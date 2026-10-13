import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { ErrorState, Loading } from '../../components/public/States';
import { get } from '../../lib/api';
import { currency, formatDate } from '../../lib/format';

const TABS = [
  { key: 'bookings', label: 'Bookings' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'enquiries', label: 'Enquiries' },
  { key: 'quotations', label: 'Quotations' },
  { key: 'invoices', label: 'Invoices' },
];

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('bookings');

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    get(`/customers/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  if (loading) return <Loading label="Loading customer…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const { customer, records } = data;
  const active = records[tab] || [];

  const columns = {
    bookings: [
      { key: 'bookingId', header: 'Reference', render: (r) => <span className="font-mono text-xs">{r.bookingId}</span> },
      { key: 'service', header: 'Service', render: (r) => r.service?.title || '—' },
      { key: 'preferredDate', header: 'Preferred', render: (r) => formatDate(r.preferredDate) },
      { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ],
    appointments: [
      { key: 'appointmentId', header: 'Reference', render: (r) => <span className="font-mono text-xs">{r.appointmentId}</span> },
      { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
      { key: 'employee', header: 'Assigned', render: (r) => r.employee?.name || '—' },
      { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ],
    enquiries: [
      { key: 'enquiryId', header: 'Reference', render: (r) => <span className="font-mono text-xs">{r.enquiryId}</span> },
      { key: 'source', header: 'Source', render: (r) => <span className="capitalize">{r.source}</span> },
      { key: 'createdAt', header: 'Received', render: (r) => formatDate(r.createdAt) },
      { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ],
    quotations: [
      { key: 'quotationNumber', header: 'Number', render: (r) => <span className="font-mono text-xs">{r.quotationNumber}</span> },
      { key: 'total', header: 'Total', render: (r) => currency(r.total) },
      { key: 'validUntil', header: 'Valid until', render: (r) => formatDate(r.validUntil) },
      { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ],
    invoices: [
      { key: 'invoiceNumber', header: 'Number', render: (r) => <span className="font-mono text-xs">{r.invoiceNumber}</span> },
      { key: 'total', header: 'Total', render: (r) => currency(r.total) },
      { key: 'balanceDue', header: 'Balance', render: (r) => currency(r.balanceDue) },
      { key: 'paymentStatus', header: 'Payment', render: (r) => <StatusBadge status={r.paymentStatus} /> },
    ],
  };

  return (
    <>
      <Link to="/admin/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-navy/60 hover:text-royal">
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      <PageHeader title={customer.name} description={customer.customerId} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card py-4">
          <p className="text-xs uppercase text-navy/50">Phone</p>
          <p className="font-medium text-navy">{customer.phone || '—'}</p>
        </div>
        <div className="card py-4">
          <p className="text-xs uppercase text-navy/50">Email</p>
          <p className="truncate font-medium text-navy">{customer.email || '—'}</p>
        </div>
        <div className="card py-4">
          <p className="text-xs uppercase text-navy/50">Address</p>
          <p className="font-medium text-navy">
            {[customer.address?.street, customer.address?.city, customer.address?.state].filter(Boolean).join(', ') || '—'}
          </p>
        </div>
        <div className="card py-4">
          <p className="text-xs uppercase text-navy/50">Status</p>
          <StatusBadge status={customer.status} />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? 'bg-royal text-white' : 'bg-white text-navy/60 hover:text-navy'
            }`}
          >
            {t.label} <span className="text-xs opacity-70">({records[t.key]?.length || 0})</span>
          </button>
        ))}
      </div>

      <DataTable columns={columns[tab]} rows={active} emptyMessage={`No ${tab} for this customer.`} />
    </>
  );
}
