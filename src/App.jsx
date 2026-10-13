import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import PublicLayout from './components/public/PublicLayout';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import { Loading } from './components/public/States';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import ServiceDetail from './pages/public/ServiceDetail';
import BookNow from './pages/public/BookNow';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';

/* Route-level code splitting.
 *
 * The gallery (grid + lightbox) and the whole admin panel are the heaviest
 * parts of the app and are not needed for the first paint of the public site,
 * so they are loaded on demand. PublicLayout and AdminLayout each provide the
 * Suspense boundary that catches them. */
const Gallery = lazy(() => import('./pages/public/Gallery'));

const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Enquiries = lazy(() => import('./pages/admin/Enquiries'));
const Bookings = lazy(() => import('./pages/admin/Bookings'));
const Appointments = lazy(() => import('./pages/admin/Appointments'));
const Employees = lazy(() => import('./pages/admin/Employees'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const CustomerDetail = lazy(() => import('./pages/admin/CustomerDetail'));
const Quotations = lazy(() => import('./pages/admin/Quotations'));
const Invoices = lazy(() => import('./pages/admin/Invoices'));
const Inventory = lazy(() => import('./pages/admin/Inventory'));
const Reviews = lazy(() => import('./pages/admin/Reviews'));
const ServicesAdmin = lazy(() => import('./pages/admin/ServicesAdmin'));
const Settings = lazy(() => import('./pages/admin/Settings'));

/** Fallback shown while a lazily-loaded route chunk is being fetched. */
const RouteFallback = () => <Loading label="Loading…" className="py-24" />;

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/book-now" element={<BookNow />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin panel */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<RouteFallback />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="employees" element={<Employees />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="services" element={<ServicesAdmin />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
