import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  PackageSearch,
  ShieldCheck,
  UsersRound,
  Warehouse,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { currency, getStockStatus } from '../lib/utils';

const features = [
  { icon: PackageSearch, title: 'Product control', text: 'Organize SKU, barcode, pricing, suppliers, categories, and stock levels in one catalog.' },
  { icon: ClipboardCheck, title: 'Stock movement', text: 'Record stock-in and stock-out activity with automatic quantity updates and clear history.' },
  { icon: BarChart3, title: 'Reports that act', text: 'See inventory value, movement trends, low-stock items, and export-ready operational reports.' },
  { icon: ShieldCheck, title: 'Accountability built in', text: 'Use role-based access and a complete audit trail for Admin, Manager, and Staff actions.' },
];

export function LandingPage() {
  const { data, user } = useInventory();
  const activeProducts = data.products.filter((product) => product.status === 'active');
  const lowStock = activeProducts.filter((product) => getStockStatus(product) !== 'in-stock').length;
  const inventoryValue = activeProducts.reduce((total, product) => total + product.cost * product.quantity, 0);

  return <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
    <div className="absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,.28),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(124,58,237,.2),transparent_32%)]" aria-hidden="true" />
    <header className="relative z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="InvenTrack home">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 shadow-lg shadow-brand-950/40"><Boxes size={24} strokeWidth={2.4} /></span>
          <span><span className="block font-display text-xl font-extrabold tracking-tight">InvenTrack</span><span className="block text-[9px] font-bold uppercase tracking-[.2em] text-slate-500">Inventory Management System</span></span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 sm:gap-3" aria-label="Main navigation">
          <a href="#features" className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white sm:block">Features</a>
          {user ? <Link to="/dashboard" className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold shadow-lg shadow-blue-950/30 transition hover:bg-brand-500">Open dashboard<ArrowRight size={16} /></Link> : <>
            <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/5 sm:px-4">Sign in</Link>
            <Link to="/register" className="hidden h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold shadow-lg shadow-blue-950/30 transition hover:bg-brand-500 sm:inline-flex">Create account<ArrowRight size={16} /></Link>
          </>}
        </nav>
      </div>
    </header>

    <main className="relative">
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_.95fr] lg:py-32">
        <div className="animate-enter">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-blue-300"><Warehouse size={14} />Smarter inventory operations</span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-[-.04em] sm:text-6xl">Know what you have.<br /><span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Move with confidence.</span></h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">InvenTrack gives growing teams one dependable workspace for products, stock movement, suppliers, reports, and operational accountability.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={user ? '/dashboard' : '/login'} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold shadow-xl shadow-blue-950/40 transition hover:-translate-y-0.5 hover:bg-brand-500">{user ? 'Open your dashboard' : 'Explore the live demo'}<ArrowRight size={17} /></Link>
            {!user && <Link to="/register" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-bold text-slate-200 transition hover:bg-white/10">Create a workspace</Link>}
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-400">
            {['Role-based access', 'Low-stock alerts', 'Local demo data'].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" />{item}</span>)}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          <div className="absolute -inset-8 rounded-[3rem] bg-brand-600/10 blur-3xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[.07] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div><p className="font-display text-sm font-bold">Inventory overview</p><p className="mt-1 text-[11px] text-slate-400">Live demo workspace</p></div>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">Operational</span>
            </div>
            <div className="grid grid-cols-2 gap-3 py-4">
              {[{ label: 'Active products', value: activeProducts.length.toString(), tint: 'text-blue-300' }, { label: 'Needs attention', value: lowStock.toString(), tint: 'text-amber-300' }, { label: 'Inventory value', value: currency(inventoryValue), tint: 'text-emerald-300' }, { label: 'User roles', value: '3', tint: 'text-violet-300' }].map((metric) => <div key={metric.label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><p className="text-[11px] font-semibold text-slate-500">{metric.label}</p><p className={`mt-2 font-display text-xl font-extrabold ${metric.tint}`}>{metric.value}</p></div>)}
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between"><p className="text-xs font-bold text-slate-200">Stock movement</p><p className="text-[10px] text-slate-500">Last 7 days</p></div>
              <div className="mt-5 flex h-32 items-end justify-between gap-3" aria-label="Sample stock movement chart">
                {[28, 62, 40, 88, 54, 75, 48].map((height, index) => <div key={index} className="flex h-full flex-1 items-end gap-1"><span className="w-1/2 rounded-t bg-blue-500" style={{ height: `${height}%` }} /><span className="w-1/2 rounded-t bg-violet-500/80" style={{ height: `${Math.max(12, 72 - height / 2)}%` }} /></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-brand-400">Built for daily operations</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Everything your inventory team needs.</h2><p className="mt-4 leading-7 text-slate-400">From receiving stock to reviewing reports, every workflow stays connected and easy to trace.</p></div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 transition hover:-translate-y-1 hover:border-blue-400/30"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10 text-blue-300"><Icon size={21} /></span><h3 className="mt-5 font-display text-base font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 sm:py-24">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 to-violet-600/10 px-6 py-12 sm:px-12">
          <UsersRound className="mx-auto text-blue-300" size={30} />
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight">Ready to see InvenTrack in action?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">Sign in with a demo role or create an account to explore the complete inventory workflow.</p>
          <Link to={user ? '/dashboard' : '/login'} className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-blue-50">{user ? 'Go to dashboard' : 'Open live workspace'}<ArrowRight size={17} /></Link>
        </div>
      </section>
    </main>

    <footer className="relative border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><p>© {new Date().getFullYear()} InvenTrack. Inventory clarity for growing teams.</p><div className="flex gap-5"><Link to="/login" className="hover:text-slate-300">Sign in</Link><Link to="/register" className="hover:text-slate-300">Register</Link></div></div>
    </footer>
  </div>;
}
