'use client';

import { useState } from 'react';
import { Package, Plus, Search, X } from 'lucide-react';

import InventoryMovementForm from './components/inventory-movement-form';

const movementTypes = [
  'All',
  'Opening',
  'Purchase Receipt',
  'Stock In',
  'Stock Out',
  'Adjustment',
  'Job Work',
  'Return',
];

export default function RawMaterialInventoryPage() {
  const [activeTab, setActiveTab] = useState<'movement-ledger' | 'stock-summary'>(
    'movement-ledger',
  );

  const [activeFilter, setActiveFilter] = useState('All');

  const [search, setSearch] = useState('');

  const [openMovementModal, setOpenMovementModal] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-background p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[40px] font-bold tracking-tight text-foreground">
                Raw Material Inventory
              </h1>

              <p className="mt-2 text-base text-muted-foreground">
                Stock balances and movement ledger for all raw materials.
              </p>
            </div>

            {/* Add Movement Button */}
            <button
              onClick={() => setOpenMovementModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Movement
            </button>
          </div>

          {/* Tabs */}
          <div className="inline-flex w-fit rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveTab('movement-ledger')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'movement-ledger'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Movement Ledger
            </button>

            <button
              onClick={() => setActiveTab('stock-summary')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'stock-summary'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Stock Summary
            </button>
          </div>

          {/* ================================================= */}
          {/* MOVEMENT LEDGER */}
          {/* ================================================= */}
          {activeTab === 'movement-ledger' && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                {movementTypes.map((type) => {
                  const isActive = activeFilter === type;

                  return (
                    <button
                      key={type}
                      onClick={() => setActiveFilter(type)}
                      className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              {/* Empty State */}
              <div className="flex min-h-[430px] items-center justify-center rounded-2xl border border-border bg-card">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>

                  <h3 className="text-[18px] font-semibold text-foreground">No movements found</h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Use <span className="font-medium text-foreground">"Add Movement"</span> to
                    record opening stock or adjustments.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ================================================= */}
          {/* STOCK SUMMARY */}
          {/* ================================================= */}
          {activeTab === 'stock-summary' && (
            <>
              {/* Search */}
              <div className="relative w-full max-w-[260px]">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background pl-11 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring"
                />
              </div>

              {/* Empty State */}
              <div className="flex min-h-[230px] items-center justify-center rounded-2xl border border-border bg-card">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>

                  <h3 className="text-[18px] font-semibold text-foreground">
                    No raw material items found
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Add raw material items in the RM Register first.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* ADD MOVEMENT MODAL */}
      {/* ================================================= */}
      {openMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[480px] rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-xl font-semibold">Add Inventory Movement</h2>

              <button
                onClick={() => setOpenMovementModal(false)}
                className="rounded-lg border border-blue-500 p-2 transition hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM IMPORT */}
            <div className="px-6 pb-6">
              <InventoryMovementForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
