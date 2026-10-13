import { NavLink } from 'react-router-dom';
import { LOGO, LOGO_WIDTH, LOGO_HEIGHT } from '../../lib/brand';
import {
  BarChart3,
  Boxes,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Settings,
  Star,
  UserCog,
  Users,
  Wrench,
  X,
} from 'lucide-react';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/enquiries', label: 'Enquiries', Icon: ClipboardList },
  { to: '/admin/bookings', label: 'Bookings', Icon: CalendarDays },
  { to: '/admin/appointments', label: 'Appointments', Icon: CalendarDays },
  { to: '/admin/customers', label: 'Customers', Icon: Users },
  { to: '/admin/employees', label: 'Employees', Icon: UserCog },
  { to: '/admin/quotations', label: 'Quotations', Icon: FileText },
  { to: '/admin/invoices', label: 'Invoices', Icon: Receipt },
  { to: '/admin/inventory', label: 'Inventory', Icon: Boxes },
  { to: '/admin/reviews', label: 'Reviews', Icon: Star },
  { to: '/admin/services', label: 'Services', Icon: Wrench },
  { to: '/admin/settings', label: 'Settings', Icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-30 bg-navy/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] transform flex-col bg-navy text-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 pt-[env(safe-area-inset-top)]">
          <NavLink to="/admin/dashboard" className="flex min-w-0 items-center gap-2">
            <img
              src={LOGO}
              alt=""
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              className="h-6 w-auto shrink-0 rounded bg-white px-1 py-0.5 object-contain"
            />
            <span className="truncate text-sm font-bold">IKGS Admin</span>
          </NavLink>
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pb-6" aria-label="Admin navigation">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-royal text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="w-full shrink-0 border-t border-white/10 p-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))]">
          <NavLink to="/" className="flex items-center gap-2 text-xs text-white/50 hover:text-white">
            <BarChart3 className="h-3.5 w-3.5" /> View public website
          </NavLink>
        </div>
      </aside>
    </>
  );
}
