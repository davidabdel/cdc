import React from 'react';
import { ChecklistCategory, ComplianceStatus, ProjectMetadata } from '../types';
import { CheckCircle, Printer, ArrowLeft, Building, Calendar, FileCheck, User, MapPin, Hash } from 'lucide-react';

interface ResultPageProps {
  categories: ChecklistCategory[];
  onBack: () => void;
  projectType: string;
  metadata?: ProjectMetadata | null;
}

export const ResultPage: React.FC<ResultPageProps> = ({ categories, onBack, projectType, metadata }) => {

  const handlePrint = () => {
    // Add a small timeout to ensure the browser processes the click before opening the dialog
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const currentDate = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate overall compliance
  const criticalChecks = [
    'sec_10_7_complying_dev',
    'sec_10_7_bushfire',
    'lot_size_normal',
    'zoning_check',
    'flood_info'
  ];

  const failedChecks = React.useMemo(() => {
    const failures: { id: string; text: string; reason: string }[] = [];

    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (criticalChecks.includes(item.id) && item.status !== ComplianceStatus.COMPLIANT) {
          failures.push({
            id: item.id,
            text: item.text,
            reason: item.notes || 'Requirement not met'
          });
        }
      });
    });

    return failures;
  }, [categories]);

  const isCompliant = failedChecks.length === 0;

  return (
    <div className="min-h-screen bg-white pb-20 print:pb-0">
      <style>{`
        @media print {
          @page { margin: 15mm; size: auto; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important;
          }
          .no-print, .print\\:hidden { display: none !important; }
          .break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>

      {/* Navigation - Hidden on Print */}
      <div className="bg-slate-900 text-white px-6 py-4 print:hidden sticky top-0 z-50 flex justify-between items-center shadow-md">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Checklist</span>
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Printer size={20} />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 print:px-0 print:py-0 print:max-w-none">

        {/* Report Header */}
        <div className="text-center mb-10 print:mb-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ring-8 ring-opacity-50 print:ring-0
            ${isCompliant ? 'bg-emerald-100 text-emerald-600 ring-emerald-50 print:bg-emerald-50' : 'bg-red-100 text-red-600 ring-red-50 print:bg-red-50'}`}>
            {isCompliant ? (
              <CheckCircle size={64} className="print:text-emerald-600" />
            ) : (
              <div className="text-6xl font-bold">X</div>
            )}
          </div>
          <h1 className={`text-4xl font-extrabold mb-2 tracking-tight ${isCompliant ? 'text-slate-900' : 'text-red-600'}`}>
            {isCompliant ? 'CDC APPROVED' : 'CDC NOT PASSED'}
          </h1>
          <p className="text-xl text-slate-500 font-medium">Preliminary Compliance Assessment</p>
        </div>

        {/* Customer / Project Details - Only show if metadata exists */}
        {metadata && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 break-inside-avoid print:border print:shadow-none">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              Project Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 print:bg-gray-100 print:text-black">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Owner Name</p>
                  <p className="text-sm font-bold text-gray-900">{metadata.ownerName || 'Not detected'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 print:bg-gray-100 print:text-black">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Property Address</p>
                  <p className="text-sm font-bold text-gray-900">{metadata.address || 'Not detected'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 print:bg-gray-100 print:text-black">
                  <Hash size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Lot / DP Details</p>
                  <p className="text-sm font-bold text-gray-900">{metadata.lotDp || 'Not detected'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 print:bg-gray-100 print:text-black">
                  <Building size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Project Type</p>
                  <p className="text-sm font-bold text-gray-900">
                    {projectType === 'POOL' ? 'Pool / Inground Spa' : 'Above Ground Spa'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 mb-10 shadow-sm print:bg-white print:border print:shadow-none break-inside-avoid">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assessment Date</p>
              <p className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-500 print:text-black" />
                {currentDate}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Result</p>
              <p className={`text-lg font-bold flex items-center gap-2 ${isCompliant ? 'text-emerald-600' : 'text-red-600'}`}>
                {isCompliant ? <FileCheck size={18} /> : <div className="font-bold">X</div>}
                {isCompliant ? 'Pass' : 'Fail'}
              </p>
            </div>
            <div>
              {/* Spacer or additional summary metric */}
            </div>
          </div>
        </div>

        {/* Failure Reasons - Only show if not compliant */}
        {!isCompliant && (
          <div className="mb-10 break-inside-avoid">
            <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2 pb-2 border-b border-red-100">
              <div className="font-bold text-2xl">!</div>
              Reasons for Failure
            </h3>
            <div className="grid gap-4">
              {failedChecks.map((fail) => (
                <div key={fail.id} className="flex items-start justify-between p-4 bg-red-50 rounded-lg border border-red-100 print:bg-white print:border-red-200">
                  <div>
                    <span className="font-bold text-red-900 block print:text-black">{fail.text}</span>
                    <span className="text-sm text-red-700 print:text-gray-600">{fail.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Checks - Only show if compliant (or maybe show passed ones?) */}
        {/* Actually, let's show them always, but style them differently if failed? */}
        {/* For now, let's keep the original Critical Checks section but maybe rename or adjust */}

        {isCompliant && (
          <div className="mb-10 break-inside-avoid">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
              <CheckCircle size={24} className="text-emerald-500 print:text-black" />
              Critical Gateway Checks Passed
            </h3>
            <div className="grid gap-4">
              <div className="flex items-start justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100 print:bg-white print:border-gray-300">
                <div>
                  <span className="font-bold text-emerald-900 block print:text-black">Complying Development Permitted</span>
                  <span className="text-sm text-emerald-700 print:text-gray-600">Confirmed via Section 10.7 Certificate</span>
                </div>
                <CheckCircle size={20} className="text-emerald-600 mt-1 print:text-black" />
              </div>
              <div className="flex items-start justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100 print:bg-white print:border-gray-300">
                <div>
                  <span className="font-bold text-emerald-900 block print:text-black">Not Bushfire Prone Land</span>
                  <span className="text-sm text-emerald-700 print:text-gray-600">Confirmed via Section 10.7 Certificate</span>
                </div>
                <CheckCircle size={20} className="text-emerald-600 mt-1 print:text-black" />
              </div>
            </div>
          </div>
        )}

        {/* Detailed Items Table */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b border-gray-100">
            Compliance Details
          </h3>

          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="break-inside-avoid">
                <h4 className="text-md font-bold text-indigo-700 mb-3 uppercase tracking-wide text-xs print:text-black">
                  {category.title}
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm print:shadow-none">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 print:bg-gray-100">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2 print:text-black">Requirement</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black">Notes / Evidence</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {category.items.map((item) => (
                        <tr key={item.id} className={item.status === ComplianceStatus.NOT_APPLICABLE ? 'bg-gray-50/50' : ''}>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            {item.text}
                            <div className="text-xs text-gray-400 font-normal mt-0.5">{item.subtext}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                              ${item.status === ComplianceStatus.COMPLIANT ? 'bg-green-100 text-green-800 border-green-200' :
                                item.status === ComplianceStatus.NOT_APPLICABLE ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                  item.status === ComplianceStatus.NEEDS_CONSULTATION ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                    'bg-red-100 text-red-800 border-red-200'}`}>
                              {item.status.replace('_', ' ').toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-pre-wrap">
                            {item.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 print:text-black">
          <p>© {new Date().getFullYear()} Sydney CDC Compliance Check. This document is a preliminary assessment only and does not constitute formal certification.</p>
        </div>
      </div>
    </div>
  );
};