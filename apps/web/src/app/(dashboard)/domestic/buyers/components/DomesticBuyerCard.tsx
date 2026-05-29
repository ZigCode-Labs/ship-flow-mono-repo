'use client';

import { Building2, Eye, FileText, Mail, MapPin, Pencil, Phone, Trash2 } from 'lucide-react';
import type { Buyer } from '@/store/domesticBuyers';

interface DomesticBuyerCardProps {
  buyer: Buyer;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (buyer: Buyer) => void;
  onEdit: (buyer: Buyer) => void;
  onDelete: (buyer: Buyer) => void;
}

export default function DomesticBuyerCard({
  buyer,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: DomesticBuyerCardProps) {
  const location = [buyer.city, buyer.state].filter(Boolean).join(', ');

  return (
    <div
      className={`rounded-lg shadow-sm p-4 min-w-0 border-2 transition-all bg-white ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(buyer.id)}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
          <Building2 size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 truncate">{buyer.companyName}</h2>
          {buyer.tradeName && <p className="text-xs text-gray-400 truncate">{buyer.tradeName}</p>}
        </div>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            buyer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {buyer.status}
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <FileText size={14} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{buyer.gstin}</span>
        </div>
        {location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
        {buyer.email && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Mail size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{buyer.email}</span>
          </div>
        )}
        {buyer.phone && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Phone size={14} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{buyer.phone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onView(buyer)}
          className="text-gray-400 hover:text-blue-600"
          title="View"
        >
          <Eye size={14} />
        </button>
        <button
          type="button"
          onClick={() => onEdit(buyer)}
          className="text-gray-400 hover:text-blue-600"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(buyer)}
          className="text-red-400 hover:text-red-600"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
