#!/usr/bin/env bash
#
# IKGS Solution — stock asset fetcher.
#
# Downloads the licensed stock photography and the hero video used by the
# public website into `public/images` and `public/videos`.
#
# Licences
# --------
#   * Pexels photos & video — https://www.pexels.com/license/
#     "All photos and videos on Pexels are free to use. Attribution is not
#      required. You can modify the photos and videos... free for commercial
#      and non-commercial purposes."
#   * Mixkit is the fallback source for the hero video if Pexels is unreachable.
#
# Files are stored locally (never hotlinked) so the site does not depend on a
# third-party CDN at runtime. Every source URL is recorded in
# `public/images/CREDITS.md`.
#
# The Pexels image CDN supports `fm=webp`, so optimized WebP is fetched
# directly instead of downloading JPEG and re-encoding locally.
#
# Usage:  bash scripts/fetch-stock-assets.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC="$ROOT/public"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

mkdir -p "$PUBLIC/images/logo" "$PUBLIC/images/hero" "$PUBLIC/images/services" \
         "$PUBLIC/images/banners" "$PUBLIC/images/about" "$PUBLIC/videos"

# fetch_photo <pexels-photo-id> <label> <width> <destination>
fetch_photo() {
  local id="$1" label="$2" width="$3" dest="$4"
  local url="https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=${width}"
  printf '  %-38s pexels/%s @%sw\n' "$label" "$id" "$width"
  curl -fsSL -m 90 -A "$UA" "$url" -o "$dest"
}

echo "Hero poster"
# Frame taken from the hero video itself so the poster and first video frame match.
curl -fsSL -m 90 -A "$UA" \
  "https://images.pexels.com/videos/4204981/antiviral-cleaning-contagious-coronavirus-4204981.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1920" \
  -o "$PUBLIC/images/hero/ikgs-hero-poster.webp"

echo "Service card imagery"
fetch_photo 4099259 "cockroach control"    900 "$PUBLIC/images/services/cockroach-control.webp"
fetch_photo 4176061 "termite control"      900 "$PUBLIC/images/services/termite-control.webp"
fetch_photo 69221   "rodent control"       900 "$PUBLIC/images/services/rodent-control.webp"
fetch_photo 1101195 "mosquito control"     900 "$PUBLIC/images/services/mosquito-control.webp"
fetch_photo 4098000 "bed bug control"      900 "$PUBLIC/images/services/bed-bug-control.webp"
fetch_photo 4176417 "commercial pest"      900 "$PUBLIC/images/services/commercial-pest-control.webp"
fetch_photo 4098778 "wood borer treatment" 900 "$PUBLIC/images/services/wood-borer-treatment.webp"
fetch_photo 4099091 "sanitization"         900 "$PUBLIC/images/services/sanitization-disinfection.webp"

echo "Section + banner imagery"
fetch_photo 6195121 "about: technicians"   1400 "$PUBLIC/images/about/ikgs-technicians.webp"
fetch_photo 6195125 "banner: about"        1600 "$PUBLIC/images/banners/about-ikgs.webp"
fetch_photo 4176541 "banner: services"     1600 "$PUBLIC/images/banners/services-ikgs.webp"
fetch_photo 6195288 "banner: gallery"      1600 "$PUBLIC/images/banners/gallery-ikgs.webp"
fetch_photo 245219  "banner: contact"      1600 "$PUBLIC/images/banners/contact-ikgs.webp"
fetch_photo 6550121 "banner: CTA"          1600 "$PUBLIC/images/banners/cta-ikgs.webp"

echo
echo "Hero video"
# Pexels video 4204981 — "A person in protective gear disinfecting an indoor
# office space" (commercial hygiene / surface treatment). Two renditions so the
# component can avoid pulling the large file on small screens.
curl -fsSL -m 300 -A "$UA" \
  "https://videos.pexels.com/video-files/4204981/4204981-sd_960_540_25fps.mp4" \
  -o "$PUBLIC/videos/ikgs-hero-540.mp4"
curl -fsSL -m 300 -A "$UA" \
  "https://videos.pexels.com/video-files/4204981/4204981-hd_1920_1080_25fps.mp4" \
  -o "$PUBLIC/videos/ikgs-hero-1080.mp4"

echo
echo "Written:"
ls -1 "$PUBLIC/images/hero" "$PUBLIC/images/services" "$PUBLIC/images/banners" \
      "$PUBLIC/images/about" "$PUBLIC/videos"
