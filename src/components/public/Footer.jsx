import { Link } from 'react-router-dom';
import { ArrowUpRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, ShieldCheck, Youtube } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { resolveAsset } from '../../lib/api';
import { LOGO, LOGO_WIDTH, LOGO_HEIGHT } from '../../lib/brand';

const SOCIALS = [
  { key: 'facebook', Icon: Facebook, label: 'Facebook' },
  { key: 'instagram', Icon: Instagram, label: 'Instagram' },
  { key: 'linkedin', Icon: Linkedin, label: 'LinkedIn' },
  { key: 'youtube', Icon: Youtube, label: 'YouTube' },
];

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/book-now', label: 'Book Now' },
  { to: '/contact', label: 'Contact' },
];

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-navy text-white/70">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {/* The logo artwork has a white background, so it sits on a white
              plate here rather than being recoloured. */}
          <span className="inline-flex items-center rounded-xl bg-white px-3 py-2">
            <img
              src={settings?.logo ? resolveAsset(settings.logo) : LOGO}
              alt={`${settings?.businessName || 'IKGS Solution'} logo`}
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              loading="lazy"
              decoding="async"
              className="h-7 w-auto max-w-[150px] object-contain"
            />
          </span>
          <p className="mt-4 text-sm leading-relaxed">
            {settings?.description ||
              'Professional pest control and hygiene services for homes, offices and commercial premises.'}
          </p>
          <div className="mt-5 flex gap-2.5">
            {SOCIALS.filter((s) => settings?.[s.key]).map(({ key, Icon, label }) => (
              <a
                key={key}
                href={settings[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-white/80 transition-colors hover:bg-brand-gradient hover:text-white"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Quick Links</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Service Areas</h2>
          {settings?.serviceAreas?.length ? (
            <ul className="mt-4 space-y-2.5 text-sm">
              {settings.serviceAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm">Contact us to confirm coverage in your area.</p>
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Get in touch</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {settings?.phone ? (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary-soft" aria-hidden="true" />
                <a href={`tel:${settings.phone}`} className="transition-colors hover:text-white">
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings?.email ? (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-soft" aria-hidden="true" />
                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-white">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings?.address ? (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-soft" aria-hidden="true" />
                <span>{settings.address}</span>
              </li>
            ) : null}
          </ul>
          <Link
            to="/book-now"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-primary-soft"
          >
            Request a service <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-5 text-xs sm:flex-row sm:gap-3">
          <p className="text-center sm:text-left">
            © {year} {settings?.businessName || 'IKGS Solution'}. All rights reserved.
          </p>

          {/* Staff entry point to the admin panel. */}
          <Link
            to="/admin/login"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition-colors duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-soft focus-visible:ring-offset-2 focus-visible:ring-offset-navy sm:w-auto"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
