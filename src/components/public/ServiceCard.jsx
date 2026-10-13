import { Link } from 'react-router-dom';
import { ArrowRight, Bug } from 'lucide-react';
import { resolveAsset } from '../../lib/api';
import { currency } from '../../lib/format';
import { SERVICE_IMAGES } from '../../lib/brand';

/**
 * Signature service card.
 *
 * Default state is white with a soft shadow — and it is fully readable on its
 * own, so touchscreen visitors get all the content without ever hovering. On
 * hover/focus (pointer devices) the card lifts, the background transitions to
 * the royal-blue gradient with white text, and the tile inverts.
 *
 * Imagery: the service image uploaded in the admin panel is used when present.
 * When a service has no image, a licence-cleared local image is matched on the
 * service slug; if there is no match either, the card falls back to its line
 * icon. Service data itself always comes from the API.
 */
export default function ServiceCard({ service, featureIcon: Icon = Bug }) {
  const image = resolveAsset(service.image) || SERVICE_IMAGES[service.slug];

  return (
    <Link
      to={`/services/${service.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-card outline-none transition-all duration-300 ease-smooth hover:-translate-y-1.5 hover:border-transparent hover:shadow-lift focus-visible:-translate-y-1.5 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-6"
    >
      {/* Gradient layer revealed on hover/focus */}
      <span
        className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-0 transition-opacity duration-300 ease-smooth group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      />
      {/* Decorative footprint-style motif, subtly visible on hover */}
      <span
        className="decor-dots pointer-events-none absolute -right-6 bottom-2 h-24 w-32 text-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col">
        {image ? (
          <img
            src={image}
            alt={`${service.title} service by IKGS Solution`}
            loading="lazy"
            decoding="async"
            width={900}
            height={600}
            className="mb-5 h-40 w-full rounded-xl object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.02] sm:h-44"
          />
        ) : (
          <span className="mb-5 grid h-14 w-14 place-items-center rounded-xl bg-ice text-primary transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white">
            <Icon className="h-7 w-7" aria-hidden="true" />
          </span>
        )}

        <h3 className="text-cardheading font-bold text-navy transition-colors duration-300 group-hover:text-white">
          {service.title}
        </h3>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-body transition-colors duration-300 group-hover:text-white/85">
          {service.shortDescription || service.description?.slice(0, 120)}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line pt-4 transition-colors duration-300 group-hover:border-white/20">
          {Number(service.startingPrice) > 0 ? (
            <span className="text-sm font-bold text-navy transition-colors duration-300 group-hover:text-white">
              From {currency(service.startingPrice)}
            </span>
          ) : (
            <span className="text-sm font-medium text-body transition-colors duration-300 group-hover:text-white/70">
              Price on request
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-300 group-hover:text-white">
            Learn more
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
