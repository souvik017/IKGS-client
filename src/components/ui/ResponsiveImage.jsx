/**
 * Shared image primitive.
 *
 * Reserves the image box with `aspect-ratio` before the file loads so nothing
 * on the page shifts (CLS), keeps the image covered without distortion, and
 * picks a sensible loading strategy: below-the-fold images are lazy, while
 * above-the-fold images can opt into eager loading with high fetch priority.
 *
 * @param {string}  src         Resolved image URL (already passed through resolveAsset if dynamic).
 * @param {string}  alt         Descriptive alt text. Empty string is allowed for decorative images.
 * @param {string}  [ratio]     CSS aspect-ratio, e.g. '16 / 9'. It is released once a fixed height is applied.
 * @param {boolean} [priority]  Eager-load and raise fetch priority (use for hero/LCP imagery only).
 * @param {string}  [className] Classes for the wrapper element.
 * @param {string}  [imgClassName] Extra classes for the <img>.
 */
export default function ResponsiveImage({
  src,
  alt = '',
  ratio = '16 / 9',
  priority = false,
  className = '',
  imgClassName = '',
  style,
  ...rest
}) {
  if (!src) return null;

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ aspectRatio: ratio, ...style }}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        /* Lowercase on purpose: React 18 forwards `fetchpriority` as a custom
           attribute but warns about the camelCase spelling. */
        fetchpriority={priority ? 'high' : 'auto'}
        className={`h-full w-full object-cover ${imgClassName}`}
        {...rest}
      />
    </div>
  );
}
