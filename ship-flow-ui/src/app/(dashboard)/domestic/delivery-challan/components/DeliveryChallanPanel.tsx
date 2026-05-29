'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, FileText } from 'lucide-react';
import { DeliveryChallan } from '../types';
import { DeliveryChallanSaveCard } from './DeliveryChallanSaveCard';

interface DeliveryChallanPanelProps {
  deliveryChallans: DeliveryChallan[];
  selectedDeliveryChallan: DeliveryChallan | null;
  onSelect: (dc: DeliveryChallan) => void;
  onNew: () => void;
}

export function DeliveryChallanPanel({
  deliveryChallans,
  selectedDeliveryChallan,
  onSelect,
  onNew,
}: DeliveryChallanPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return deliveryChallans
      .filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          c.challanNumber.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.challanDate).getTime() - new Date(a.challanDate).getTime());
  }, [deliveryChallans, searchQuery]);

  return (
    <div className="w-[308px] h-full flex flex-col bg-white border-r border-[#e5e7eb]">
      <div className="px-4 pt-4 flex flex-col" style={{ height: 121 }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Delivery Challans</h2>
          <button
            onClick={onNew}
            className="h-9 px-4 bg-blue-600 text-white rounded-md text-sm font-medium flex items-center gap-1.5 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search DC number or buyer"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileText className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-base font-medium text-gray-900">No delivery challans yet</p>
            <p className="text-sm mt-1">Click &apos;+ New&apos; to create one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <DeliveryChallanSaveCard
                key={c.id}
                deliveryChallan={c}
                isSelected={selectedDeliveryChallan?.id === c.id}
                onSelect={() => onSelect(c)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
