import { Crown, UserCog, Users } from 'lucide-react';
import type { Role } from '../../types';

const roles: Array<{ role: Role; label: string; detail: string; icon: typeof Crown; selected: string }> = [
  { role: 'Admin', label: 'Admin', detail: 'Full control', icon: Crown, selected: 'border-violet-400 bg-violet-50 text-violet-700 ring-violet-100' },
  { role: 'Manager', label: 'Manager', detail: 'Manage stock', icon: UserCog, selected: 'border-brand-400 bg-brand-50 text-brand-700 ring-brand-100' },
  { role: 'Staff', label: 'Staff', detail: 'Daily operations', icon: Users, selected: 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-emerald-100' },
];

export function RoleSelector({ value, onChange, label = 'Select your role' }: { value: Role; onChange(role: Role): void; label?: string }) {
  return <fieldset><legend className="mb-2 block text-sm font-semibold text-slate-700">{label}<span className="ml-1 text-red-500">*</span></legend><div className="grid grid-cols-3 gap-2">{roles.map(({ role, label: roleLabel, detail, icon: Icon, selected }) => { const active = value === role; return <button key={role} type="button" onClick={() => onChange(role)} aria-pressed={active} className={`flex min-w-0 flex-col items-center rounded-xl border px-2 py-3 text-center transition ${active ? `${selected} ring-4` : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}><Icon size={18} /><span className="mt-1.5 text-xs font-bold">{roleLabel}</span><span className="mt-0.5 hidden text-[10px] opacity-70 sm:block">{detail}</span></button>; })}</div></fieldset>;
}
