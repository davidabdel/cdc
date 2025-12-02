import React, { useState } from 'react';
import { INITIAL_DATA } from './constants';
import { ChecklistCategory, ComplianceStatus, FileUpload, ProjectMetadata } from './types';
import { ProgressBar } from './components/ui/ProgressBar';
import { ChecklistSection } from './components/ChecklistSection';
import { AIChat } from './components/AIChat';
import { FileUploader } from './components/FileUploader';
import { ResultPage } from './components/ResultPage';
import { analyzeChecklistWithDocuments } from './services/geminiService';
import { ShieldCheck, Download, Waves, Box, ChevronRight, RotateCcw, FileCheck } from 'lucide-react';

const SPA_EXCLUDED_IDS = ['coping_height', 'decking_height', 'excavation', 'landscaped_area'];

type ProjectType = 'POOL' | 'SPA';

export default function App() {
  const [categories, setCategories] = useState<ChecklistCategory[]>(INITIAL_DATA);
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResultPage, setShowResultPage] = useState(false);
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Derive visible categories based on project type
  const visibleCategories = React.useMemo(() => {
    if (projectType === 'POOL') return categories;
    if (projectType === 'SPA') {
      return categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item => !SPA_EXCLUDED_IDS.includes(item.id))
      })).filter(cat => cat.items.length > 0);
    }
    return [];
  }, [categories, projectType]);

  const updateItemStatus = (itemId: string, newStatus: ComplianceStatus) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    })));
  };

  const updateItemNotes = (itemId: string, newNotes: string) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(item => 
        item.id === itemId ? { ...item, notes: newNotes } : item
      )
    })));
  };

  const handleDocumentAnalysis = async (files: FileUpload[]) => {
    setIsAnalyzing(true);
    try {
      // Pass the visible structure to the AI
      const response = await analyzeChecklistWithDocuments(files, visibleCategories);
      
      if (response) {
        // Update Metadata
        if (response.metadata) {
          setMetadata(response.metadata);
        }

        // Update Checklist Items
        if (response.results && response.results.length > 0) {
          setCategories(prev => prev.map(cat => ({
            ...cat,
            items: cat.items.map(item => {
              const result = response.results.find(r => r.id === item.id);
              if (result) {
                return {
                  ...item,
                  status: result.status,
                  notes: result.notes
                };
              }
              return item;
            })
          })));
        }
      }
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze documents. Please ensure your API key is valid.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
      const dataStr = JSON.stringify({ metadata, categories: visibleCategories }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `cdc-checklist-${projectType?.toLowerCase() || 'export'}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
  };

  // Logic to determine if "CDC Approved" report is available
  // Requirements: 
  // 1. sec_10_7_complying_dev = COMPLIANT
  // 2. sec_10_7_bushfire = COMPLIANT
  // 3. lot_size_normal = COMPLIANT
  // 4. zoning_check = COMPLIANT
  // 5. flood_info = COMPLIANT
  
  const canShowApprovalReport = React.useMemo(() => {
    const findStatus = (id: string) => {
        for (const cat of visibleCategories) {
            const item = cat.items.find(i => i.id === id);
            if (item) return item.status;
        }
        return ComplianceStatus.PENDING;
    };

    const criteria = [
        'sec_10_7_complying_dev',
        'sec_10_7_bushfire',
        'lot_size_normal',
        'zoning_check',
        'flood_info'
    ];

    return criteria.every(id => findStatus(id) === ComplianceStatus.COMPLIANT);
  }, [visibleCategories]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1914') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-indigo-100 p-4 rounded-full">
               <ShieldCheck size={40} className="text-indigo-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
            <p className="text-gray-500 text-center">Please enter the access code to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Enter access code"
                autoFocus
              />
              {loginError && (
                <p className="text-red-500 text-sm mt-2 ml-1">Incorrect access code. Please try again.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Selection Screen
  if (!projectType) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="bg-indigo-100 p-4 rounded-full">
               <ShieldCheck size={48} className="text-indigo-700" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Sydney CDC Compliance Check</h1>
            <p className="text-xl text-gray-600 max-w-lg mx-auto">
              Select your project type to generate a tailored compliance checklist for NSW Complying Development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 w-full">
            <button 
              onClick={() => setProjectType('POOL')}
              className="group relative flex flex-col items-center px-8 pt-8 pb-20 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-indigo-600 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Waves size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pool / Inground Spa</h3>
              <p className="text-gray-500 text-center">
                Standard swimming pools, inground spas, and associated excavation works.
              </p>
              <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 font-medium flex items-center gap-1">
                Start Assessment <ChevronRight size={16} />
              </div>
            </button>

            <button 
              onClick={() => setProjectType('SPA')}
              className="group relative flex flex-col items-center px-8 pt-8 pb-20 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-indigo-600 hover:shadow-xl transition-all duration-300"
            >
               <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Box size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Above Ground Spa / Swim Spa</h3>
              <p className="text-gray-500 text-center">
                Portable or fixed above-ground units with minimal excavation requirements.
              </p>
               <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 font-medium flex items-center gap-1">
                Start Assessment <ChevronRight size={16} />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result Page
  if (showResultPage) {
    return (
      <ResultPage 
        categories={visibleCategories} 
        projectType={projectType} 
        onBack={() => setShowResultPage(false)} 
        metadata={metadata}
      />
    );
  }

  // Main Application
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700">
            <ShieldCheck size={28} className="stroke-2" />
            <h1 className="text-xl font-extrabold tracking-tight hidden sm:block">Sydney CDC Compliance Check</h1>
            <h1 className="text-xl font-extrabold tracking-tight sm:hidden">Sydney CDC Check</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100">
                {projectType === 'POOL' ? <Waves size={14} /> : <Box size={14} />}
                {projectType === 'POOL' ? 'Pool / Inground' : 'Above Ground Spa'}
             </div>

            <button 
                onClick={() => setProjectType(null)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Change Project Type"
            >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
            </button>

            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Preliminary Assessment</h2>
            <p className="text-gray-600">
              Verify compliance for <strong>{projectType === 'POOL' ? 'Swimming Pools & Inground Spas' : 'Above Ground Spas & Swim Spas'}</strong> against NSW standards.
            </p>
          </div>
          
          {canShowApprovalReport && (
              <button 
                onClick={() => setShowResultPage(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 font-bold flex items-center gap-2 animate-bounce-slow transition-all transform hover:scale-105"
              >
                  <FileCheck size={20} />
                  View Approval Report
              </button>
          )}
        </div>
        
        <FileUploader onAnalyze={handleDocumentAnalysis} isAnalyzing={isAnalyzing} />

        {/* Progress */}
        <ProgressBar categories={visibleCategories} />

        {/* Checklist */}
        <div className="space-y-6">
          {visibleCategories.map(category => (
            <ChecklistSection 
              key={category.id} 
              category={category} 
              onUpdateStatus={updateItemStatus}
              onUpdateNotes={updateItemNotes}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-8 py-6 text-center text-xs text-gray-400">
        <p>Disclaimer: This tool is for preliminary assessment only. Always consult a qualified professional.</p>
      </footer>

      {/* AI Assistant */}
      <AIChat />
    </div>
  );
}