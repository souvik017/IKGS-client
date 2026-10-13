import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * @param {Array<{name: string, path?: string}>} items last item is the current page
 * @param {'dark'|'light'} [tone] 'light' renders for dark/photographic backgrounds
 */
export default function Breadcrumbs({ items = [], tone = 'dark' }) {
  if (!items.length) return null;

  const light = tone === 'light';

  return (
    <nav aria-label="Breadcrumb">
      <ol className={`flex flex-wrap items-center gap-1.5 text-sm ${light ? 'text-white/70' : 'text-body'}`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.name}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {item.path && !isLast ? (
                <Link to={item.path} className="font-medium transition-colors hover:text-primary-soft">
                  {item.name}
                </Link>
              ) : (
                <span
                  className={isLast ? `font-semibold ${light ? 'text-white' : 'text-navy'}` : ''}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.name}
                </span>
              )}
              {!isLast ? (
                <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${light ? 'text-white/40' : 'text-body/40'}`} aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
