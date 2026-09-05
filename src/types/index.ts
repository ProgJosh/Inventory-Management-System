export type Role = 'Admin' | 'Manager' | 'Staff';
export type ProductStatus = 'active' | 'archived';
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
export type TransactionType = 'stock-in' | 'stock-out';

export interface User { id: string; name: string; email: string; role: Role; initials: string; }
export interface DemoUser extends User { password: string; status: 'active' | 'inactive'; createdAt: string; }
export interface Category { id: string; name: string; description: string; color: string; createdAt: string; }
export interface Supplier { id: string; name: string; contactName: string; email: string; phone: string; address: string; status: 'active' | 'inactive'; createdAt: string; }
export interface Product { id: string; sku: string; barcode: string; name: string; categoryId: string; supplierId: string; cost: number; sellingPrice: number; quantity: number; reorderLevel: number; image: string; status: ProductStatus; createdAt: string; updatedAt: string; }
export interface InventoryTransaction { id: string; productId: string; type: TransactionType; quantity: number; previousStock: number; newStock: number; reference: string; note: string; performedBy: string; createdAt: string; }
export interface AuditLog { id: string; userId: string; userName: string; action: string; entityType: 'Product' | 'Stock' | 'Supplier' | 'Category' | 'User' | 'Authentication'; entityName: string; detail: string; createdAt: string; }
export interface InventoryDatabase { users: DemoUser[]; products: Product[]; categories: Category[]; suppliers: Supplier[]; transactions: InventoryTransaction[]; auditLogs: AuditLog[]; }
export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
export type SupplierInput = Omit<Supplier, 'id' | 'createdAt'>;
export type CategoryInput = Omit<Category, 'id' | 'createdAt'>;
export interface UserAccountInput { name: string; email: string; role: Role; password: string; status: 'active' | 'inactive'; }
export interface ToastMessage { id: string; type: 'success' | 'error' | 'info'; title: string; description?: string; }
export interface DashboardMetrics { totalProducts: number; lowStock: number; outOfStock: number; inventoryValue: number; }
