import { useMemo, useState } from 'react';
import { Crown, KeyRound, Pencil, Plus, Power, ShieldCheck, UserCog, Users } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import type { DemoUser, Role, UserAccountInput } from '../types';
import { formatDate, relativeTime } from '../lib/utils';
import { Badge, Button, Card, ConfirmDialog, EmptyState, FormField, Input, Modal, PageHeader, SearchInput, Select } from '../components/ui';

const roleDetails: Record<Role, { description: string; tone: 'blue' | 'purple' | 'green'; icon: typeof Crown }> = {
  Admin: { description: 'Full system, user, and audit control', tone: 'purple', icon: Crown },
  Manager: { description: 'Catalog, supplier, and inventory control', tone: 'blue', icon: UserCog },
  Staff: { description: 'Stock operations and reporting access', tone: 'green', icon: Users },
};

function UserForm({ account, onClose }: { account?: DemoUser; onClose(): void }) {
  const { saveUser } = useInventory();
  const [form, setForm] = useState<UserAccountInput>({
    name: account?.name ?? '', email: account?.email ?? '', role: account?.role ?? 'Staff', password: '', status: account?.status ?? 'active',
  });
  const [error, setError] = useState('');
  const set = (field: keyof UserAccountInput, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    try { saveUser(form, account?.id); onClose(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save this user.'); }
  };
  return <form id="user-form" onSubmit={submit} className="space-y-4">
    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Full name" required className="sm:col-span-2"><Input value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="Employee full name" autoFocus required /></FormField>
      <FormField label="Email address" required className="sm:col-span-2"><Input type="email" value={form.email} onChange={(event) => set('email', event.target.value)} placeholder="name@company.com" required /></FormField>
      <FormField label="Assigned role" required><Select value={form.role} onChange={(event) => set('role', event.target.value)}><option value="Admin">Admin</option><option value="Manager">Manager</option><option value="Staff">Staff</option></Select></FormField>
      <FormField label="Account status"><Select value={form.status} onChange={(event) => set('status', event.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></Select></FormField>
      <FormField label={account ? 'New password' : 'Temporary password'} required={!account} hint={account ? 'Leave blank to keep the current password.' : 'Minimum 8 characters.'} className="sm:col-span-2"><div className="relative"><KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><Input type="password" value={form.password} onChange={(event) => set('password', event.target.value)} className="pl-10" minLength={form.password ? 8 : undefined} placeholder={account ? 'Keep current password' : 'Create a temporary password'} required={!account} /></div></FormField>
    </div>
    <div className="rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-700"><span className="font-bold">{form.role} permissions:</span> {roleDetails[form.role].description}.</div>
  </form>;
}

export function UsersPage() {
  const { data, user, toggleUser } = useInventory();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'all' | Role>('all');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<DemoUser | 'new' | null>(null);
  const [toggling, setToggling] = useState<DemoUser | null>(null);
  const filtered = useMemo(() => data.users.filter((account) => {
    const term = search.toLowerCase();
    return (role === 'all' || account.role === role) && (status === 'all' || (account.status ?? 'active') === status) && (!term || account.name.toLowerCase().includes(term) || account.email.toLowerCase().includes(term));
  }), [data.users, search, role, status]);

  return <div className="animate-enter">
    <PageHeader eyebrow="Administration" title="Users & roles" description="Create user accounts, assign access levels, and control who can enter the inventory workspace." actions={<Button onClick={() => setEditing('new')}><Plus size={17} />Add user</Button>} />
    <div className="mb-5 grid gap-3 md:grid-cols-3">{(['Admin', 'Manager', 'Staff'] as Role[]).map((roleName) => { const details = roleDetails[roleName]; const Icon = details.icon; const count = data.users.filter((account) => account.role === roleName && account.status !== 'inactive').length; return <Card key={roleName} className="flex items-center gap-4 p-5"><div className={`grid h-12 w-12 place-items-center rounded-xl ${details.tone === 'purple' ? 'bg-violet-50 text-violet-600' : details.tone === 'blue' ? 'bg-blue-50 text-brand-600' : 'bg-emerald-50 text-emerald-600'}`}><Icon size={21} /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between"><p className="font-display font-extrabold text-slate-800">{roleName}</p><span className="font-display text-xl font-extrabold text-ink">{count}</span></div><p className="mt-1 truncate text-xs text-slate-500">{details.description}</p></div></Card>; })}</div>
    <Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:p-5"><SearchInput value={search} onChange={setSearch} placeholder="Search name or email…" /><div className="grid grid-cols-2 gap-2 sm:flex"><Select value={role} onChange={(event) => setRole(event.target.value as typeof role)} className="sm:w-40"><option value="all">All roles</option><option value="Admin">Admin</option><option value="Manager">Manager</option><option value="Staff">Staff</option></Select><Select value={status} onChange={(event) => setStatus(event.target.value)} className="sm:w-40"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></Select></div></div>
      {filtered.length ? <div className="table-scroll"><table><thead><tr><th>User</th><th>Role</th><th>Permissions</th><th>Status</th><th>Created</th><th>Last activity</th><th className="text-right">Actions</th></tr></thead><tbody>{filtered.map((account) => { const details = roleDetails[account.role]; const lastActivity = data.auditLogs.find((log) => log.userId === account.id); return <tr key={account.id}><td><div className="flex min-w-[220px] items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl text-xs font-bold text-white ${account.role === 'Admin' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-500' : account.role === 'Manager' ? 'bg-gradient-to-br from-brand-600 to-blue-400' : 'bg-gradient-to-br from-emerald-600 to-teal-400'}`}>{account.initials}</span><div><p className="font-bold text-slate-800">{account.name}{account.id === user?.id && <span className="ml-1 text-xs font-semibold text-brand-600">(You)</span>}</p><p className="text-xs text-slate-400">{account.email}</p></div></div></td><td><Badge tone={details.tone}>{account.role}</Badge></td><td className="max-w-64 text-xs text-slate-500">{details.description}</td><td><Badge tone={account.status === 'inactive' ? 'slate' : 'green'}><span className={`h-1.5 w-1.5 rounded-full ${account.status === 'inactive' ? 'bg-slate-400' : 'bg-emerald-500'}`} />{account.status ?? 'active'}</Badge></td><td className="whitespace-nowrap text-xs text-slate-500">{formatDate(account.createdAt)}</td><td className="whitespace-nowrap text-xs text-slate-500">{lastActivity ? relativeTime(lastActivity.createdAt) : 'No activity yet'}</td><td><div className="flex justify-end gap-1"><button onClick={() => setEditing(account)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-brand-600" title="Edit user"><Pencil size={16} /></button><button onClick={() => setToggling(account)} disabled={account.id === user?.id} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-30" title={account.id === user?.id ? 'You cannot deactivate yourself' : 'Change user status'}><Power size={16} /></button></div></td></tr>; })}</tbody></table></div> : <EmptyState title="No users found" description="No account matches the selected search and role filters." action={<Button onClick={() => setEditing('new')}><Plus size={17} />Add user</Button>} />}
    </Card>
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"><ShieldCheck className="mt-0.5 shrink-0" size={19} /><div><p className="font-bold">Role-based access</p><p className="mt-1 text-xs leading-5 text-blue-700">Admins manage users and audit records. Managers maintain the catalog and procurement records. Staff can view the catalog and process stock transactions.</p></div></div>
    <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Create user account' : 'Edit user account'} description="Assign the appropriate access level for this team member." footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="user-form">{editing === 'new' ? 'Create user' : 'Save changes'}</Button></>}>{editing && <UserForm account={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}</Modal>
    <ConfirmDialog open={!!toggling} onClose={() => setToggling(null)} onConfirm={() => toggling && toggleUser(toggling.id)} title={`${toggling?.status === 'inactive' ? 'Activate' : 'Deactivate'} user?`} description={toggling?.status === 'inactive' ? `${toggling?.name} will be able to sign in again.` : `${toggling?.name} will no longer be able to sign in, but their activity history will remain.`} confirmLabel={toggling?.status === 'inactive' ? 'Activate user' : 'Deactivate user'} danger={toggling?.status !== 'inactive'} />
  </div>;
}
