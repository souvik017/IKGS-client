export default function SectionHeading({ eyebrow, title, description, align = 'center', light = false }) {
  const alignment = align === 'left' ? 'text-left' : 'text-center mx-auto';
  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow ? (
        <p className={`mb-2 text-sm font-semibold uppercase tracking-widest ${light ? 'text-royal-light' : 'text-royal'}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-3xl sm:text-4xl ${light ? 'text-white' : 'text-navy'}`}>{title}</h2>
      {description ? (
        <p className={`mt-4 text-base leading-relaxed ${light ? 'text-white/70' : 'text-navy/60'}`}>{description}</p>
      ) : null}
    </div>
  );
}
