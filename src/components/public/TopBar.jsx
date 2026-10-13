import { Clock, Mail, Phone } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

/**
 * Slim light utility strip. Kept bright (off-white) to preserve the clean,
 * white-dominant identity rather than introducing a dark banner.
 */
export default function TopBar() {
  const { settings } = useSettings();
  if (!settings) return null;

  const hasDetails = settings.phone || settings.email || settings.businessHours;
  if (!hasDetails) return null;

  return (
    <div className="border-b border-line bg-offwhite text-xs text-body">
      <div className="container-page flex flex-col items-center justify-between gap-1 py-2 sm:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          {settings.phone ? (
            <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-primary">
              <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {settings.phone}
            </a>
          ) : null}
          {settings.email ? (
            <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-primary">
              <Mail className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {settings.email}
            </a>
          ) : null}
        </div>
        {settings.businessHours ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {settings.businessHours}
          </span>
        ) : null}
      </div>
    </div>
  );
}
