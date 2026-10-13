import { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

/**
 * Controls the inline boot loader declared in `index.html`.
 *
 * The loader is plain HTML + inline CSS, so it is on screen at the very first
 * paint. This component removes it once the app is genuinely ready:
 *
 *   - after the first `GET /public/settings` call settles, so the navbar and
 *     contact details are populated rather than popping in afterwards;
 *   - after webfonts are ready, so the loader does not hand over mid-swap;
 *   - never before `MIN_VISIBLE_MS`, so it reads as a deliberate intro rather
 *     than a flicker;
 *   - never after `MAX_WAIT_MS`, so a slow or unreachable API can never trap
 *     the visitor behind the loader.
 */

const MIN_VISIBLE_MS = 350;
const MAX_WAIT_MS = 2500;
const FADE_MS = 600;

/** Timestamped when this module is first evaluated, i.e. at app boot. */
const bootedAt = Date.now();

let hidden = false;

function hideBootLoader() {
  if (hidden) return;
  hidden = true;

  const el = document.getElementById('ikgs-preloader');
  if (!el) return;

  el.classList.add('ikgs-preloader--hidden');
  // Remove it entirely after the fade so it can never sit above the page.
  window.setTimeout(() => el.remove(), FADE_MS);
}

export default function BootLoader() {
  const { loading } = useSettings();

  useEffect(() => {
    if (loading) return undefined;

    let cancelled = false;

    const finish = async () => {
      const remaining = MIN_VISIBLE_MS - (Date.now() - bootedAt);
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
      try {
        await document.fonts?.ready;
      } catch {
        /* font loading API unavailable — not important */
      }
      if (!cancelled) hideBootLoader();
    };

    finish();
    return () => {
      cancelled = true;
    };
  }, [loading]);

  // Hard cap: a hung request must never leave the loader covering the site.
  useEffect(() => {
    const timer = window.setTimeout(hideBootLoader, MAX_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
