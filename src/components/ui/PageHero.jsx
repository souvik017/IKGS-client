import { motion } from 'framer-motion';
import Breadcrumbs from './Breadcrumbs';

/**
 * Page banner used by the inner public pages.
 *
 * Two presentation modes:
 *
 * 1. Default — bright off-white band with pale-blue geometric accents. Keeps
 *    the navy-on-white identity and suits content-led pages.
 * 2. `image` — full-width photographic banner with a navy overlay so the
 *    heading stays readable. Used by About, Services, Gallery and Contact so
 *    every main page shares one consistent banner system.
 *
 * Only the home hero uses video; secondary pages use optimized static images.
 *
 * @param {string} [image] Resolved image URL for the photographic variant.
 * @param {string} [imagePosition] CSS object-position, e.g. 'center 35%'.
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  children,
  align = 'left',
  image,
  imagePosition = 'center',
}) {
  const hasImage = Boolean(image);

  return (
    <section
      className={`relative isolate overflow-hidden border-b ${
        hasImage ? 'border-navy/20 bg-navy' : 'border-line bg-offwhite'
      }`}
    >
      {hasImage ? (
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <img
            src={image}
            alt=""
            fetchpriority="high"
            decoding="async"
            style={{ objectPosition: imagePosition }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/92 via-navy/78 to-navy/55" />
        </div>
      ) : (
        /* Decorative, contained accents - never overflow the viewport. */
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-frost/70 blur-3xl" />
          <div className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-ice blur-3xl" />
          <div className="decor-dots absolute right-10 top-16 h-24 w-40 text-frost" />
        </div>
      )}

      <div className={`container-page ${hasImage ? 'py-14 sm:py-20 lg:py-24' : 'py-14 sm:py-20'}`}>
        <motion.div
          className={`flex max-w-3xl flex-col gap-4 ${align === 'center' ? 'mx-auto text-center items-center' : ''}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {breadcrumbs.length ? <Breadcrumbs items={breadcrumbs} tone={hasImage ? 'light' : 'dark'} /> : null}
          {eyebrow ? (
            <span className={hasImage ? 'eyebrow !bg-white/10 !text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm' : 'eyebrow'}>
              <span className={`h-1.5 w-1.5 rounded-full ${hasImage ? 'bg-white' : 'bg-primary'}`} aria-hidden="true" />
              {eyebrow}
            </span>
          ) : null}
          <h1 className={`text-display sm:text-hero ${hasImage ? 'text-white' : ''}`}>{title}</h1>
          {description ? (
            <p
              className={`max-w-prose text-base leading-relaxed sm:text-lg ${
                hasImage ? 'text-white/80' : 'text-body'
              }`}
            >
              {description}
            </p>
          ) : null}
          {children}
        </motion.div>
      </div>
    </section>
  );
}
