import { createSeedData } from '../data/seed';
import type {
  AuditLog,
  Category,
  CategoryInput,
  InventoryDatabase,
  InventoryTransaction,
  Product,
  ProductInput,
  Role,
  Supplier,
  SupplierInput,
  TransactionType,
  User,
  UserAccountInput,
} from '../types';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const DB_KEY = 'stockpilot_inventory_v1';
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const clean = (value: string) => value.trim();

export class InventoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InventoryError';
  }
}

export const canManageCatalog = (role: Role) => role === 'Admin' || role === 'Manager';
export const canViewAudit = (role: Role) => role === 'Admin';

export class InventoryService {
  private storage: StorageAdapter;
  private resetCodes = new Map<string, { code: string; expiresAt: number }>();

  constructor(storage?: StorageAdapter) {
    this.storage = storage ?? (typeof window !== 'undefined' ? window.localStorage : {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });
  }

  private read(): InventoryDatabase {
    const value = this.storage.getItem(DB_KEY);
    if (!value) {
      const seed = createSeedData();
      this.write(seed);
      return seed;
    }
    try {
      const database = JSON.parse(value) as InventoryDatabase;
      database.users = database.users.map((user) => ({
        ...user,
        status: user.status ?? 'active',
        createdAt: user.createdAt ?? new Date().toISOString(),
      }));
      return database;
    } catch {
      const seed = createSeedData();
      this.write(seed);
      return seed;
    }
  }

  private write(database: InventoryDatabase) {
    this.storage.setItem(DB_KEY, JSON.stringify(database));
  }

  private requireCatalogAccess(user: User) {
    if (!canManageCatalog(user.role)) throw new InventoryError('Your role does not have permission to manage catalog records.');
  }

  private requireAdmin(user: User) {
    if (user.role !== 'Admin') throw new InventoryError('Only administrators can manage user accounts and roles.');
  }

  private log(database: InventoryDatabase, user: User, entry: Omit<AuditLog, 'id' | 'userId' | 'userName' | 'createdAt'>) {
    database.auditLogs.unshift({
      id: uid('log'),
      userId: user.id,
      userName: user.name,
      createdAt: new Date().toISOString(),
      ...entry,
    });
  }

  async getDatabase(): Promise<InventoryDatabase> {
    await new Promise((resolve) => setTimeout(resolve, 220));
    return this.read();
  }

  getSnapshot(): InventoryDatabase {
    return this.read();
  }

