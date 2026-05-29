'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/sonner';

import { RMRegisterEmptyState } from './components/RMRegisterEmptyState';
import { RMRegisterHeader } from './components/RMRegisterHeader';
import { RMRegisterTable } from './components/RMRegisterTable';
import { RMRegisterViewModal } from './components/RMRegisterViewModal';
import {
  consumeCreatedToastCode,
  consumeUpdatedToastCode,
  loadRawMaterials,
  saveRawMaterials,
} from './lib/storage';
import type { RawMaterial } from './types';

export default function RMRegisterPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [viewMaterial, setViewMaterial] = useState<RawMaterial | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    setMaterials(loadRawMaterials());
    setIsHydrated(true);

    const createdCode = consumeCreatedToastCode();
    if (createdCode) {
      toast.success('Item created', {
        description: `${createdCode} created successfully.`,
      });
    }

    const updatedCode = consumeUpdatedToastCode();
    if (updatedCode) {
      toast.success('Item updated', {
        description: `${updatedCode} saved successfully.`,
      });
    }
  }, []);

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const query = searchQuery.toLowerCase();
      return (
        query === '' ||
        material.name.toLowerCase().includes(query) ||
        material.code.toLowerCase().includes(query) ||
        (material.description?.toLowerCase() || '').includes(query)
      );
    });
  }, [materials, searchQuery]);

  const persistMaterials = (nextMaterials: RawMaterial[]) => {
    setMaterials(nextMaterials);
    saveRawMaterials(nextMaterials);
  };

  const handleCreateClick = () => {
    router.push('/production/raw-materials/register/new');
  };

  const handleView = (material: RawMaterial) => {
    setViewMaterial(material);
    setIsViewOpen(true);
  };

  const handleEdit = (material: RawMaterial) => {
    router.push(`/production/raw-materials/register/${material.id}/edit`);
  };

  const handleDelete = (material: RawMaterial) => {
    const nextMaterials = materials.filter((item) => item.id !== material.id);
    persistMaterials(nextMaterials);
    toast.success('Item removed', {
      description: `${material.code} was deleted.`,
    });
  };

  const showEmptyState = isHydrated && materials.length === 0;

  return (
    <div className="flex h-full flex-col bg-white">
      <RMRegisterHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateClick={handleCreateClick}
      />

      <div className="flex-1 overflow-auto">
        <div className="w-full px-7 py-4">
          {showEmptyState ? (
            <div className="rounded-lg border border-gray-200 bg-white">
              <RMRegisterEmptyState onCreateClick={handleCreateClick} />
            </div>
          ) : (
            <RMRegisterTable
              materials={filteredMaterials}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <RMRegisterViewModal
        material={viewMaterial}
        open={isViewOpen}
        onOpenChange={(open) => {
          setIsViewOpen(open);
          if (!open) setViewMaterial(null);
        }}
        onEdit={handleEdit}
      />
    </div>
  );
}
