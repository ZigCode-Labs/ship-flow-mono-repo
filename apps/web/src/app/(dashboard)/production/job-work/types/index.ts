export interface JobWork {
  id: string;
  jobWorkNumber: string;
  jobWorkType: string;
  issueDate: string;
  expectedReturnDate: string;
  jobWorker: string;
  jobWorkerName: string;
  jobWorkerAddress?: string;
  issueTime?: string;
  status: 'draft' | 'issued' | 'sent' | 'in_progress' | 'completed' | 'cancelled';
  totalValue: number;
  currency: string;
  overallDiscount?: number;
  issueLines: JobWorkIssueLine[];
  remarks?: string;
  timeline: JobWorkTimelineEntry[];
}

export interface JobWorkIssueLine {
  id: string;
  itemName: string;
  itemCode: string;
  workOperation: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  amount: number;
  total: number;
  remarks?: string;
}

export interface JobWorkTimelineEntry {
  id: string;
  label: string;
  message: string;
  date: string;
}

export type JobWorkStatus = JobWork['status'];

export const statusLabels: Record<JobWorkStatus, string> = {
  draft: 'Draft',
  issued: 'Issued',
  sent: 'Sent',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const statusColors: Record<JobWorkStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  issued: 'bg-blue-100 text-blue-700',
  sent: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

// Re-export form types
export * from './form';
