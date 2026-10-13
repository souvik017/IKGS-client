/**
 * Brand asset paths and per-service image fallbacks.
 *
 * Logo
 * ----
 * `public/images/logo/logo.jpeg` is the official IKGS Solution logo artwork.
 * `ikgs-logo.webp` is the same artwork with the surrounding white padding
 * trimmed off and resized, which is what the UI renders. A logo uploaded in
 * Admin → Settings still takes priority at runtime.
 */
export const LOGO = '/images/logo/ikgs-logo.webp';

/** Intrinsic size of `ikgs-logo.webp`, used to reserve space and avoid layout shift. */
export const LOGO_WIDTH = 560;
export const LOGO_HEIGHT = 181;

/**
 * Fallback card imagery, keyed by service slug.
 *
 * These are only used when a service has no uploaded image in the admin panel.
 * The API response stays the source of truth for everything else — services
 * that are not in this map simply render with their line icon, exactly as
 * before. All files are optimized WebP stored locally; see
 * `public/images/CREDITS.md` for sources and licences.
 */
export const SERVICE_IMAGES = {
  'cockroach-control': '/images/services/cockroach-control.webp',
  'termite-control': '/images/services/termite-control.webp',
  'rodent-control': '/images/services/rodent-control.webp',
  'mosquito-control': '/images/services/mosquito-control.webp',
  'bed-bug-control': '/images/services/bed-bug-control.webp',
  'commercial-pest-control': '/images/services/commercial-pest-control.webp',
  'wood-borer-treatment': '/images/services/wood-borer-treatment.webp',
  'sanitization-disinfection': '/images/services/sanitization-disinfection.webp',
};
