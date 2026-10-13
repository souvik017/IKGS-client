import { ArrowRight, PhoneCall } from 'lucide-react';
import Button from './Button';
import Reveal from './Reveal';
import { useSettings } from '../../context/SettingsContext';

/**
 * High-contrast conversion band. This is one of the few places the blue
 * gradient is used at full surface, so it stays a deliberate accent.
 *
 * Pass `image` to use a photographic background instead — the gradient is
 * retained underneath as the fallback so the band always has contrast behind
 * its text, whatever happens to the image.
 */
export default function CTASection({
  title = 'Ready to get rid of pests?',
  description = 'Book a free inspection and get a clear, no-obligation treatment recommendation for your property.',
  primaryLabel = 'Book a Service',
  primaryTo = '/book-now',
  image,
}) {
  const { settings } = useSettings();

  return (
    <section className="container-page py-16 sm:py-20">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl bg-brand-gradient px-5 py-12 text-center text-white shadow-lift sm:px-14 sm:py-16">
          {image ? (
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
              <img
                src={image}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/80 to-deep/80" />
            </div>
          ) : (
            <div className="decor-dots pointer-events-none absolute inset-0 -z-10 text-white/20" aria-hidden="true" />
          )}

          <h2 className="mx-auto max-w-2xl text-section text-white">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">{description}</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              to={primaryTo}
              className="group w-full !bg-white !text-primary hover:!bg-ice sm:w-auto"
              iconRight={ArrowRight}
            >
              {primaryLabel}
            </Button>
            {settings?.phone ? (
              <Button href={`tel:${settings.phone}`} variant="ghost" className="w-full !text-white hover:!bg-white/10 sm:w-auto" icon={PhoneCall}>
                Call {settings.phone}
              </Button>
            ) : (
              <Button to="/contact" variant="ghost" className="w-full !text-white hover:!bg-white/10 sm:w-auto">
                Contact Us
              </Button>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
