'use client';

import { useMemo, useState } from 'react';
import {
  Download,
  Edit,
  Eye,
  Package,
  Plus,
  Printer,
  Search,
  Send,
  Trash2,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { JobWorkForm } from './components/JobWorkForm';
import jobWorkFormConfig from './data/job-work-form-config.json';
import type { JobWork, JobWorkIssueLine } from './types';
import type { JobWorkFormConfig, JobWorkFormValues } from './types/form';

const typedFormConfig = jobWorkFormConfig as JobWorkFormConfig;
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);

const formatDisplayDate = (date: string): string => {
  if (!date) return '-';
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return '-';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
};

const getToday = (): string => new Date().toISOString().split('T')[0];

const getNextJobWorkNumber = (orders: JobWork[]): string => {
  const nextNumber =
    orders.reduce((max, order) => {
      const number = Number(order.jobWorkNumber.replace(/\D/g, ''));
      return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0) + 1;

  return `JW-${String(nextNumber).padStart(5, '0')}`;
};

const getJobWorkerLabel = (value: string): string =>
  typedFormConfig.dataSources.jobWorkers.find(
    (worker: { value: string; label: string }) => worker.value === value,
  )?.label ?? 'No job worker';

const getJobWorkerAddress = (value: string): string =>
  typedFormConfig.dataSources.jobWorkers.find(
    (worker: { value: string; address?: string }) => worker.value === value,
  )?.address ?? '';

const jobWorkToFormValues = (jobWork: JobWork): JobWorkFormValues => ({
  jobWorkNumber: jobWork.jobWorkNumber,
  jobWorkType: jobWork.jobWorkType,
  issueDate: jobWork.issueDate,
  expectedReturnDate: jobWork.expectedReturnDate,
  jobWorker: jobWork.jobWorker,
  issueTime: jobWork.issueTime ?? '',
  jobWorkerAddress: jobWork.jobWorkerAddress ?? '',
  remarks: jobWork.remarks ?? '',
  overallDiscount: jobWork.overallDiscount ?? 0,
  issueLines: jobWork.issueLines.map((line) => ({
    id: line.id,
    itemCode: line.itemCode,
    itemName: line.itemName,
    workOperation: line.workOperation,
    quantity: line.quantity,
    unit: line.unit,
    rate: line.rate,
    discount: line.discount,
    amount: line.amount,
    total: line.total,
    remarks: line.remarks ?? '',
  })),
});

const createPdfBlob = (jobWork: JobWork): Blob => {
  const lines = [
    'Global Loom Textiles Pvt Ltd',
    'JOB WORK ORDER',
    `JW #: ${jobWork.jobWorkNumber}`,
    `Status: ${jobWork.status.toUpperCase()}`,
    `Date: ${formatDisplayDate(jobWork.issueDate)}`,
    `Job Worker: ${jobWork.jobWorkerName === 'No job worker' ? 'N/A' : jobWork.jobWorkerName}`,
    '',
    'Issue Lines',
    'Item Code    Description    Operation    Qty    Unit    Rate    Amount',
    ...(jobWork.issueLines.length
      ? jobWork.issueLines.map(
          (line) =>
            `${line.itemCode || '-'}    ${line.itemName || '-'}    ${line.workOperation || '-'}    ${line.quantity.toFixed(3)}    ${line.unit || 'PCS'}    ${formatCurrency(line.rate)}    ${formatCurrency(line.amount)}`,
        )
      : [`-    -    -    1.000    PCS    ${formatCurrency(0)}    ${formatCurrency(0)}`]),
    '',
    `Subtotal: ${formatCurrency(jobWork.totalValue)}`,
    `Grand Total: ${formatCurrency(jobWork.totalValue)}`,
  ];

  const content = [
    'BT',
    '/F1 12 Tf',
    '50 790 Td',
    ...lines.flatMap((line, index) => [
      index === 0 ? '' : '0 -18 Td',
      `(${line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj`,
    ]),
    'ET',
  ]
    .filter(Boolean)
    .join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

const downloadJobWorkPdf = (jobWork: JobWork): void => {
  const url = URL.createObjectURL(createPdfBlob(jobWork));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${jobWork.jobWorkNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

function JobWorkDocument({ jobWork }: { jobWork: JobWork }) {
  const lines = jobWork.issueLines.length
    ? jobWork.issueLines
    : [
        {
          id: 'empty-line',
          itemCode: '',
          itemName: '',
          workOperation: '',
          quantity: 1,
          unit: 'PCS',
          rate: 0,
          discount: 0,
          amount: 0,
          total: 0,
          remarks: '',
        },
      ];

  return (
    <div
      id="job-work-print-area"
      className="mx-auto w-full max-w-[1010px] border border-slate-300 bg-white text-black print:max-w-none"
    >
      <div className="flex items-center justify-between border-b border-slate-300 px-7 py-4">
        <div className="flex items-center gap-5">
          <div className="flex h-[72px] w-36 items-center justify-center rounded-[4px] border border-slate-200 bg-slate-100 text-xs text-slate-400">
            No Logo
          </div>
          <div className="text-lg font-bold">Global Loom Textiles Pvt Ltd</div>
        </div>
        <div className="text-right text-xs">
          <div className="text-slate-600">GSTIN</div>
          <div className="font-bold">27AAAAA0000A1Z5</div>
        </div>
      </div>

      <div className="border-b border-slate-300 bg-slate-50 py-4 text-center text-2xl font-bold">
        JOB WORK ORDER
      </div>

      <div className="px-7 py-7">
        <div className="mb-9 flex items-start justify-between border-b border-emerald-300 pb-9">
          <span
            className={`rounded-full border px-3 py-1 text-sm font-bold ${jobWork.status === 'issued' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-300 bg-slate-100 text-slate-900'}`}
          >
            {jobWork.status === 'issued' ? 'ISSUED' : 'DRAFT'}
          </span>
          <div className="text-right text-sm">
            <div>
              <span className="text-slate-600">JW #: </span>
              <span className="font-bold">{jobWork.jobWorkNumber}</span>
            </div>
            <div>
              <span className="text-slate-600">Date: </span>
              <span>{formatDisplayDate(jobWork.issueDate)}</span>
            </div>
          </div>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-7">
          <div className="rounded-[4px] border border-slate-200 p-5">
            <h3 className="border-b border-slate-100 pb-2 text-sm font-bold text-emerald-600">
              JOB WORKER
            </h3>
            <p className="pt-4 text-lg font-bold">
              {jobWork.jobWorkerName === 'No job worker' ? 'N/A' : jobWork.jobWorkerName}
            </p>
          </div>
          <div className="rounded-[4px] border border-slate-200 p-5">
            <h3 className="border-b border-slate-100 pb-2 text-sm font-bold text-emerald-600">
              ORDER DETAILS
            </h3>
            <p className="pt-4 text-base text-slate-600">
              Duration:{' '}
              {jobWork.expectedReturnDate
                ? `${formatDisplayDate(jobWork.issueDate)} - ${formatDisplayDate(jobWork.expectedReturnDate)}`
                : '-'}
            </p>
          </div>
        </div>

        <section className="mb-7">
          <h3 className="mb-3 text-sm font-bold tracking-wide text-emerald-600">ISSUE LINES</h3>
          <div className="overflow-hidden rounded-[4px] border border-slate-200">
            <div className="grid grid-cols-[1fr_1.7fr_1.5fr_0.8fr_0.8fr_1fr_1.1fr] bg-slate-50 text-xs font-bold text-slate-700">
              <div className="px-4 py-3">Item Code</div>
              <div className="px-4 py-3">Description</div>
              <div className="px-4 py-3">Operation</div>
              <div className="px-4 py-3 text-right">Qty</div>
              <div className="px-4 py-3 text-center">Unit</div>
              <div className="px-4 py-3 text-right">Rate</div>
              <div className="px-4 py-3 text-right">Amount</div>
            </div>
            {lines.map((line) => (
              <div
                key={line.id}
                className="grid grid-cols-[1fr_1.7fr_1.5fr_0.8fr_0.8fr_1fr_1.1fr] border-t border-slate-200 text-sm"
              >
                <div className="px-4 py-3">{line.itemCode || '-'}</div>
                <div className="px-4 py-3">{line.itemName || '-'}</div>
                <div className="px-4 py-3">{line.workOperation || '-'}</div>
                <div className="px-4 py-3 text-right">{line.quantity.toFixed(3)}</div>
                <div className="px-4 py-3 text-center">{line.unit || 'PCS'}</div>
                <div className="px-4 py-3 text-right">{formatCurrency(line.rate)}</div>
                <div className="px-4 py-3 text-right font-bold">{formatCurrency(line.amount)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h3 className="mb-3 text-sm font-bold tracking-wide text-emerald-600">SUMMARY</h3>
          <div className="ml-auto w-[360px] space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span>{formatCurrency(jobWork.totalValue)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-300 pb-2">
              <span className="text-slate-600">Taxable Amount</span>
              <span>{formatCurrency(jobWork.totalValue)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>
              <span className="text-emerald-600">{formatCurrency(jobWork.totalValue)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Balance Payable</span>
              <span className="text-orange-500">{formatCurrency(0)}</span>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="mb-3 text-sm font-bold tracking-wide text-emerald-600">
            TRANSACTION TIMELINE
          </h3>
          <div className="space-y-3 text-xs">
            {jobWork.timeline.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="rounded-[4px] border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                    {entry.label}
                  </span>
                  <span>{entry.message}</span>
                </div>
                <span className="text-slate-400">{formatDisplayDate(entry.date)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-between border-t border-slate-300 bg-slate-50 px-7 py-3 text-[10px] text-slate-700">
        <span>
          Plot No. 45, Textile Hub, Near Gateway Industrial Estate, Fort, Mumbai, Maharashtra,
          400001, India
        </span>
        <span>kushi@mailinator.com&nbsp;&nbsp;&nbsp;+91 9820012345</span>
      </div>
    </div>
  );
}

function JobWorkDetail({
  jobWork,
  onEdit,
  onIssue,
  onDelete,
  onPrint,
  onPdf,
}: {
  jobWork: JobWork;
  onEdit: () => void;
  onIssue: () => void;
  onDelete: () => void;
  onPrint: () => void;
  onPdf: () => void;
}) {
  const isIssued = jobWork.status === 'issued';

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
      <div className="flex h-[66px] items-center justify-between border-b border-slate-200 bg-white px-5 print:hidden">
        <h2 className="text-base font-semibold text-black">{jobWork.jobWorkNumber}</h2>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs ${isIssued ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}
          >
            {isIssued ? 'Issued' : 'Draft'}
          </span>
          {isIssued ? (
            <>
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-[6px] border-emerald-200 px-4 text-sm font-semibold text-emerald-700"
              >
                <Package className="h-4 w-4" />
                Receive Material
              </Button>
              <Button
                variant="outline"
                disabled
                className="h-10 gap-2 rounded-[6px] border-slate-200 px-4 text-sm font-semibold"
              >
                Mark as Completed
              </Button>
              <div className="h-7 w-px bg-slate-200" />
              <Button
                variant="ghost"
                className="h-10 gap-2 rounded-[6px] px-4 text-sm font-semibold text-emerald-700"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
              <Button
                variant="ghost"
                className="h-10 gap-2 rounded-[6px] px-4 text-sm font-semibold text-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Pay
              </Button>
            </>
          ) : (
            <>
              <div className="h-7 w-px bg-slate-200" />
              <Button
                variant="outline"
                onClick={onEdit}
                className="h-10 gap-2 rounded-[6px] border-slate-200 px-4 text-sm font-semibold text-black"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={onIssue}
                className="h-10 gap-2 rounded-[6px] border-slate-200 px-4 text-sm font-semibold text-blue-600"
              >
                <Send className="h-4 w-4" />
                Issue
              </Button>
              <Button
                variant="outline"
                onClick={onDelete}
                className="h-10 gap-2 rounded-[6px] border-slate-200 px-4 text-sm font-semibold text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
          <div className="h-7 w-px bg-slate-200" />
          <Button
            variant="outline"
            onClick={onPrint}
            className="h-10 gap-2 rounded-[6px] border-slate-200 px-4 text-sm font-semibold text-black"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={onPdf}
            className="h-10 gap-2 rounded-[6px] border-slate-200 px-4 text-sm font-semibold text-black"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {isIssued && (
        <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-5 py-2 text-xs text-emerald-900 print:hidden">
          <div className="flex items-center gap-5">
            <span>Total: {formatCurrency(jobWork.totalValue)}</span>
            <span>Paid: {formatCurrency(0)}</span>
            <span>Balance: {formatCurrency(jobWork.totalValue)}</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-12 py-5 print:overflow-visible print:px-0 print:py-0">
        <JobWorkDocument jobWork={jobWork} />
      </div>
    </div>
  );
}

export default function JobWorkPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJW, setSelectedJW] = useState<JobWork | null>(null);
  const [jobWorks, setJobWorks] = useState<JobWork[]>([]);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingJobWork, setEditingJobWork] = useState<JobWork | null>(null);
  const [jobWorkToDelete, setJobWorkToDelete] = useState<JobWork | null>(null);

  const filteredJWs = useMemo(() => {
    if (!searchQuery.trim()) return jobWorks;
    const query = searchQuery.toLowerCase();
    return jobWorks.filter(
      (jw) =>
        jw.jobWorkNumber.toLowerCase().includes(query) ||
        jw.jobWorkerName.toLowerCase().includes(query),
    );
  }, [jobWorks, searchQuery]);

  const nextJobWorkNumber = useMemo(() => getNextJobWorkNumber(jobWorks), [jobWorks]);
  const activeFormInitialData =
    formMode === 'edit' && editingJobWork
      ? jobWorkToFormValues(editingJobWork)
      : { jobWorkNumber: nextJobWorkNumber };

  const handleCreateNew = () => {
    setFormMode('create');
    setEditingJobWork(null);
    setSelectedJW(null);
  };

  const handleCancelForm = () => {
    setFormMode(null);
    setEditingJobWork(null);
  };

  const buildSavedJobWork = (data: JobWorkFormValues, existing?: JobWork): JobWork => {
    const lineTotal = data.issueLines.reduce(
      (sum: number, line: JobWorkIssueLine) => sum + line.amount,
      0,
    );
    const totalValue = lineTotal - lineTotal * (data.overallDiscount / 100);
    const createdEntry = {
      id: `timeline_created_${existing?.id ?? Date.now()}`,
      label: 'CREATED',
      message: `Job Work ${data.jobWorkNumber} created`,
      date: data.issueDate,
    };

    return {
      id: existing?.id ?? `job_work_${Date.now()}`,
      jobWorkNumber: data.jobWorkNumber,
      jobWorkType: data.jobWorkType,
      issueDate: data.issueDate,
      expectedReturnDate: data.expectedReturnDate,
      jobWorker: data.jobWorker,
      jobWorkerName: getJobWorkerLabel(data.jobWorker),
      jobWorkerAddress: data.jobWorkerAddress || getJobWorkerAddress(data.jobWorker),
      issueTime: data.issueTime,
      status: existing?.status ?? 'draft',
      totalValue,
      currency: 'INR',
      overallDiscount: data.overallDiscount,
      issueLines: data.issueLines.map((line: JobWorkIssueLine) => ({
        id: line.id,
        itemCode: line.itemCode,
        itemName: line.itemName,
        workOperation: line.workOperation,
        quantity: line.quantity,
        unit: line.unit,
        rate: line.rate,
        discount: line.discount,
        amount: line.amount,
        total: line.total,
        remarks: line.remarks,
      })),
      remarks: data.remarks,
      timeline: existing
        ? [
            {
              id: `timeline_updated_${Date.now()}`,
              label: 'UPDATED',
              message: 'Job Work order updated',
              date: getToday(),
            },
            ...existing.timeline,
          ]
        : [createdEntry],
    };
  };

  const handleSave = (data: JobWorkFormValues) => {
    const savedJobWork = buildSavedJobWork(
      data,
      formMode === 'edit' ? (editingJobWork ?? undefined) : undefined,
    );

    setJobWorks((prev) => {
      if (formMode === 'edit') {
        return prev.map((jobWork) => (jobWork.id === savedJobWork.id ? savedJobWork : jobWork));
      }

      return [savedJobWork, ...prev];
    });
    setSelectedJW(savedJobWork);
    setFormMode(null);
    setEditingJobWork(null);
  };

  const handleEdit = (jobWork: JobWork) => {
    setEditingJobWork(jobWork);
    setFormMode('edit');
    setSelectedJW(null);
  };

  const handleIssue = (jobWork: JobWork) => {
    const issuedJobWork: JobWork = {
      ...jobWork,
      status: 'issued',
      timeline: [
        {
          id: `timeline_issued_${Date.now()}`,
          label: 'STATUS CHANGED',
          message: 'Status changed from draft to issued',
          date: getToday(),
        },
        ...jobWork.timeline,
      ],
    };

    setJobWorks((prev) => prev.map((item) => (item.id === jobWork.id ? issuedJobWork : item)));
    setSelectedJW(issuedJobWork);
    toast('Success', {
      description: 'Job Work order issued',
      position: 'top-right',
    });
  };

  const handleConfirmDelete = () => {
    if (!jobWorkToDelete) return;

    setJobWorks((prev) => prev.filter((jobWork) => jobWork.id !== jobWorkToDelete.id));
    if (selectedJW?.id === jobWorkToDelete.id) {
      setSelectedJW(null);
    }
    setJobWorkToDelete(null);
    toast('Success', {
      description: 'Job Work order deleted',
      position: 'top-right',
    });
  };

  const hasJobWorks = jobWorks.length > 0;

  return (
    <div className="flex h-full">
      <div className="flex w-[360px] flex-col border-r border-gray-200 bg-white print:hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Wrench className="size-5 text-blue-600" />
            <h1 className="text-base font-semibold text-gray-900">Job Work</h1>
          </div>
          <Button
            onClick={handleCreateNew}
            className="h-9 gap-2 rounded-[6px] bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="size-4" />
            New
          </Button>
        </div>

        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search job work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-[6px] border-gray-200 bg-white pl-10 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!hasJobWorks ? (
            <div className="flex h-full flex-col items-center justify-center px-6">
              <Wrench className="size-10 text-gray-300" />
              <p className="mt-4 text-center text-sm font-medium text-gray-600">
                No job work orders yet
              </p>
              <p className="mt-1 text-center text-xs text-gray-400">
                Create your first job work order
              </p>
            </div>
          ) : filteredJWs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-12">
              <p className="text-center text-sm text-muted-foreground">
                No job work orders found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                {jobWorks.length} {jobWorks.length === 1 ? 'order' : 'orders'}
              </p>
              {filteredJWs.map((jw) => (
                <button
                  key={jw.id}
                  onClick={() => {
                    setSelectedJW(jw);
                    setFormMode(null);
                    setEditingJobWork(null);
                  }}
                  className={`w-full rounded-[8px] border px-3 py-3 text-left transition-colors ${
                    selectedJW?.id === jw.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-black">{jw.jobWorkerName}</p>
                      <p className="mt-2 text-sm text-slate-600">{jw.jobWorkNumber}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {formatDisplayDate(jw.issueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${jw.status === 'issued' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {jw.status === 'issued' ? 'Issued' : 'Draft'}
                      </span>
                      <p className="mt-3 text-sm font-bold text-black">
                        {formatCurrency(jw.totalValue)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-50 print:block print:overflow-visible print:bg-white">
        {formMode ? (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1010px] px-6 py-6 pb-20">
              <JobWorkForm
                key={formMode === 'edit' ? editingJobWork?.id : nextJobWorkNumber}
                initialData={activeFormInitialData}
                title={
                  formMode === 'edit' && editingJobWork
                    ? `Edit ${editingJobWork.jobWorkNumber}`
                    : 'New Job Work Order'
                }
                successDescription={
                  formMode === 'edit' ? 'Job Work order updated' : 'Job Work order created'
                }
                onSave={handleSave}
                onCancel={handleCancelForm}
              />
            </div>
          </div>
        ) : selectedJW ? (
          <JobWorkDetail
            jobWork={selectedJW}
            onEdit={() => handleEdit(selectedJW)}
            onIssue={() => handleIssue(selectedJW)}
            onDelete={() => setJobWorkToDelete(selectedJW)}
            onPrint={() => window.print()}
            onPdf={() => downloadJobWorkPdf(selectedJW)}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6">
            <Wrench className="size-12 text-gray-300" />
            <p className="mt-4 text-center text-sm font-medium text-gray-500">
              Select a Job Work order to view details
            </p>
            <p className="text-center text-xs text-gray-400">or create a new one</p>
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(jobWorkToDelete)}
        onOpenChange={(open) => !open && setJobWorkToDelete(null)}
      >
        <DialogContent className="max-w-[512px] rounded-[8px] border-0 bg-white p-6 shadow-xl">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-xl font-semibold text-slate-950">
              Delete Job Work Order
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-600">
              Are you sure you want to permanently delete this draft job work order?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-[6px] px-5"
              onClick={() => setJobWorkToDelete(null)}
            >
              Keep
            </Button>
            <Button
              className="h-10 rounded-[6px] bg-red-500 px-5 text-white hover:bg-red-600"
              onClick={handleConfirmDelete}
            >
              Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
