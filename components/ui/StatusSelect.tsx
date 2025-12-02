import React from 'react';
import { ComplianceStatus } from '../../types';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, MinusCircle } from 'lucide-react';

interface StatusSelectProps {
  value: ComplianceStatus;
  onChange: (status: ComplianceStatus) => void;
}

const statusConfig = {
  [ComplianceStatus.PENDING]: { label: 'Pending', color: 'text-gray-400', bg: 'bg-gray-100', icon: HelpCircle },
  [ComplianceStatus.COMPLIANT]: { label: 'Compliant', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
  [ComplianceStatus.NON_COMPLIANT]: { label: 'Non-Compliant', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
  [ComplianceStatus.NEEDS_CONSULTATION]: { label: 'Consult', color: 'text-amber-600', bg: 'bg-amber-100', icon: AlertTriangle },
  [ComplianceStatus.NOT_APPLICABLE]: { label: 'N/A', color: 'text-blue-600', bg: 'bg-blue-100', icon: MinusCircle },
};

export const StatusSelect: React.FC<StatusSelectProps> = ({ value, onChange }) => {
  const CurrentConfig = statusConfig[value];
  const Icon = CurrentConfig.icon;

  return (
    <div className="relative inline-block w-40">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ComplianceStatus)}
        className={`w-full appearance-none pl-9 pr-8 py-2 text-sm font-medium rounded-lg border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 cursor-pointer ${CurrentConfig.bg} ${CurrentConfig.color}`}
      >
        {Object.values(ComplianceStatus).map((status) => (
          <option key={status} value={status}>
            {statusConfig[status].label}
          </option>
        ))}
      </select>
      <div className="absolute left-2.5 top-2.5 pointer-events-none">
        <Icon size={16} className={CurrentConfig.color} />
      </div>
      <div className="absolute right-2.5 top-3 pointer-events-none text-gray-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};