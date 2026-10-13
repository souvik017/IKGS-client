import { motion } from 'framer-motion';
import { ZoomIn } from 'lucide-react';
import { resolveAsset } from '../../lib/api';
import { viewportOnce } from '../../lib/motion';

/**
 * Responsive masonry-style grid. Each image is a button so it is reachable by
 * keyboard, and opening the lightbox is handled by the parent.
 */
export default function GalleryGrid({ images, onOpen }) {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [column-fill:_balance]">
      {images.map((image, index) => {
        const src = resolveAsset(image.image);
        return (
          <motion.button
            key={image._id || image.id || index}
            type="button"
            onClick={() => onOpen(index)}
            className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-line bg-white text-left shadow-soft focus-visible:ring-2 focus-visible:ring-primary"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.3) }}
            aria-label={`View larger: ${image.title}`}
          >
            <div className="relative overflow-hidden">
              <img
                src={src}
                alt={image.alt || image.title}
                loading="lazy"
                className="h-auto w-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute bottom-3 left-3 right-3 translate-y-2 text-sm font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {image.title}
              </span>
              <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
