import { Link } from 'react-router-dom';

/**
 * Single button primitive used across the public site and admin panel.
 * Renders <Link>, <a> or <button> depending on the props supplied.
 */
const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  className = '',
  icon: Icon,
  iconRight: IconRight,
  children,
  ...rest
}) {
  const classes = [VARIANTS[variant] || VARIANTS.primary, size === 'sm' ? 'btn-sm' : '', className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
      {IconRight ? <IconRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" /> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}
