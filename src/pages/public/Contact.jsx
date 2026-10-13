import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Seo from '../../components/public/Seo';
import PageHero from '../../components/ui/PageHero';
import EnquiryForm from '../../components/public/EnquiryForm';
import Reveal from '../../components/ui/Reveal';
import { useSettings } from '../../context/SettingsContext';
import { buildBreadcrumbSchema, buildOrganizationSchema } from '../../lib/seo';

export default function Contact() {
  const { settings } = useSettings();
  const whatsapp = settings?.whatsapp?.replace(/[^\d]/g, '');

  const cards = [
    settings?.phone && {
      key: 'phone',
      icon: Phone,
      label: 'Phone',
      value: settings.phone,
      href: `tel:${settings.phone}`,
    },
    settings?.email && {
      key: 'email',
      icon: Mail,
      label: 'Email',
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    settings?.address && {
      key: 'address',
      icon: MapPin,
      label: 'Address',
      value: settings.address,
      href: settings.googleMapsUrl || undefined,
    },
    whatsapp && {
      key: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      value: 'Chat with our team',
      href: `https://wa.me/${whatsapp}`,
    },
  ].filter(Boolean);

  return (
    <>
      <Seo
        title="Contact Us"
        description="Get in touch with IKGS Solution for pest control and hygiene services in West Bengal. Call, email, WhatsApp or send us an enquiry online."
        path="/contact"
        jsonLd={[
          buildOrganizationSchema(settings || {}),
          buildBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Contact"
        title="Let's talk about your requirement"
        description="Call us, message on WhatsApp or send an enquiry — whichever is easiest for you."
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Contact' }]}
        image="/images/banners/contact-ikgs.webp"
        imagePosition="center 50%"
      />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-extrabold text-navy">Reach our team</h2>
            <div className="mt-6 space-y-4">
              {cards.length === 0 ? (
                <p className="text-sm text-body">
                  Contact details are being configured. Please use the enquiry form.
                </p>
              ) : (
                cards.map(({ key, icon: Icon, label, value, href }) => {
                  const content = (
                    <>
                      <span className="icon-tile">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-navy">{label}</span>
                        <span className="block break-words text-sm text-body">{value}</span>
                      </span>
                    </>
                  );
                  return href ? (
                    <a
                      key={key}
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-start gap-4 rounded-2xl border border-line bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={key} className="flex items-start gap-4 rounded-2xl border border-line bg-white p-4 shadow-soft">
                      {content}
                    </div>
                  );
                })
              )}
            </div>

            {settings?.businessHours ? (
              <p className="mt-6 rounded-2xl border border-line bg-offwhite p-4 text-sm text-body">
                <span className="font-bold text-navy">Business hours: </span>
                {settings.businessHours}
              </p>
            ) : null}

            {settings?.serviceAreas?.length ? (
              <div className="mt-6">
                <p className="text-sm font-bold text-navy">Service areas</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {settings.serviceAreas.map((area) => (
                    <li key={area} className="rounded-full bg-ice px-3.5 py-1.5 text-xs font-semibold text-primary">
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-2xl font-extrabold text-navy">Send an enquiry</h2>
            <p className="mb-6 mt-2 text-sm text-body">
              Share your requirement and we will get back to you.
            </p>
            <EnquiryForm />

            {settings?.googleMapsUrl ? (
              <Reveal delay={0.1}>
                <div className="mt-8 overflow-hidden rounded-2xl border border-line shadow-soft">
                  <iframe
                    title={`${settings.businessName || 'IKGS Solution'} location map`}
                    src={settings.googleMapsUrl}
                    className="h-56 w-full sm:h-72"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
