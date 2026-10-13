import { useState } from 'react';
import toast from 'react-hot-toast';
import { Filter, Plus, RefreshCw } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import useResource from '../../hooks/useResource';
import { post, put } from '../../lib/api';
import { formatDate } from '../../lib/format';

const STATUSES = ['new', 'in-progress', 'follow-up', 'converted', 'closed'];

const emptyForm = { name: '', phone: '', email: '', details: '', source: 'phone' };

export default function Enquiries() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, filters, updateFilter, reload } =
    useResource('/enquiries');

  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const openDetail = async (row) => {
    setSelected({ ...row, followUpNote: '', newStatus: row.status });
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await post('/enquiries', form);
      toast.success('Enquiry created');
      setCreateOpen(false);
      setForm(emptyForm);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveStatus = async () => {
    setBusy(true);
    try {
      const res = await put(`/enquiries/${selected._id}/status`, {
        status: selected.newStatus,
        note: selected.followUpNote || undefined,
      });
      toast.success('Enquiry updated');
      setSelected(res.data.enquiry);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const convert = async () => {
    setBusy(true);
    try {
      await post(`/enquiries/${selected._id}/convert`, { createBooking: true });
      toast.success('Converted to customer and booking');
      setSelected(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'enquiryId', header: 'Reference', render: (r) => <span className="font-mono text-xs">{r.enquiryId}</span> },
    {
      key: 'name',
      header: 'Contact',
      render: (r) => (
        <div>
          <p className="font-medium text-navy">{r.name}</p>
          <p className="text-xs text-navy/50">{r.phone || r.email || '—'}</p>
        </div>
      ),
    },
    { key: 'source', header: 'Source', render: (r) => <span className="capitalize">{r.source}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: 'Received', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <button type="button" className="link text-sm" onClick={() => openDetail(r)}>
          View
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Enquiries" description="Website enquiries and leads entered from calls or walk-ins.">
        <button type="button" className="btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Enquiry
        </button>
      </PageHeader>

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

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No enquiries found." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Create */}
      <Modal
        open={createOpen}
        title="New Enquiry"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" form="enquiry-form" className="btn-primary" disabled={busy}>Save</button>
          </>
        }
      >
        <form id="enquiry-form" onSubmit={submitCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="e-name">Name *</label>
              <input id="e-name" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="e-phone">Phone *</label>
              <input id="e-phone" className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="e-email">Email</label>
              <input id="e-email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="e-source">Source</label>
              <select id="e-source" className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {['phone', 'walk-in', 'website', 'referral', 'other'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="e-details">Details</label>
            <textarea id="e-details" rows={3} className="input" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
          </div>
        </form>
      </Modal>

      {/* Detail */}
      <Modal
        open={Boolean(selected)}
        title={selected ? `Enquiry ${selected.enquiryId}` : ''}
        onClose={() => setSelected(null)}
        size="lg"
        footer={
          selected ? (
            <>
              <button type="button" className="btn-outline" onClick={() => setSelected(null)}>Close</button>
              <button type="button" className="btn-ghost" onClick={saveStatus} disabled={busy}>Save status</button>
              {selected.status !== 'converted' ? (
                <button type="button" className="btn-primary" onClick={convert} disabled={busy}>Convert to customer</button>
              ) : null}
            </>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-navy/50">Name</p>
                <p className="font-medium text-navy">{selected.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-navy/50">Phone</p>
                <p className="font-medium text-navy">{selected.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-navy/50">Email</p>
                <p className="font-medium text-navy">{selected.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-navy/50">Source</p>
                <p className="font-medium capitalize text-navy">{selected.source}</p>
              </div>
            </div>

            {selected.details ? (
              <div>
                <p className="text-xs uppercase text-navy/50">Details</p>
                <p className="text-sm text-navy/70">{selected.details}</p>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="e-status">Status</label>
                <select id="e-status" className="input" value={selected.newStatus} onChange={(e) => setSelected({ ...selected, newStatus: e.target.value })}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="e-note">Add follow-up note</label>
                <input id="e-note" className="input" value={selected.followUpNote} onChange={(e) => setSelected({ ...selected, followUpNote: e.target.value })} />
              </div>
            </div>

            {selected.followUps?.length ? (
              <div>
                <p className="mb-2 text-xs uppercase text-navy/50">Follow-up history</p>
                <ul className="space-y-2">
                  {selected.followUps.map((f, i) => (
                    <li key={f._id || i} className="rounded-lg bg-mist px-3 py-2 text-sm text-navy/70">
                      <span className="block text-xs text-navy/40">{formatDate(f.createdAt, true)}</span>
                      {f.note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {selected.customer ? (
              <p className="text-sm text-navy/60">
                Linked customer: <span className="font-medium text-navy">{selected.customer.name}</span>
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
