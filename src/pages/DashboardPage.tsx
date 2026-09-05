import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowDownToLine, ArrowRight, ArrowUpFromLine, Boxes, DollarSign, PackageCheck, PackageX, ShieldCheck, TrendingUp } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { currency, getStockStatus, number, relativeTime } from '../lib/utils';
import { Badge, Card, PageHeader, ProductThumb } from '../components/ui';
import { canManageCatalog, canViewAudit } from '../services/inventoryService';

export function DashboardPage() {
  const { data, user } = useInventory();
  const products = data.products.filter((product) => product.status === 'active');
  const metrics = useMemo(() => ({
    totalProducts: products.length,
    lowStock: products.filter((item) => getStockStatus(item) === 'low-stock').length,
    outOfStock: products.filter((item) => getStockStatus(item) === 'out-of-stock').length,
    inventoryValue: products.reduce((sum, item) => sum + item.cost * item.quantity, 0),
  }), [products]);
  const attention = [...products].filter((product) => getStockStatus(product) !== 'in-stock').sort((a, b) => a.quantity - b.quantity);
  const categoryValues = data.categories.map((category) => ({
    ...category,
    value: products.filter((product) => product.categoryId === category.id).reduce((sum, product) => sum + product.cost * product.quantity, 0),
  })).sort((a, b) => b.value - a.value);
  const maxCategory = Math.max(...categoryValues.map((item) => item.value), 1);
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const next = new Date(date); next.setDate(next.getDate() + 1);
    const txns = data.transactions.filter((item) => new Date(item.createdAt) >= date && new Date(item.createdAt) < next);
    return {
      day: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date),
      incoming: txns.filter((item) => item.type === 'stock-in').reduce((sum, item) => sum + item.quantity, 0),
      outgoing: txns.filter((item) => item.type === 'stock-out').reduce((sum, item) => sum + item.quantity, 0),
    };
  });
  const maxMovement = Math.max(...week.flatMap((day) => [day.incoming, day.outgoing]), 1);
  const firstName = user?.name.split(' ')[0];
  const canManage = !!user && canManageCatalog(user.role);
  const roleSummary = user?.role === 'Admin'
    ? { title: 'Administrator dashboard', text: 'Full workspace oversight, user administration, and audit access.', link: '/users', action: 'Manage users' }
    : user?.role === 'Manager'
      ? { title: 'Manager dashboard', text: 'Catalog, supplier, category, and replenishment controls are enabled.', link: '/products?stock=attention', action: 'Review low stock' }
      : { title: 'Staff dashboard', text: 'Process daily stock movements and monitor available inventory.', link: '/transactions', action: 'Open transactions' };

  return <div className="animate-enter">
    <PageHeader eyebrow="Command center" title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${firstName}`} description="Here’s what’s happening across your inventory today." actions={<><Link to="/transactions?new=stock-in" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ArrowDownToLine size={17} />Stock in</Link><Link to={canManage ? '/products?new=true' : '/products'} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"><Boxes size={17} />{canManage ? 'Add product' : 'View products'}</Link></>} />

    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-4 sm:flex-row sm:items-center"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white"><ShieldCheck size={19} /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-display text-sm font-extrabold text-slate-800">{roleSummary.title}</p><Badge tone={user?.role === 'Admin' ? 'purple' : user?.role === 'Manager' ? 'blue' : 'green'}>{user?.role}</Badge></div><p className="mt-1 text-xs text-slate-500">{roleSummary.text}</p></div><Link to={roleSummary.link} className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-xl bg-white px-3 text-xs font-bold text-brand-600 shadow-sm ring-1 ring-slate-200 hover:bg-brand-50">{roleSummary.action}<ArrowRight size={14} /></Link></div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: 'Total products', value: number(metrics.totalProducts), note: 'Active catalog items', icon: PackageCheck, tint: 'bg-blue-50 text-blue-600', trend: '+3 this month' },
        { label: 'Low stock', value: number(metrics.lowStock), note: 'At or below reorder level', icon: AlertTriangle, tint: 'bg-amber-50 text-amber-600', trend: 'Needs review' },
        { label: 'Out of stock', value: number(metrics.outOfStock), note: 'Unavailable for fulfillment', icon: PackageX, tint: 'bg-red-50 text-red-600', trend: metrics.outOfStock ? 'Restock now' : 'All healthy' },
        { label: 'Inventory value', value: currency(metrics.inventoryValue), note: 'Based on acquisition cost', icon: DollarSign, tint: 'bg-emerald-50 text-emerald-600', trend: '+8.2% vs last month' },
      ].map(({ label, value, note, icon: Icon, tint, trend }) => <Card key={label} className="p-5"><div className="flex items-start justify-between"><div className={`grid h-11 w-11 place-items-center rounded-xl ${tint}`}><Icon size={21} /></div><span className="flex items-center gap-1 text-[11px] font-bold text-slate-400"><TrendingUp size={12} />{trend}</span></div><p className="mt-5 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></Card>)}
    </div>

    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,.8fr)]">
      <Card className="min-w-0 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-display text-lg font-bold text-ink">Stock movement</h2><p className="mt-1 text-xs text-slate-500">Units received and issued over the last 7 days</p></div><div className="flex items-center gap-4 text-xs font-semibold text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-brand-500" />Stock in</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-violet-400" />Stock out</span></div></div>
        <div className="mt-7 flex h-56 items-end gap-3 border-b border-slate-200 sm:gap-6">{week.map((day) => <div key={day.day} className="group flex h-full flex-1 flex-col items-center justify-end"><div className="flex h-[190px] w-full items-end justify-center gap-1 sm:gap-2"><div title={`${day.incoming} in`} className="w-2.5 rounded-t-md bg-brand-500 transition-all group-hover:bg-brand-600 sm:w-4" style={{ height: `${Math.max(3, day.incoming / maxMovement * 100)}%` }} /><div title={`${day.outgoing} out`} className="w-2.5 rounded-t-md bg-violet-400 transition-all group-hover:bg-violet-500 sm:w-4" style={{ height: `${Math.max(3, day.outgoing / maxMovement * 100)}%` }} /></div><span className="my-2 text-[10px] font-semibold text-slate-400 sm:text-xs">{day.day}</span></div>)}</div>
      </Card>

      <Card className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-bold text-ink">Inventory value</h2><p className="mt-1 text-xs text-slate-500">Value by product category</p></div><span className="font-display text-sm font-bold text-slate-700">{currency(metrics.inventoryValue)}</span></div><div className="mt-6 space-y-4">{categoryValues.map((category) => <div key={category.id}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="flex items-center gap-2 font-semibold text-slate-600"><i className="h-2.5 w-2.5 rounded-full" style={{ background: category.color }} />{category.name}</span><span className="font-bold text-slate-700">{currency(category.value)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ background: category.color, width: `${category.value / maxCategory * 100}%` }} /></div></div>)}</div></Card>
    </div>

    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,.85fr)]">
      <Card className="overflow-hidden"><div className="flex items-center justify-between px-5 py-5 sm:px-6"><div><h2 className="font-display text-lg font-bold text-ink">Recent activity</h2><p className="mt-1 text-xs text-slate-500">Latest changes across your workspace</p></div><Link to={user && canViewAudit(user.role) ? '/audit-log' : '/transactions'} className="hidden items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 sm:flex">View all <ArrowRight size={14} /></Link></div><div>{data.auditLogs.slice(0, 5).map((log) => <div key={log.id} className="flex items-start gap-3 border-t border-slate-100 px-5 py-3.5 sm:px-6"><div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${log.action === 'Stock in' ? 'bg-emerald-50 text-emerald-600' : log.action === 'Stock out' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-brand-600'}`}>{log.action === 'Stock in' ? <ArrowDownToLine size={16} /> : log.action === 'Stock out' ? <ArrowUpFromLine size={16} /> : <Boxes size={16} />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm text-slate-700"><span className="font-bold">{log.userName}</span> · {log.action.toLowerCase()}</p><p className="mt-0.5 truncate text-xs text-slate-500">{log.entityName} — {log.detail}</p></div><span className="shrink-0 text-[11px] text-slate-400">{relativeTime(log.createdAt)}</span></div>)}</div></Card>

      <Card className="overflow-hidden"><div className="flex items-center justify-between px-5 py-5 sm:px-6"><div><h2 className="font-display text-lg font-bold text-ink">Needs attention</h2><p className="mt-1 text-xs text-slate-500">Low and out-of-stock products</p></div><Badge tone={attention.length ? 'amber' : 'green'}>{attention.length} items</Badge></div>{attention.length ? <div>{attention.slice(0, 5).map((product) => <div key={product.id} className="flex items-center gap-3 border-t border-slate-100 px-5 py-3 sm:px-6"><ProductThumb image={product.image} name={product.name} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-700">{product.name}</p><p className="text-xs text-slate-400">{product.sku} · Reorder {product.reorderLevel}</p></div><Badge tone={product.quantity === 0 ? 'red' : 'amber'}>{product.quantity} left</Badge></div>)}</div> : <p className="border-t border-slate-100 p-8 text-center text-sm text-slate-500">All product levels are healthy.</p>}<Link to="/products?stock=attention" className="flex h-12 items-center justify-center gap-1 border-t border-slate-100 text-xs font-bold text-brand-600 hover:bg-brand-50">Review inventory <ArrowRight size={14} /></Link></Card>
    </div>
  </div>;
}
