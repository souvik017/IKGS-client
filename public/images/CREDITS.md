# Image and video credits

All stock media below is stored locally in this repository. Nothing is
hotlinked at runtime. Files were downloaded with
`bash scripts/fetch-stock-assets.sh`, which is the single source of truth for
the exact URLs used.

## Licence

**Pexels** — <https://www.pexels.com/license/>

> All photos and videos on Pexels are free to use. Attribution is not required.
> You can modify the photos and videos from Pexels freely. All photos and videos
> may be used for free for commercial and non-commercial purposes.

This permits commercial use on the IKGS Solution website without attribution.
Credits are recorded here anyway, and Pexels works are **not** used in a way
that implies third-party endorsement of IKGS Solution.

## Photography

| Local file | Pexels source | Published caption |
| --- | --- | --- |
| `hero/ikgs-hero-poster.webp` | pexels.com/video/4204981/ | Poster frame of the hero video (commercial hygiene / office disinfection) |
| `services/cockroach-control.webp` | photo 4099259 | Person in protective gear sanitizing kitchen surfaces with disinfectant |
| `services/termite-control.webp` | photo 4176061 | A professional in PPE, disinfecting a wooden shelf indoors |
| `services/rodent-control.webp` | photo 69221 | Close-up of a rat peeking through a wire cage |
| `services/mosquito-control.webp` | photo 1101195 | Macro shot of a mosquito resting on a green leaf |
| `services/bed-bug-control.webp` | photo 4098000 | Worker in protective gear sanitizing a bedroom |
| `services/commercial-pest-control.webp` | photo 4176417 | Individual disinfects a workspace using fumigation, in full protective gear |
| `services/wood-borer-treatment.webp` | photo 4098778 | Worker in PPE disinfecting a living room |
| `services/sanitization-disinfection.webp` | photo 4099091 | Person in hazmat suit disinfecting a modern kitchen table with a spray bottle |
| `about/ikgs-technicians.webp` | photo 6195121 | Team of cleaning professionals in uniform posing indoors |
| `banners/about-ikgs.webp` | photo 6195125 | Cleaning team in uniforms ready to sanitize a modern living room |
| `banners/services-ikgs.webp` | photo 4176541 | Professional in protective gear sanitizing a modern living room |
| `banners/gallery-ikgs.webp` | photo 6195288 | Two workers in protective gear disinfecting a modern living room |
| `banners/contact-ikgs.webp` | photo 245219 | Clean, organised modern office interior |
| `banners/cta-ikgs.webp` | photo 6550121 | Bright modern office interior with arranged seating |

Image requests use the Pexels CDN `fm=webp` transform, so the stored files are
already optimized WebP (~28–134 KB each). Google's Manrope webfont is loaded
from Google Fonts under the SIL Open Font License.

## Logo

`logo/logo.jpeg` is the official IKGS Solution logo artwork supplied by the
company — it is not a stock asset and is not covered by the licences above.
`logo/logo.webp` / `logo/ikgs-logo.webp` are derived from it; see
`logo/README.md`.

## Hero video

| Local file | Source | Size |
| --- | --- | --- |
| `videos/ikgs-hero-540.mp4` | pexels.com/video/4204981/ (`sd_960_540_25fps`) | ~477 KB |
| `videos/ikgs-hero-1080.mp4` | pexels.com/video/4204981/ (`hd_1920_1080_25fps`) | ~5.9 MB |

Clip: *"A person in protective gear disinfecting an indoor office space"* —
commercial hygiene and surface treatment. Sourced for relevance to IKGS
Solution's sanitization and commercial pest management services, not lifestyle
footage.

The 540 px rendition is served to small screens and to connections that request
reduced data; the 1080 px rendition is served on wider screens. Both are loaded
with `preload="metadata"`, so no full video download happens until the browser
starts playback. See `src/components/ui/VideoHero.jsx`.

## Replacing stock imagery with real project photography

Stock imagery stands in for genuine IKGS job photographs. Replace it by
uploading real photographs from **Admin → Gallery** — the public gallery page
and the home page gallery teaser already read only from the API and never from
these files. To swap a service card or banner image, replace the corresponding
file in `public/images/` or set an image on the service in
**Admin → Services**.
