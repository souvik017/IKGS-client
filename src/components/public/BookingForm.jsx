import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { get, post } from '../../lib/api';

export default function BookingForm() {
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [confirmation, setConfirmation] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    let active = true;
    get('/public/services')
      .then((res) => active && setServices(res.data.services))
      .catch(() => active && setServices([]))
      .finally(() => active && setServicesLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (values) => {
    setSubmitError(null);
    try {
      const res = await post('/public/bookings', values);
      setConfirmation(res.data);
      reset();
    } catch (err) {
      // Never show success when the request fails.
      setSubmitError(err.message);
    }
  };

  if (confirmation) {
    return (
      <motion.div
        className="card text-center"
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-xl font-extrabold text-navy">Booking received</h3>
        <p className="mt-2 text-sm text-body">{confirmation.message}</p>
        <p className="mt-5 inline-block rounded-xl bg-ice px-4 py-2 font-mono text-sm font-bold text-primary">
          {confirmation.booking.bookingId}
        </p>
        <div className="mt-7">
          <button type="button" className="btn-secondary" onClick={() => setConfirmation(null)}>
            Book another service
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="bk-name">
            Full name <span className="text-primary">*</span>
          </label>
          <input
            id="bk-name"
            className={`input ${errors.name ? 'input-error' : ''}`}
            placeholder="Your name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name ? (
            <p className="field-error" role="alert">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {errors.name.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="label" htmlFor="bk-phone">
            Phone <span className="text-primary">*</span>
          </label>
          <input
            id="bk-phone"
            className={`input ${errors.phone ? 'input-error' : ''}`}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register('phone', {
              required: 'Phone is required',
              pattern: { value: /^[\d\s\-+()]{7,20}$/, message: 'Enter a valid phone number' },
            })}
          />
          {errors.phone ? (
            <p className="field-error" role="alert">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {errors.phone.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="bk-email">
            Email
          </label>
          <input
            id="bk-email"
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email', {
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: 'Enter a valid email' },
            })}
          />
          {errors.email ? (
            <p className="field-error" role="alert">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {errors.email.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="label" htmlFor="bk-service">
            Required service
          </label>
          <select id="bk-service" className="input" disabled={servicesLoading} {...register('service')}>
            <option value="">{servicesLoading ? 'Loading services…' : 'Select a service'}</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="bk-address">
          Address
        </label>
        <input
          id="bk-address"
          className="input"
          placeholder="Property address"
          autoComplete="street-address"
          {...register('address')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="bk-date">
            Preferred date
          </label>
          <input id="bk-date" type="date" className="input" {...register('preferredDate')} />
        </div>
        <div>
          <label className="label" htmlFor="bk-time">
            Preferred time
          </label>
          <select id="bk-time" className="input" {...register('preferredTime')}>
            <option value="">Any time</option>
            <option value="09:00-12:00">Morning (9:00 – 12:00)</option>
            <option value="12:00-15:00">Afternoon (12:00 – 15:00)</option>
            <option value="15:00-18:00">Evening (15:00 – 18:00)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="bk-message">
          Message / notes
        </label>
        <textarea
          id="bk-message"
          rows={3}
          className="input"
          placeholder="Tell us briefly about the problem"
          {...register('message')}
        />
      </div>

      {submitError ? (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={isSubmitting || servicesLoading}>
        {isSubmitting ? (
          'Submitting…'
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" /> Request Free Demo
          </>
        )}
      </button>
      <p className="text-center text-xs text-body">
        By submitting you agree to be contacted about your enquiry.
      </p>
    </form>
  );
}
