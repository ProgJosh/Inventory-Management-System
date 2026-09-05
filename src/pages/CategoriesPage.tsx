import { useMemo, useState } from 'react';
import { FolderTree, Package, Pencil, Plus, Search } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { canManageCatalog } from '../services/inventoryService';
import type { Category, CategoryInput } from '../types';
import { currency } from '../lib/utils';
import { Badge, Button, Card, EmptyState, FormField, Input, Modal, PageHeader, SearchInput } from '../components/ui';

const colors = ['#2563eb', '#7c3aed', '#0891b2', '#ea580c', '#16a34a', '#db2777', '#475569', '#ca8a04'];

function CategoryForm({ category, onClose }: { category?: Category; onClose(): void }) {
  const { saveCategory } = useInventory();
  const [form, setForm] = useState<CategoryInput>(category ? { name: category.name, description: category.description, color: category.color } : { name: '', description: '', color: colors[0] });
  const [error, setError] = useState('');
  const submit = (event: React.FormEvent) => { event.preventDefault(); setError(''); try { saveCategory(form, category?.id); onClose(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save category.'); } };
  return <form id="category-form" onSubmit={submit} className="space-y-5">{error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}<FormField label="Category name" required><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Warehouse equipment" autoFocus required /></FormField><FormField label="Description"><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="w-full resize-none rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" placeholder="Describe the items grouped here…" /></FormField><FormField label="Category color"><div className="flex flex-wrap gap-2">{colors.map((color) => <button key={color} type="button" onClick={() => setForm({ ...form, color })} className={`grid h-9 w-9 place-items-center rounded-full transition ${form.color === color ? 'ring-4 ring-slate-200' : 'hover:scale-105'}`} style={{ background: color }} aria-label={`Use color ${color}`}>{form.color === color && <span className="h-2.5 w-2.5 rounded-full bg-white" />}</button>)}</div></FormField></form>;
}

export function CategoriesPage() {
  const { data, user } = useInventory();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const canManage = !!user && canManageCatalog(user.role);
  const categories = useMemo(() => data.categories.map((category) => {
    const products = data.products.filter((product) => product.categoryId === category.id && product.status === 'active');
    return { ...category, products: products.length, units: products.reduce((sum, product) => sum + product.quantity, 0), value: products.reduce((sum, product) => sum + product.quantity * product.cost, 0) };
  }).filter((category) => !search || category.name.toLowerCase().includes(search.toLowerCase()) || category.description.toLowerCase().includes(search.toLowerCase())), [data.categories, data.products, search]);

  return <div className="animate-enter"><PageHeader eyebrow="Catalog organization" title="Categories" description="Organize products into clear groups and understand where your inventory is concentrated." actions={canManage ? <Button onClick={() => setEditing('new')}><Plus size={17} />Add category</Button> : <Badge tone="slate">View-only access</Badge>} />
    <div className="mb-5 max-w-xl"><SearchInput value={search} onChange={setSearch} placeholder="Search categories…" /></div>
    {categories.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{categories.map((category) => <Card key={category.id} className="group relative overflow-hidden p-5"><div className="absolute inset-x-0 top-0 h-1" style={{ background: category.color }} /><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl text-white shadow-sm" style={{ background: category.color }}><FolderTree size={20} /></div>{canManage && <button onClick={() => setEditing(category)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 opacity-70 hover:bg-slate-100 hover:text-brand-600 group-hover:opacity-100" aria-label={`Edit ${category.name}`}><Pencil size={16} /></button>}</div><h2 className="mt-4 font-display text-lg font-extrabold text-ink">{category.name}</h2><p className="mt-1 h-10 text-sm leading-5 text-slate-500">{category.description || 'No description added.'}</p><div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-3 text-center"><div><p className="font-display text-base font-extrabold text-slate-800">{category.products}</p><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Products</p></div><div><p className="font-display text-base font-extrabold text-slate-800">{category.units}</p><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Units</p></div><div><p className="font-display text-sm font-extrabold text-slate-800">{currency(category.value)}</p><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Value</p></div></div></Card>)}</div> : <Card><EmptyState title="No categories found" description="No category matches your search. Clear it or create a new category." action={canManage ? <Button onClick={() => setEditing('new')}><Package size={17} />Create category</Button> : undefined} /></Card>}
    <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Create category' : 'Edit category'} description="Choose a clear name, description, and visual identifier." size="sm" footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="category-form">{editing === 'new' ? 'Create category' : 'Save changes'}</Button></>}>{editing && <CategoryForm category={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}</Modal>
  </div>;
}
