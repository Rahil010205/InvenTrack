import clsx from 'clsx';

export default function Table({ headers, data, renderRow, className }) {
  return (
    <div className={clsx("overflow-hidden rounded-lg border border-border shadow-sm transition-colors", className)}>
      <table className="min-w-full divide-y divide-border bg-card">
        <thead className="bg-muted/50">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {data.map((item, idx) => renderRow(item, idx))}
        </tbody>
      </table>
    </div>
  );
}
