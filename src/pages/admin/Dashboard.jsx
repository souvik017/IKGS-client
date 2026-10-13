import { useEffect, useState } from 'react';
import {
  Boxes,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  FileText,
  Receipt,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import { ErrorState, Loading } from '../../components/public/States';
import { get } from '../../lib/api';
import { currency } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { admin } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    get('/dashboard/summary')
      .then((res) => setSummary(res.data.summary))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <>
      <PageHeader
        title={`Welcome, ${admin?.name?.split(' ')[0] || 'Admin'}`}
        description="An overview of enquiries, bookings, appointments and billing."
      />

      {loading ? (
        <Loading label="Loading dashboard…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total enquiries" value={summary.totalEnquiries} Icon={ClipboardList} tone="royal" to="/admin/enquiries" />
            <StatCard label="New enquiries" value={summary.newEnquiries} Icon={UserPlus} tone="emerald" to="/admin/enquiries" />
            <StatCard label="Pending bookings" value={summary.pendingBookings} Icon={CalendarDays} tone="amber" to="/admin/bookings" />
            <StatCard label="Today's appointments" value={summary.todaysAppointments} Icon={CalendarClock} tone="royal" to="/admin/appointments" />
            <StatCard label="Upcoming appointments" value={summary.upcomingAppointments} Icon={CalendarClock} tone="navy" to="/admin/appointments" />
            <StatCard label="Total customers" value={summary.totalCustomers} Icon={Users} tone="navy" to="/admin/customers" />
            <StatCard label="Pending quotations" value={summary.pendingQuotations} Icon={FileText} tone="amber" to="/admin/quotations" />
            <StatCard label="Outstanding invoices" value={summary.unpaidInvoices} Icon={Receipt} tone="red" to="/admin/invoices" />
            <StatCard label="Low-stock items" value={summary.lowStockItems} Icon={Boxes} tone="red" to="/admin/inventory" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-navy/10 bg-white p-6 shadow-card lg:col-span-1">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-royal/10 text-royal">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-navy/50">Outstanding amount</p>
                  <p className="text-2xl font-extrabold text-navy">{currency(summary.outstandingAmount)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-navy/50">
                Total balance due across unpaid and partially paid invoices.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
