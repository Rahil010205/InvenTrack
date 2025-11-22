import clsx from 'clsx';

export default function Table({ headers, data, renderRow, className }) {
  return (
    <div
      className={clsx(
        "overflow-x-auto rounded-lg border bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark shadow-sm transition-colors",
        className
      )}
    >
      <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
        <thead className="bg-muted-light/50 dark:bg-muted-dark/50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground-light dark:text-muted-foreground-dark"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => renderRow(item, idx))}
        </tbody>
      </table>
    </div>
  );
}
