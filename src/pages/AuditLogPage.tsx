import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Boxes, FolderTree, LogIn, RefreshCw, ShieldCheck, Truck, UsersRound } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatDate } from '../lib/utils';
import { Badge, Button, Card, ConfirmDialog, EmptyState, PageHeader, Pagination, SearchInput, Select } from '../components/ui';
import type { AuditLog } from '../types';

const entityIcon = (log: AuditLog) => {
  if (log.entityType === 'Supplier') return Truck;
  if (log.entityType === 'Category') return FolderTree;
  if (log.entityType === 'Authentication') return LogIn;
  if (log.entityType === 'User') return UsersRound;
  if (log.action === 'Stock in') return ArrowDownToLine;
  if (log.action === 'Stock out') return ArrowUpFromLine;
  return Boxes;
};

export function AuditLogPage() {
  const { data, resetDemoData } = useInventory();
  const [search, setSearch] = useState('');
  const [entity, setEntity] = useState('all');
  const [page, setPage] = useState(1);
  const [resetOpen, setResetOpen] = useState(false);
  const pageSize = 9;
  useEffect(() => setPage(1), [search, entity]);
  const filtered = useMemo(() => data.auditLogs.filter((log) => {
    const term = search.toLowerCase();
    return (entity === 'all' || log.entityType === entity) && (!term || [log.userName, log.action, log.entityName, log.detail].some((value) => value.toLowerCase().includes(term)));
  }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [data.auditLogs, search, entity]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return <div className="animate-enter"><PageHeader eyebrow="Administration" title="Audit log" description="A permanent, timestamped record of actions taken across this local workspace." actions={<Button variant="secondary" onClick={() => setResetOpen(true)}><RefreshCw size={16} />Reset demo data</Button>} />
    <Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:p-5"><SearchInput value={search} onChange={setSearch} placeholder="Search action, user, or record…" /><Select value={entity} onChange={(event) => setEntity(event.target.value)} className="sm:w-48"><option value="all">All record types</option><option value="Product">Products</option><option value="Stock">Stock</option><option value="Supplier">Suppliers</option><option value="Category">Categories</option><option value="User">Users</option><option value="Authentication">Authentication</option></Select></div>
      {paged.length ? <div className="divide-y divide-slate-100">{paged.map((log) => { const Icon = entityIcon(log); return <div key={log.id} className="flex flex-col gap-3 px-5 py-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-brand-600"><Icon size={18} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-800">{log.action}</p><Badge tone={log.entityType === 'Stock' ? 'green' : log.entityType === 'Authentication' || log.entityType === 'User' ? 'purple' : 'blue'}>{log.entityType}</Badge></div><p className="mt-1 text-sm text-slate-600"><span className="font-semibold">{log.entityName}</span> · {log.detail}</p></div><div className="shrink-0 sm:text-right"><p className="text-sm font-semibold text-slate-700">{log.userName}</p><p className="mt-0.5 text-xs text-slate-400">{formatDate(log.createdAt, true)}</p></div></div>; })}</div> : <EmptyState title="No audit records found" description="No actions match your current search and record type." />}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={filtered.length} from={(page - 1) * pageSize + 1} to={Math.min(page * pageSize, filtered.length)} />
    </Card>
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"><ShieldCheck className="mt-0.5 shrink-0" size={19} /><div><p className="font-bold">Audit integrity</p><p className="mt-1 text-xs leading-5 text-blue-700">Every catalog and stock mutation is automatically attributed to the signed-in user. In production, send these events to an append-only server-side store.</p></div></div>
    <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={resetDemoData} title="Reset all demo data?" description="All products, transactions, suppliers, categories, and audit changes stored in this browser will return to their seeded state." confirmLabel="Reset data" danger />
  </div>;
}
