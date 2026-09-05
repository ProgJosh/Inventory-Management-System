import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2, PackageOpen, Search, X } from 'lucide-react';
import { cn, productImage } from '../../lib/utils';
import { useInventory } from '../../context/InventoryContext';

export const inputClass = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-500';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  loading?: boolean;
};

export function Button({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus:ring-brand-200',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-200',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200',
  };
  return (
    <button className={cn('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-55', styles[variant], size === 'sm' ? 'h-9 px-3 text-xs' : 'h-11 px-4 text-sm', className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 size={16} className="animate-spin" />}{children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rounded-2xl border border-slate-200/80 bg-white shadow-card', className)}>{children}</section>;
}

export function Badge({ tone = 'slate', children }: { tone?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate'; children: ReactNode }) {
  const tones = { blue: 'bg-blue-50 text-blue-700 ring-blue-600/10', green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10', amber: 'bg-amber-50 text-amber-700 ring-amber-600/10', red: 'bg-red-50 text-red-700 ring-red-600/10', purple: 'bg-violet-50 text-violet-700 ring-violet-600/10', slate: 'bg-slate-100 text-slate-600 ring-slate-500/10' };
  return <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', tones[tone])}>{children}</span>;
}

export function FormField({ label, error, hint, required, children, className }: { label: string; error?: string; hint?: string; required?: boolean; children: ReactNode; className?: string }) {
  return <label className={cn('block', className)}><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}{required && <span className="ml-1 text-red-500">*</span>}</span>{children}{error ? <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle size={12} />{error}</span> : hint ? <span className="mt-1.5 block text-xs text-slate-500">{hint}</span> : null}</label>;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputClass, 'cursor-pointer appearance-none bg-[linear-gradient(45deg,transparent_50%,#64748b_50%),linear-gradient(135deg,#64748b_50%,transparent_50%)] bg-[position:calc(100%-17px)_19px,calc(100%-12px)_19px] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-9', className)} {...props}>{children}</select>;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: { value: string; onChange(value: string): void; placeholder?: string }) {
  return <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-10" aria-label={placeholder} />{value && <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="Clear search"><X size={14} /></button>}</div>;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-brand-600">{eyebrow}</p>}<h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h1><p className="mt-1.5 max-w-2xl text-sm text-slate-500">{description}</p></div>{actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}</div>;
}

export function Modal({ open, onClose, title, description, children, footer, size = 'lg' }: { open: boolean; onClose(): void; title: string; description?: string; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'lg' | 'xl' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
    <div role="dialog" aria-modal="true" className={cn('max-h-[94vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-2xl', size === 'sm' ? 'sm:max-w-md' : size === 'xl' ? 'sm:max-w-4xl' : 'sm:max-w-2xl')}>
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="font-display text-lg font-bold text-ink">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div><button onClick={onClose} className="ml-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close modal"><X size={19} /></button></div>
      <div className="max-h-[calc(94vh-150px)] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      {footer && <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</div>}
    </div>
  </div>;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', danger }: { open: boolean; onClose(): void; onConfirm(): void; title: string; description: string; confirmLabel?: string; danger?: boolean }) {
  return <Modal open={open} onClose={onClose} size="sm" title={title} description={description} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button></>}><div className={cn('flex items-start gap-3 rounded-xl p-4 text-sm', danger ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800')}><AlertCircle className="mt-0.5 shrink-0" size={18} /><p>This action is recorded in the audit log and can be reviewed by an administrator.</p></div></Modal>;
}

export function EmptyState({ title = 'Nothing to show', description, action }: { title?: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center justify-center px-5 py-14 text-center"><div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><PackageOpen size={24} /></div><h3 className="font-display font-bold text-slate-800">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function Pagination({ page, totalPages, onChange, total, from, to }: { page: number; totalPages: number; onChange(page: number): void; total: number; from: number; to: number }) {
  if (!total) return null;
  return <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm sm:flex-row"><p className="text-slate-500">Showing <span className="font-semibold text-slate-700">{from}–{to}</span> of <span className="font-semibold text-slate-700">{total}</span></p><div className="flex items-center gap-1"><button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-35" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>{Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.max(3, page + 2)).map((item) => <button key={item} onClick={() => onChange(item)} className={cn('h-9 min-w-9 rounded-lg px-2 text-sm font-semibold', page === item ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100')}>{item}</button>)}<button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-35" onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Next page"><ChevronRight size={16} /></button></div></div>;
}

export function ProductThumb({ image, name, size = 'md' }: { image: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'h-9 w-9 text-lg rounded-lg' : size === 'lg' ? 'h-20 w-20 text-4xl rounded-2xl' : 'h-11 w-11 text-xl rounded-xl';
  return <div className={cn('grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 ring-1 ring-slate-200', sizeClass)}>{productImage(image) === 'url' ? <img src={image} alt={name} className="h-full w-full object-cover" /> : <span aria-hidden="true">{image || '📦'}</span>}</div>;
}

export function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center bg-canvas"><div className="text-center"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg"><Loader2 className="animate-spin" /></div><p className="font-display font-bold text-slate-800">Preparing your workspace</p><p className="mt-1 text-sm text-slate-500">Loading inventory data…</p></div></div>;
}

export function Toasts() {
  const { toasts, dismissToast } = useInventory();
  const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
  const colors = { success: 'text-emerald-600 bg-emerald-50', error: 'text-red-600 bg-red-50', info: 'text-blue-600 bg-blue-50' };
  return <div className="fixed right-4 top-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">{toasts.map((toast) => { const Icon = icons[toast.type]; return <div key={toast.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lift"><div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', colors[toast.type])}><Icon size={18} /></div><div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">{toast.title}</p>{toast.description && <p className="mt-0.5 text-xs leading-5 text-slate-500">{toast.description}</p>}</div><button onClick={() => dismissToast(toast.id)} className="text-slate-400 hover:text-slate-700"><X size={16} /></button></div>; })}</div>;
}
