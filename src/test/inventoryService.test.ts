import { beforeEach, describe, expect, it } from 'vitest';
import { InventoryError, InventoryService, type StorageAdapter } from '../services/inventoryService';
import { currency, filterProducts, getStockStatus } from '../lib/utils';
import type { ProductInput, User } from '../types';

class MemoryStorage implements StorageAdapter {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const admin: User = { id: 'usr-admin', name: 'Olivia Martin', email: 'admin@stockpilot.io', role: 'Admin', initials: 'OM' };
const staff: User = { id: 'usr-staff', name: 'Mia Chen', email: 'staff@stockpilot.io', role: 'Staff', initials: 'MC' };
const newProduct: ProductInput = { sku: 'ELE-MSE-099', barcode: '810045672099', name: 'Orbit Wireless Mouse', categoryId: 'cat-electronics', supplierId: 'sup-nova', cost: 22, sellingPrice: 39, quantity: 12, reorderLevel: 4, image: '🖱️' };

describe('InventoryService main workflows', () => {
  let service: InventoryService;
  beforeEach(() => { service = new InventoryService(new MemoryStorage()); });

  it('formats monetary values as Philippine pesos', () => {
    expect(currency(1099)).toContain('₱');
    expect(currency(1099)).toContain('1,099.00');
  });

  it('authenticates valid demo users and rejects invalid credentials', async () => {
    const user = await service.authenticate('ADMIN@stockpilot.io', 'admin123');
    expect(user.role).toBe('Admin');
    expect(user).not.toHaveProperty('password');
    await expect(service.authenticate('admin@stockpilot.io', 'wrong')).rejects.toThrow('Email or password is incorrect');
  });

  it('registers new accounts as Staff and prevents duplicate registration', async () => {
    const user = await service.registerAccount('Taylor Morgan', 'taylor@stockpilot.io', 'welcome123');
    expect(user).toMatchObject({ name: 'Taylor Morgan', role: 'Staff', email: 'taylor@stockpilot.io' });
    expect(await service.authenticate('taylor@stockpilot.io', 'welcome123')).toMatchObject({ role: 'Staff' });
    await expect(service.registerAccount('Taylor Again', 'taylor@stockpilot.io', 'welcome123')).rejects.toThrow('already exists');
    const adminAccount = await service.registerAccount('Casey Admin', 'casey@stockpilot.io', 'welcome123', 'Admin');
    expect(adminAccount.role).toBe('Admin');
  });

  it('resets a password using an expiring one-time verification code', async () => {
    const code = await service.requestPasswordReset('staff@stockpilot.io');
    expect(code).toMatch(/^\d{6}$/);
    await expect(service.resetPassword('staff@stockpilot.io', '000000', 'newpass123')).rejects.toThrow('invalid or has expired');
    await service.resetPassword('staff@stockpilot.io', code, 'newpass123');
    await expect(service.authenticate('staff@stockpilot.io', 'staff123')).rejects.toThrow();
    expect(await service.authenticate('staff@stockpilot.io', 'newpass123')).toMatchObject({ role: 'Staff' });
  });

  it('creates a product, adds an audit record, and prevents duplicate SKUs', () => {
    const database = service.addProduct(newProduct, admin);
    expect(database.products[0]).toMatchObject({ name: 'Orbit Wireless Mouse', sku: 'ELE-MSE-099', quantity: 12 });
    expect(database.auditLogs[0]).toMatchObject({ action: 'Product created', userName: 'Olivia Martin' });
    expect(() => service.addProduct({ ...newProduct, name: 'Duplicate mouse' }, admin)).toThrow('SKU is already in use');
    expect(() => service.addProduct({ ...newProduct, sku: 'OTHER-100' }, staff)).toThrow('permission');
  });

  it('creates users for all supported roles and enforces Admin-only user management', async () => {
    const database = service.saveUser({ name: 'Jordan Lee', email: 'jordan@stockpilot.io', role: 'Manager', password: 'secure123', status: 'active' }, admin);
    const account = database.users.find((user) => user.email === 'jordan@stockpilot.io');
    expect(account).toMatchObject({ name: 'Jordan Lee', role: 'Manager', status: 'active', initials: 'JL' });
    expect((await service.authenticate('jordan@stockpilot.io', 'secure123')).role).toBe('Manager');
    expect(() => service.saveUser({ name: 'Blocked', email: 'blocked@stockpilot.io', role: 'Staff', password: 'secure123', status: 'active' }, staff)).toThrow('Only administrators');
    expect(() => service.toggleUser(admin.id, admin)).toThrow('cannot deactivate your own account');
  });

  it('automatically updates stock for stock-in and stock-out', () => {
    expect(service.getSnapshot().products.find((product) => product.id === 'prd-002')?.quantity).toBe(4);
    let database = service.adjustStock('prd-002', 'stock-in', 6, 'PO-TEST', 'Test receipt', staff);
    expect(database.products.find((product) => product.id === 'prd-002')?.quantity).toBe(10);
    database = service.adjustStock('prd-002', 'stock-out', 3, 'SO-TEST', 'Test issue', staff);
    expect(database.products.find((product) => product.id === 'prd-002')?.quantity).toBe(7);
    expect(database.transactions[0]).toMatchObject({ previousStock: 10, newStock: 7, quantity: 3 });
  });

  it('prevents negative stock and invalid transaction quantities', () => {
    expect(() => service.adjustStock('prd-002', 'stock-out', 5, 'SO-FAIL', '', staff)).toThrow('Only 4 units are available');
    expect(() => service.adjustStock('prd-002', 'stock-in', 0, 'PO-FAIL', '', staff)).toThrow(InventoryError);
    expect(service.getSnapshot().products.find((product) => product.id === 'prd-002')?.quantity).toBe(4);
  });

  it('supports product search, category filtering, sorting, and alert filtering', () => {
    const products = service.getSnapshot().products;
    const base = { category: 'all', stock: 'all', visibility: 'active' as const, sort: 'name' as const };
    expect(filterProducts(products, { ...base, search: 'ELE-MON-027' }).map((product) => product.id)).toEqual(['prd-002']);
    expect(filterProducts(products, { ...base, search: '', category: 'cat-network' })).toHaveLength(2);
    const alerts = filterProducts(products, { ...base, search: '', stock: 'attention', sort: 'quantity' });
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.every((product) => getStockStatus(product) !== 'in-stock')).toBe(true);
    expect(alerts[0].quantity).toBe(0);
  });
});
