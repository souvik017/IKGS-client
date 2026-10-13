import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

import Seo from '../../components/public/Seo';
import PageHero from '../../components/ui/PageHero';
import GalleryGrid from '../../components/public/GalleryGrid';
import GalleryLightbox from '../../components/public/GalleryLightbox';
import CTASection from '../../components/ui/CTASection';
import SectionHeading from '../../components/ui/SectionHeading';
import { EmptyState, ErrorState, Loading } from '../../components/public/States';
import { get } from '../../lib/api';
import { useSettings } from '../../context/SettingsContext';
import { buildBreadcrumbSchema, buildOrganizationSchema } from '../../lib/seo';

export default function Gallery() {
  const { settings } = useSettings();
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    get('/public/gallery')
      .then((res) => {
        setImages(res.data.images);
        setCategories(res.data.categories || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(
    () => (active === 'All' ? images : images.filter((image) => image.category === active)),
    [images, active]
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i - 1 + filtered.length) % filtered.length)),
    [filtered.length]
  );
  const nextImage = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i + 1) % filtered.length)),
    [filtered.length]
  );

  const tabs = ['All', ...categories];

  return (
    <>
      <Seo
        title="Gallery"
        description={`Photographs from ${settings?.businessName || 'IKGS Solution'} field work — pest control, hygiene and sanitization services across West Bengal.`}
        path="/gallery"
        jsonLd={[
          buildOrganizationSchema(settings || {}),
          buildBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Gallery', path: '/gallery' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Our Work"
        title="Gallery"
        description="Photographs from our field team. Every image below is published from our admin panel."
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Gallery' }]}
        image="/images/banners/gallery-ikgs.webp"
        imagePosition="center 45%"
      />

      <section className="section">
        <div className="container-page">
          {loading ? (
            <Loading label="Loading gallery…" />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : images.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="No photographs published yet"
              message="Our gallery is being populated. Please check back soon."
            />
          ) : (
            <>
              {categories.length > 1 ? (
                <div className="mb-8 flex flex-wrap items-center gap-2 sm:mb-10" role="tablist" aria-label="Filter gallery by category">
                  {tabs.map((tab) => {
                    const selected = active === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => {
                          setActive(tab);
                          setLightboxIndex(null);
                        }}
                        className={`relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-300 sm:px-4 ${
                          selected ? 'text-white' : 'bg-white text-body hover:text-navy shadow-soft'
                        }`}
                      >
                        {selected ? (
                          <motion.span
                            layoutId="gallery-filter-pill"
                            className="absolute inset-0 -z-10 rounded-full bg-brand-gradient"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        ) : null}
                        {tab}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {filtered.length === 0 ? (
                <EmptyState
                  icon={ImageIcon}
                  title="Nothing in this category"
                  message="Choose another category to see more photographs."
                />
              ) : (
                <GalleryGrid images={filtered} onOpen={setLightboxIndex} />
              )}
            </>
          )}
        </div>
      </section>

      <GalleryLightbox
        images={filtered}
        index={lightboxIndex}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
      />

      <CTASection
        title="Want results like these?"
        description="Book a service and our team will take care of the rest."
      />
    </>
  );
}
