import { statusStyle, titleCase } from '../../lib/format';

export default function StatusBadge({ status }) {
  if (!status) return <span className="text-navy/40">—</span>;
  return <span className={`badge ${statusStyle(status)}`}>{titleCase(status)}</span>;
}
