import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, PhoneCall, X } from 'lucide-react';
import Button from '../ui/Button';

const EASE_OUT = [0.22, 1, 0.36, 1];

export default function MobileNavigation({ open, onClose, links, settings, logo }) {
  const location = useLocation();

  // Close the drawer whenever the route changes, so selecting a link never
  // leaves the menu open behind the new page.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock scroll and support Escape while open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            id="mobile-navigation"
            className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl lg:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: EASE_OUT }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 pt-[calc(0.875rem_+_env(safe-area-inset-top))]">
              <img
                src={logo}
                alt={`${settings?.businessName || 'IKGS Solution'} logo`}
                width={560}
                height={181}
                className="h-8 w-auto max-w-[60%] object-contain"
              />
              <button
                type="button"
                onClick={onClose}
                autoFocus
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-body transition-colors hover:bg-offwhite hover:text-navy active:bg-ice"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4" aria-label="Mobile menu">
              <ul>
                {links.map((link, index) => (
                  <motion.li
                    key={link.to}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.05, duration: 0.3, ease: EASE_OUT }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${
                          isActive ? 'bg-ice text-primary' : 'text-navy hover:bg-offwhite'
                        }`
                      }
                    >
                      {link.label}
                      <ArrowRight className="h-4 w-4 shrink-0 opacity-40" aria-hidden="true" />
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="space-y-3 border-t border-line px-4 py-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))]">
              <Button to="/book-now" className="w-full" iconRight={ArrowRight}>
                Contact Now
              </Button>
              {settings?.phone ? (
                <Button href={`tel:${settings.phone}`} variant="secondary" className="w-full" icon={PhoneCall}>
                  {settings.phone}
                </Button>
              ) : null}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
