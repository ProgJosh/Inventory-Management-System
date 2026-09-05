import type { Product, StockStatus } from '../types';

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export const currency = (value: number) => new Intl.NumberFormat('en-PH', {
  style: 'currency', currency: 'PHP', maximumFractionDigits: 2,
}).format(value);

export const number = (value: number) => new Intl.NumberFormat('en-US').format(value);

export const formatDate = (value: string, withTime = false) => new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: withTime ? undefined : 'numeric',
  ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
}).format(new Date(value));

export const relativeTime = (value: string) => {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, 'second');
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');
  const days = Math.round(hours / 24);
  return formatter.format(days, 'day');
};

export const getStockStatus = (product: Product): StockStatus => {
  if (product.quantity === 0) return 'out-of-stock';
  if (product.quantity <= product.reorderLevel) return 'low-stock';
  return 'in-stock';
};

export interface ProductFilters {
  search: string;
  category: string;
  stock: string;
  visibility: 'active' | 'archived' | 'all';
  sort: 'name' | 'quantity' | 'value';
}

export const filterProducts = (products: Product[], filters: ProductFilters) => products.filter((product) => {
  const term = filters.search.trim().toLowerCase();
  const matchesSearch = !term || [product.name, product.sku, product.barcode].some((value) => value.toLowerCase().includes(term));
  const matchesCategory = filters.category === 'all' || product.categoryId === filters.category;
  const status = getStockStatus(product);
  const matchesStock = filters.stock === 'all' || (filters.stock === 'attention' ? status !== 'in-stock' : status === filters.stock);
  const matchesVisibility = filters.visibility === 'all' || product.status === filters.visibility;
  return matchesSearch && matchesCategory && matchesStock && matchesVisibility;
}).sort((a, b) => filters.sort === 'quantity' ? a.quantity - b.quantity : filters.sort === 'value' ? b.quantity * b.cost - a.quantity * a.cost : a.name.localeCompare(b.name));

export const stockLabel: Record<StockStatus, string> = {
  'in-stock': 'In stock', 'low-stock': 'Low stock', 'out-of-stock': 'Out of stock',
};

export const downloadCsv = (filename: string, rows: Array<Array<string | number>>) => {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const productImage = (image: string) => {
  const trimmed = image.trim();
  return /^https?:\/\//.test(trimmed) || trimmed.startsWith('data:') ? 'url' : 'emoji';
};
