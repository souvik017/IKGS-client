import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { post } from '../../lib/api';

export default function EnquiryForm() {
  const [reference, setReference] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    setSubmitError(null);
    try {
      const res = await post('/public/enquiries', values);
      setReference(res.data.reference);
      reset();
    } catch (err) {
      // Never show success when the request fails.
      setSubmitError(err.message);
    }
  };

  if (reference) {
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
        <h3 className="mt-5 text-xl font-extrabold text-navy">Thank you</h3>
        <p className="mt-2 text-sm text-body">
          Your enquiry has been received. Our team will get in touch shortly.
        </p>
        <p className="mt-5 inline-block rounded-xl bg-ice px-4 py-2 font-mono text-sm font-bold text-primary">
          {reference}
        </p>
        <div className="mt-7">
          <button type="button" className="btn-secondary" onClick={() => setReference(null)}>
            Send another enquiry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="en-name">
            Full name <span className="text-primary">*</span>
          </label>
          <input
            id="en-name"
            className={`input ${errors.name ? 'input-error' : ''}`}
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
          <label className="label" htmlFor="en-phone">
            Phone <span className="text-primary">*</span>
          </label>
          <input
            id="en-phone"
            className={`input ${errors.phone ? 'input-error' : ''}`}
            inputMode="tel"
            autoComplete="tel"
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

      <div>
        <label className="label" htmlFor="en-email">
          Email
        </label>
        <input
          id="en-email"
          type="email"
          className={`input ${errors.email ? 'input-error' : ''}`}
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
        <label className="label" htmlFor="en-details">
          How can we help? <span className="text-primary">*</span>
        </label>
        <textarea
          id="en-details"
          rows={4}
          className={`input ${errors.details ? 'input-error' : ''}`}
          placeholder="Tell us about your requirement"
          aria-invalid={Boolean(errors.details)}
          {...register('details', { required: 'Please add a few details' })}
        />
        {errors.details ? (
          <p className="field-error" role="alert">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {errors.details.message}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          'Sending…'
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" /> Send Enquiry
          </>
        )}
      </button>
    </form>
  );
}
