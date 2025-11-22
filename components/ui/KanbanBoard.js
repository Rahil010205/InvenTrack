'use client';

import { useState } from 'react';
import Link from 'next/link';
import ActionButtons from '@/components/ActionButtons';

export default function KanbanBoard({ items, type }) {
  const columns = ['draft', 'waiting', 'ready', 'done', 'cancelled'];
  
  const getColumnItems = (status) => items.filter(item => item.status === status);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((status) => (
        <div key={status} className="min-w-[280px] w-80 flex-shrink-0 bg-muted/50 rounded-xl p-4">
          <h3 className="font-medium text-foreground mb-4 capitalize flex items-center justify-between">
            {status}
            <span className="bg-background text-xs px-2 py-1 rounded-full text-muted-foreground">
              {getColumnItems(status).length}
            </span>
          </h3>
          
          <div className="space-y-3">
            {getColumnItems(status).map((item) => (
              <div key={item[`${type}_id`]} className="bg-card p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {item.sequence_number || `#${item[`${type}_id`]}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h4 className="font-medium text-foreground mb-1">
                  {type === 'receipt' ? item.supplier_name : item.customer_name}
                </h4>
                
                <div className="mt-3 flex justify-end gap-2">
                    <ActionButtons id={item[`${type}_id`]} type={`${type}s`} status={item.status} />
                  {/* Add Cancel button here later */}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
