import { BadgeCheck, CalendarCheck, Clock, ShieldCheck } from 'lucide-react';
import Seo from '../../components/public/Seo';
import PageHero from '../../components/ui/PageHero';
import BookingForm from '../../components/public/BookingForm';
import Reveal from '../../components/ui/Reveal';
import { useSettings } from '../../context/SettingsContext';
import { buildBreadcrumbSchema, buildOrganizationSchema } from '../../lib/seo';

const BENEFITS = [
  { icon: ShieldCheck, text: 'Free inspection before you commit' },
  { icon: Clock, text: 'Confirmed appointment slot' },
  { icon: BadgeCheck, text: 'Clear treatment recommendation' },
  { icon: CalendarCheck, text: 'Follow-up visit where required' },
];

export default function BookNow() {
  const { settings } = useSettings();

  return (
    <>
      <Seo
        title="Book a Free Demo | Pest Control Booking"
        description="Book a free pest control inspection and demo with IKGS Solution. Share your requirement and our team will confirm a convenient appointment."
        path="/book-now"
        jsonLd={[
          buildOrganizationSchema(settings || {}),
          buildBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Book Now', path: '/book-now' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Book Now"
        title="Book a free demo"
        description="Fill in your details and we will contact you to confirm a convenient appointment for your property."
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Book Now' }]}
      />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <BookingForm />
          </div>

          <aside className="lg:col-span-2">
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-line bg-offwhite p-7">
                <h2 className="text-xl font-extrabold text-navy">What happens next</h2>
                <ul className="mt-6 space-y-4">
                  {BENEFITS.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-sm font-medium text-body">
                      <span className="icon-tile h-10 w-10">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-t border-line pt-6">
                  <p className="text-sm font-bold text-navy">Prefer to talk?</p>
                  {settings?.phone ? (
                    <a href={`tel:${settings.phone}`} className="link mt-1 block text-sm">
                      {settings.phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-body">Use the contact form and we will call you.</p>
                  )}
                  {settings?.businessHours ? (
                    <p className="mt-2 text-xs text-body">{settings.businessHours}</p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
