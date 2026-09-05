import { useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, MailCheck, RotateCcw } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/auth/AuthShell';
import { Button, FormField, Input } from '../components/ui';
import { useInventory } from '../context/InventoryContext';

export function ForgotPasswordPage() {
  const { user, requestPasswordReset, resetPassword } = useInventory();
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [localCode, setLocalCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { const code = await requestPasswordReset(email); setLocalCode(code); setStep('reset'); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to start password recovery.'); } finally { setSubmitting(false); }
  };
  const submitReset = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (password !== confirmPassword) { setError('The passwords do not match.'); return; }
    setSubmitting(true);
    try { await resetPassword(email, verificationCode, password); navigate('/login'); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to reset your password.'); } finally { setSubmitting(false); }
  };
  const resend = async () => {
    setError(''); setSubmitting(true);
    try { setLocalCode(await requestPasswordReset(email)); setVerificationCode(''); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to resend the code.'); } finally { setSubmitting(false); }
  };

  return <AuthShell eyebrow="Account recovery" title={step === 'request' ? 'Reset your password' : 'Check your verification code'} description={step === 'request' ? 'Enter your account email to begin secure password recovery.' : `Enter the six-digit code issued for ${email}.`} footer={<Link to="/login" className="inline-flex items-center gap-1.5 font-bold text-brand-600 hover:text-brand-700"><ArrowLeft size={14} />Back to sign in</Link>}>
    {step === 'request' ? <form onSubmit={sendCode} className="space-y-5">{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}<div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-brand-600"><KeyRound size={24} /></div><FormField label="Email address" required><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" autoFocus required /></FormField><Button type="submit" className="w-full" loading={submitting}>Continue<ArrowRight size={17} /></Button></form> : <form onSubmit={submitReset} className="space-y-4">{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}<div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center"><MailCheck className="mx-auto text-brand-600" size={22} /><p className="mt-2 text-xs font-semibold text-blue-700">Local-mode verification code</p><p className="mt-1 font-mono text-2xl font-extrabold tracking-[.3em] text-blue-900">{localCode}</p><p className="mt-2 text-[11px] leading-4 text-blue-600">In production this code is delivered by email. It expires in 10 minutes.</p></div><FormField label="Verification code" required><Input value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" inputMode="numeric" autoComplete="one-time-code" className="text-center font-mono text-lg tracking-[.25em]" autoFocus required /></FormField><FormField label="New password" required><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} required /></FormField><FormField label="Confirm new password" required><Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat new password" autoComplete="new-password" minLength={8} required /></FormField><Button type="submit" className="w-full" loading={submitting}>Reset password<RotateCcw size={16} /></Button><button type="button" onClick={resend} disabled={submitting} className="w-full text-xs font-bold text-brand-600 hover:text-brand-700 disabled:opacity-50">Issue a new code</button></form>}
  </AuthShell>;
}
