import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownLeft, ArrowDownToLine, ArrowUpFromLine, CalendarDays, ClipboardList, Plus, Scale } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import type { TransactionType } from '../types';
import { formatDate, number } from '../lib/utils';
import { Badge, Button, Card, EmptyState, FormField, Input, Modal, PageHeader, Pagination, ProductThumb, SearchInput, Select } from '../components/ui';

function TransactionForm({ initialType, onClose }: { initialType: TransactionType; onClose(): void }) {
  const { data, adjustStock } = useInventory();
  const [type, setType] = useState<TransactionType>(initialType);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const product = data.products.find((item) => item.id === productId);
  const available = product?.quantity ?? 0;
  const projected = type === 'stock-in' ? available + quantity : available - quantity;
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    try { adjustStock(productId, type, quantity, reference, note); onClose(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to complete the transaction.'); }
  };
  return <form id="transaction-form" onSubmit={submit} className="space-y-5">
    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5"><button type="button" onClick={() => setType('stock-in')} className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${type === 'stock-in' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}><ArrowDownToLine size={17} />Stock in</button><button type="button" onClick={() => setType('stock-out')} className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${type === 'stock-out' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500'}`}><ArrowUpFromLine size={17} />Stock out</button></div>
    <FormField label="Product" required><Select value={productId} onChange={(event) => setProductId(event.target.value)} autoFocus required><option value="">Select an active product</option>{data.products.filter((item) => item.status === 'active').sort((a, b) => a.name.localeCompare(b.name)).map((item) => <option key={item.id} value={item.id}>{item.name} · {item.sku} ({item.quantity} available)</option>)}</Select></FormField>
    {product && <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><ProductThumb image={product.image} name={product.name} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-700">{product.name}</p><p className="text-xs text-slate-500">Current stock: {number(product.quantity)} units</p></div><Badge tone={projected < 0 ? 'red' : projected <= product.reorderLevel ? 'amber' : 'green'}>{projected} after</Badge></div>}
    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Quantity" required error={type === 'stock-out' && quantity > available && product ? `Maximum available: ${available}` : undefined}><Input type="number" min="1" step="1" max={type === 'stock-out' && product ? available : undefined} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} required /></FormField><FormField label="Reference" required hint={type === 'stock-in' ? 'e.g. PO-8845' : 'e.g. SO-1062'}><Input value={reference} onChange={(event) => setReference(event.target.value.toUpperCase())} placeholder={type === 'stock-in' ? 'PO-8845' : 'SO-1062'} required /></FormField></div>
    <FormField label="Note" hint="Optional context for the audit trail"><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Add delivery, order, or adjustment details…" className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" /></FormField>
  </form>;
}

export function TransactionsPage() {
  const { data } = useInventory();
  const [params, setParams] = useSearchParams();
  const [modal, setModal] = useState<TransactionType | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | TransactionType>('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  useEffect(() => { const create = params.get('new'); if (create === 'stock-in' || create === 'stock-out') { setModal(create); setParams({}, { replace: true }); } }, [params, setParams]);
  useEffect(() => setPage(1), [search, type]);
  const filtered = useMemo(() => data.transactions.filter((transaction) => {
    const product = data.products.find((item) => item.id === transaction.productId);
    const term = search.toLowerCase();
    return (type === 'all' || transaction.type === type) && (!term || product?.name.toLowerCase().includes(term) || product?.sku.toLowerCase().includes(term) || transaction.reference.toLowerCase().includes(term));
  }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [data.transactions, data.products, search, type]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const incoming = data.transactions.filter((item) => item.type === 'stock-in').reduce((sum, item) => sum + item.quantity, 0);
  const outgoing = data.transactions.filter((item) => item.type === 'stock-out').reduce((sum, item) => sum + item.quantity, 0);

  return <div className="animate-enter">
    <PageHeader eyebrow="Inventory operations" title="Stock transactions" description="Receive, issue, and trace every unit moving through your inventory." actions={<><Button variant="secondary" onClick={() => setModal('stock-out')}><ArrowUpFromLine size={17} />Stock out</Button><Button onClick={() => setModal('stock-in')}><ArrowDownToLine size={17} />Stock in</Button></>} />
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><Card className="flex items-center gap-4 p-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ArrowDownLeft size={20} /></div><div><p className="text-xs font-semibold text-slate-500">Total received</p><p className="font-display text-xl font-extrabold text-ink">{number(incoming)} <span className="text-xs font-semibold text-slate-400">units</span></p></div></Card><Card className="flex items-center gap-4 p-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600"><ArrowUpFromLine size={20} /></div><div><p className="text-xs font-semibold text-slate-500">Total issued</p><p className="font-display text-xl font-extrabold text-ink">{number(outgoing)} <span className="text-xs font-semibold text-slate-400">units</span></p></div></Card><Card className="flex items-center gap-4 p-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-brand-600"><Scale size={20} /></div><div><p className="text-xs font-semibold text-slate-500">Net movement</p><p className="font-display text-xl font-extrabold text-ink">{incoming - outgoing >= 0 ? '+' : ''}{number(incoming - outgoing)} <span className="text-xs font-semibold text-slate-400">units</span></p></div></Card></div>
    <Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:p-5"><SearchInput value={search} onChange={setSearch} placeholder="Search product, SKU, or reference…" /><Select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="sm:w-44"><option value="all">All movements</option><option value="stock-in">Stock in</option><option value="stock-out">Stock out</option></Select></div>
      {paged.length ? <div className="table-scroll"><table><thead><tr><th>Date & time</th><th>Reference</th><th>Product</th><th>Movement</th><th>Before</th><th>After</th><th>Performed by</th><th>Note</th></tr></thead><tbody>{paged.map((transaction) => { const product = data.products.find((item) => item.id === transaction.productId); const actor = data.users.find((item) => item.id === transaction.performedBy); return <tr key={transaction.id}><td className="min-w-36"><p className="font-semibold text-slate-700">{formatDate(transaction.createdAt, true)}</p><p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400"><CalendarDays size={11} />{new Date(transaction.createdAt).getFullYear()}</p></td><td><span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">{transaction.reference}</span></td><td><div className="flex min-w-[220px] items-center gap-3"><ProductThumb image={product?.image ?? '📦'} name={product?.name ?? 'Product'} size="sm" /><div><p className="font-bold text-slate-800">{product?.name ?? 'Archived product'}</p><p className="text-xs text-slate-400">{product?.sku}</p></div></div></td><td><Badge tone={transaction.type === 'stock-in' ? 'green' : 'amber'}>{transaction.type === 'stock-in' ? <ArrowDownToLine size={12} /> : <ArrowUpFromLine size={12} />}{transaction.type === 'stock-in' ? '+' : '−'}{transaction.quantity} units</Badge></td><td className="font-semibold text-slate-500">{transaction.previousStock}</td><td className="font-bold text-slate-800">{transaction.newStock}</td><td className="whitespace-nowrap"><p className="font-semibold text-slate-700">{actor?.name ?? 'Unknown'}</p><p className="text-xs text-slate-400">{actor?.role}</p></td><td className="max-w-56 truncate text-slate-500">{transaction.note || '—'}</td></tr>; })}</tbody></table></div> : <EmptyState title="No transactions found" description="No stock movement matches your current search and filter settings." action={<Button onClick={() => setModal('stock-in')}><Plus size={17} />Record stock</Button>} />}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filtered.length} from={(page - 1) * pageSize + 1} to={Math.min(page * pageSize, filtered.length)} />
    </Card>
    <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'stock-in' ? 'Record stock in' : 'Record stock out'} description={modal === 'stock-in' ? 'Receive items and increase available inventory.' : 'Issue items without allowing inventory to go negative.'} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button type="submit" form="transaction-form">Record transaction</Button></>}>{modal && <TransactionForm initialType={modal} onClose={() => setModal(null)} />}</Modal>
  </div>;
}
