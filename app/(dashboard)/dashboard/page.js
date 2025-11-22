import { fetchAPI } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import DashboardFilter from '@/components/DashboardFilter';
import StockMovementChart from '@/components/StockMovementChart';

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const warehouse_id = params?.warehouse_id || '';
  const query = warehouse_id ? `?warehouse_id=${warehouse_id}` : '';

  const [stats, warehouses] = await Promise.all([
    fetchAPI(`/dashboard${query}`),
    fetchAPI('/warehouses')
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <DashboardFilter warehouses={warehouses} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Total Stock Items"
          value={stats.totalQty}
          icon={Package}
          className="bg-green-600 text-white"
        />
        <Card
          title="Low Stock Alerts"
          value={stats.lowStock}
          icon={AlertTriangle}
          className="bg-red-500 text-white"
        />
        <Card
          title="Pending Receipts"
          value={stats.pendingReceipts}
          icon={ArrowDownToLine}
          className="bg-yellow-500 text-white"
        />
        <Card
          title="Pending Deliveries"
          value={stats.pendingDeliveries}
          icon={ArrowUpFromLine}
          className="bg-blue-600 text-white"
        />
      </div>

      <StockMovementChart data={stats.chartData} />

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
