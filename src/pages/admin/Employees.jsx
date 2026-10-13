import { useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Plus, RefreshCw, UserX, UserCheck } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import Modal from '../../components/admin/Modal';
import StatusBadge from '../../components/admin/StatusBadge';
import useResource from '../../hooks/useResource';
import { post, put } from '../../lib/api';
import { formatDate, toDateInput } from '../../lib/format';

const emptyForm = { name: '', phone: '', email: '', designation: '', joiningDate: '', notes: '', active: true };

export default function Employees() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, reload } = useResource('/employees');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      phone: row.phone || '',
      email: row.email || '',
      designation: row.designation || '',
      joiningDate: toDateInput(row.joiningDate),
      notes: row.notes || '',
      active: row.active,
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await put(`/employees/${editing._id}`, form);
        toast.success('Employee updated');
      } else {
        await post('/employees', form);
        toast.success('Employee created');
      }
      setOpen(false);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (row) => {
    try {
      await put(`/employees/${row._id}/status`, { active: !row.active });
      toast.success(row.active ? 'Employee deactivated' : 'Employee activated');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'employeeId', header: 'ID', render: (r) => <span className="font-mono text-xs">{r.employeeId}</span> },
    {
      key: 'name',
      header: 'Employee',
      render: (r) => (
        <div>
          <p className="font-medium text-navy">{r.name}</p>
          <p className="text-xs text-navy/50">{r.designation || r.email || '—'}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (r) => r.phone || '—' },
    { key: 'joiningDate', header: 'Joined', render: (r) => formatDate(r.joiningDate) },
    { key: 'active', header: 'Status', render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button type="button" className="link" onClick={() => startEdit(r)} title="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" className="link" onClick={() => toggleActive(r)} title={r.active ? 'Deactivate' : 'Activate'}>
            {r.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Employees" description="Field technicians and staff who carry out service visits.">
        <button type="button" className="btn-primary" onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          className="input sm:max-w-xs"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-ghost" onClick={reload}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No employees found." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal
        open={open}
        title={editing ? 'Edit Employee' : 'Add Employee'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" form="employee-form" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form id="employee-form" onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="emp-name">Name *</label>
              <input id="emp-name" required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="emp-phone">Phone</label>
              <input id="emp-phone" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="emp-email">Email</label>
              <input id="emp-email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="emp-designation">Designation</label>
              <input id="emp-designation" className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="emp-joining">Joining date</label>
              <input id="emp-joining" type="date" className="input" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input id="emp-active" type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <label htmlFor="emp-active" className="text-sm text-navy/70">Active</label>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="emp-notes">Notes</label>
            <textarea id="emp-notes" rows={3} className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </form>
      </Modal>
    </>
  );
}
