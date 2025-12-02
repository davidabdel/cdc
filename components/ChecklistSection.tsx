import React from 'react';
import { ChecklistCategory, ChecklistItem, ComplianceStatus } from '../types';
import { StatusSelect } from './ui/StatusSelect';
import { ChevronDown, ChevronUp, FileText, Info } from 'lucide-react';

interface ChecklistSectionProps {
  category: ChecklistCategory;
  onUpdateStatus: (itemId: string, status: ComplianceStatus) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({ category, onUpdateStatus, onUpdateNotes }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  // Calculate section stats
  const total = category.items.length;
  const compliant = category.items.filter(i => i.status === ComplianceStatus.COMPLIANT).length;
  const issues = category.items.filter(i => i.status === ComplianceStatus.NON_COMPLIANT || i.status === ComplianceStatus.NEEDS_CONSULTATION).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 transition-all hover:shadow-md">
      <div 
        className="bg-gray-50 px-6 py-4 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${issues > 0 ? 'bg-red-100 text-red-600' : compliant === total ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                <FileText size={20} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-800">{category.title}</h2>
                <div className="text-xs text-gray-500 font-medium">
                    {compliant}/{total} Compliant {issues > 0 && <span className="text-red-500 font-bold ml-2">• {issues} Issues</span>}
                </div>
            </div>
        </div>
        {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
      </div>

      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {category.items.map((item) => (
            <div key={item.id} className="p-6 transition-colors hover:bg-gray-50/50">
              <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-gray-900">{item.text}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.subtext}</p>
                  
                  {/* Notes Input - Changed to Textarea for multi-line support */}
                  <div className="mt-2">
                    <textarea 
                      placeholder="Add notes or AI findings..." 
                      value={item.notes}
                      onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                      className="w-full text-sm bg-white border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none p-3 text-gray-700 placeholder-gray-400 transition-colors resize-y min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                   <StatusSelect 
                        value={item.status} 
                        onChange={(status) => onUpdateStatus(item.id, status)} 
                    />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};