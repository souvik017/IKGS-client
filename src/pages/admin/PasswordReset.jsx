import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Seo from '../../components/public/Seo';
import { post } from '../../lib/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true);
    try { const res = await post('/auth/password/forgot', { email }); setDone(true); toast.success(res.data.message); }
    catch (error) { toast.error(error.message); }
    finally { setBusy(false); }
  };
  return <Shell title="Forgot password"><Seo title="Forgot Password" description="Request a staff account password reset." path="/forgot-password" noindex />
    {done ? <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">If an active account matches that email, password reset instructions have been sent.</div> : <form onSubmit={submit} className="space-y-4"><label className="label">Account email<input autoComplete="email" type="email" required className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></label><button className="btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button></form>}
    <p className="mt-5 text-center text-sm"><Link className="text-royal underline" to="/admin/login">Back to sign in</Link></p>
  </Shell>;
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    setBusy(true);
    try { const res = await post('/auth/password/reset', { token: params.get('token'), password }); toast.success(res.data.message); setDone(true); }
    catch (error) { toast.error(error.message); }
    finally { setBusy(false); }
  };
  return <Shell title="Set a new password"><Seo title="Reset Password" description="Set a new staff account password." path="/reset-password" noindex />
    {done ? <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">Password updated. <Link className="font-semibold underline" to="/admin/login">Sign in</Link></div> : <form onSubmit={submit} className="space-y-4"><label className="label">New password<input type="password" required minLength={8} autoComplete="new-password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} /></label><label className="label">Confirm password<input type="password" required minLength={8} autoComplete="new-password" className="input mt-1" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label><button className="btn-primary w-full" disabled={busy || !params.get('token')}>{busy ? 'Updating…' : 'Reset password'}</button>{!params.get('token') && <p className="text-sm text-red-700">This reset link is missing its token. Request a new one.</p>}</form>}
    <p className="mt-5 text-center text-sm"><Link className="text-royal underline" to="/admin/login">Back to sign in</Link></p>
  </Shell>;
}

function Shell({ title, children }) { return <div className="grid min-h-screen place-items-center bg-navy px-4 py-12"><section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"><p className="text-center text-sm font-bold tracking-wide text-royal">IKGS SOLUTION</p><h1 className="mb-6 mt-2 text-center text-2xl font-bold text-navy">{title}</h1>{children}</section></div>; }
