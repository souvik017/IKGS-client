import { Link } from 'react-router-dom';

export default function StatCard({ label, value, Icon, tone = 'royal', to }) {
  const tones = {
    royal: 'bg-royal/10 text-royal',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    navy: 'bg-navy/10 text-navy',
  };

  const Wrapper = to ? Link : 'div';

  return (
    <Wrapper
      {...(to ? { to } : {})}
      className="flex items-center gap-4 rounded-xl border border-navy/10 bg-white p-5 shadow-card transition hover:shadow-lift"
    >
      {Icon ? (
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-navy/50">{label}</p>
        <p className="text-2xl font-extrabold text-navy">{value}</p>
      </div>
    </Wrapper>
  );
}
