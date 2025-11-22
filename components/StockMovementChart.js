'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function StockMovementChart({ data }) {
  const { processedData, totalIncoming, totalOutgoing } = useMemo(() => {
    if (!data || data.length === 0) {
      return { processedData: [], totalIncoming: 0, totalOutgoing: 0 };
    }

    let inc = 0;
    let out = 0;

    const processed = data.map((item) => {
      const incoming = Number(item.incoming);
      const outgoing = Number(item.outgoing);
      inc += incoming;
      out += outgoing;
      
      return { 
        id: item.ledger_id,
        date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        fullDate: new Date(item.created_at).toLocaleString(),
        incoming, 
        outgoing: -outgoing,
        rawOutgoing: outgoing 
      };
    });

    return { processedData: processed, totalIncoming: inc, totalOutgoing: out };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center h-80">
          <p className="text-slate-500 dark:text-slate-400">No data available for chart</p>
        </div>
        <div className="space-y-6">
        <div className="p-6 rounded-lg border border-green-300 bg-gray-50  h-[calc(50%-12px)] flex flex-col justify-center">
          <h3 className="text-md font-medium text-green-800 ">Total Incoming</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        <div className="p-6 rounded-lg border border-red-300 bg-gray-50  h-[calc(50%-12px)] flex flex-col justify-center">
          <h3 className="text-md font-medium text-red-800 ">Total Outgoing</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">0</p>
        </div>
      </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const incoming = payload.find(p => p.dataKey === 'incoming')?.value || 0;
      const outgoing = payload.find(p => p.dataKey === 'outgoing')?.payload.rawOutgoing || 0;

      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded shadow-lg text-sm">
          <p className="font-semibold mb-2 text-slate-900 dark:text-slate-100">{label}</p>
          <p className="text-green-600 dark:text-green-400">Incoming: {incoming}</p>
          <p className="text-red-600 dark:text-red-400">Outgoing: {outgoing}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Stock Movement (Last 30 Days)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              stackOffset="sign"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Bar dataKey="incoming" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="outgoing" fill="#ef4444" radius={[0, 0, 4, 4]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="space-y-6">
        <div className="p-6 rounded-lg border border-green-300 bg-gray-50  h-[calc(50%-12px)] flex flex-col justify-center">
          <h3 className="text-md font-medium text-green-800 ">Total Incoming</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{totalIncoming}</p>
          <p className="text-sm text-green-700 mt-1">Items received</p>
        </div>
        <div className="p-6 rounded-lg border border-red-300 bg-gray-50  h-[calc(50%-12px)] flex flex-col justify-center">
          <h3 className="text-md font-medium text-red-800 ">Total Outgoing</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{totalOutgoing}</p>
           <p className="text-sm text-red-700 mt-1">Items delivered</p>
        </div>
      </div>
    </div>
  );
}
