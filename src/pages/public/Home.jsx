import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Bug,
  CalendarCheck,
  CheckCircle2,
  Droplets,
  Image as ImageIcon,
  Leaf,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
} from 'lucide-react';

import Seo from '../../components/public/Seo';
import ServiceCard from '../../components/public/ServiceCard';
import TestimonialCard from '../../components/public/TestimonialCard';
import { EmptyState, ErrorState, Loading } from '../../components/public/States';
import SectionHeading from '../../components/ui/SectionHeading';
import Button from '../../components/ui/Button';
import Reveal, { RevealGroup, RevealItem } from '../../components/ui/Reveal';
import CTASection from '../../components/ui/CTASection';
import FeatureCard from '../../components/ui/FeatureCard';
import ResponsiveImage from '../../components/ui/ResponsiveImage';
import VideoHero from '../../components/ui/VideoHero';
import { get, resolveAsset } from '../../lib/api';
import { useSettings } from '../../context/SettingsContext';
import { buildOrganizationSchema } from '../../lib/seo';
import { EASE, viewportOnce } from '../../lib/motion';

const WHY_US = [
  {
    icon: Users,
    title: 'Trained Technicians',
    text: 'Service delivered by trained field staff following a documented treatment process.',
  },
  {
    icon: Leaf,
    title: 'Approved Chemicals',
    text: 'Approved formulations applied according to label guidance and sound safety practice.',
  },
  {
    icon: CalendarCheck,
    title: 'Scheduled Visits',
    text: 'Time-bound service slots and follow-up visits so treatment completes as planned.',
  },
  {
    icon: ShieldCheck,
    title: 'Responsive Support',
    text: 'A single point of contact for bookings, service queries and post-service support.',
  },
];

const PROCESS = [
  { icon: Target, title: 'Inspect', text: 'We survey the property to identify the pest and the extent of the infestation.' },
  { icon: Workflow, title: 'Treat', text: 'We apply a treatment plan matched to the pest, the property and the risk.' },
  { icon: BadgeCheck, title: 'Advise', text: 'We explain preventive steps so the problem does not return quickly.' },
];

const HERO_ICONS = [Bug, Droplets, ShieldCheck, Sparkles];

