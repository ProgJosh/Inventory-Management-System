import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createSeedData } from '../data/seed';
import { inventoryService } from '../services/inventoryService';
import type { CategoryInput, InventoryDatabase, ProductInput, Role, SupplierInput, ToastMessage, TransactionType, User, UserAccountInput } from '../types';

interface InventoryContextValue {
  data: InventoryDatabase;
  user: User | null;
  loading: boolean;
  toasts: ToastMessage[];
  login(email: string, password: string, remember?: boolean, role?: Role): Promise<void>;
  register(name: string, email: string, password: string, role: Role): Promise<void>;
  requestPasswordReset(email: string): Promise<string>;
  resetPassword(email: string, code: string, password: string): Promise<void>;
  logout(): void;
  addProduct(input: ProductInput): void;
  updateProduct(id: string, input: ProductInput): void;
  archiveProduct(id: string): void;
  adjustStock(productId: string, type: TransactionType, quantity: number, reference: string, note: string): void;
  saveSupplier(input: SupplierInput, id?: string): void;
  toggleSupplier(id: string): void;
  saveCategory(input: CategoryInput, id?: string): void;
  saveUser(input: UserAccountInput, id?: string): void;
  toggleUser(id: string): void;
  resetDemoData(): void;
  notify(type: ToastMessage['type'], title: string, description?: string): void;
  dismissToast(id: string): void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);
const SESSION_KEY = 'stockpilot_session_v1';

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<InventoryDatabase>(createSeedData);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [user, setUser] = useState<User | null>(() => {
    const session = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try { return JSON.parse(session) as User; } catch { return null; }
  });

  useEffect(() => {
    inventoryService.getDatabase().then(setData).finally(() => setLoading(false));
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const notify = useCallback((type: ToastMessage['type'], title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, type, title, description }]);
    window.setTimeout(() => dismissToast(id), 4200);
  }, [dismissToast]);

  const requireUser = () => {
    if (!user) throw new Error('Please sign in to continue.');
    return user;
  };

  const login = async (email: string, password: string, remember = false, role?: Role) => {
    const authenticated = await inventoryService.authenticate(email, password, role);
    inventoryService.addAuditLogin(authenticated);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(authenticated));
    setUser(authenticated);
    setData(inventoryService.getSnapshot());
  };

  const register = async (name: string, email: string, password: string, role: Role) => {
    await inventoryService.registerAccount(name, email, password, role);
    setData(inventoryService.getSnapshot());
    notify('success', 'Account created', `You can now sign in with your new ${role} account.`);
  };

  const requestPasswordReset = (email: string) => inventoryService.requestPasswordReset(email);

  const resetPassword = async (email: string, code: string, password: string) => {
    await inventoryService.resetPassword(email, code, password);
    setData(inventoryService.getSnapshot());
    notify('success', 'Password updated', 'Sign in using your new password.');
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = useMemo<InventoryContextValue>(() => ({
    data, user, loading, toasts, login, register, requestPasswordReset, resetPassword, logout, notify, dismissToast,
    addProduct(input) {
      setData(inventoryService.addProduct(input, requireUser()));
      notify('success', 'Product created', `${input.name} is now in your inventory.`);
    },
    updateProduct(id, input) {
      setData(inventoryService.updateProduct(id, input, requireUser()));
      notify('success', 'Product updated', `${input.name} was saved successfully.`);
    },
    archiveProduct(id) {
      const product = data.products.find((item) => item.id === id);
      setData(inventoryService.archiveProduct(id, requireUser()));
      notify('success', product?.status === 'archived' ? 'Product restored' : 'Product archived', product?.name);
    },
    adjustStock(productId, type, quantity, reference, note) {
      const product = data.products.find((item) => item.id === productId);
      setData(inventoryService.adjustStock(productId, type, quantity, reference, note, requireUser()));
      notify('success', type === 'stock-in' ? 'Stock received' : 'Stock issued', `${quantity} units · ${product?.name ?? ''}`);
    },
    saveSupplier(input, id) {
      setData(inventoryService.saveSupplier(input, requireUser(), id));
      notify('success', id ? 'Supplier updated' : 'Supplier created', input.name);
    },
    toggleSupplier(id) {
      const supplier = data.suppliers.find((item) => item.id === id);
      setData(inventoryService.toggleSupplier(id, requireUser()));
      notify('success', 'Supplier status changed', supplier?.name);
    },
    saveCategory(input, id) {
      setData(inventoryService.saveCategory(input, requireUser(), id));
      notify('success', id ? 'Category updated' : 'Category created', input.name);
    },
    saveUser(input, id) {
      setData(inventoryService.saveUser(input, requireUser(), id));
      notify('success', id ? 'User updated' : 'User created', `${input.name} · ${input.role}`);
    },
    toggleUser(id) {
      const account = data.users.find((item) => item.id === id);
      setData(inventoryService.toggleUser(id, requireUser()));
      notify('success', 'User status changed', account?.name);
    },
    resetDemoData() {
      setData(inventoryService.resetDemoData());
      notify('success', 'Demo data restored', 'All local changes have been reset.');
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data, user, loading, toasts, notify, dismissToast]);

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used inside InventoryProvider.');
  return context;
}
