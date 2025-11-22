import clsx from 'clsx';

export function Card({ title, value, icon: Icon, trend, className }) {
  return (
    <div className={clsx("rounded-xl border border-border bg-card p-6 shadow-sm transition-colors", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={clsx(trend > 0 ? "text-green-600 dark:text-green-400" : "text-destructive", "font-medium")}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
          <span className="ml-2 text-muted-foreground">from last month</span>
        </div>
      )}
    </div>
  );
}
