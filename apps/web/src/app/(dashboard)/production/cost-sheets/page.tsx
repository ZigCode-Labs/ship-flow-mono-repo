'use client';

import { useState } from 'react';
import { CostSheetForm, CostSheetsEmptyState, CostSheetsHeader } from './components';

export default function CostSheetsPage() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleBackToList = () => {
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <div className="flex h-full flex-col">
        <CostSheetForm onCancel={handleBackToList} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <CostSheetsHeader onCreateClick={handleCreateClick} />
      <CostSheetsEmptyState onCreateClick={handleCreateClick} />
    </div>
  );
}
