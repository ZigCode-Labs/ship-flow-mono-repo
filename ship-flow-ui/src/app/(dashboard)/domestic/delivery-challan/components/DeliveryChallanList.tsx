'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, FileText } from 'lucide-react';
import { DeliveryChallan } from '../types';
import { DeliveryChallanSaveCard } from './DeliveryChallanSaveCard';

type FilterStatus = 'all' | 'delivered' | 'sent' | 'draft' | 'cancelled';

interface DeliveryChallanListProps {
  deliveryChallans: DeliveryChallan[];
  selectedDeliveryChallan: DeliveryChallan | null;
  onSelectDeliveryChallan: (deliveryChallan: DeliveryChallan) => void;
  onNewDeliveryChallan: () => void;
}

function matchesFilterStatus(deliveryChallan: DeliveryChallan, filter: FilterStatus): boolean {
  if (filter === 'all') return true;
  return deliveryChallan.status === filter;
}

export function DeliveryChallanList({
  deliveryChallans,
  selectedDeliveryChallan,
  onSelectDeliveryChallan,
  onNewDeliveryChallan,
}: DeliveryChallanListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const filterStatus: FilterStatus = 'all';

  const filteredAndSortedChallans = useMemo(() => {
    return deliveryChallans
      .filter((challan) => {
        const matchesSearch =
          challan.challanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          challan.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = matchesFilterStatus(challan, filterStatus);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.challanDate).getTime() - new Date(a.challanDate).getTime());
  }, [deliveryChallans, searchQuery, filterStatus]);

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Delivery Challans</h2>
          <Button
            onClick={onNewDeliveryChallan}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search challans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Saved Cards List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredAndSortedChallans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileText className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No delivery challans yet</p>
            <p className="text-sm text-center mb-4">
              {searchQuery || filterStatus !== 'all'
                ? 'No challans match your search criteria'
                : "Click '+ New' to create your first delivery challan"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedChallans.map((challan) => (
              <DeliveryChallanSaveCard
                key={challan.id}
                deliveryChallan={challan}
                isSelected={selectedDeliveryChallan?.id === challan.id}
                onSelect={() => onSelectDeliveryChallan(challan)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
