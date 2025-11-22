'use client';

import { useState } from 'react';
import { LayoutList, Kanban } from 'lucide-react';
import Table from '@/components/ui/Table';
import KanbanBoard from '@/components/ui/KanbanBoard';
import ActionButtons from '@/components/ActionButtons';
import Link from 'next/link';
import { Edit } from 'lucide-react';

export default function ViewSwitcher({ items, type }) {
  const [view, setView] = useState('list');

  const headers = type === 'receipt' 
    ? ['ID', 'Supplier', 'Status', 'Created By', 'Date', 'Actions']
    : ['ID', 'Customer', 'Status', 'Created By', 'Date', 'Actions'];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex items-center bg-muted rounded-lg p-1 border border-border">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="List View"
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`p-2 rounded-md transition-all ${view === 'kanban' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Kanban View"
          >
            <Kanban className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <Table
          headers={headers}
          data={items}
          renderRow={(item) => (
            <tr key={item[`${type}_id`]} className="hover:bg-accent transition-colors">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                {item.sequence_number || `#${item[`${type}_id`]}`}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                {type === 'receipt' ? item.supplier_name : item.customer_name}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  item.status === 'draft' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{item.created_by_name || 'Unknown'}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                <ActionButtons id={item[`${type}_id`]} type={`${type}s`} status={item.status} />
              </td>
            </tr>
          )}
        />
      ) : (
        <KanbanBoard items={items} type={type} />
      )}
    </div>
  );
}