  async authenticate(email: string, password: string, expectedRole?: Role): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 420));
    const database = this.read();
    const match = database.users.find((user) => user.email.toLowerCase() === clean(email).toLowerCase() && user.password === password && user.status !== 'inactive');
    if (!match) throw new InventoryError('Email or password is incorrect, or this account is inactive.');
    if (expectedRole && match.role !== expectedRole) throw new InventoryError(`This account is assigned to the ${match.role} role. Select ${match.role} to continue.`);
    const { password: _password, ...safeUser } = match;
    void _password;
    return safeUser;
  }

  async registerAccount(nameValue: string, emailValue: string, password: string, role: Role = 'Staff'): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 420));
    const database = this.read();
    const name = clean(nameValue);
    const email = clean(emailValue).toLowerCase();
    if (name.length < 2) throw new InventoryError('Your name must contain at least 2 characters.');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new InventoryError('Enter a valid email address.');
    if (password.length < 8) throw new InventoryError('Password must contain at least 8 characters.');
    if (database.users.some((user) => user.email.toLowerCase() === email)) throw new InventoryError('An account with this email address already exists.');
    const account = {
      id: uid('usr'), name, email, role,
      initials: name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      password, status: 'active' as const, createdAt: new Date().toISOString(),
    };
    database.users.unshift(account);
    this.log(database, account, { action: 'User registered', entityType: 'User', entityName: account.name, detail: `${role} · self-registration` });
    this.write(database);
    const { password: _password, ...safeUser } = account;
    void _password;
    return safeUser;
  }

  async requestPasswordReset(emailValue: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 360));
    const email = clean(emailValue).toLowerCase();
    const account = this.read().users.find((user) => user.email.toLowerCase() === email && user.status !== 'inactive');
    if (!account) throw new InventoryError('No active account was found for this email address.');
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.resetCodes.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
    return code;
  }

  async resetPassword(emailValue: string, code: string, password: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 360));
    const email = clean(emailValue).toLowerCase();
    const reset = this.resetCodes.get(email);
    if (!reset || reset.code !== clean(code) || reset.expiresAt < Date.now()) throw new InventoryError('The verification code is invalid or has expired.');
    if (password.length < 8) throw new InventoryError('Password must contain at least 8 characters.');
    const database = this.read();
    const account = database.users.find((user) => user.email.toLowerCase() === email && user.status !== 'inactive');
    if (!account) throw new InventoryError('This account is unavailable.');
    account.password = password;
    this.resetCodes.delete(email);
    this.log(database, account, { action: 'Password reset', entityType: 'Authentication', entityName: account.email, detail: 'Password updated through account recovery' });
    this.write(database);
  }

  addAuditLogin(user: User) {
    const database = this.read();
    this.log(database, user, { action: 'Signed in', entityType: 'Authentication', entityName: user.email, detail: `${user.role} session started` });
    this.write(database);
  }

  addProduct(input: ProductInput, user: User): InventoryDatabase {
    this.requireCatalogAccess(user);
    const database = this.read();
    this.validateProduct(input, database.products);
    const timestamp = new Date().toISOString();
    const product: Product = {
      ...input,
      sku: clean(input.sku).toUpperCase(),
      barcode: clean(input.barcode),
      name: clean(input.name),
      image: clean(input.image) || '📦',
      id: uid('prd'),
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    database.products.unshift(product);
    this.log(database, user, { action: 'Product created', entityType: 'Product', entityName: product.name, detail: `${product.sku} · ${product.quantity} opening units` });
    this.write(database);
    return database;
  }

  updateProduct(id: string, input: ProductInput, user: User): InventoryDatabase {
    this.requireCatalogAccess(user);
    const database = this.read();
    const index = database.products.findIndex((product) => product.id === id);
    if (index < 0) throw new InventoryError('Product was not found.');
    this.validateProduct(input, database.products, id);
    const existing = database.products[index];
    const product: Product = {
      ...existing,
      ...input,
      sku: clean(input.sku).toUpperCase(),
      barcode: clean(input.barcode),
      name: clean(input.name),
      image: clean(input.image) || '📦',
      updatedAt: new Date().toISOString(),
    };
    database.products[index] = product;
    this.log(database, user, { action: 'Product updated', entityType: 'Product', entityName: product.name, detail: `Catalog record ${product.sku} updated` });
    this.write(database);
    return database;
  }

  archiveProduct(id: string, user: User): InventoryDatabase {
    this.requireCatalogAccess(user);
    const database = this.read();
    const product = database.products.find((item) => item.id === id);
    if (!product) throw new InventoryError('Product was not found.');
    product.status = product.status === 'active' ? 'archived' : 'active';
    product.updatedAt = new Date().toISOString();
    this.log(database, user, { action: product.status === 'archived' ? 'Product archived' : 'Product restored', entityType: 'Product', entityName: product.name, detail: `${product.sku} marked ${product.status}` });
    this.write(database);
    return database;
  }

  adjustStock(productId: string, type: TransactionType, quantity: number, reference: string, note: string, user: User): InventoryDatabase {
    const database = this.read();
    const product = database.products.find((item) => item.id === productId);
    if (!product || product.status === 'archived') throw new InventoryError('Select an active product.');
    if (!Number.isInteger(quantity) || quantity <= 0) throw new InventoryError('Quantity must be a positive whole number.');
    if (!clean(reference)) throw new InventoryError('A transaction reference is required.');
    if (type === 'stock-out' && quantity > product.quantity) throw new InventoryError(`Only ${product.quantity} units are available. Stock cannot be negative.`);
    const previousStock = product.quantity;
    const newStock = type === 'stock-in' ? previousStock + quantity : previousStock - quantity;
    product.quantity = newStock;
    product.updatedAt = new Date().toISOString();
    const transaction: InventoryTransaction = {
      id: uid('txn'), productId, type, quantity, previousStock, newStock,
      reference: clean(reference), note: clean(note), performedBy: user.id, createdAt: new Date().toISOString(),
    };
    database.transactions.unshift(transaction);
    this.log(database, user, {
      action: type === 'stock-in' ? 'Stock in' : 'Stock out', entityType: 'Stock', entityName: product.name,
      detail: `${type === 'stock-in' ? 'Added' : 'Removed'} ${quantity} unit${quantity === 1 ? '' : 's'} · ${transaction.reference}`,
    });
    this.write(database);
    return database;
  }

  saveSupplier(input: SupplierInput, user: User, id?: string): InventoryDatabase {
    this.requireCatalogAccess(user);
    const database = this.read();
    if (!clean(input.name) || !clean(input.contactName) || !/^\S+@\S+\.\S+$/.test(input.email)) throw new InventoryError('Supplier name, contact, and a valid email are required.');
    if (database.suppliers.some((item) => item.id !== id && item.name.toLowerCase() === clean(input.name).toLowerCase())) throw new InventoryError('A supplier with this name already exists.');
    const existing = id ? database.suppliers.find((item) => item.id === id) : undefined;
    const supplier: Supplier = { ...input, name: clean(input.name), contactName: clean(input.contactName), email: clean(input.email), id: existing?.id ?? uid('sup'), createdAt: existing?.createdAt ?? new Date().toISOString() };
    if (existing) database.suppliers[database.suppliers.indexOf(existing)] = supplier;
    else database.suppliers.unshift(supplier);
    this.log(database, user, { action: existing ? 'Supplier updated' : 'Supplier created', entityType: 'Supplier', entityName: supplier.name, detail: `${supplier.contactName} · ${supplier.status}` });
    this.write(database);
    return database;
  }

  toggleSupplier(id: string, user: User): InventoryDatabase {
    this.requireCatalogAccess(user);
    const database = this.read();
    const supplier = database.suppliers.find((item) => item.id === id);
    if (!supplier) throw new InventoryError('Supplier was not found.');
    supplier.status = supplier.status === 'active' ? 'inactive' : 'active';
    this.log(database, user, { action: 'Supplier status changed', entityType: 'Supplier', entityName: supplier.name, detail: `Marked ${supplier.status}` });
    this.write(database);
    return database;
  }

  saveCategory(input: CategoryInput, user: User, id?: string): InventoryDatabase {
    this.requireCatalogAccess(user);
    const database = this.read();
    if (clean(input.name).length < 2) throw new InventoryError('Category name must contain at least 2 characters.');
    if (database.categories.some((item) => item.id !== id && item.name.toLowerCase() === clean(input.name).toLowerCase())) throw new InventoryError('A category with this name already exists.');
    const existing = id ? database.categories.find((item) => item.id === id) : undefined;
    const category: Category = { ...input, name: clean(input.name), description: clean(input.description), id: existing?.id ?? uid('cat'), createdAt: existing?.createdAt ?? new Date().toISOString() };
    if (existing) database.categories[database.categories.indexOf(existing)] = category;
    else database.categories.unshift(category);
    this.log(database, user, { action: existing ? 'Category updated' : 'Category created', entityType: 'Category', entityName: category.name, detail: category.description || 'Category saved' });
    this.write(database);
    return database;
  }

  saveUser(input: UserAccountInput, actor: User, id?: string): InventoryDatabase {
    this.requireAdmin(actor);
    const database = this.read();
    const name = clean(input.name);
    const email = clean(input.email).toLowerCase();
    if (name.length < 2) throw new InventoryError('User name must contain at least 2 characters.');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new InventoryError('Enter a valid email address.');
    if (database.users.some((user) => user.id !== id && user.email.toLowerCase() === email)) throw new InventoryError('A user with this email address already exists.');
    if (!id && input.password.length < 8) throw new InventoryError('New user passwords must contain at least 8 characters.');
    if (id && input.password && input.password.length < 8) throw new InventoryError('A replacement password must contain at least 8 characters.');
    if (id === actor.id && input.status === 'inactive') throw new InventoryError('You cannot deactivate your own account.');
    const existing = id ? database.users.find((user) => user.id === id) : undefined;
    if (id && !existing) throw new InventoryError('User account was not found.');
    if (id === actor.id && input.role !== 'Admin') throw new InventoryError('You cannot remove your own administrator role.');
    const activeAdmins = database.users.filter((user) => user.role === 'Admin' && user.status !== 'inactive');
    if (existing?.role === 'Admin' && existing.status !== 'inactive' && (input.role !== 'Admin' || input.status === 'inactive') && activeAdmins.length === 1) throw new InventoryError('At least one active administrator account is required.');
    const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    const account = {
      id: existing?.id ?? uid('usr'),
      name,
      email,
      role: input.role,
      initials,
      password: input.password || existing?.password || '',
      status: input.status,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    if (existing) database.users[database.users.indexOf(existing)] = account;
    else database.users.unshift(account);
    this.log(database, actor, { action: existing ? 'User updated' : 'User created', entityType: 'User', entityName: account.name, detail: `${account.role} · ${account.status}` });
    this.write(database);
    return database;
  }

  toggleUser(id: string, actor: User): InventoryDatabase {
    this.requireAdmin(actor);
    if (id === actor.id) throw new InventoryError('You cannot deactivate your own account.');
    const database = this.read();
    const account = database.users.find((user) => user.id === id);
    if (!account) throw new InventoryError('User account was not found.');
    if (account.role === 'Admin' && account.status !== 'inactive' && database.users.filter((user) => user.role === 'Admin' && user.status !== 'inactive').length === 1) throw new InventoryError('At least one active administrator account is required.');
    account.status = account.status === 'active' ? 'inactive' : 'active';
    this.log(database, actor, { action: 'User status changed', entityType: 'User', entityName: account.name, detail: `Marked ${account.status}` });
    this.write(database);
    return database;
  }

  resetDemoData(): InventoryDatabase {
    const database = createSeedData();
    this.write(database);
    return database;
  }

  private validateProduct(input: ProductInput, products: Product[], id?: string) {
    if (clean(input.name).length < 2) throw new InventoryError('Product name must contain at least 2 characters.');
    if (!/^[A-Za-z0-9-]{3,30}$/.test(clean(input.sku))) throw new InventoryError('SKU must be 3–30 letters, numbers, or hyphens.');
    if (!/^\d{8,14}$/.test(clean(input.barcode))) throw new InventoryError('Barcode must contain 8–14 digits.');
    if (!input.categoryId || !input.supplierId) throw new InventoryError('Category and supplier are required.');
    if ([input.cost, input.sellingPrice, input.quantity, input.reorderLevel].some((value) => !Number.isFinite(value) || value < 0)) throw new InventoryError('Prices and stock values cannot be negative.');
    if (!Number.isInteger(input.quantity) || !Number.isInteger(input.reorderLevel)) throw new InventoryError('Stock and reorder level must be whole numbers.');
    if (products.some((product) => product.id !== id && product.sku.toLowerCase() === clean(input.sku).toLowerCase())) throw new InventoryError('This SKU is already in use. Enter a unique SKU.');
  }
}

export const inventoryService = new InventoryService();
