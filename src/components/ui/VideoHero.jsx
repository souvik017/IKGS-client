import { useEffect, useRef, useState } from 'react';

export const HERO_POSTER = '/images/hero/ikgs-hero-poster.webp';

/** Below this width the smaller video rendition is used. */
const MOBILE_BREAKPOINT = 768;

/**
 * Full-width background video hero.
 *
 * Behaviour
 * ---------
 * - Muted, looping, inline autoplay so browsers permit playback without sound.
 * - A static poster image is always rendered underneath the video, so the hero
 *   is complete before the video decodes, if the video fails to load, or if
 *   autoplay is refused. It also reserves the hero height, so there is no
 *   layout shift while the video loads.
 * - The video is never requested at all when the visitor prefers reduced
 *   motion, has Data Saver enabled, or is on a slow (2G/3G) connection: they
 *   simply get the poster image.
 * - Two renditions exist; the right one is chosen once, in JavaScript, rather
 *   than through the `<source media>` attribute (which browsers apply
 *   inconsistently to video). Mobile therefore never pulls the large file.
 * - `preload="metadata"` keeps the initial payload minimal.
 *
 * Important: a rejected `play()` promise is *not* treated as a failure. The
 * browser may reject it when it manages autoplay itself, or when a second call
 * interrupts the first. Removing the video in that case would leave the hero
 * stuck on the poster, so the element is left mounted and the browser is free
 * to start playback on its own.
 */

export const HERO_SOURCES = {
  mobile: '/videos/ikgs-hero-540.mp4',
  desktop: '/videos/ikgs-hero-1080.mp4',
};

/** Should we attempt video playback at all, given the visitor's preferences? */
function canPlayHeroVideo() {
  if (typeof window === 'undefined') return false;

  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  } catch {
    /* matchMedia unavailable — fall through and allow video */
  }

  // Respect Data Saver and very slow connections.
  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    if (connection.saveData) return false;
    if (/^(slow-2g|2g|3g)$/.test(connection.effectiveType || '')) return false;
  }

  return true;
}

/** Pick the smallest rendition that still looks right on this screen. */
function pickHeroSource() {
  if (typeof window === 'undefined') return HERO_SOURCES.desktop;
  try {
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
      ? HERO_SOURCES.mobile
      : HERO_SOURCES.desktop;
  } catch {
    return HERO_SOURCES.desktop;
  }
}

export default function VideoHero({
  children,
  className = '',
  overlayClassName = 'bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40',
  poster = HERO_POSTER,
  src: srcProp,
}) {
  // Decided once on mount so the browser never starts a download we then cancel.
  const [videoEnabled] = useState(canPlayHeroVideo);
  const [source] = useState(srcProp || pickHeroSource);
  // Only a genuine media error (unsupported codec, missing file) hides the video.
  const [loadFailed, setLoadFailed] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoEnabled) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;

    // The `autoplay` attribute starts playback; this is just a nudge for the
    // cases where it did not. A rejection is swallowed on purpose — the poster
    // underneath already provides a complete, readable hero.
    const nudge = () => {
      if (video.paused) {
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
      }
    };

    nudge();
    // Retry once the first frame is decodable, which is when a refused autoplay
    // is most likely to succeed.
    video.addEventListener('canplay', nudge, { once: true });
    video.addEventListener('loadeddata', nudge, { once: true });

    return () => {
      video.removeEventListener('canplay', nudge);
      video.removeEventListener('loadeddata', nudge);
    };
  }, [videoEnabled]);

  const showVideo = videoEnabled && !loadFailed;

  return (
    <section className={`relative isolate overflow-hidden bg-navy ${className}`}>
      {/* Background media layer. Sits behind the content, never captures clicks. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <img
          src={poster}
          alt=""
          fetchpriority="high"
          decoding="sync"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {showVideo ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={source}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={poster}
            tabIndex={-1}
            onError={() => setLoadFailed(true)}
          />
        ) : null}

        {/* Overlay keeping white text readable over the footage. */}
        <div className={`absolute inset-0 ${overlayClassName}`} />
      </div>

      {children}
    </section>
  );
}
