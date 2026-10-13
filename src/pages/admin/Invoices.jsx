import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Filter, Plus, RefreshCw, Wallet } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import useResource from '../../hooks/useResource';
import { fetchPdf, get, post, put } from '../../lib/api';
import { currency, formatDate, statusStyle, titleCase } from '../../lib/format';

const PAYMENT_STATUSES = ['unpaid', 'partially-paid', 'paid'];
const blankItem = () => ({ item: '', quantity: 1, unitPrice: 0, discount: 0 });

export default function Invoices() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, filters, updateFilter, reload } =
    useResource('/invoices');

  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [paymentFor, setPaymentFor] = useState(null);
  const [payment, setPayment] = useState({ amountPaid: '', paymentMethod: 'cash' });

  const [form, setForm] = useState({
    mode: 'general',
    customer: '',
    appointment: '',
    billingPeriod: '',
    items: [blankItem()],
  });

  useEffect(() => {
    get('/customers', { limit: 100 }).then((res) => setCustomers(res.data)).catch(() => setCustomers([]));
    get('/appointments', { limit: 100 }).then((res) => setAppointments(res.data)).catch(() => setAppointments([]));
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
      if (form.mode === 'appointment') {
        await post('/invoices/appointment', { appointment: form.appointment });
      } else {
        await post('/invoices', {
          customer: form.customer,
          billingPeriod: form.billingPeriod,
          items: form.items.map((i) => ({
            item: i.item,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
            discount: Number(i.discount) || 0,
          })),
        });
      }
      toast.success('Invoice created');
      setOpen(false);
      setForm({ mode: 'general', customer: '', appointment: '', billingPeriod: '', items: [blankItem()] });
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const openPayment = (row) => {
    setPaymentFor(row);
    setPayment({ amountPaid: row.amountPaid || 0, paymentMethod: row.paymentMethod || 'cash' });
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await put(`/invoices/${paymentFor._id}/payment`, {
        amountPaid: Number(payment.amountPaid),
        paymentMethod: payment.paymentMethod,
      });
      toast.success('Payment updated');
      setPaymentFor(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const download = async (row) => {
    try {
      await fetchPdf(`/invoices/${row._id}/pdf`, { download: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'invoiceNumber', header: 'Number', render: (r) => <span className="font-mono text-xs">{r.invoiceNumber}</span> },
    { key: 'customer', header: 'Customer', render: (r) => r.customer?.name || '—' },
    { key: 'invoiceType', header: 'Type', render: (r) => <span className="capitalize">{r.invoiceType}</span> },
    { key: 'total', header: 'Total', render: (r) => currency(r.total) },
    { key: 'balanceDue', header: 'Balance', render: (r) => currency(r.balanceDue) },
    { key: 'paymentStatus', header: 'Payment', render: (r) => <StatusBadge status={r.paymentStatus} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button type="button" className="link" title="Record payment" onClick={() => openPayment(r)}>
            <Wallet className="h-4 w-4" />
          </button>
          <button type="button" className="link" title="Download PDF" onClick={() => download(r)}>
            <Download className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const estimate = form.items.reduce(
    (sum, i) => sum + Number(i.quantity) * Number(i.unitPrice) - (Number(i.discount) || 0),
    0
  );

  return (
    <>
      <PageHeader title="Invoices" description="Appointment-based and general billing.">
        <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New Invoice
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          className="input sm:max-w-xs"
          placeholder="Search invoice number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-navy/40" />
          <select className="input sm:w-44" value={filters.paymentStatus || ''} onChange={(e) => updateFilter('paymentStatus', e.target.value || undefined)}>
            <option value="">All payment states</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{titleCase(s)}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-ghost" onClick={reload}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No invoices found." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Create invoice */}
      <Modal
        open={open}
        title="New Invoice"
        onClose={() => setOpen(false)}
        size="lg"
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" form="invoice-form" className="btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create invoice'}
            </button>
          </>
        }
      >
        <form id="invoice-form" onSubmit={submit} className="space-y-5">
          <div className="flex gap-2">
            {[
              { key: 'general', label: 'General / monthly' },
              { key: 'appointment', label: 'From appointment' },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setForm({ ...form, mode: m.key })}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  form.mode === m.key ? 'border-royal bg-royal/5 text-royal' : 'border-navy/15 text-navy/60'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {form.mode === 'appointment' ? (
            <div>
              <label className="label" htmlFor="i-appointment">Appointment *</label>
              <select
                id="i-appointment"
                required
                className="input"
                value={form.appointment}
                onChange={(e) => setForm({ ...form, appointment: e.target.value })}
              >
                <option value="">Select appointment</option>
                {appointments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.appointmentId} — {a.customer?.name} ({formatDate(a.date)})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-navy/50">
                Line items are generated from the appointment's service when none are provided.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="i-customer">Customer *</label>
                  <select id="i-customer" required className="input" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} — {c.phone || c.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="i-period">Billing period</label>
                  <input id="i-period" className="input" placeholder="e.g. 2026-09" value={form.billingPeriod} onChange={(e) => setForm({ ...form, billingPeriod: e.target.value })} />
                </div>
              </div>
              <div>
                <span className="label">Line items *</span>
                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <input className="input col-span-7" placeholder="Item description" required value={item.item} onChange={(e) => updateItem(index, { item: e.target.value })} />
                      <input type="number" min="1" className="input col-span-2" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, { quantity: e.target.value })} />
                      <input type="number" min="0" step="0.01" className="input col-span-3" placeholder="Rate" value={item.unitPrice} onChange={(e) => updateItem(index, { unitPrice: e.target.value })} />
                    </div>
                  ))}
                </div>
                <button type="button" className="link mt-2 text-sm" onClick={() => setForm({ ...form, items: [...form.items, blankItem()] })}>
                  <Plus className="inline h-3.5 w-3.5" /> Add item
                </button>
              </div>
              <p className="text-right text-sm text-navy/60">
                Estimated total (before tax): <span className="font-semibold text-navy">{currency(estimate)}</span>
              </p>
            </>
          )}
        </form>
      </Modal>

      {/* Payment */}
      <Modal
        open={Boolean(paymentFor)}
        title={paymentFor ? `Record payment — ${paymentFor.invoiceNumber}` : ''}
        onClose={() => setPaymentFor(null)}
        size="sm"
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setPaymentFor(null)}>Cancel</button>
            <button type="submit" form="payment-form" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save payment'}
            </button>
          </>
        }
      >
        {paymentFor ? (
          <form id="payment-form" onSubmit={submitPayment} className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-navy/60">Invoice total</span>
              <span className="font-semibold text-navy">{currency(paymentFor.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy/60">Current status</span>
              <span className={`badge ${statusStyle(paymentFor.paymentStatus)}`}>{titleCase(paymentFor.paymentStatus)}</span>
            </div>
            <div>
              <label className="label" htmlFor="p-amount">Amount paid</label>
              <input
                id="p-amount"
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={payment.amountPaid}
                onChange={(e) => setPayment({ ...payment, amountPaid: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="p-method">Payment method</label>
              <select id="p-method" className="input" value={payment.paymentMethod} onChange={(e) => setPayment({ ...payment, paymentMethod: e.target.value })}>
                {['cash', 'upi', 'bank-transfer', 'cheque', 'card', 'other'].map((m) => (
                  <option key={m} value={m}>{titleCase(m)}</option>
                ))}
              </select>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
