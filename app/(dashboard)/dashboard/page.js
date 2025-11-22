import { fetchAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default async function DashboardPage() {
  const stats = await fetchAPI('/dashboard');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Overview</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Total Stock Items"
          value={stats.totalQty}
          icon={Package}
        />
        <Card
          title="Low Stock Alerts"
          value={stats.lowStock}
          icon={AlertTriangle}
          className={stats.lowStock > 0 ? "border-l-4 border-l-red-500" : ""}
        />
        <Card
          title="Pending Receipts"
          value={stats.pendingReceipts}
          icon={ArrowDownToLine}
        />
        <Card
          title="Pending Deliveries"
          value={stats.pendingDeliveries}
          icon={ArrowUpFromLine}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors">
        <h3 className="text-lg font-medium text-foreground">Recent Activity</h3>
        <div className="mt-4 space-y-4">
          {stats.recentActivity.length === 0 ? (
            <p className="text-muted-foreground">No recent activity.</p>
          ) : (
            stats.recentActivity.map((activity) => (
              <div key={activity.ledger_id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {activity.source_type.toUpperCase()} - {activity.product_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={activity.quantity_change > 0 ? "text-green-600 dark:text-green-400 font-bold" : "text-destructive font-bold"}>
                  {activity.quantity_change > 0 ? "+" : ""}{activity.quantity_change}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
