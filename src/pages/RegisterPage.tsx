import { useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/auth/AuthShell';
import { RoleSelector } from '../components/auth/RoleSelector';
import { Button, FormField, Input } from '../components/ui';
import { useInventory } from '../context/InventoryContext';
import type { Role } from '../types';

export function RegisterPage() {
  const { user, register } = useInventory();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('Staff');
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (password !== confirmPassword) { setError('The passwords do not match.'); return; }
    if (!accepted) { setError('Please accept the terms and privacy policy.'); return; }
    setSubmitting(true);
    try { await register(name, email, password, role); navigate('/login'); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create your account.'); } finally { setSubmitting(false); }
  };

  return <AuthShell eyebrow="Get started" title="Create your account" description="Register for inventory access and choose the role appropriate for this local workspace." footer={<>Already have an account? <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">Sign in</Link></>}>
    <form onSubmit={submit} className="space-y-4">
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      <FormField label="Full name" required><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" autoFocus required /></FormField>
      <FormField label="Work email" required><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required /></FormField>
      <RoleSelector value={role} onChange={setRole} label="Register as" />
      <FormField label="Password" required hint="Use at least 8 characters."><div className="relative"><Input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a secure password" autoComplete="new-password" minLength={8} className="pr-11" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></FormField>
      <FormField label="Confirm password" required><Input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" minLength={8} required /></FormField>
      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">{[{ label: '8+ characters', met: password.length >= 8 }, { label: 'Passwords match', met: !!password && password === confirmPassword }].map((rule) => <span key={rule.label} className={`flex items-center gap-1.5 ${rule.met ? 'text-emerald-600' : 'text-slate-400'}`}><span className={`grid h-4 w-4 place-items-center rounded-full ${rule.met ? 'bg-emerald-100' : 'bg-slate-100'}`}><Check size={10} /></span>{rule.label}</span>)}</div>
      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" /><span>I agree to the acceptable-use and privacy terms for this inventory workspace.</span></label>
      {role === 'Admin' && <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-700">Local mode allows Admin registration for demonstration. Production systems should require an existing administrator’s approval.</p>}
      <Button type="submit" className="w-full" loading={submitting}><UserPlus size={17} />Create {role} account<ArrowRight size={16} /></Button>
    </form>
  </AuthShell>;
}
