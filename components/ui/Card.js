import clsx from 'clsx';

export function Card({ title, value, icon: Icon, trend, className }) {
  return (
    <div
      className={clsx(
        "rounded-xl border bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark p-6 shadow-sm transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground-light dark:text-muted-foreground-dark">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground-light dark:text-foreground-dark">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="rounded-full bg-primary/10 text-primary p-3">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {trend != null && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={clsx(
              trend > 0
                ? "text-green-600 dark:text-green-400"
                : "text-destructive dark:text-red-400",
              "font-medium"
            )}
          >
            {trend > 0 ? "+" : ""}{trend}%
          </span>
          <span className="ml-2 text-muted-foreground-light dark:text-muted-foreground-dark">
            from last month
          </span>
        </div>
      )}
    </div>
  );
}
