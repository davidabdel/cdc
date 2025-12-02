import React from 'react';
import { ChecklistCategory, ComplianceStatus, ProjectMetadata } from '../types';
import { CheckCircle, Printer, ArrowLeft, Building, Calendar, FileCheck, User, MapPin, Hash, ShieldCheck } from 'lucide-react';

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
    <>
      <style>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important;
          }
          .no-print, .print\\:hidden { display: none !important; }
          .break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>

      {/* WEB LAYOUT - Hidden on Print */}
      <div className="min-h-screen bg-white pb-20 print:hidden">
        {/* Navigation */}
        <div className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-50 flex justify-between items-center shadow-md">
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

        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Report Header */}
          <div className="text-center mb-10">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ring-8 ring-opacity-50
              ${isCompliant ? 'bg-emerald-100 text-emerald-600 ring-emerald-50' : 'bg-red-100 text-red-600 ring-red-50'}`}>
              {isCompliant ? (
                <CheckCircle size={64} />
              ) : (
                <div className="text-6xl font-bold">X</div>
              )}
            </div>
            <h1 className={`text-4xl font-extrabold mb-2 tracking-tight ${isCompliant ? 'text-slate-900' : 'text-red-600'}`}>
              {isCompliant ? 'CDC APPROVED' : 'CDC NOT PASSED'}
            </h1>
            <p className="text-xl text-slate-500 font-medium">Preliminary Compliance Assessment</p>
          </div>

          {/* Customer / Project Details */}
          {metadata && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Project Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Owner Name</p>
                    <p className="text-sm font-bold text-gray-900">{metadata.ownerName || 'Not detected'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Property Address</p>
                    <p className="text-sm font-bold text-gray-900">{metadata.address || 'Not detected'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <Hash size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Lot / DP Details</p>
                    <p className="text-sm font-bold text-gray-900">{metadata.lotDp || 'Not detected'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
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
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 mb-10 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assessment Date</p>
                <p className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-500" />
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
            </div>
          </div>

          {/* Failure Reasons */}
          {!isCompliant && (
            <div className="mb-10">
              <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2 pb-2 border-b border-red-100">
                <div className="font-bold text-2xl">!</div>
                Reasons for Failure
              </h3>
              <div className="grid gap-4">
                {failedChecks.map((fail) => (
                  <div key={fail.id} className="flex items-start justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <span className="font-bold text-red-900 block">{fail.text}</span>
                      <span className="text-sm text-red-700">{fail.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Checks */}
          {isCompliant && (
            <div className="mb-10">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
                <CheckCircle size={24} className="text-emerald-500" />
                Critical Gateway Checks Passed
              </h3>
              <div className="grid gap-4">
                <div className="flex items-start justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div>
                    <span className="font-bold text-emerald-900 block">Complying Development Permitted</span>
                    <span className="text-sm text-emerald-700">Confirmed via Section 10.7 Certificate</span>
                  </div>
                  <CheckCircle size={20} className="text-emerald-600 mt-1" />
                </div>
                <div className="flex items-start justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div>
                    <span className="font-bold text-emerald-900 block">Not Bushfire Prone Land</span>
                    <span className="text-sm text-emerald-700">Confirmed via Section 10.7 Certificate</span>
                  </div>
                  <CheckCircle size={20} className="text-emerald-600 mt-1" />
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
                <div key={category.id}>
                  <h4 className="text-md font-bold text-indigo-700 mb-3 uppercase tracking-wide text-xs">
                    {category.title}
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Requirement</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes / Evidence</th>
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

          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
            <p>© {new Date().getFullYear()} Sydney CDC Compliance Check. This document is a preliminary assessment only and does not constitute formal certification.</p>
          </div>
        </div>
      </div>

      {/* PRINT LAYOUT - Visible ONLY on Print */}
      <div className="hidden print:block font-sans text-black bg-white p-0 m-0 w-full h-full">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck size={32} className="text-slate-900" />
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 leading-none">Sydney CDC Check</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Compliance Report</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">{currentDate}</p>
            <p className="text-xs text-slate-500">Generated on {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Top Section: Details & Result */}
        <div className="flex gap-6 mb-6">
          {/* Left: Project Details */}
          <div className="flex-1 border border-slate-300 rounded-lg p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Project Details</h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div>
                <span className="block text-slate-400">Owner</span>
                <span className="font-bold text-slate-900">{metadata?.ownerName || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-400">Address</span>
                <span className="font-bold text-slate-900 truncate">{metadata?.address || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-400">Lot / DP</span>
                <span className="font-bold text-slate-900">{metadata?.lotDp || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-400">Type</span>
                <span className="font-bold text-slate-900">{projectType === 'POOL' ? 'Pool / Inground' : 'Above Ground Spa'}</span>
              </div>
            </div>
          </div>

          {/* Right: Result */}
          <div className={`w-1/3 rounded-lg p-4 flex flex-col items-center justify-center border-2 
              ${isCompliant ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-red-50 border-red-500 text-red-800'}`}>
            {isCompliant ? <CheckCircle size={32} className="mb-2" /> : <div className="text-3xl font-bold mb-2">X</div>}
            <span className="text-xl font-extrabold uppercase tracking-tight">{isCompliant ? 'PASSED' : 'FAILED'}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-75">Preliminary Assessment</span>
          </div>
        </div>

        {/* Failed Reasons (if any) */}
        {!isCompliant && (
          <div className="mb-6 border border-red-200 bg-red-50 rounded-lg p-3">
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>!</span> Critical Failures
            </h3>
            <ul className="list-disc list-inside text-xs text-red-900 space-y-1">
              {failedChecks.map(fail => (
                <li key={fail.id}>
                  <span className="font-bold">{fail.text}:</span> {fail.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Compliance Details - Compact Table */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="break-inside-avoid">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 border-b-2 border-slate-100 pb-0.5">
                {category.title}
              </h4>
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-500">
                    <th className="text-left py-1 px-2 w-1/2 font-semibold">Requirement</th>
                    <th className="text-left py-1 px-2 w-1/6 font-semibold">Status</th>
                    <th className="text-left py-1 px-2 w-1/3 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {category.items.map((item) => (
                    <tr key={item.id} className={item.status === ComplianceStatus.NOT_APPLICABLE ? 'text-slate-400' : 'text-slate-800'}>
                      <td className="py-1 px-2 align-top">
                        <span className="font-semibold block">{item.text}</span>
                      </td>
                      <td className="py-1 px-2 align-top">
                        <span className={`inline-block px-1.5 rounded-sm font-bold uppercase text-[9px]
                                   ${item.status === ComplianceStatus.COMPLIANT ? 'bg-emerald-100 text-emerald-800' :
                            item.status === ComplianceStatus.NOT_APPLICABLE ? 'bg-slate-100 text-slate-500' :
                              item.status === ComplianceStatus.NEEDS_CONSULTATION ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'}`}>
                          {item.status === ComplianceStatus.COMPLIANT ? 'Pass' :
                            item.status === ComplianceStatus.NOT_APPLICABLE ? 'N/A' :
                              item.status === ComplianceStatus.NEEDS_CONSULTATION ? 'Check' : 'Fail'}
                        </span>
                      </td>
                      <td className="py-1 px-2 align-top italic text-slate-600">
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[9px] text-slate-400">
          <p>Disclaimer: This document is a preliminary assessment only and does not constitute a formal Complying Development Certificate. Please consult a professional certifier.</p>
          <p>© {new Date().getFullYear()} Sydney CDC Compliance Check</p>
        </div>
      </div>
    </>
  );
};