'use client';

import { FileText } from 'lucide-react';

export function DetailPanel() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#f9fafb]">
      <div className="flex flex-col items-center text-gray-500">
        <FileText className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-900">Select a Delivery Challan</p>
        <p className="text-sm mt-1">Choose from the list or create a new one</p>
      </div>
    </div>
  );
}
