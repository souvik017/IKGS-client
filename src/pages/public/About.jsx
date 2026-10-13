import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Home,
  ShieldCheck,
  Target,
  Users,
  Workflow,
} from 'lucide-react';
import Seo from '../../components/public/Seo';
import PageHero from '../../components/ui/PageHero';
import SectionHeading from '../../components/ui/SectionHeading';
import CTASection from '../../components/ui/CTASection';
import Button from '../../components/ui/Button';
import FeatureCard from '../../components/ui/FeatureCard';
import ResponsiveImage from '../../components/ui/ResponsiveImage';
import Reveal, { RevealGroup, RevealItem } from '../../components/ui/Reveal';
import { useSettings } from '../../context/SettingsContext';
import { buildBreadcrumbSchema, buildOrganizationSchema } from '../../lib/seo';

const APPROACH = [
  { icon: Target, title: 'Inspect', text: 'We survey the property to identify the pest and the extent of the infestation.' },
  { icon: Workflow, title: 'Treat', text: 'We apply a treatment plan matched to the pest, the property and the risk.' },
  { icon: Users, title: 'Advise', text: 'We explain preventive steps so the problem does not return quickly.' },
];

const CAPABILITIES = [
  { icon: Home, title: 'Residential', text: 'Homes, apartments and housing societies with treatments planned around your routine.' },
  { icon: Building2, title: 'Commercial', text: 'Restaurants, hotels, offices, warehouses and institutions with scheduled programmes.' },
];

export default function About() {
  const { settings } = useSettings();
  const areas = settings?.serviceAreas || [];

  return (
    <>
      <Seo
        title="About Us"
        description={`Learn about ${settings?.businessName || 'IKGS Solution'} - a West Bengal pest control and hygiene services company serving homes, offices and commercial premises.`}
        path="/about"
        jsonLd={[
          buildOrganizationSchema(settings || {}),
          buildBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="About Us"
        title={`Pest control done properly, by ${settings?.businessName || 'IKGS Solution'}`}
        description="A pest control and hygiene services company built around clear communication, trained technicians and a documented treatment process."
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'About' }]}
        image="/images/banners/about-ikgs.webp"
        imagePosition="center 40%"
      />

      {/* Introduction */}
      <section className="section">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2">
          <SectionHeading
            align="left"
            eyebrow="Who We Are"
            title="Focused on pest control and hygiene"
            description={
              settings?.description ||
              'We serve residential, commercial and institutional customers across West Bengal. Our work is transparent: you know what treatment is being applied, when it will be done and what to expect afterwards.'
            }
          >
            <ul className="mt-8 space-y-3">
              {[
                'Residential, commercial and institutional pest control',
                'Hygiene and sanitization services',
                'Scheduled service programmes with follow-up visits',
                'A single point of contact for every booking',
              ].map((item, index) => (
                <Reveal key={item} delay={index * 0.05} as="li" className="flex items-start gap-3 text-sm text-body">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </Reveal>
              ))}
            </ul>
          </SectionHeading>

          <Reveal delay={0.1}>
            <ResponsiveImage
              src="/images/about/ikgs-technicians.webp"
              alt="IKGS Solution technicians in uniform preparing for a service visit"
              ratio="4 / 3"
              className="mb-6 w-full rounded-3xl border border-line shadow-card"
            />
            <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white shadow-lift">
              <div className="decor-dots pointer-events-none absolute inset-0 text-white/15" aria-hidden="true" />
              <ShieldCheck className="h-9 w-9 text-white" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-extrabold text-white">Our approach</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Every job starts with an inspection and ends with practical prevention advice. No
                jargon, no unnecessary repeat visits.
              </p>
              <div className="mt-7 space-y-4">
                {APPROACH.map(({ icon: Icon, title, text }, index) => (
                  <div key={title} className="flex gap-3.5 rounded-2xl bg-white/10 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {index + 1}. {title}
                      </p>
                      <p className="mt-1 text-xs text-white/70">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section bg-offwhite">
        <div className="container-page">
          <SectionHeading
            eyebrow="Capabilities"
            title="Built for homes and businesses alike"
            description="The same care and process whether we are treating a single flat or a commercial kitchen."
          />
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2">
            {CAPABILITIES.map((item) => (
              <RevealItem key={item.title} className="h-full">
                <FeatureCard icon={item.icon} title={item.title}>{item.text}</FeatureCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Coverage */}
      <section className="section">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2">
          <SectionHeading
            align="left"
            eyebrow="Coverage"
            title="Where we operate"
            description={
              areas.length
                ? 'We currently provide services across the following areas in West Bengal.'
                : 'Contact us to confirm availability in your area.'
            }
          >
            {areas.length ? (
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {areas.map((area) => (
                  <li key={area} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy shadow-soft">
                    {area}
                  </li>
                ))}
              </ul>
            ) : null}
          </SectionHeading>

          <Reveal delay={0.1}>
            <div className="card">
              <h3 className="font-bold text-navy">Trust &amp; safety</h3>
              <ul className="mt-4 space-y-3 text-sm text-body">
                {[
                  'Approved chemicals applied to label guidance',
                  'Technicians follow a documented service process',
                  'Clear pre-service and post-service guidance',
                  'Service records kept against your customer profile',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button to="/book-now" className="mt-6 w-full" iconRight={ArrowRight}>
                Request a service
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection
        title="Talk to us about your requirement"
        description="Tell us about the problem and we will recommend a treatment approach that fits your property."
      />
    </>
  );
}