export default function Home() {
  const { settings } = useSettings();
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      get('/public/services'),
      get('/public/testimonials'),
      get('/public/gallery'),
    ])
      .then(([servicesRes, testimonialsRes, galleryRes]) => {
        setServices(servicesRes.data.services);
        setTestimonials(testimonialsRes.data.testimonials);
        setGallery(galleryRes.data.images.slice(0, 6));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const heroImage = services.find((s) => s.image)?.image;
  const hasAreas = Boolean(settings?.serviceAreas?.length);

  return (
    <>
      <Seo
        title="IKGS Solution | Pest Control & Hygiene Services in West Bengal"
        description={
          settings?.description ||
          'Professional pest control and hygiene solutions for homes, offices and commercial spaces across our service areas in West Bengal.'
        }
        path="/"
        jsonLd={buildOrganizationSchema(settings || {})}
      />

      {/* ---------------------------------------------------------------- Hero
          Full-width background video with a dark overlay. VideoHero handles
          autoplay policy, the poster fallback, reduced motion and data saver. */}
      <VideoHero className="min-h-[600px] lg:min-h-[720px]">
        <div className="container-page grid min-h-[600px] items-center gap-12 py-20 lg:min-h-[720px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-28">
          <div>
            <motion.span
              className="eyebrow !bg-white/10 !text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Pest Control &amp; Hygiene Specialists
            </motion.span>

            <motion.h1
              className="mt-6 text-hero text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.06, ease: EASE }}
            >
              A Cleaner Space.
              <br />
              <span className="bg-gradient-to-r from-ice via-frost to-primary-soft bg-clip-text text-transparent">
                A Healthier Tomorrow.
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14, ease: EASE }}
            >
              {settings?.description ||
                'Professional pest control and hygiene solutions for homes, offices and commercial spaces across our service areas in West Bengal.'}
            </motion.p>

            <motion.div
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.22 } } }}
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}>
                <Button to="/book-now" iconRight={ArrowRight} className="group w-full sm:w-auto">
                  Book a Service
                </Button>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}>
                <Button
                  to="/services"
                  variant="secondary"
                  className="w-full !border-white/25 !bg-white/10 !text-white backdrop-blur-sm hover:!border-white/40 hover:!bg-white/20 hover:!text-white sm:w-auto"
                >
                  Explore Our Services
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust indicators - only from verified business data */}
            {(services.length > 0 || hasAreas || settings?.businessHours) ? (
              <motion.ul
                className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/75"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                {services.length > 0 ? (
                  <li className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary-soft" aria-hidden="true" />
                    <span><strong className="font-bold text-white">{services.length}</strong> services offered</span>
                  </li>
                ) : null}
                {hasAreas ? (
                  <li className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary-soft" aria-hidden="true" />
                    <span><strong className="font-bold text-white">{settings.serviceAreas.length}</strong> service areas</span>
                  </li>
                ) : null}
                {settings?.businessHours ? (
                  <li className="inline-flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-primary-soft" aria-hidden="true" />
                    <span>{settings.businessHours}</span>
                  </li>
                ) : null}
              </motion.ul>
            ) : null}
          </div>

          {/* Frosted glass panel: real service imagery when available, otherwise
              the brand mark. Reads as a deliberate card over the video. */}
          <motion.div
            className="relative mx-auto w-full max-w-lg"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          >
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-lift backdrop-blur-md sm:p-6">
              {heroImage ? (
                <ResponsiveImage
                  src={resolveAsset(heroImage)}
                  alt={`${settings?.businessName || 'IKGS Solution'} technician treating a property`}
                  ratio="16 / 10"
                  priority
                  className="mb-5 rounded-2xl"
                />
              ) : null}

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-frost">
                What we protect
              </p>
              <p className="mt-1.5 text-xl font-extrabold text-white sm:text-2xl">
                Homes. Offices. Businesses.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {HERO_ICONS.map((Icon, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/10 p-3 transition-colors duration-300 hover:bg-white/20"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20 text-white">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold text-white sm:text-sm">
                      {['Pest Control', 'Sanitization', 'Protection', 'Hygiene'][index]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ice text-primary">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold text-navy">
                  Documented treatment process
                  <span className="block text-xs font-normal text-body">Inspect · Treat · Advise</span>
                </p>
              </div>
            </div>

            {settings?.phone ? (
              <a
                href={`tel:${settings.phone}`}
                className="absolute -bottom-5 left-4 inline-flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-navy shadow-lift transition-transform duration-300 hover:-translate-y-0.5 sm:left-6"
              >
                <PhoneCall className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {settings.phone}
              </a>
            ) : null}
          </motion.div>
        </div>
      </VideoHero>

      {/* ------------------------------------------------------------ Services */}
      <section className="section bg-offwhite">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow="Our Services"
              title="Excellent Pest Control Services"
              description="Targeted treatments for the pests we are actually asked to solve — delivered by our own field team."
            />
            <Reveal delay={0.1}>
              <Button to="/services" variant="secondary" iconRight={ArrowRight} className="group">
                View All Services
              </Button>
            </Reveal>
          </div>

          <div className="mt-12">
            {loading ? (
              <Loading label="Loading services…" />
            ) : error ? (
              <ErrorState message={error} onRetry={load} />
            ) : services.length === 0 ? (
              <EmptyState
                title="Services coming soon"
                message="Our service catalogue is being updated. Please check back shortly."
              />
            ) : (
              <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.slice(0, 6).map((service) => (
                  <RevealItem key={service._id} className="h-full">
                    <ServiceCard service={service} />
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Why choose us */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why Choose Us"
            title="A process built around reliability"
            description="We keep the service simple, documented and easy to follow up on."
          />
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((item) => (
              <RevealItem key={item.title} className="h-full">
                <FeatureCard icon={item.icon} title={item.title}>{item.text}</FeatureCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* --------------------------------------------------------------- Process */}
      <section className="section bg-navy text-white">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              light
              align="left"
              eyebrow="How It Works"
              title="Three steps from problem to resolution"
              description="A predictable process so you always know what happens next."
            />
          </div>
          <RevealGroup className="space-y-4">
            {PROCESS.map(({ icon: Icon, title, text }, index) => (
              <RevealItem
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-primary-soft">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-bold text-white">
                    {index + 1}. {title}
                  </p>
                  <p className="mt-1 text-sm text-white/65">{text}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* -------------------------------------------------------------- Coverage */}
      {hasAreas ? (
        <section className="section">
          <div className="container-page grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-line bg-offwhite p-8">
                <div className="decor-dots pointer-events-none absolute right-4 top-4 h-24 w-40 text-frost" aria-hidden="true" />
                <MapPin className="h-8 w-8 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-2xl font-extrabold text-navy">Service coverage</h3>
                <p className="mt-2 text-sm text-body">
                  We currently serve the following locations in West Bengal.
                </p>
                <ul className="mt-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                  {settings.serviceAreas.map((area) => (
                    <li key={area} className="flex items-center gap-2 text-sm font-semibold text-navy">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <SectionHeading
              align="left"
              eyebrow="Where We Work"
              title="Local coverage you can actually count on"
              description="Unsure whether we cover your address? Send an enquiry and we will confirm straight away."
            >
              <div className="mt-8">
                <Button to="/contact" iconRight={ArrowRight} className="group">
                  Check availability
                </Button>
              </div>
            </SectionHeading>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- Testimonials */}
      {testimonials.length > 0 ? (
        <section className="section bg-offwhite">
          <div className="container-page">
            <SectionHeading
              eyebrow="Customer Feedback"
              title="What our customers say"
              description="Verified feedback shared by customers after their service."
            />
            <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 6).map((testimonial) => (
                <RevealItem key={testimonial.id} className="h-full">
                  <TestimonialCard testimonial={testimonial} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------------------- Gallery teaser */}
      {gallery.length > 0 ? (
        <section className="section">
          <div className="container-page">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                align="left"
                eyebrow="Our Work"
                title="A look at our work"
                description="Photographs from our field team."
              />
              <Reveal delay={0.1}>
                <Button to="/gallery" variant="secondary" iconRight={ArrowRight} className="group">
                  <ImageIcon className="h-4 w-4" aria-hidden="true" /> View Gallery
                </Button>
              </Reveal>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {gallery.map((image, index) => (
                <motion.img
                  key={image._id}
                  src={resolveAsset(image.image)}
                  alt={image.alt || image.title}
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={420}
                  className="h-32 w-full rounded-2xl object-cover shadow-soft min-[420px]:h-40 sm:h-52"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CTASection image="/images/banners/cta-ikgs.webp" />
    </>
  );
}
