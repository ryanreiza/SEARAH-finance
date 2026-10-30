import React from 'react';
import { AllocationStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, AlertOctagon } from 'lucide-react';

interface BadgeStatusProps {
  status: AllocationStatus;
  customLabel?: string;
  className?: string;
}

export const BadgeStatus: React.FC<BadgeStatusProps> = ({ status, customLabel, className = '' }) => {
  switch (status) {
    case 'in_progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          {customLabel || 'Sedang Proses'}
        </span>
      );
    case 'approaching_limit':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {customLabel || 'Mendekati Batas'}
        </span>
      );
    case 'achieved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {customLabel || 'Target Tercapai'}
        </span>
      );
    case 'exceeded':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          {customLabel || 'Melebihi Target'}
        </span>
      );
    default:
      return null;
  }
};
