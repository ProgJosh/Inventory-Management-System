import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Archive, ArrowDownUp, Eye, PackagePlus, Pencil, Plus, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { canManageCatalog } from '../services/inventoryService';
import type { Product, ProductInput, StockStatus } from '../types';
import { currency, filterProducts, getStockStatus, stockLabel } from '../lib/utils';
import { Badge, Button, Card, ConfirmDialog, EmptyState, FormField, Input, Modal, PageHeader, Pagination, ProductThumb, SearchInput, Select } from '../components/ui';

const blankProduct: ProductInput = { sku: '', barcode: '', name: '', categoryId: '', supplierId: '', cost: 0, sellingPrice: 0, quantity: 0, reorderLevel: 5, image: '📦' };

function ProductForm({ product, onClose }: { product?: Product; onClose(): void }) {
  const { data, addProduct, updateProduct } = useInventory();
  const [form, setForm] = useState<ProductInput>(product ? { sku: product.sku, barcode: product.barcode, name: product.name, categoryId: product.categoryId, supplierId: product.supplierId, cost: product.cost, sellingPrice: product.sellingPrice, quantity: product.quantity, reorderLevel: product.reorderLevel, image: product.image } : blankProduct);
  const [error, setError] = useState('');
  const set = (field: keyof ProductInput, value: string | number) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    try { product ? updateProduct(product.id, form) : addProduct(form); onClose(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save this product.'); }
  };
  return <form id="product-form" onSubmit={submit} className="space-y-5">
    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4"><ProductThumb image={form.image} name={form.name || 'Product'} size="lg" /><div className="min-w-0 flex-1"><FormField label="Product image" hint="Use an emoji or paste a public image URL."><Input value={form.image} maxLength={300} onChange={(event) => set('image', event.target.value)} placeholder="📦 or https://…" /></FormField></div></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Product name" required className="sm:col-span-2"><Input value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="e.g. Wireless office mouse" autoFocus required /></FormField>
      <FormField label="SKU" required hint="Letters, numbers, and hyphens only"><Input value={form.sku} onChange={(event) => set('sku', event.target.value.toUpperCase())} placeholder="ELE-MSE-001" required /></FormField>
      <FormField label="Barcode" required hint="8–14 numeric digits"><Input value={form.barcode} onChange={(event) => set('barcode', event.target.value.replace(/\D/g, ''))} placeholder="810045672099" inputMode="numeric" required /></FormField>
      <FormField label="Category" required><Select value={form.categoryId} onChange={(event) => set('categoryId', event.target.value)} required><option value="">Select category</option>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></FormField>
      <FormField label="Supplier" required><Select value={form.supplierId} onChange={(event) => set('supplierId', event.target.value)} required><option value="">Select supplier</option>{data.suppliers.filter((item) => item.status === 'active' || item.id === form.supplierId).map((item) => <option key={item.id} value={item.id}>{item.name}{item.status === 'inactive' ? ' (inactive)' : ''}</option>)}</Select></FormField>
      <FormField label="Unit cost" required><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">₱</span><Input type="number" min="0" step="0.01" value={form.cost} onChange={(event) => set('cost', Number(event.target.value))} className="pl-7" required /></div></FormField>
      <FormField label="Selling price" required><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">₱</span><Input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(event) => set('sellingPrice', Number(event.target.value))} className="pl-7" required /></div></FormField>
      <FormField label={product ? 'Current stock' : 'Opening stock'} required><Input type="number" min="0" step="1" value={form.quantity} onChange={(event) => set('quantity', Number(event.target.value))} required /></FormField>
      <FormField label="Reorder level" required hint="Alert when stock reaches this amount"><Input type="number" min="0" step="1" value={form.reorderLevel} onChange={(event) => set('reorderLevel', Number(event.target.value))} required /></FormField>
    </div>
  </form>;
}

function ProductDetails({ product }: { product: Product }) {
  const { data } = useInventory();
  const category = data.categories.find((item) => item.id === product.categoryId);
  const supplier = data.suppliers.find((item) => item.id === product.supplierId);
  const status = getStockStatus(product);
  return <div><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><ProductThumb image={product.image} name={product.name} size="lg" /><div><div className="mb-2 flex flex-wrap gap-2"><Badge tone={product.status === 'archived' ? 'slate' : status === 'in-stock' ? 'green' : status === 'low-stock' ? 'amber' : 'red'}>{product.status === 'archived' ? 'Archived' : stockLabel[status]}</Badge><Badge tone="blue">{category?.name ?? 'Uncategorized'}</Badge></div><h3 className="font-display text-xl font-extrabold text-ink">{product.name}</h3><p className="mt-1 text-sm text-slate-500">{product.sku} · {product.barcode}</p></div></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ label: 'On hand', value: `${product.quantity} units` }, { label: 'Reorder at', value: `${product.reorderLevel} units` }, { label: 'Unit cost', value: currency(product.cost) }, { label: 'Retail price', value: currency(product.sellingPrice) }].map((item) => <div key={item.label} className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p><p className="mt-1 text-sm font-bold text-slate-800">{item.value}</p></div>)}</div><dl className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">{[['Supplier', supplier?.name ?? 'Unknown'], ['Stock value', currency(product.quantity * product.cost)], ['Potential margin', currency(product.sellingPrice - product.cost)], ['Last updated', new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(product.updatedAt))]].map(([term, value]) => <div key={term} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-slate-500">{term}</dt><dd className="text-right font-semibold text-slate-700">{value}</dd></div>)}</dl></div>;
}

