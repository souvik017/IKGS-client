import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Seo from '../../components/public/Seo';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { admin, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  if (!loading && admin) {
    return <Navigate to={location.state?.from || '/admin/dashboard'} replace />;
  }

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      const loggedIn = await login(values.email, values.password);
      toast.success(`Welcome back, ${loggedIn.name}`);
      navigate(location.state?.from || '/admin/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4 py-12">
      <Seo title="Admin Login" description="IKGS Solution administration sign-in." path="/admin/login" noindex />

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-royal text-lg font-extrabold text-white">
            IK
          </span>
          <h1 className="mt-4 text-2xl font-bold text-white">IKGS Solution Admin</h1>
          <p className="mt-1 text-sm text-white/60">Sign in to manage your business</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl bg-white p-8 shadow-xl" noValidate>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/30" />
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="input pl-10"
                placeholder="admin@example.com"
                {...register('email', { required: 'Email is required' })}
              />
            </div>
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/30" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input pl-10"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
          </div>

          {serverError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {serverError}
            </p>
          ) : null}

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            <LogIn className="h-4 w-4" />
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Authorised personnel only. All activity may be logged.
        </p>
      </div>
    </div>
  );
}
