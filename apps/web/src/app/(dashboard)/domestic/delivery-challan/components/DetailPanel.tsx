'use client';

import { Package } from 'lucide-react';

export function DetailPanel() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* Top Bar Shell */}
      <header className="flex h-12 items-center justify-end border-b border-slate-200 bg-white px-4 shadow-sm" />

      {/* Large Empty State Canvas */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f9fafb] p-4 text-center">
        <div className="w-full max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Architectural Backdrop (Subtle Glassmorphism) */}
          <div className="relative mb-3 flex justify-center">
            <div className="absolute inset-0 scale-150 rounded-full bg-primary/5 opacity-30 blur-3xl" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-md">
              <Package className="h-7 w-7 text-blue-600" />
            </div>
          </div>
          <h2 className="mb-1 text-sm font-extrabold tracking-tight text-slate-700">
            Select a Delivery Challan
          </h2>
          <p className="text-xs font-normal text-slate-400">
            Choose from the list or create a new one
          </p>
          {/* Background Decoration */}
          <div className="pointer-events-none mt-4 grid grid-cols-3 gap-2 opacity-20">
            <div className="h-8 rounded-lg bg-slate-200" />
            <div className="h-8 rounded-lg bg-slate-200" />
            <div className="h-8 rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Footer Attribution / Status */}
      <footer className="flex items-center justify-between border-t border-slate-200 bg-white p-3 text-[8px] font-semibold uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          System Operational
        </div>
        <div>Domestic Division &copy; 2026</div>
      </footer>
    </div>
  );
}
