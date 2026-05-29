'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProformaForm, ProformaInvoiceViewer } from '@/components/proforma';
import { toast } from '@/components/ui/sonner';
import {
  DEFAULT_EXCHANGE_RATE,
  getExchangeRateToastDescription,
  getInitialLiveExchangeRate,
} from '@/components/proforma/exchange-rate';

export default function DomesticProformaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [hasToastShown, setHasToastShown] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE);
  const [proformas, setProformas] = useState<any[]>([]);
  const [selectedProforma, setSelectedProforma] = useState<any>(null);
  const [editingProforma, setEditingProforma] = useState<any>(null);

  const fetchProformas = async () => {
    try {
      const res = await fetch('http://localhost:4000/domestic-proformas');
      if (res.ok) {
        const data = await res.json();
        setProformas(data);
      }
    } catch (err) {
      console.error('Failed to fetch proformas:', err);
    }
  };

  useEffect(() => {
    fetchProformas();
  }, []);

  const handleSaveSuccess = () => {
    fetchProformas();
    setShowForm(false);
    setEditingProforma(null);
    setSelectedProforma(null);
  };

  const handleExchangeRateUpdated = (nextRate: string) => {
    setExchangeRate(nextRate);
    toast.success('Exchange Rate Updated', {
      description: getExchangeRateToastDescription(nextRate),
    });
  };

  const filteredProformas = proformas.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.customerName && p.customerName.toLowerCase().includes(q)) ||
      (p.proformaNumber && p.proformaNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex h-screen w-full bg-surface text-on-surface select-none">
      {/* Sidebar (Left) */}
      <aside className="h-full w-[23rem] flex flex-col bg-surface-container-low border-r border-outline-variant/15 select-none">
        {/* Header Section */}
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-on-surface">
              Domestic Proforma
            </h1>
          </div>

          <Button
            className="h-10 min-w-20 shrink-0 gap-1 rounded-[5px] bg-green-700 px-2.5 text-white shadow-sm hover:bg-green-800 active:scale-[0.98] transition-all cursor-pointer w-full"
            onClick={() => {
              if (!hasToastShown) {
                handleExchangeRateUpdated(getInitialLiveExchangeRate());
                setHasToastShown(true);
              }
              setSelectedProforma(null);
              setEditingProforma(null);
              setShowForm(true);
            }}
            aria-label="Create new domestic proforma"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-wide">NEW</span>
          </Button>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-secondary" />
            </div>
            <Input
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 text-slate-800"
              placeholder="Search Proformas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Sidebar Content / Empty State */}
        <div className="flex-1 overflow-y-auto">
          {filteredProformas.length > 0 ? (
            <div className="p-4 pt-2 space-y-3">
              <div className="text-[11px] text-gray-500 px-1 font-medium">
                {filteredProformas.length} proforma{filteredProformas.length > 1 ? 's' : ''}
              </div>
              {filteredProformas.map((proforma, index) => {
                const isSelected = selectedProforma?.id === proforma.id;
                return (
                  <div
                    key={proforma.id || index}
                    onClick={() => {
                      setSelectedProforma(proforma);
                      setShowForm(false);
                      setEditingProforma(null);
                    }}
                    className={`border rounded-xl p-3 bg-white hover:bg-slate-50/50 transition-all duration-200 cursor-pointer shadow-sm ${
                      isSelected
                        ? 'border-emerald-600 ring-1 ring-emerald-500/20 scale-[0.99] bg-emerald-50/10'
                        : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex justify-between items-start mb-1.5">
                          <h3 className="font-semibold text-[13px] text-slate-800 leading-tight">
                            {proforma.customerName || 'No customer'}
                          </h3>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold select-none ${
                              proforma.status === 'SENT'
                                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                : 'bg-slate-100 text-slate-600 font-semibold'
                            }`}
                          >
                            {proforma.status || 'Draft'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {proforma.proformaNumber || 'DPI-XXX'}
                        </div>
                        <div className="flex justify-between items-center pt-1.5">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {new Date(proforma.date || Date.now()).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="font-bold text-[13px] text-slate-800">
                            ₹
                            {(proforma.grandTotal || 0).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full max-h-full w-full flex-col items-center justify-center rounded-none border-0 bg-surface px-6 text-center shadow-none select-none">
              <div className="mb-3">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-slate-400 font-semibold text-xs mb-1">
                {proformas.length > 0 ? 'No matching proformas' : 'No domestic proformas yet'}
              </h3>
              <p className="text-slate-400 text-[10px] px-2 leading-relaxed">
                {proformas.length > 0
                  ? 'Try adjusting your search criteria'
                  : 'Create your first domestic proforma invoice'}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area (Right) */}
      <main className="flex-1 h-full bg-slate-50 flex flex-col relative overflow-hidden print:bg-white select-none">
        {showForm ? (
          <ProformaForm
            initialExchangeRate={exchangeRate}
            onRefreshExchangeRate={handleExchangeRateUpdated}
            onCancel={() => {
              setShowForm(false);
              setEditingProforma(null);
            }}
            onSaveSuccess={handleSaveSuccess}
            initialData={editingProforma}
          />
        ) : selectedProforma ? (
          <ProformaInvoiceViewer
            proforma={selectedProforma}
            onEdit={(p) => {
              setEditingProforma(p);
              setShowForm(true);
            }}
            onBack={() => setSelectedProforma(null)}
            onDeleteSuccess={() => {
              setSelectedProforma(null);
              fetchProformas();
            }}
            onStatusUpdate={() => {
              fetchProformas();
              setSelectedProforma((prev: any) => (prev ? { ...prev, status: 'SENT' } : null));
            }}
          />
        ) : (
          <>
            {/* Top Bar Shell */}
            <header className="h-12 flex items-center justify-end px-4 space-x-2 border-b border-slate-200 bg-white shadow-sm"></header>

            {/* Large Empty State Canvas */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
              <div className="max-w-xs w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Architectural Backdrop (Subtle Glassmorphism) */}
                <div className="relative mb-3 flex justify-center">
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-150 opacity-30"></div>
                  <div className="relative w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-md border border-slate-100">
                    <FileText className="w-7 h-7 text-emerald-600" />
                  </div>
                </div>
                <h2 className="text-sm font-extrabold text-slate-700 tracking-tight mb-1">
                  Select a proforma to view details
                </h2>
                <p className="text-xs text-slate-400 font-normal">or create a new one</p>
                {/* Background Decoration */}
                <div className="mt-4 grid grid-cols-3 gap-2 opacity-20 pointer-events-none">
                  <div className="h-8 bg-slate-200 rounded-lg"></div>
                  <div className="h-8 bg-slate-200 rounded-lg"></div>
                  <div className="h-8 bg-slate-200 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Footer Attribution / Status */}
            <footer className="p-3 flex justify-between items-center text-[8px] uppercase tracking-widest text-slate-400 font-semibold border-t border-slate-200 bg-white">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational
              </div>
              <div>Domestic Division © 2026</div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
