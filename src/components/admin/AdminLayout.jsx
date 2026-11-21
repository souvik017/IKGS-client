import { Suspense, useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Bell, LogOut, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import { Loading } from '../public/States';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../lib/api';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const [unseen, setUnseen] = useState(0);

  useEffect(() => {
    const stream = new EventSource(`${API_BASE_URL}/notifications/stream`, { withCredentials: true });
    stream.addEventListener('notification', (event) => {
      const notification = JSON.parse(event.data);
      if (notification.type !== 'closure-request') return;
      setUnseen((count) => count + 1);
      toast((t) => (
        <Link to="/admin/closure-requests" onClick={() => toast.dismiss(t.id)} className="block">
          <strong className="block">{notification.title}</strong>
          <span className="text-sm">{notification.message} · Review now</span>
        </Link>
      ), { duration: 12000 });
    });
    return () => stream.close();
  }, []);

  return (
    <div className="flex min-h-screen bg-mist">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-navy/10 bg-white px-4 sm:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-navy lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4">
            <Link to="/admin/closure-requests" onClick={() => setUnseen(0)} className="relative rounded-lg p-2 text-navy hover:bg-mist" aria-label={`Closure notifications${unseen ? `, ${unseen} unread` : ''}`} title="Closure requests">
              <Bell className="h-5 w-5" />
              {unseen > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{unseen > 9 ? '9+' : unseen}</span>}
            </Link>
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-navy">{admin?.name}</p>
              <p className="hidden truncate text-xs text-navy/50 min-[420px]:block">{admin?.email}</p>
            </div>
            <Link to="/" className="hidden shrink-0 text-xs font-medium text-navy/50 hover:text-royal md:block">
              Public site
            </Link>
            <button type="button" className="btn-ghost shrink-0 px-3 py-2" onClick={logout} title="Sign out">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {/* Admin screens are code-split; this catches each chunk as it loads. */}
          <Suspense fallback={<Loading label="Loading…" className="py-24" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
