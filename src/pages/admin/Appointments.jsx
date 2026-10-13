import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Filter, RefreshCw, UserCheck } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import useResource from '../../hooks/useResource';
import { get, put } from '../../lib/api';
import { formatDate } from '../../lib/format';

const STATUSES = ['scheduled', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled', 'rescheduled'];

export default function Appointments() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, filters, updateFilter, reload } =
    useResource('/appointments');

  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    get('/employees', { active: 'true', limit: 100 })
      .then((res) => setEmployees(res.data))
      .catch(() => setEmployees([]));
  }, []);

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
    { key: 'customer', header: 'Customer', render: (r) => r.customer?.name || '—' },
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
    </>
  );
}
