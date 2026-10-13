import { AlertCircle, Loader2, PackageOpen } from 'lucide-react';
import Button from '../ui/Button';

export function Loading({ label = 'Loading…', className = '' }) {
  return (
    <div
      className={`flex items-center justify-center gap-2.5 py-16 text-body ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-100 bg-red-50/60 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-red-500 shadow-soft">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="max-w-sm text-sm font-medium text-red-700">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, action, icon: Icon = PackageOpen }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-offwhite px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-body/40 shadow-soft">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="font-bold text-navy">{title}</p>
      {message ? <p className="max-w-sm text-sm text-body">{message}</p> : null}
      {action}
    </div>
  );
}
