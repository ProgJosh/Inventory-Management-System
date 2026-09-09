import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, BarChart3, Bell, Boxes, ChevronDown, ClipboardList, FolderTree,
  LayoutDashboard, LogOut, Menu, Package, PanelLeftClose, Search, ShieldCheck,
  Store, Truck, CircleUserRound, UsersRound, X,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { canViewAudit } from '../../services/inventoryService';
import { cn, getStockStatus } from '../../lib/utils';
import { Badge, ProductThumb } from '../ui';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/transactions', label: 'Transactions', icon: ClipboardList },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/users', label: 'Users & roles', icon: UsersRound, adminOnly: true },
  { to: '/audit-log', label: 'Audit log', icon: ShieldCheck, adminOnly: true },
];

export function AppLayout() {
  const { data, user, logout } = useInventory();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const alerts = useMemo(() => data.products.filter((product) => product.status === 'active' && getStockStatus(product) !== 'in-stock'), [data.products]);

  const runSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?q=${encodeURIComponent(search.trim())}`);
    setSearch('');
  };

  const sidebar = <>
    <div className={cn('flex h-20 items-center border-b border-slate-800/80 px-5', collapsed ? 'justify-center' : 'justify-between')}>
      <button className="flex items-center gap-3 overflow-hidden text-left" onClick={() => navigate('/')}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-950/20"><Boxes size={22} strokeWidth={2.4} /></span>
        {!collapsed && <span><span className="block font-display text-lg font-extrabold tracking-tight text-white">InvenTrack</span><span className="block text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Inventory Management System</span></span>}
      </button>
      {!collapsed && <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white lg:hidden" onClick={() => setMobileOpen(false)}><X size={19} /></button>}
    </div>
    <nav className="flex-1 space-y-1 px-3 py-5">
      {!collapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-600">Workspace</p>}
      {navItems.filter((item) => !item.adminOnly || (user && canViewAudit(user.role))).map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} title={collapsed ? label : undefined} className={({ isActive }) => cn('group flex h-11 items-center rounded-xl text-sm font-semibold transition', collapsed ? 'justify-center px-0' : 'gap-3 px-3', isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-950/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white')}><Icon size={19} strokeWidth={2} /><span className={cn(collapsed && 'hidden')}>{label}</span>{label === 'Products' && alerts.length > 0 && !collapsed && <span className="ml-auto rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">{alerts.length}</span>}</NavLink>)}
    </nav>
    <div className="border-t border-slate-800/80 p-3">
      {!collapsed && <div className="mb-3 rounded-xl bg-slate-800/80 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,.12)]" />Local data mode</div><p className="mt-1.5 text-[11px] leading-4 text-slate-500">Changes are securely stored in this browser.</p></div>}
      <button onClick={() => setCollapsed(!collapsed)} className="hidden h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-800 hover:text-slate-200 lg:flex"><PanelLeftClose size={16} className={cn('transition', collapsed && 'rotate-180')} />{!collapsed && 'Collapse sidebar'}</button>
    </div>
  </>;

  return <div className="min-h-screen bg-canvas text-slate-800">
    <aside className={cn('fixed inset-y-0 left-0 z-40 hidden flex-col bg-slate-950 transition-[width] duration-200 lg:flex', collapsed ? 'w-[76px]' : 'w-64')}>{sidebar}</aside>
    {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}><aside className="flex h-full w-72 flex-col bg-slate-950" onClick={(event) => event.stopPropagation()}>{sidebar}</aside></div>}
    <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
      <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
        <form onSubmit={runSearch} className="relative hidden w-full max-w-md sm:block"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products or SKU…" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100" /></form>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 xl:flex"><Store size={16} className="text-brand-600" />Main warehouse<ChevronDown size={14} className="text-slate-400" /></div>
          <div className="relative">
            <button onClick={() => { setAlertsOpen(!alertsOpen); setProfileOpen(false); }} className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Inventory alerts"><Bell size={18} />{alerts.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}</button>
            {alertsOpen && <div className="absolute right-0 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><p className="font-display text-sm font-bold">Inventory alerts</p><p className="text-xs text-slate-500">{alerts.length} items need attention</p></div><Badge tone={alerts.length ? 'amber' : 'green'}>{alerts.length ? 'Action needed' : 'All clear'}</Badge></div><div className="max-h-80 overflow-auto">{alerts.slice(0, 5).map((product) => <button key={product.id} onClick={() => { navigate('/products?stock=attention'); setAlertsOpen(false); }} className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50"><ProductThumb image={product.image} name={product.name} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-700">{product.name}</p><p className="text-xs text-slate-500">{product.quantity === 0 ? 'Out of stock' : `${product.quantity} left · reorder at ${product.reorderLevel}`}</p></div><AlertTriangle size={16} className={product.quantity === 0 ? 'text-red-500' : 'text-amber-500'} /></button>)}{alerts.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Stock levels look healthy.</p>}</div></div>}
          </div>
          <div className="relative">
            <button onClick={() => { setProfileOpen(!profileOpen); setAlertsOpen(false); }} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-xs font-bold text-white"><CircleUserRound size={20} /></span><span className="hidden text-left md:block"><span className="block text-xs font-bold text-slate-800">{user?.name}</span><span className="block text-[11px] text-slate-500">{user?.role}</span></span><ChevronDown size={14} className="hidden text-slate-400 md:block" /></button>
            {profileOpen && <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lift"><div className="border-b border-slate-100 px-3 py-2"><p className="truncate text-sm font-bold">{user?.name}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div><button onClick={logout} className="mt-1 flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={16} />Sign out</button></div>}
          </div>
        </div>
      </header>
      <main key={location.pathname} className="mx-auto min-h-[calc(100vh-80px)] max-w-[1600px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  </div>;
}
