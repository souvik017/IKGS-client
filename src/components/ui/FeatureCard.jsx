export default function FeatureCard({ icon: Icon, title, children, className = '' }) {
  return (
    <div className={`card card-hover ${className}`}>
      {Icon ? (
        <span className="icon-tile">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="mt-4 font-bold text-navy">{title}</h3>
      {children ? <p className="mt-2 text-sm leading-relaxed text-body">{children}</p> : null}
    </div>
  );
}
