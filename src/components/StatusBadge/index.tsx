import { cn } from '@/lib/utils';
import type { CaseStatus, DisputeStatus, TransferStatus, AcceptanceStatus } from '@/types';
import { CASE_STATUS_LABELS } from '@/types';

interface StatusBadgeProps {
  status: CaseStatus | DisputeStatus | TransferStatus | AcceptanceStatus;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  verified: 'bg-blue-100 text-blue-700 border-blue-200',
  disputed: 'bg-orange-100 text-orange-700 border-orange-200',
  transferring: 'bg-purple-100 text-purple-700 border-purple-200',
  transferred: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  correction: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  merged: 'bg-gray-100 text-gray-500 border-gray-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  sent: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  received: 'bg-green-100 text-green-700 border-green-200',
};

const statusLabels: Record<string, string> = {
  ...CASE_STATUS_LABELS,
  processing: '处理中',
  resolved: '已解决',
  sent: '已推送',
  received: '已接收',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center border rounded font-medium',
        statusStyles[status] || 'bg-slate-100 text-slate-600 border-slate-200',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />
      {statusLabels[status] || status}
    </span>
  );
}
