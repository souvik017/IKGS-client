import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CalendarCheck, CheckCircle2, Image as ImageIcon, PhoneCall } from 'lucide-react';

import Seo from '../../components/public/Seo';
import PageHero from '../../components/ui/PageHero';
import SectionHeading from '../../components/ui/SectionHeading';
import Button from '../../components/ui/Button';
import Reveal from '../../components/ui/Reveal';
import CTASection from '../../components/ui/CTASection';
import { EmptyState, ErrorState, Loading } from '../../components/public/States';
import { get, resolveAsset } from '../../lib/api';
import { currency } from '../../lib/format';
import { useSettings } from '../../context/SettingsContext';
import { buildBreadcrumbSchema, buildServiceSchema } from '../../lib/seo';

const INCLUDED = [
  'Pre-service inspection',
  'Treatment using approved chemicals',
  'Safety guidance after treatment',
  'Follow-up visit where the plan requires it',
];

export default function ServiceDetail() {
  const { slug } = useParams();
  const { settings } = useSettings();
  const [service, setService] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([get(`/public/services/${slug}`), get('/public/services')])
      .then(([detail, list]) => {
        setService(detail.data.service);
        setOthers(list.data.services.filter((s) => s.slug !== slug).slice(0, 3));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [slug]);

  if (loading) return <Loading label="Loading service…" className="py-40" />;

  if (error || !service) {
    return (
      <div className="container-page py-28">
        <ErrorState message={error || 'Service not found'} onRetry={load} />
        <div className="mt-6 text-center">
          <Button to="/services" variant="secondary">
            Back to all services
          </Button>
        </div>
      </div>
    );
  }

  const image = resolveAsset(service.image);

  return (
    <>
      <Seo
        title={service.seoTitle || service.title}
        description={service.seoDescription || service.shortDescription}
        path={`/services/${service.slug}`}
        image={image && image.startsWith('http') ? image : undefined}
        type="article"
        jsonLd={[
          buildServiceSchema(service, settings || {}),
          buildBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Service"
        title={service.title}
        description={service.shortDescription}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.title },
        ]}
      />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {image ? (
              <Reveal>
                <img
                  src={image}
                  alt={`${service.title} service provided by IKGS Solution`}
                  loading="lazy"
                  className="mb-10 w-full rounded-3xl object-cover shadow-card"
                />
              </Reveal>
            ) : (
              <Reveal>
                <div className="mb-10 grid h-52 place-items-center rounded-3xl bg-brand-gradient-soft text-primary">
                  <ImageIcon className="h-10 w-10" aria-hidden="true" />
                </div>
              </Reveal>
            )}

            <Reveal>
              <h2 className="text-section">About this service</h2>
              <p className="mt-4 max-w-prose whitespace-pre-line leading-relaxed text-body">
                {service.description || service.shortDescription}
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="mt-10 rounded-2xl border border-line bg-offwhite p-7">
                <h3 className="font-bold text-navy">What to expect</h3>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-body">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {others.length > 0 ? (
              <Reveal delay={0.1}>
                <div className="mt-12">
                  <SectionHeading align="left" eyebrow="Related" title="Other services" />
                  <ul className="mt-6 space-y-3">
                    {others.map((other) => (
                      <li key={other._id}>
                        <Link
                          to={`/services/${other.slug}`}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white px-5 py-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
                        >
                          <span>
                            <span className="block font-semibold text-navy">{other.title}</span>
                            <span className="block text-sm text-body">{other.shortDescription}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}
          </div>

          {/* Sticky booking panel */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-line bg-white p-6 shadow-card">
              {Number(service.startingPrice) > 0 ? (
                <>
                  <p className="text-sm font-medium text-body">Starting from</p>
                  <p className="text-3xl font-extrabold text-navy">{currency(service.startingPrice)}</p>
                </>
              ) : (
                <p className="text-lg font-bold text-navy">Price on request</p>
              )}
              <p className="mt-2 text-xs text-body">
                Final cost depends on property size and the treatment required.
              </p>

              <Button to="/book-now" className="mt-6 w-full" icon={CalendarCheck}>
                Book this service
              </Button>
              {settings?.phone ? (
                <Button href={`tel:${settings.phone}`} variant="secondary" className="mt-3 w-full" icon={PhoneCall}>
                  {settings.phone}
                </Button>
              ) : null}

              <div className="mt-6 border-t border-line pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-body">Coverage</p>
                {settings?.serviceAreas?.length ? (
                  <p className="mt-2 text-sm text-body">{settings.serviceAreas.join(' · ')}</p>
                ) : (
                  <p className="mt-2 text-sm text-body">Contact us to confirm your area.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <CTASection />
    </>
  );
}
