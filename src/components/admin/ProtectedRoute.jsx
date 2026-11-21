import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../public/States';

export default function ProtectedRoute({ children, employeeOnly = false }) {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist">
        <Loading label="Verifying session…" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (employeeOnly && admin.accountType !== 'employee') return <Navigate to="/admin/dashboard" replace />;
  if (!employeeOnly && admin.accountType === 'employee') return <Navigate to="/employee" replace />;

  return children;
}