export function ProductsPage() {
  const { data, user, archiveProduct } = useInventory();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState('all');
  const [stock, setStock] = useState(params.get('stock') ?? 'all');
  const [visibility, setVisibility] = useState<'active' | 'archived' | 'all'>('active');
  const [sort, setSort] = useState<'name' | 'quantity' | 'value'>('name');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [archiving, setArchiving] = useState<Product | null>(null);
  const canManage = !!user && canManageCatalog(user.role);
  const pageSize = 7;

  useEffect(() => { if (params.get('new') === 'true' && canManage) { setEditing('new'); setParams((current) => { current.delete('new'); return current; }, { replace: true }); } }, [params, setParams, canManage]);
  useEffect(() => setPage(1), [search, category, stock, visibility, sort]);

  const filtered = useMemo(() => filterProducts(data.products, { search, category, stock, visibility, sort }), [data.products, search, category, stock, visibility, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return <div className="animate-enter">
    <PageHeader eyebrow="Catalog" title="Products" description="Manage your product catalog, pricing, stock thresholds, and supplier assignments." actions={canManage ? <Button onClick={() => setEditing('new')}><Plus size={17} />Add product</Button> : <Badge tone="slate">View-only catalog access</Badge>} />
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 p-4 sm:p-5"><div className="flex flex-col gap-3 xl:flex-row"><SearchInput value={search} onChange={setSearch} placeholder="Search product, SKU, or barcode…" /><div className="grid grid-cols-2 gap-2 sm:flex"><Select value={category} onChange={(event) => setCategory(event.target.value)} className="sm:w-44"><option value="all">All categories</option>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select><Select value={stock} onChange={(event) => setStock(event.target.value)} className="sm:w-40"><option value="all">All stock levels</option><option value="in-stock">In stock</option><option value="low-stock">Low stock</option><option value="out-of-stock">Out of stock</option><option value="attention">Needs attention</option></Select><Select value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)} className="sm:w-36"><option value="active">Active</option><option value="archived">Archived</option><option value="all">All products</option></Select><Select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="sm:w-40"><option value="name">Sort: Name</option><option value="quantity">Sort: Lowest stock</option><option value="value">Sort: Value</option></Select></div></div><div className="mt-3 flex items-center justify-between"><p className="flex items-center gap-2 text-xs text-slate-500"><SlidersHorizontal size={14} />{filtered.length} matching products</p>{(search || category !== 'all' || stock !== 'all' || visibility !== 'active') && <button onClick={() => { setSearch(''); setCategory('all'); setStock('all'); setVisibility('active'); }} className="text-xs font-bold text-brand-600">Clear filters</button>}</div></div>
      {paged.length ? <div className="table-scroll"><table><thead><tr><th>Product</th><th>Category</th><th>Supplier</th><th><span className="flex items-center gap-1">Stock <ArrowDownUp size={12} /></span></th><th>Unit cost</th><th>Retail price</th><th>Status</th><th className="text-right">Actions</th></tr></thead><tbody>{paged.map((product) => { const status: StockStatus = getStockStatus(product); const categoryName = data.categories.find((item) => item.id === product.categoryId)?.name; const supplierName = data.suppliers.find((item) => item.id === product.supplierId)?.name; return <tr key={product.id}><td><div className="flex min-w-[220px] items-center gap-3"><ProductThumb image={product.image} name={product.name} /><div><button onClick={() => setViewing(product)} className="font-bold text-slate-800 hover:text-brand-600">{product.name}</button><p className="mt-0.5 text-xs text-slate-400">{product.sku}</p></div></div></td><td className="whitespace-nowrap text-slate-600">{categoryName}</td><td className="max-w-40 truncate text-slate-600">{supplierName}</td><td><span className="font-display text-base font-bold text-slate-800">{product.quantity}</span><span className="ml-1 text-xs text-slate-400">units</span></td><td className="whitespace-nowrap font-semibold text-slate-600">{currency(product.cost)}</td><td className="whitespace-nowrap font-semibold text-slate-800">{currency(product.sellingPrice)}</td><td><Badge tone={product.status === 'archived' ? 'slate' : status === 'in-stock' ? 'green' : status === 'low-stock' ? 'amber' : 'red'}>{product.status === 'archived' ? 'Archived' : stockLabel[status]}</Badge></td><td><div className="flex justify-end gap-1"><button onClick={() => setViewing(product)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-brand-600" title="View product"><Eye size={16} /></button>{canManage && <><button onClick={() => setEditing(product)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-brand-600" title="Edit product"><Pencil size={16} /></button><button onClick={() => setArchiving(product)} className={`grid h-9 w-9 place-items-center rounded-lg text-slate-400 ${product.status === 'archived' ? 'hover:bg-emerald-50 hover:text-emerald-600' : 'hover:bg-red-50 hover:text-red-600'}`} title={product.status === 'archived' ? 'Restore product' : 'Archive product'}>{product.status === 'archived' ? <RotateCcw size={16} /> : <Archive size={16} />}</button></>}</div></td></tr>; })}</tbody></table></div> : <EmptyState title="No products found" description="Try changing your filters or create a new product to expand your inventory." action={canManage && !search ? <Button onClick={() => setEditing('new')}><PackagePlus size={17} />Create product</Button> : undefined} />}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filtered.length} from={(page - 1) * pageSize + 1} to={Math.min(page * pageSize, filtered.length)} />
    </Card>
    <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add a new product' : 'Edit product'} description={editing === 'new' ? 'Create a complete catalog record with opening stock.' : 'Update product details and inventory thresholds.'} size="xl" footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="product-form">{editing === 'new' ? 'Create product' : 'Save changes'}</Button></>}>{editing && <ProductForm product={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}</Modal>
    <Modal open={!!viewing} onClose={() => setViewing(null)} title="Product details" description="Catalog and inventory summary." footer={<Button variant="secondary" onClick={() => setViewing(null)}>Close</Button>}>{viewing && <ProductDetails product={viewing} />}</Modal>
    <ConfirmDialog open={!!archiving} onClose={() => setArchiving(null)} onConfirm={() => archiving && archiveProduct(archiving.id)} title={archiving?.status === 'archived' ? 'Restore this product?' : 'Archive this product?'} description={archiving?.status === 'archived' ? `${archiving?.name} will return to the active catalog.` : `${archiving?.name} will be hidden from active inventory and stock transactions.`} confirmLabel={archiving?.status === 'archived' ? 'Restore product' : 'Archive product'} danger={archiving?.status !== 'archived'} />
  </div>;
}
