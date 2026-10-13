import { Loading } from '../public/States';

/**
 * @param {Array<{key, header, render?, className?}>} columns
 * @param {Array} rows
 */
export default function DataTable({ columns, rows, loading, emptyMessage = 'No records found.', onRowClick }) {
  return (
    <div className="overflow-hidden rounded-xl border border-navy/10 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-navy/10">
          <thead className="bg-mist">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy/60 ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <Loading label="Loading…" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-navy/50">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row._id || row.id || index}
                  className={`hover:bg-mist/60 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-sm text-navy/80 ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
