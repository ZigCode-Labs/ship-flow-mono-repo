'use client';

import { useEffect, useState } from 'react';
import { CreditNoteDetailPanel } from '@/app/(dashboard)/domestic/notes/components/CreditNoteDetailPanel';
import { CreditNoteList } from '@/app/(dashboard)/domestic/notes/components/CreditNoteList';
import type { CreditNote } from '@/app/(dashboard)/domestic/notes/types';

const sampleCreditNotes: CreditNote[] = [
  {
    id: 'cn-26-27-001',
    creditNoteNumber: 'CN-26-27-001',
    invoiceNumber: 'DI-26-27-001',
    invoiceDate: '2026-05-22',
    creditNoteDate: '2026-05-22',
    customerName: '',
    customerGstin: '',
    placeOfSupply: '',
    reason: 'Delayed Delivery Penalty',
    amount: 0,
    status: 'sent',
    lineItems: [
      {
        id: 'cn-26-27-001-1',
        itemCode: '',
        description: 'sdfsdf',
        hsn: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        gst: 0,
        total: 0,
      },
    ],
    subtotal: 0,
    discount: 0,
    taxableAmount: 0,
    totalTax: 0,
    grandTotal: 0,
  },
];

export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(sampleCreditNotes);
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNote | null>(
    sampleCreditNotes[0],
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('credit_notes');
    if (!saved) return;

    try {
      const parsedCreditNotes = JSON.parse(saved) as CreditNote[];

      if (parsedCreditNotes.length > 0) {
        setCreditNotes(parsedCreditNotes);
        setSelectedCreditNote(parsedCreditNotes[0]);
      }
    } catch (err) {
      console.error('Failed to parse local credit notes:', err);
    }
  }, []);

  const handleSelectCreditNote = (creditNote: CreditNote) => {
    setSelectedCreditNote(creditNote);
    setIsCreatingNew(false);
  };

  const handleNewCreditNote = () => {
    setSelectedCreditNote(null);
    setIsCreatingNew(true);
  };

  const handleCancelForm = () => {
    setIsCreatingNew(false);
  };

  return (
    <div className="flex h-full w-full shrink-0 overflow-hidden bg-white">
      <CreditNoteList
        creditNotes={creditNotes}
        selectedCreditNote={selectedCreditNote}
        onSelectCreditNote={handleSelectCreditNote}
        onNewCreditNote={handleNewCreditNote}
      />

      <div className="h-full min-w-0 flex-1 overflow-hidden border-l border-gray-200 bg-gray-50">
        <CreditNoteDetailPanel
          creditNote={selectedCreditNote}
          isCreatingNew={isCreatingNew}
          onCancelForm={handleCancelForm}
        />
      </div>
    </div>
  );
}
