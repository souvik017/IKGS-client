import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Plus, RefreshCw, UserCheck, UserX } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import useResource from '../../hooks/useResource';
import { del, post, put } from '../../lib/api';
import { formatDate } from '../../lib/format';

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  state: 'West Bengal',
  zipCode: '',
  notes: '',
  status: 'active',
};

/** Nest the flat address fields the way the Customer model expects them. */
const toPayload = (form) => ({
  name: form.name.trim(),
  phone: form.phone.trim(),
  email: form.email.trim(),
  notes: form.notes,
  status: form.status,
  address: {
    street: form.street.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    zipCode: form.zipCode.trim(),
  },
});

export default function Customers() {
  const navigate = useNavigate();
  const { rows, pagination, loading, error, page, setPage, search, setSearch, reload } = useResource('/customers');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

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
      street: row.address?.street || '',
      city: row.address?.city || '',
      state: row.address?.state || 'West Bengal',
      zipCode: row.address?.zipCode || '',
      notes: row.notes || '',
      status: row.status || 'active',
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await put(`/customers/${editing._id}`, toPayload(form));
        toast.success('Customer updated');
      } else {
        await post('/customers', toPayload(form));
        toast.success('Customer created');
      }
      setOpen(false);
      reload();
    } catch (err) {
      // A duplicate phone/email is rejected by the API; surface it verbatim.
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  /** Deactivate is a soft delete on the API; reactivating uses the update route. */
  const runAction = async () => {
    if (!confirmAction) return;
    const { row, nextStatus } = confirmAction;
    setBusy(true);
    try {
      if (nextStatus === 'inactive') {
        await del(`/customers/${row._id}`);
        toast.success('Customer deactivated');
      } else {
        await put(`/customers/${row._id}`, { status: 'active' });
        toast.success('Customer reactivated');
      }
      setConfirmAction(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'customerId', header: 'ID', render: (r) => <span className="font-mono text-xs">{r.customerId}</span> },
    {
      key: 'name',
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="font-medium text-navy">{r.name}</p>
          <p className="text-xs text-navy/50">{r.email || '—'}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (r) => r.phone || '—' },
    {
      key: 'address',
      header: 'Location',
      render: (r) => [r.address?.city, r.address?.state].filter(Boolean).join(', ') || '—',
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status || 'active'} /> },
    { key: 'createdAt', header: 'Added', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (r) => {
        const inactive = (r.status || 'active') === 'inactive';
        return (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="link"
              title="Edit"
              aria-label={`Edit ${r.name}`}
              onClick={(e) => {
                e.stopPropagation();
                startEdit(r);
              }}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`link ${inactive ? '' : 'text-amber-600'}`}
              title={inactive ? 'Reactivate' : 'Deactivate'}
              aria-label={`${inactive ? 'Reactivate' : 'Deactivate'} ${r.name}`}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmAction({ row: r, nextStatus: inactive ? 'active' : 'inactive' });
              }}
            >
              {inactive ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        description="Customer records created from bookings, enquiries and invoices — or added here directly."
      >
        <button type="button" className="btn-primary" onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add Customer
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          className="input sm:max-w-xs"
          placeholder="Search name, phone, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-ghost" onClick={reload}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyMessage="No customers found."
        onRowClick={(row) => navigate(`/admin/customers/${row._id}`)}
      />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal
        open={open}
        title={editing ? 'Edit Customer' : 'Add Customer'}
        onClose={() => setOpen(false)}
        size="lg"
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </button>
            <button type="submit" form="customer-form" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form id="customer-form" onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-name">Name *</label>
              <input
                id="c-name"
                required
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="c-phone">Phone</label>
              <input
                id="c-phone"
                className="input"
                inputMode="tel"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="c-email">Email</label>
              <input
                id="c-email"
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <fieldset className="space-y-4 rounded-xl border border-navy/10 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-navy/50">
              Address
            </legend>
            <div>
              <label className="label" htmlFor="c-street">Street</label>
              <input
                id="c-street"
                className="input"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="c-city">City</label>
                <input
                  id="c-city"
                  className="input"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="c-state">State</label>
                <input
                  id="c-state"
                  className="input"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="c-zip">PIN code</label>
                <input
                  id="c-zip"
                  className="input"
                  inputMode="numeric"
                  value={form.zipCode}
                  onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                />
              </div>
            </div>
          </fieldset>

          <div>
            <label className="label" htmlFor="c-notes">Notes</label>
            <textarea
              id="c-notes"
              rows={3}
              className="input"
              placeholder="Site access details, preferences, history…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {editing ? (
            <div className="flex items-center gap-2">
              <input
                id="c-status"
                type="checkbox"
                checked={form.status === 'active'}
                onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })}
              />
              <label htmlFor="c-status" className="text-sm text-navy/70">Active customer</label>
            </div>
          ) : null}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction?.nextStatus === 'inactive' ? 'Deactivate this customer?' : 'Reactivate this customer?'}
        message={
          confirmAction?.nextStatus === 'inactive'
            ? `${confirmAction?.row?.name} will be marked inactive. Their bookings, quotations and invoices are kept.`
            : `${confirmAction?.row?.name} will be marked active again.`
        }
        confirmLabel={confirmAction?.nextStatus === 'inactive' ? 'Deactivate' : 'Reactivate'}
        busy={busy}
        onConfirm={runAction}
        onClose={() => setConfirmAction(null)}
      />
    </>
  );
}
