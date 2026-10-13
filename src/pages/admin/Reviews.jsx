import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, EyeOff, Star, Trash2 } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import useResource from '../../hooks/useResource';
import { del, put } from '../../lib/api';
import { formatDate } from '../../lib/format';

const STATUSES = ['pending', 'approved', 'hidden'];

export default function Reviews() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, filters, updateFilter, reload } =
    useResource('/reviews');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const setStatus = async (row, status) => {
    try {
      await put(`/reviews/${row._id}/status`, { status });
      toast.success(`Review ${status}`);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await del(`/reviews/${confirmDelete._id}`);
      toast.success('Review deleted');
      setConfirmDelete(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => (
        <span className="flex gap-0.5" aria-label={`${r.rating} out of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-navy/20'}`} />
          ))}
        </span>
      ),
    },
    { key: 'customer', header: 'Customer', render: (r) => r.customerName || r.customer?.name || '—' },
    {
      key: 'comment',
      header: 'Comment',
      render: (r) => <span className="line-clamp-2 max-w-md text-navy/70">{r.comment || '—'}</span>,
    },
    { key: 'createdAt', header: 'Received', render: (r) => formatDate(r.createdAt) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (r) => (
        <div className="flex justify-end gap-2">
          {r.status !== 'approved' ? (
            <button type="button" className="link text-emerald-600" title="Approve (publish)" onClick={() => setStatus(r, 'approved')}>
              <Check className="h-4 w-4" />
            </button>
          ) : null}
          {r.status !== 'hidden' ? (
            <button type="button" className="link" title="Hide" onClick={() => setStatus(r, 'hidden')}>
              <EyeOff className="h-4 w-4" />
            </button>
          ) : null}
          <button type="button" className="link text-red-600" title="Delete" onClick={() => setConfirmDelete(r)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Reviews are never published automatically. Only approved reviews appear on the website."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="search" className="input sm:max-w-xs" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input sm:w-40" value={filters.status || ''} onChange={(e) => updateFilter('status', e.target.value || undefined)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No reviews found." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete this review?"
        message="This permanently removes the review. Hiding is usually preferable."
        confirmLabel="Delete"
        busy={busy}
        onConfirm={remove}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
