import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Menu } from 'lucide-react';
import Button from '../ui/Button';
import MobileNavigation from './MobileNavigation';
import { useSettings } from '../../context/SettingsContext';
import { resolveAsset } from '../../lib/api';
import { LOGO, LOGO_WIDTH, LOGO_HEIGHT } from '../../lib/brand';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSettings();

  const businessName = settings?.businessName || 'IKGS Solution';
  // A logo uploaded in the admin panel takes priority over the bundled file.
  const logoSrc = settings?.logo ? resolveAsset(settings.logo) : LOGO;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-30 bg-white/95 backdrop-blur transition-shadow duration-300 ${
          scrolled ? 'shadow-nav' : 'border-b border-line'
        }`}
      >
        <nav
          className="container-page flex h-[68px] items-center justify-between gap-3"
          aria-label="Main navigation"
        >
          {/* Logo — the real IKGS Solution artwork, trimmed to a 3.09:1 lockup
              so it stays legible from 320px up without needing a second file. */}
          <Link
            to="/"
            className="flex shrink-0 items-center rounded-lg transition-opacity duration-200 hover:opacity-90"
            aria-label={`${businessName} home`}
          >
            <img
              src={logoSrc}
              alt={`${businessName} logo`}
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              fetchpriority="high"
              className="h-8 w-auto max-w-[45vw] object-contain sm:h-9 sm:max-w-none lg:h-10"
            />
          </Link>

          {/* Centered links (desktop) */}
          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <li key={link.to} className="relative">
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative block rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 xl:px-3.5 ${
                      isActive ? 'text-primary' : 'text-navy/80 hover:text-primary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive ? (
                        <motion.span
                          layoutId="nav-active-indicator"
                          className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-brand-gradient"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      ) : null}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Contact CTA — available from tablet width so it is never hidden
              behind the hamburger on a 768px screen. On desktop the links are
              revealed and the whole bar is one balanced row. */}
          <div className="flex items-center gap-2">
            <Button to="/book-now" iconRight={ArrowRight} className="group hidden md:inline-flex">
              Book a Free Demo
            </Button>

            <button
              type="button"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-navy transition-colors hover:bg-offwhite active:bg-ice lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              <motion.span whileTap={{ scale: 0.88 }} className="grid place-items-center">
                <Menu className="h-6 w-6" aria-hidden="true" />
              </motion.span>
            </button>
          </div>
        </nav>
      </header>

      <MobileNavigation
        open={open}
        onClose={() => setOpen(false)}
        links={LINKS}
        settings={settings}
        logo={logoSrc}
      />
    </>
  );
}
