import React from 'react';
import { ChecklistCategory, ComplianceStatus } from '../../types';

interface ProgressBarProps {
  categories: ChecklistCategory[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ categories }) => {
  const allItems = categories.flatMap(c => c.items);
  const total = allItems.length;
  const compliant = allItems.filter(i => i.status === ComplianceStatus.COMPLIANT).length;
  const nonCompliant = allItems.filter(i => i.status === ComplianceStatus.NON_COMPLIANT).length;
  const consult = allItems.filter(i => i.status === ComplianceStatus.NEEDS_CONSULTATION).length;
  const na = allItems.filter(i => i.status === ComplianceStatus.NOT_APPLICABLE).length;

  // We exclude N/A from the denominator for a clearer "Progress" metric, 
  // or we can count N/A as "done". Let's count N/A as done.
  const completed = compliant + na + nonCompliant + consult; // "Processed" items
  const percentage = Math.round((completed / total) * 100) || 0;
  
  // Specific compliant percentage for the bar color
  const successRate = total > 0 ? Math.round(((compliant + na) / total) * 100) : 0;

  return (
    <div className="w-full bg-white p-4 shadow-sm rounded-lg mb-6 sticky top-0 z-20 border-b border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Audit Progress</h3>
        <span className="text-sm font-bold text-indigo-600">{percentage}% Reviewed</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden flex">
        <div 
          className="bg-green-500 h-2.5 transition-all duration-500" 
          style={{ width: `${(compliant / total) * 100}%` }}
          title="Compliant"
        ></div>
        <div 
          className="bg-blue-300 h-2.5 transition-all duration-500" 
          style={{ width: `${(na / total) * 100}%` }}
           title="N/A"
        ></div>
        <div 
          className="bg-amber-400 h-2.5 transition-all duration-500" 
          style={{ width: `${(consult / total) * 100}%` }}
           title="Needs Consultation"
        ></div>
        <div 
          className="bg-red-500 h-2.5 transition-all duration-500" 
          style={{ width: `${(nonCompliant / total) * 100}%` }}
           title="Non-Compliant"
        ></div>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Compliant</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Issue</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div>Consult</div>
      </div>
    </div>
  );
};