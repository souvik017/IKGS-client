import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarPlus, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import useResource from '../../hooks/useResource';
import { get, post, put } from '../../lib/api';
import { formatDate, toDateInput } from '../../lib/format';

const STATUSES = ['new', 'pending', 'confirmed', 'completed', 'cancelled'];
export default function FreeInspections() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, filters, updateFilter, reload } = useResource('/free-inspections');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ date: '', time: '', employee: '', address: '', jobNotes: '' });
  const [busy, setBusy] = useState(false);
  const [employees, setEmployees] = useState([]);
  useEffect(() => { get('/employees', { active: 'true', limit: 100 }).then(r => setEmployees(r.data)).catch(() => setEmployees([])); }, []);
  const open = (r) => { setSelected(r); setForm({ date: toDateInput(r.preferredDate) || toDateInput(new Date()), time: r.preferredTime || '', employee: '', address: r.address || '', jobNotes: r.message || '' }); };
  const convert = async (e) => { e.preventDefault(); setBusy(true); try { await post(`/free-inspections/${selected._id}/convert`, form); toast.success('Inspection scheduled'); setSelected(null); reload(); } catch (err) { toast.error(err.message); } finally { setBusy(false); } };
  const columns = [
    { key: 'bookingId', header: 'Request', render: r => <span className="font-mono text-xs">{r.bookingId}</span> },
    { key: 'name', header: 'Customer', render: r => <div><p className="font-medium">{r.name}</p><p className="text-xs text-navy/50">{r.phone}</p></div> },
    { key: 'service', header: 'Service', render: r => r.service?.title || 'Inspection request' },
    { key: 'preferredDate', header: 'Preferred visit', render: r => `${formatDate(r.preferredDate)}${r.preferredTime ? ` · ${r.preferredTime}` : ''}` },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', className: 'text-right', render: r => <div className="flex justify-end gap-2"><select className="rounded-lg border px-2 py-1 text-xs" value={r.status} onChange={async e => { try { await put(`/free-inspections/${r._id}/status`, { status: e.target.value }); reload(); } catch (err) { toast.error(err.message); } }}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select><button className="link" title="Schedule inspection" onClick={() => open(r)}><CalendarPlus className="h-4 w-4" /></button></div> },
  ];
  return <><PageHeader title="Free inspections" description="Website requests for a free inspection, ready for staff follow-up." />
    <div className="mb-4 flex flex-wrap gap-3"><input className="input max-w-xs" placeholder="Search name, phone, reference…" value={search} onChange={e => setSearch(e.target.value)} /><select className="input w-44" value={filters.status || ''} onChange={e => updateFilter('status', e.target.value || undefined)}><option value="">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select><button className="btn-ghost" onClick={reload}><RefreshCw className="h-4 w-4" />Refresh</button></div>
    {error && <p className="mb-3 text-sm text-red-600">{error}</p>}<DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No website inspection requests." /><Pagination pagination={pagination} onPageChange={setPage} />
    <Modal open={Boolean(selected)} title={selected ? `Schedule ${selected.bookingId}` : ''} onClose={() => setSelected(null)} footer={<><button className="btn-outline" onClick={() => setSelected(null)}>Cancel</button><button form="inspection-form" className="btn-primary" disabled={busy}>{busy ? 'Scheduling…' : 'Confirm and assign'}</button></>}><form id="inspection-form" onSubmit={convert} className="space-y-4"><p className="rounded-xl bg-mist p-3 text-sm">{selected?.name} · {selected?.phone}</p><div className="grid grid-cols-2 gap-3"><label className="label">Date<input required type="date" className="input" value={form.date} onChange={e => setForm({...form,date:e.target.value})}/></label><label className="label">Time<input className="input" value={form.time} onChange={e => setForm({...form,time:e.target.value})}/></label></div><label className="label">Full service location<textarea required className="input" rows="3" value={form.address} onChange={e => setForm({...form,address:e.target.value})}/></label><label className="label">Assign employee<select className="input" value={form.employee} onChange={e=>setForm({...form,employee:e.target.value})}><option value="">Leave unassigned</option>{employees.map(emp=><option key={emp._id} value={emp._id}>{emp.name} · {emp.employeeId}</option>)}</select></label><label className="label">Work notes<textarea className="input" value={form.jobNotes} onChange={e => setForm({...form,jobNotes:e.target.value})}/></label></form></Modal>
  </>;
}
