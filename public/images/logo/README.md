# Logo assets

## Files

| File               | What it is | Size | Used by |
| ------------------ | ---------- | ---- | ------- |
| `logo.jpeg`        | The official IKGS Solution logo artwork as supplied. | 500 × 500, white background | Source of truth — not served directly |
| `ikgs-logo.webp`   | The same artwork with the surrounding white padding trimmed off and resized. | 560 × 181 (3.09 : 1), ~13 KB | Navbar, mobile menu, footer, admin sidebar |

`ikgs-logo.webp` is generated from `logo.jpeg` with:

```bash
npx -y sharp-cli@4 \
  -i public/images/logo/logo.jpeg \
  -o public/images/logo/ikgs-logo.webp \
  -q 88 trim 12 -- resize 560
```

Re-run that command if the source artwork is ever replaced.

## Notes for developers

- **Background.** The artwork has a solid white background rather than
  transparency, so it is only ever placed on white surfaces. In the footer and
  admin sidebar (both navy) it sits on a small white plate.
- **Do not recolour it.** A transparent-background export would knock out the
  white "IKGS" letters inside the blue block and the white space inside the
  border frame, so it is left as supplied.
- **Aspect ratio.** Keep `width={560} height={181}` (or the `LOGO_WIDTH` /
  `LOGO_HEIGHT` constants exported from `src/lib/brand.js`) on the `<img>` so
  the header reserves space and the page never shifts while the logo loads.

## Managing the logo from the admin panel

Uploading a logo in **Admin → Settings → Logo** overrides `ikgs-logo.webp`
everywhere on the public site: the settings value is returned by
`GET /api/public/settings` and the components fall back to the bundled file
only when that value is empty. That is the better route if the logo may change
without a redeploy.
