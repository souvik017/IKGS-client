import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Eye, Filter, Plus, RefreshCw, Trash2 } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import useResource from '../../hooks/useResource';
import { fetchPdf, get, post, put } from '../../lib/api';
import { currency, formatDate } from '../../lib/format';

const STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
const blankItem = () => ({ item: '', quantity: 1, unitPrice: 0, discount: 0 });

export default function Quotations() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, filters, updateFilter, reload } =
    useResource('/quotations');

  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ customer: '', validUntil: '', terms: '', items: [blankItem()] });

  useEffect(() => {
    get('/customers', { limit: 100 })
      .then((res) => setCustomers(res.data))
      .catch(() => setCustomers([]));
  }, []);

  const updateItem = (index, patch) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...patch };
      return { ...prev, items };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await post('/quotations', {
        ...form,
        items: form.items.map((i) => ({
          item: i.item,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          discount: Number(i.discount) || 0,
        })),
      });
      toast.success('Quotation created');
      setOpen(false);
      setForm({ customer: '', validUntil: '', terms: '', items: [blankItem()] });
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (row, status) => {
    try {
      await put(`/quotations/${row._id}/status`, { status });
      toast.success('Status updated');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const viewDetail = async (row) => {
    try {
      const res = await get(`/quotations/${row._id}`);
      setDetail(res.data.quotation);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const download = async (row) => {
    try {
      await fetchPdf(`/quotations/${row._id}/pdf`, { download: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const estimate = form.items.reduce(
    (sum, i) => sum + Number(i.quantity) * Number(i.unitPrice) - (Number(i.discount) || 0),
    0
  );

  const columns = [
    { key: 'quotationNumber', header: 'Number', render: (r) => <span className="font-mono text-xs">{r.quotationNumber}</span> },
    { key: 'customer', header: 'Customer', render: (r) => r.customer?.name || '—' },
    { key: 'total', header: 'Total', render: (r) => currency(r.total) },
    { key: 'validUntil', header: 'Valid until', render: (r) => formatDate(r.validUntil) },
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
            onChange={(e) => changeStatus(r, e.target.value)}
            aria-label={`Status for ${r.quotationNumber}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="button" className="link" title="View" onClick={() => viewDetail(r)}>
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" className="link" title="Download PDF" onClick={() => download(r)}>
            <Download className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Quotations" description="Prepare and send quotations to customers.">
        <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New Quotation
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          className="input sm:max-w-xs"
          placeholder="Search quotation number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-navy/40" />
          <select className="input sm:w-40" value={filters.status || ''} onChange={(e) => updateFilter('status', e.target.value || undefined)}>
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

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No quotations found." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Create */}
      <Modal
        open={open}
        title="New Quotation"
        onClose={() => setOpen(false)}
        size="lg"
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" form="quotation-form" className="btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create quotation'}
            </button>
          </>
        }
      >
        <form id="quotation-form" onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="q-customer">Customer *</label>
              <select id="q-customer" required className="input" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} — {c.phone || c.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="q-valid">Valid until</label>
              <input id="q-valid" type="date" className="input" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="label mb-0">Line items *</span>
              <button type="button" className="link text-sm" onClick={() => setForm({ ...form, items: [...form.items, blankItem()] })}>
                <Plus className="inline h-3.5 w-3.5" /> Add item
              </button>
            </div>
            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <input
                    className="input col-span-5"
                    placeholder="Item description"
                    required
                    value={item.item}
                    onChange={(e) => updateItem(index, { item: e.target.value })}
                  />
                  <input
                    type="number"
                    min="1"
                    className="input col-span-2"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input col-span-2"
                    placeholder="Rate"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input col-span-2"
                    placeholder="Discount"
                    value={item.discount}
                    onChange={(e) => updateItem(index, { discount: e.target.value })}
                  />
                  <button
                    type="button"
                    className="col-span-1 grid place-items-center text-navy/40 hover:text-red-600"
                    onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== index) })}
                    disabled={form.items.length === 1}
                    aria-label="Remove line item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="q-terms">Terms &amp; conditions</label>
            <textarea id="q-terms" rows={3} className="input" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} placeholder="Leave blank to use the default terms configured in Settings." />
          </div>

          <p className="text-right text-sm text-navy/60">
            Estimated total (before tax): <span className="font-semibold text-navy">{currency(estimate)}</span>
          </p>
          <p className="text-right text-xs text-navy/40">
            Final totals are calculated by the server when the quotation is saved.
          </p>
        </form>
      </Modal>

      {/* Detail */}
      <Modal open={Boolean(detail)} title={detail ? `Quotation ${detail.quotationNumber}` : ''} onClose={() => setDetail(null)} size="lg">
        {detail ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy">{detail.customer?.name}</p>
                <p className="text-xs text-navy/50">{detail.customer?.phone} {detail.customer?.email}</p>
              </div>
              <StatusBadge status={detail.status} />
            </div>
            <table className="min-w-full divide-y divide-navy/10 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-navy/50">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/5">
                {detail.items.map((i, idx) => (
                  <tr key={idx}>
                    <td className="py-2">{i.item}</td>
                    <td className="py-2 text-right">{i.quantity}</td>
                    <td className="py-2 text-right">{currency(i.unitPrice)}</td>
                    <td className="py-2 text-right">{currency(i.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ml-auto w-64 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-navy/60">Subtotal</span><span>{currency(detail.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-navy/60">Discount</span><span>- {currency(detail.discount)}</span></div>
              <div className="flex justify-between"><span className="text-navy/60">Tax</span><span>{currency(detail.tax)}</span></div>
              <div className="flex justify-between border-t border-navy/10 pt-1 font-bold text-navy"><span>Total</span><span>{currency(detail.total)}</span></div>
            </div>
            {detail.terms ? <p className="text-xs text-navy/50">{detail.terms}</p> : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
