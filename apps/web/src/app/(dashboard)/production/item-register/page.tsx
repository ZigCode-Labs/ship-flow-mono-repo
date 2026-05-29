'use client';

import { useState, useMemo } from 'react';
import { toast } from '@/components/ui/sonner';
import { ItemRegisterHeader } from './components/ItemRegisterHeader';
import { ItemRegisterTable } from './components/ItemRegisterTable';
import { ItemRegisterEmptyState } from './components/ItemRegisterEmptyState';
import { ItemRegisterForm } from './components/ItemRegisterForm';
import { ProductionItem, ItemType } from './types';

// Sample data - Replace with API call
const sampleItems: ProductionItem[] = [];

export default function ItemRegisterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType>('all');
  const [items, setItems] = useState<ProductionItem[]>(sampleItems);
  const [isCreating, setIsCreating] = useState(false);

  // Filter items based on search query and type
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || item.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [items, searchQuery, selectedType]);

  const handleImportClick = () => {
    toast.info('Import from Main Item - Coming soon');
  };

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleBackToList = () => {
    setIsCreating(false);
  };

  const getNextItemCode = () => {
    const nextNumber = items.length + 1;
    return `PRD-${String(nextNumber).padStart(5, '0')}`;
  };

  const handleSaveItem = (item: Omit<ProductionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    const newItem: ProductionItem = {
      ...item,
      id: `production-item-${timestamp}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setItems((currentItems) => [newItem, ...currentItems]);
    setIsCreating(false);
    setSearchQuery('');
    setSelectedType('all');
    toast.success(`${newItem.name} saved`);
  };

  const handleItemClick = (item: ProductionItem) => {
    toast.info(`Selected item: ${item.name}`);
  };

  return isCreating ? (
    <ItemRegisterForm
      itemCode={getNextItemCode()}
      onBack={handleBackToList}
      onSave={handleSaveItem}
    />
  ) : (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header Section */}
      <ItemRegisterHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onImportClick={handleImportClick}
        onCreateClick={handleCreateClick}
      />

      {/* Content Section */}
      <div className="flex-1 overflow-auto">
        <div className="w-full px-7 py-4">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200">
              <ItemRegisterEmptyState onCreateClick={handleCreateClick} />
            </div>
          ) : (
            <ItemRegisterTable items={filteredItems} onItemClick={handleItemClick} />
          )}
        </div>
      </div>
    </div>
  );
}
