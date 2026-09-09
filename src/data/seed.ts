import type { InventoryDatabase } from '../types';

const now = new Date();
const daysAgo = (days: number, hour = 10) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hour, days % 2 ? 15 : 30, 0, 0);
  return date.toISOString();
};

export const createSeedData = (): InventoryDatabase => ({
  users: [
    { id: 'usr-admin', name: 'Olivia Martin', email: 'admin@stockpilot.io', password: 'admin123', role: 'Admin', initials: 'OM', status: 'active', createdAt: daysAgo(240) },
    { id: 'usr-manager', name: 'Ethan Brooks', email: 'manager@stockpilot.io', password: 'manager123', role: 'Manager', initials: 'EB', status: 'active', createdAt: daysAgo(185) },
    { id: 'usr-staff', name: 'Mia Chen', email: 'staff@stockpilot.io', password: 'staff123', role: 'Staff', initials: 'MC', status: 'active', createdAt: daysAgo(95) },
  ],
  categories: [
    { id: 'cat-electronics', name: 'Electronics', description: 'Computers, accessories, and office electronics', color: '#2563eb', createdAt: daysAgo(180) },
    { id: 'cat-furniture', name: 'Office Furniture', description: 'Desks, chairs, and storage', color: '#7c3aed', createdAt: daysAgo(150) },
    { id: 'cat-stationery', name: 'Stationery', description: 'Everyday writing and filing supplies', color: '#0891b2', createdAt: daysAgo(120) },
    { id: 'cat-network', name: 'Networking', description: 'Routers, switches, and connectivity', color: '#ea580c', createdAt: daysAgo(90) },
    { id: 'cat-safety', name: 'Safety & PPE', description: 'Workplace protection equipment', color: '#16a34a', createdAt: daysAgo(60) },
  ],
  suppliers: [
    { id: 'sup-nova', name: 'Nova Technologies', contactName: 'Daniel Kim', email: 'orders@novatech.example', phone: '+1 (415) 555-0142', address: '240 Market Street, San Francisco, CA', status: 'active', createdAt: daysAgo(210) },
    { id: 'sup-apex', name: 'Apex Office Co.', contactName: 'Sophia Grant', email: 'sales@apexoffice.example', phone: '+1 (312) 555-0188', address: '85 Lakeview Avenue, Chicago, IL', status: 'active', createdAt: daysAgo(175) },
    { id: 'sup-paper', name: 'Paper & Co. Supply', contactName: 'Lucas Reed', email: 'hello@paperco.example', phone: '+1 (617) 555-0125', address: '16 Franklin Road, Boston, MA', status: 'active', createdAt: daysAgo(140) },
    { id: 'sup-connect', name: 'ConnectPro Distribution', contactName: 'Ava Patel', email: 'trade@connectpro.example', phone: '+1 (206) 555-0113', address: '730 Union Street, Seattle, WA', status: 'active', createdAt: daysAgo(105) },
    { id: 'sup-safe', name: 'SafeWorks Industrial', contactName: 'Noah James', email: 'accounts@safeworks.example', phone: '+1 (713) 555-0194', address: '440 Commerce Drive, Houston, TX', status: 'inactive', createdAt: daysAgo(70) },
  ],
  products: [
    { id: 'prd-001', sku: 'ELE-LAP-014', barcode: '810045672014', name: 'AeroBook Pro 14 Laptop', categoryId: 'cat-electronics', supplierId: 'sup-nova', cost: 780, sellingPrice: 1099, quantity: 18, reorderLevel: 6, image: '💻', status: 'active', createdAt: daysAgo(120), updatedAt: daysAgo(1) },
    { id: 'prd-002', sku: 'ELE-MON-027', barcode: '810045672027', name: 'ViewEdge 27” 4K Monitor', categoryId: 'cat-electronics', supplierId: 'sup-nova', cost: 245, sellingPrice: 369, quantity: 4, reorderLevel: 8, image: '🖥️', status: 'active', createdAt: daysAgo(110), updatedAt: daysAgo(0, 9) },
    { id: 'prd-003', sku: 'FUR-CHR-012', barcode: '725113490012', name: 'ErgoFlex Mesh Chair', categoryId: 'cat-furniture', supplierId: 'sup-apex', cost: 138, sellingPrice: 229, quantity: 26, reorderLevel: 10, image: '🪑', status: 'active', createdAt: daysAgo(100), updatedAt: daysAgo(2) },
    { id: 'prd-004', sku: 'NET-RTR-006', barcode: '690112458006', name: 'ConnectPro AX6000 Router', categoryId: 'cat-network', supplierId: 'sup-connect', cost: 122, sellingPrice: 189, quantity: 0, reorderLevel: 5, image: '📡', status: 'active', createdAt: daysAgo(88), updatedAt: daysAgo(1, 14) },
    { id: 'prd-005', sku: 'STA-NBK-080', barcode: '501998234080', name: 'Executive Grid Notebook', categoryId: 'cat-stationery', supplierId: 'sup-paper', cost: 4.2, sellingPrice: 9.99, quantity: 142, reorderLevel: 30, image: '📓', status: 'active', createdAt: daysAgo(80), updatedAt: daysAgo(3) },
    { id: 'prd-006', sku: 'ELE-KBD-041', barcode: '810045672041', name: 'Slate Mechanical Keyboard', categoryId: 'cat-electronics', supplierId: 'sup-nova', cost: 56, sellingPrice: 89, quantity: 7, reorderLevel: 10, image: '⌨️', status: 'active', createdAt: daysAgo(70), updatedAt: daysAgo(0, 11) },
    { id: 'prd-007', sku: 'FUR-DSK-018', barcode: '725113490018', name: 'Atlas Standing Desk', categoryId: 'cat-furniture', supplierId: 'sup-apex', cost: 310, sellingPrice: 489, quantity: 12, reorderLevel: 4, image: '🗄️', status: 'active', createdAt: daysAgo(65), updatedAt: daysAgo(4) },
    { id: 'prd-008', sku: 'SAF-HLM-030', barcode: '605118344030', name: 'CoreGuard Safety Helmet', categoryId: 'cat-safety', supplierId: 'sup-safe', cost: 18.5, sellingPrice: 34.99, quantity: 9, reorderLevel: 12, image: '⛑️', status: 'active', createdAt: daysAgo(55), updatedAt: daysAgo(2, 15) },
    { id: 'prd-009', sku: 'NET-SWT-024', barcode: '690112458024', name: '24-Port Managed Switch', categoryId: 'cat-network', supplierId: 'sup-connect', cost: 172, sellingPrice: 259, quantity: 15, reorderLevel: 5, image: '🔌', status: 'active', createdAt: daysAgo(48), updatedAt: daysAgo(1, 9) },
    { id: 'prd-010', sku: 'STA-PEN-120', barcode: '501998234120', name: 'Precision Gel Pen 12-Pack', categoryId: 'cat-stationery', supplierId: 'sup-paper', cost: 6.8, sellingPrice: 13.5, quantity: 64, reorderLevel: 20, image: '🖊️', status: 'active', createdAt: daysAgo(42), updatedAt: daysAgo(5) },
    { id: 'prd-011', sku: 'ELE-HST-016', barcode: '810045672016', name: 'ClearCall USB Headset', categoryId: 'cat-electronics', supplierId: 'sup-nova', cost: 32, sellingPrice: 59, quantity: 3, reorderLevel: 8, image: '🎧', status: 'active', createdAt: daysAgo(35), updatedAt: daysAgo(0, 8) },
    { id: 'prd-012', sku: 'FUR-CAB-010', barcode: '725113490010', name: 'Metro Filing Cabinet', categoryId: 'cat-furniture', supplierId: 'sup-apex', cost: 94, sellingPrice: 149, quantity: 21, reorderLevel: 6, image: '🗃️', status: 'active', createdAt: daysAgo(30), updatedAt: daysAgo(6) },
  ],
  transactions: [
    { id: 'txn-101', productId: 'prd-002', type: 'stock-out', quantity: 3, previousStock: 7, newStock: 4, reference: 'SO-1049', note: 'Customer order fulfillment', performedBy: 'usr-staff', createdAt: daysAgo(0, 9) },
    { id: 'txn-102', productId: 'prd-006', type: 'stock-in', quantity: 5, previousStock: 2, newStock: 7, reference: 'PO-8832', note: 'Supplier replenishment', performedBy: 'usr-manager', createdAt: daysAgo(0, 11) },
    { id: 'txn-103', productId: 'prd-011', type: 'stock-out', quantity: 2, previousStock: 5, newStock: 3, reference: 'SO-1045', note: 'Sales order', performedBy: 'usr-staff', createdAt: daysAgo(0, 8) },
    { id: 'txn-104', productId: 'prd-004', type: 'stock-out', quantity: 2, previousStock: 2, newStock: 0, reference: 'SO-1040', note: 'Project allocation', performedBy: 'usr-manager', createdAt: daysAgo(1, 14) },
    { id: 'txn-105', productId: 'prd-001', type: 'stock-in', quantity: 10, previousStock: 8, newStock: 18, reference: 'PO-8814', note: 'Scheduled replenishment', performedBy: 'usr-admin', createdAt: daysAgo(1, 10) },
    { id: 'txn-106', productId: 'prd-008', type: 'stock-out', quantity: 6, previousStock: 15, newStock: 9, reference: 'SO-1038', note: 'Warehouse issue', performedBy: 'usr-staff', createdAt: daysAgo(2, 15) },
    { id: 'txn-107', productId: 'prd-003', type: 'stock-in', quantity: 12, previousStock: 14, newStock: 26, reference: 'PO-8799', note: 'Supplier delivery', performedBy: 'usr-manager', createdAt: daysAgo(3, 13) },
    { id: 'txn-108', productId: 'prd-010', type: 'stock-out', quantity: 16, previousStock: 80, newStock: 64, reference: 'SO-1028', note: 'Retail sales', performedBy: 'usr-staff', createdAt: daysAgo(5, 16) },
  ],
  auditLogs: [
    { id: 'log-201', userId: 'usr-staff', userName: 'Mia Chen', action: 'Stock out', entityType: 'Stock', entityName: 'ViewEdge 27” 4K Monitor', detail: 'Removed 3 units · SO-1049', createdAt: daysAgo(0, 9) },
    { id: 'log-202', userId: 'usr-manager', userName: 'Ethan Brooks', action: 'Stock in', entityType: 'Stock', entityName: 'Slate Mechanical Keyboard', detail: 'Added 5 units · PO-8832', createdAt: daysAgo(0, 11) },
    { id: 'log-203', userId: 'usr-staff', userName: 'Mia Chen', action: 'Stock out', entityType: 'Stock', entityName: 'ClearCall USB Headset', detail: 'Removed 2 units · SO-1045', createdAt: daysAgo(0, 8) },
    { id: 'log-204', userId: 'usr-manager', userName: 'Ethan Brooks', action: 'Stock out', entityType: 'Stock', entityName: 'ConnectPro AX6000 Router', detail: 'Removed 2 units · SO-1040', createdAt: daysAgo(1, 14) },
    { id: 'log-205', userId: 'usr-admin', userName: 'Olivia Martin', action: 'Product updated', entityType: 'Product', entityName: 'AeroBook Pro 14 Laptop', detail: 'Pricing and reorder level updated', createdAt: daysAgo(1, 12) },
    { id: 'log-206', userId: 'usr-admin', userName: 'Olivia Martin', action: 'Stock in', entityType: 'Stock', entityName: 'AeroBook Pro 14 Laptop', detail: 'Added 10 units · PO-8814', createdAt: daysAgo(1, 10) },
    { id: 'log-207', userId: 'usr-manager', userName: 'Ethan Brooks', action: 'Supplier updated', entityType: 'Supplier', entityName: 'ConnectPro Distribution', detail: 'Contact details updated', createdAt: daysAgo(3, 9) },
    { id: 'log-208', userId: 'usr-admin', userName: 'Olivia Martin', action: 'Category created', entityType: 'Category', entityName: 'Safety & PPE', detail: 'New category added', createdAt: daysAgo(7, 10) },
  ],
});
