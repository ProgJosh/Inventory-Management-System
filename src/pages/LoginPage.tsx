import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Boxes, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Button, Input } from '../components/ui';
import { RoleSelector } from '../components/auth/RoleSelector';
import type { Role } from '../types';

export function LoginPage() {
  const { user, login } = useInventory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Staff');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { await login(email, password, remember, role); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in.'); } finally { setSubmitting(false); }
  };

  return <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,.95fr)]">
    <div className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col xl:p-16"><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,.28),transparent_35%),radial-gradient(circle_at_90%_80%,rgba(124,58,237,.2),transparent_38%)]" /><div className="absolute -right-32 top-24 h-96 w-96 rounded-full border border-white/5" /><div className="absolute -right-16 top-40 h-64 w-64 rounded-full border border-white/5" />
      <div className="relative z-10 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-900/50"><Boxes size={24} /></span><div><p className="font-display text-xl font-extrabold text-white">InvenTrack</p><p className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Inventory Management System</p></div></div>
      <div className="relative z-10 my-auto max-w-xl"><h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">Control every item.<br /><span className="text-brand-400">Move with confidence.</span></h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-400">A clear, dependable inventory workspace for the teams who keep your business moving.</p>
        <div className="mt-10 grid grid-cols-3 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><BarChart3 className="mb-4 text-brand-400" size={21} /><p className="text-sm font-bold text-white">Live insights</p><p className="mt-1 text-xs leading-5 text-slate-500">Know what needs attention</p></div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><ShieldCheck className="mb-4 text-violet-400" size={21} /><p className="text-sm font-bold text-white">Role control</p><p className="mt-1 text-xs leading-5 text-slate-500">The right access for every team</p></div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><CheckCircle2 className="mb-4 text-emerald-400" size={21} /><p className="text-sm font-bold text-white">Full traceability</p><p className="mt-1 text-xs leading-5 text-slate-500">Every change is recorded</p></div></div>
      </div><p className="relative z-10 text-xs text-slate-600">© {new Date().getFullYear()} StockPilot Systems. Secure inventory workspace.</p>
    </div>
    <div className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-10"><div className="w-full max-w-md animate-enter"><div className="mb-9 flex items-center gap-3 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white"><Boxes size={21} /></span><p className="font-display text-xl font-extrabold text-ink">StockPilot</p></div><p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600">Welcome back</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">Sign in to your workspace</h2><p className="mt-2 text-sm text-slate-500">Enter the account credentials provided by your administrator.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}<RoleSelector value={role} onChange={setRole} /><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</span><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Password</span><div className="relative"><Input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="pr-11" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label><div className="flex items-center justify-between gap-3"><label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />Keep me signed in</label><Link to="/forgot-password" className="text-xs font-bold text-brand-600 hover:text-brand-700">Forgot password?</Link></div><Button type="submit" className="w-full" loading={submitting}>Sign in <ArrowRight size={17} /></Button></form>
      <p className="mt-6 text-center text-sm text-slate-500">New to StockPilot? <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">Create an account</Link></p><div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-brand-600 shadow-sm"><LockKeyhole size={17} /></div><div><p className="text-sm font-bold text-slate-700">Protected workspace</p><p className="mt-1 text-xs leading-5 text-slate-500">Access and permissions are based on your assigned Admin, Manager, or Staff role.</p></div></div>
    </div></div>
  </div>;
}
