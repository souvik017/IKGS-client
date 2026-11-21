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
      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#111a37] via-[#1d3673] to-[#3c68e9] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-blue-100">IKGS business overview</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Good day, {admin?.name?.split(' ')[0] || 'Admin'}</h1><p className="mt-2 max-w-xl text-sm text-blue-100">Your operations, customer activity and team workload at a glance.</p></div><button className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20" onClick={load}>Refresh overview</button></div>
      </div>

      {loading ? (
        <Loading label="Loading dashboard…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total enquiries" value={summary.totalEnquiries} Icon={ClipboardList} tone="royal" to="/admin/enquiries" />
            <StatCard label="New enquiries" value={summary.newEnquiries} Icon={UserPlus} tone="emerald" to="/admin/enquiries" />
            <StatCard label="Pending bookings" value={summary.pendingBookings} Icon={CalendarDays} tone="amber" to="/admin/bookings" />
            <StatCard label="Free inspection requests" value={summary.pendingFreeInspections} Icon={CalendarDays} tone="emerald" to="/admin/free-inspections" />
            <StatCard label="Today's appointments" value={summary.todaysAppointments} Icon={CalendarClock} tone="royal" to="/admin/appointments" />
            <StatCard label="Upcoming appointments" value={summary.upcomingAppointments} Icon={CalendarClock} tone="navy" to="/admin/appointments" />
            <StatCard label="Total customers" value={summary.totalCustomers} Icon={Users} tone="navy" to="/admin/customers" />
            <StatCard label="Pending quotations" value={summary.pendingQuotations} Icon={FileText} tone="amber" to="/admin/quotations" />
            <StatCard label="Outstanding invoices" value={summary.unpaidInvoices} Icon={Receipt} tone="red" to="/admin/invoices" />
            <StatCard label="Revenue this month" value={currency(summary.revenueThisMonth)} Icon={TrendingUp} tone="emerald" to="/admin/invoices" />
            <StatCard label="Revenue collected" value={currency(summary.revenueAllTime)} Icon={Receipt} tone="royal" to="/admin/invoices" />
            <StatCard label="Low-stock items" value={summary.lowStockItems} Icon={Boxes} tone="red" to="/admin/inventory" />
          </div>

          {summary.birthdayEmployees?.length ? <section className="mt-5 rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-50 to-amber-50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-pink-700">Team birthdays today 🎂</p><div className="mt-3 flex flex-wrap gap-2">{summary.birthdayEmployees.map(e=><span key={e.id} className="rounded-xl bg-white/80 px-3 py-2 text-sm font-semibold text-navy">🎉 {e.name}</span>)}</div></section> : null}

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card lg:col-span-2">
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
            <div className="rounded-2xl bg-white p-6 shadow-card"><p className="text-xs font-bold uppercase tracking-wider text-navy/40">Quick actions</p><div className="mt-4 grid gap-2"><a className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-100" href="/admin/free-inspections">Review free inspections →</a><a className="rounded-xl bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-800 hover:bg-violet-100" href="/admin/appointments">Manage today’s appointments →</a><a className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100" href="/admin/inventory">Check stock levels →</a></div></div>
          </div>
        </>
      )}
    </>
  );
}
