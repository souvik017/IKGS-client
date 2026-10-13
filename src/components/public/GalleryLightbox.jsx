import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { resolveAsset } from '../../lib/api';

/**
 * Full-screen lightbox with previous/next navigation and keyboard support
 * (Escape to close, ArrowLeft/ArrowRight to move). Focus is moved into the
 * dialog on open and restored by the browser on close.
 */
export default function GalleryLightbox({ images, index, onClose, onPrev, onNext }) {
  const closeRef = useRef(null);
  const open = index !== null && index >= 0;

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onPrev();
      if (event.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose, onPrev, onNext]);

  const image = open ? images[index] : null;

  return (
    <AnimatePresence>
      {open && image ? (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col bg-navy/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${index + 1} of ${images.length}: ${image.title}`}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
            <span className="text-sm text-white/70">
              {index + 1} / {images.length}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Close image viewer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-4 sm:px-16">
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-2 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-4"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>

            <motion.img
              key={image._id || image.image}
              src={resolveAsset(image.image)}
              alt={image.alt || image.title}
              className="max-h-[74vh] max-w-full rounded-xl object-contain shadow-2xl"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />

            <button
              type="button"
              onClick={onNext}
              className="absolute right-2 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="px-6 pb-6 text-center text-white">
            <p className="font-semibold">{image.title}</p>
            {image.caption ? <p className="mt-1 text-sm text-white/60">{image.caption}</p> : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
