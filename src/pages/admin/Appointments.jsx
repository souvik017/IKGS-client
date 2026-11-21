import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Eye, Filter, RefreshCw, UserCheck } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import useResource from '../../hooks/useResource';
import { get, post, put } from '../../lib/api';
import { formatDate, toDateInput } from '../../lib/format';

const STATUSES = ['scheduled', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled', 'rescheduled'];

export default function Appointments() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, filters, updateFilter, reload } =
    useResource('/appointments');

  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState(null);
  const [edit, setEdit] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [material, setMaterial] = useState({ itemId: '', quantity: 1, notes: '' });

  useEffect(() => {
    get('/employees', { active: 'true', limit: 100 })
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployees([]));
  }, []);

  const openDetail = async (row) => {
    try {
      const [appointmentRes, inventoryRes] = await Promise.all([get(`/appointments/${row._id}`), get('/inventory/items', { active: 'true', limit: 100 })]);
      setDetail(appointmentRes.data);
      const a = appointmentRes.data.appointment;
      setEdit({ date: toDateInput(a.date), time: a.time || '', address: a.address || '', jobNotes: a.jobNotes || '', status: a.status });
      setInventory(inventoryRes.data);
    } catch (err) { toast.error(err.message); }
  };
  const saveDetail = async (e) => {
    e.preventDefault();
    try { await put(`/appointments/${detail.appointment._id}`, { ...edit, date: new Date(`${edit.date}T12:00:00`).toISOString() }); toast.success('Appointment updated'); await openDetail(detail.appointment); reload(); }
    catch (err) { toast.error(err.message); }
  };
  const assignMaterial = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await post(`/appointments/${detail.appointment._id}/materials`, { ...material, quantity: Number(material.quantity) }); toast.success('Material issued and inventory updated'); await openDetail(detail.appointment); reload(); }
    catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const updateStatus = async (appointment, status) => {
    try {
      await put(`/appointments/${appointment._id}/status`, { status });
      toast.success('Status updated');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const assign = async (employeeId) => {
    setBusy(true);
    try {
      await put(`/appointments/${selected._id}/assign`, { employeeId });
      toast.success('Employee assigned');
      setSelected(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'appointmentId', header: 'Reference', render: (r) => <span className="font-mono text-xs">{r.appointmentId}</span> },
    { key: 'customer', header: 'Customer', render: (r) => r.customer?.name || r.clientName || r.booking?.name || '—' },
    { key: 'service', header: 'Service', render: (r) => r.service?.title || '—' },
    { key: 'date', header: 'Scheduled', render: (r) => `${formatDate(r.date)}${r.time ? ` • ${r.time}` : ''}` },
    { key: 'employee', header: 'Assigned to', render: (r) => r.employee?.name || <span className="text-navy/40">Unassigned</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <select
            className="rounded-lg border border-navy/15 px-2 py-1 text-xs"
            value={r.status}
            onChange={(e) => updateStatus(r, e.target.value)}
            aria-label={`Update status for ${r.appointmentId}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="button" className="link text-sm" title="Assign employee" onClick={() => setSelected(r)}>
            <UserCheck className="h-4 w-4" />
          </button>
          <button type="button" className="link text-sm" title="View and edit appointment" onClick={() => openDetail(r)}><Eye className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Appointments" description="Scheduled service visits and their assigned field technicians." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          className="input sm:max-w-xs"
          placeholder="Search reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-navy/40" />
          <select className="input sm:w-44" value={filters.status || ''} onChange={(e) => updateFilter('status', e.target.value || undefined)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-navy/70">
          <input
            type="checkbox"
            checked={filters.today === 'true'}
            onChange={(e) => updateFilter('today', e.target.checked ? 'true' : undefined)}
          />
          Today only
        </label>
        <button type="button" className="btn-ghost" onClick={reload}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No appointments found." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal
        open={Boolean(selected)}
        title={selected ? `Assign ${selected.appointmentId}` : ''}
        onClose={() => setSelected(null)}
      >
        <div className="space-y-3">
          <p className="text-sm text-navy/60">
            Customer: <span className="font-medium text-navy">{selected?.customer?.name}</span>
          </p>
          {employees.length === 0 ? (
            <p className="text-sm text-navy/50">No active employees available.</p>
          ) : (
            <ul className="space-y-2">
              {employees.map((emp) => (
                <li key={emp._id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-navy/10 px-4 py-3 text-left text-sm hover:border-royal"
                    onClick={() => assign(emp._id)}
                    disabled={busy}
                  >
                    <span>
                      <span className="block font-medium text-navy">{emp.name}</span>
                      <span className="text-xs text-navy/50">{emp.employeeId}</span>
                    </span>
                    <UserCheck className="h-4 w-4 text-royal" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      <Modal open={Boolean(detail)} title={detail ? `Appointment ${detail.appointment.appointmentId}` : ''} onClose={() => setDetail(null)} size="lg">
        {detail && edit ? <div className="space-y-5">
          <div className="grid gap-3 rounded-xl bg-mist p-4 sm:grid-cols-2"><p><span className="text-xs text-navy/50">Customer / booking contact</span><br/><b>{detail.appointment.customer?.name||detail.appointment.clientName||detail.appointment.booking?.name||'—'}</b></p><p><span className="text-xs text-navy/50">Phone</span><br/><b>{detail.appointment.customer?.phone||detail.appointment.clientPhone||detail.appointment.booking?.phone||'—'}</b></p><p><span className="text-xs text-navy/50">Service</span><br/><b>{detail.appointment.service?.title || '—'}</b></p><p><span className="text-xs text-navy/50">Assigned employee</span><br/><b>{detail.appointment.employee?.name || 'Unassigned'}</b></p><p><span className="text-xs text-navy/50">Booking</span><br/><b>{detail.appointment.booking?.bookingId || 'Direct appointment'}</b></p><p className="sm:col-span-2"><Link className="link" to={`/admin/invoices?appointment=${detail.appointment._id}`}>Create invoice for this appointment →</Link></p></div>
          <form onSubmit={saveDetail} className="grid gap-3 sm:grid-cols-2"><label className="label">Date<input required type="date" className="input" value={edit.date} onChange={e => setEdit({...edit,date:e.target.value})}/></label><label className="label">Time<input className="input" value={edit.time} onChange={e => setEdit({...edit,time:e.target.value})}/></label><label className="label sm:col-span-2">Detailed location<textarea rows="2" className="input" value={edit.address} onChange={e => setEdit({...edit,address:e.target.value})}/></label><label className="label sm:col-span-2">Job notes<textarea rows="2" className="input" value={edit.jobNotes} onChange={e => setEdit({...edit,jobNotes:e.target.value})}/></label><label className="label">Status<select className="input" value={edit.status} onChange={e => setEdit({...edit,status:e.target.value})}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></label><div className="flex items-end"><button className="btn-primary">Save appointment</button></div></form>
          <section className="rounded-xl border border-navy/10 p-4"><h3 className="font-bold text-navy">Issue materials from inventory</h3><p className="mb-3 text-xs text-navy/55">Issued amounts immediately reduce available stock and are added to the appointment history.</p><form onSubmit={assignMaterial} className="grid gap-2 sm:grid-cols-[1fr_100px_1fr_auto]"><select required className="input" value={material.itemId} onChange={e => setMaterial({...material,itemId:e.target.value})}><option value="">Select material</option>{inventory.map(i=><option key={i._id} value={i._id}>{i.itemName} · available {i.quantity} {i.unit}</option>)}</select><input required type="number" min="0.01" step="0.01" className="input" value={material.quantity} onChange={e=>setMaterial({...material,quantity:e.target.value})}/><input className="input" placeholder="Usage notes" value={material.notes} onChange={e=>setMaterial({...material,notes:e.target.value})}/><button className="btn-primary" disabled={busy}>{busy?'Saving…':'Issue'}</button></form>
          <div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b text-xs text-navy/50"><th className="py-2">Material</th><th>Qty</th><th>Time</th><th>Staff</th><th>Notes</th></tr></thead><tbody>{(detail.materialHistory||[]).map(t=><tr key={t._id} className="border-b border-navy/5"><td className="py-2">{t.item?.itemName||'Inventory item'}</td><td>{Math.abs(t.change)} {t.item?.unit}</td><td>{formatDate(t.createdAt)}</td><td>{t.performedBy?.name||'—'}</td><td>{t.notes}</td></tr>)}{!detail.materialHistory?.length&&<tr><td className="py-3 text-navy/50" colSpan="5">No material history yet.</td></tr>}</tbody></table></div></section>
        </div> : null}
      </Modal>
    </>
  );
}
