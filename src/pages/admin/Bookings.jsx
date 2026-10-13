import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarPlus, Filter, RefreshCw } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import useResource from '../../hooks/useResource';
import { get, post, put } from '../../lib/api';
import { formatDate, toDateInput } from '../../lib/format';

const STATUSES = ['new', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function Bookings() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, filters, updateFilter, reload } =
    useResource('/bookings');

  const [selected, setSelected] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertForm, setConvertForm] = useState({ date: '', time: '', employee: '', jobNotes: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    get('/employees', { active: 'true', limit: 100 })
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployees([]));
  }, []);

  const updateStatus = async (booking, status) => {
    try {
      await put(`/bookings/${booking._id}/status`, { status });
      toast.success(`Booking marked ${status}`);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openConvert = (booking) => {
    setSelected(booking);
    setConvertForm({
      date: toDateInput(booking.preferredDate) || toDateInput(new Date()),
      time: booking.preferredTime || '',
      employee: '',
      jobNotes: '',
    });
    setConvertOpen(true);
  };

  const submitConvert = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await post(`/bookings/${selected._id}/convert`, convertForm);
      toast.success('Appointment created');
      setConvertOpen(false);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'bookingId', header: 'Reference', render: (r) => <span className="font-mono text-xs">{r.bookingId}</span> },
    {
      key: 'name',
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="font-medium text-navy">{r.name}</p>
          <p className="text-xs text-navy/50">{r.phone || r.email || '—'}</p>
        </div>
      ),
    },
    { key: 'service', header: 'Service', render: (r) => r.service?.title || '—' },
    { key: 'preferredDate', header: 'Preferred', render: (r) => `${formatDate(r.preferredDate)}${r.preferredTime ? ` • ${r.preferredTime}` : ''}` },
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
            aria-label={`Update status for ${r.bookingId}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="button" className="link text-sm" onClick={() => openConvert(r)} title="Convert to appointment">
            <CalendarPlus className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Bookings" description="Bookings submitted online or entered by staff." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          className="input sm:max-w-xs"
          placeholder="Search name, phone, reference…"
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
        <button type="button" className="btn-ghost" onClick={reload}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No bookings found." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal
        open={convertOpen}
        title={selected ? `Convert ${selected.bookingId} to appointment` : ''}
        onClose={() => setConvertOpen(false)}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setConvertOpen(false)}>Cancel</button>
            <button type="submit" form="convert-form" className="btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create appointment'}
            </button>
          </>
        }
      >
        <form id="convert-form" onSubmit={submitConvert} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-date">Date *</label>
              <input id="c-date" type="date" required className="input" value={convertForm.date} onChange={(e) => setConvertForm({ ...convertForm, date: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="c-time">Time</label>
              <input id="c-time" className="input" placeholder="e.g. 10:00" value={convertForm.time} onChange={(e) => setConvertForm({ ...convertForm, time: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="c-employee">Assign employee</label>
            <select id="c-employee" className="input" value={convertForm.employee} onChange={(e) => setConvertForm({ ...convertForm, employee: e.target.value })}>
              <option value="">Unassigned</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="c-notes">Job notes</label>
            <textarea id="c-notes" rows={3} className="input" value={convertForm.jobNotes} onChange={(e) => setConvertForm({ ...convertForm, jobNotes: e.target.value })} />
          </div>
        </form>
      </Modal>
    </>
  );
}
