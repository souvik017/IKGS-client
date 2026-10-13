import Reveal from './Reveal';

/**
 * Section heading with an eyebrow pill, a fluid heading and optional
 * description. `align` controls centring; `light` adapts for dark surfaces.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
  className = '',
  children,
}) {
  const alignment = align === 'left' ? 'text-left items-start' : 'text-center items-center mx-auto';
  return (
    <div className={`flex max-w-3xl flex-col ${alignment} ${className}`}>
      {eyebrow ? (
        <Reveal>
          <span className={light ? 'eyebrow !bg-white/10 !text-white' : 'eyebrow'}>
            <span className={`h-1.5 w-1.5 rounded-full ${light ? 'bg-white' : 'bg-primary'}`} aria-hidden="true" />
            {eyebrow}
          </span>
        </Reveal>
      ) : null}
      <Reveal delay={0.05}>
        <h2 className={`mt-5 text-section ${light ? 'text-white' : 'text-navy'}`}>{title}</h2>
      </Reveal>
      {description ? (
        <Reveal delay={0.1}>
          <p className={`mt-4 max-w-prose text-base leading-relaxed sm:text-lg ${light ? 'text-white/70' : 'text-body'}`}>
            {description}
          </p>
        </Reveal>
      ) : null}
      {children}
    </div>
  );
}
