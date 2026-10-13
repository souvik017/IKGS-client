import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, SearchX } from 'lucide-react';

import Seo from '../../components/public/Seo';
import PageHero from '../../components/ui/PageHero';
import ServiceCard from '../../components/public/ServiceCard';
import SectionHeading from '../../components/ui/SectionHeading';
import CTASection from '../../components/ui/CTASection';
import Button from '../../components/ui/Button';
import Reveal, { RevealGroup, RevealItem } from '../../components/ui/Reveal';
import { EmptyState, ErrorState, Loading } from '../../components/public/States';
import { get } from '../../lib/api';
import { useSettings } from '../../context/SettingsContext';
import { buildBreadcrumbSchema, buildOrganizationSchema } from '../../lib/seo';

const FAQS = [
  {
    q: 'How do I know which treatment I need?',
    a: 'We start with an inspection. Based on what we find, we recommend the treatment that matches the pest, the property and the risk — you are free to decide after that.',
  },
  {
    q: 'Do you handle both homes and commercial premises?',
    a: 'Yes. We serve apartments, independent houses, offices, restaurants, hotels, warehouses and institutions. Commercial sites can be placed on a scheduled service programme.',
  },
  {
    q: 'What should I do before the visit?',
    a: 'Clear access to the affected areas and keep children and pets away during treatment. Any preparation specific to the treatment will be explained when we confirm your appointment.',
  },
  {
    q: 'Is a follow-up visit included?',
    a: 'Where the treatment plan requires it, a follow-up visit is scheduled as part of the service. Your appointment record keeps track of it.',
  },
];

function FaqItem({ item, open, onToggle, index }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-navy">{item.q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key={`faq-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-body">{item.a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function Services() {
  const { settings } = useSettings();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [term, setTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const load = () => {
    setLoading(true);
    setError(null);
    get('/public/services')
      .then((res) => setServices(res.data.services))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) => s.title.toLowerCase().includes(q) || (s.shortDescription || '').toLowerCase().includes(q)
    );
  }, [services, term]);

  return (
    <>
      <Seo
        title="Pest Control Services in West Bengal"
        description="Explore IKGS Solution pest control and hygiene services — cockroach, termite, rodent, mosquito and bed bug control, commercial pest management and sanitization."
        path="/services"
        jsonLd={[
          buildOrganizationSchema(settings || {}),
          buildBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Our Services"
        title="Pest control & hygiene services"
        description="Targeted treatments for homes, offices and commercial premises across West Bengal. Every service is delivered by our own field team."
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Services' }]}
        image="/images/banners/services-ikgs.webp"
        imagePosition="center 45%"
      />

      <section className="section">
        <div className="container-page">
          <div className="mx-auto mb-10 w-full max-w-md sm:mb-12">
            <label className="sr-only" htmlFor="service-search">
              Search services
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body/50" aria-hidden="true" />
              <input
                id="service-search"
                type="search"
                className="input pl-11"
                placeholder="Search services…"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <Loading label="Loading services…" />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching services"
              message={term ? 'Try a different search term.' : 'Our catalogue is being updated.'}
            />
          ) : (
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((service) => (
                <RevealItem key={service._id} className="h-full">
                  <ServiceCard service={service} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-offwhite">
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <SectionHeading
            align="left"
            eyebrow="Questions"
            title="Frequently asked questions"
            description="Still unsure? Send us an enquiry and we will point you in the right direction."
          >
            <div className="mt-8">
              <Button to="/contact" variant="secondary">
                Ask a question
              </Button>
            </div>
          </SectionHeading>

          <Reveal delay={0.1} className="space-y-3">
            {FAQS.map((item, index) => (
              <FaqItem
                key={item.q}
                item={item}
                index={index}
                open={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
              />
            ))}
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
