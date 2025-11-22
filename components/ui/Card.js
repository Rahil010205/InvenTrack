import clsx from 'clsx';

export function Card({ title, value, icon: Icon, trend, className }) {
  return (
    <div className={clsx("rounded-xl border border-slate-200 bg-white p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-full bg-blue-50 p-3 text-blue-600">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={clsx(trend > 0 ? "text-green-600" : "text-red-600", "font-medium")}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
          <span className="ml-2 text-slate-500">from last month</span>
        </div>
      )}
    </div>
  );
}
