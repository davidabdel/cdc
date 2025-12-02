import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { FileUpload } from '../types';

interface FileUploaderProps {
  onAnalyze: (files: FileUpload[]) => Promise<void>;
  isAnalyzing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onAnalyze, isAnalyzing }) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const processFile = (file: File): Promise<FileUpload> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve({
        name: file.name,
        type: file.type,
        data: reader.result as string
      });
      reader.onerror = error => reject(error);
    });
  };

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const processedFiles: FileUpload[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      // Basic validation for images and PDFs
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        try {
          const processed = await processFile(file);
          processedFiles.push(processed);
        } catch (e) {
          console.error("Error reading file", file.name);
        }
      }
    }
    setFiles(prev => [...prev, ...processedFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = async () => {
    if (files.length === 0) return;
    await onAnalyze(files);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Upload className="text-indigo-600" size={20} />
            AI Document Analysis
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload architectural plans, site surveys, or Section 10.7 certificates. 
            The AI will scan them to auto-fill the checklist below.
          </p>
          
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
            }`}
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              multiple 
              onChange={(e) => handleFiles(e.target.files)} 
              className="hidden" 
              id="file-upload"
              accept="application/pdf,image/*"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                <FileText size={24} />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-400">
                PDF, PNG, JPG (Max 10MB)
              </span>
            </label>
          </div>
        </div>

        {/* File List & Actions */}
        {(files.length > 0 || isAnalyzing) && (
          <div className="w-full md:w-80 shrink-0 bg-gray-50 rounded-lg p-4 border border-gray-200">
             <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">{files.length} Documents</span>
                <button 
                    onClick={() => setFiles([])} 
                    className="text-xs text-red-500 hover:text-red-700"
                    disabled={isAnalyzing}
                >
                    Clear All
                </button>
             </div>
             
             <div className="max-h-48 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
                {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                            <FileText size={14} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{file.name}</span>
                        </div>
                        {!isAnalyzing && (
                            <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-gray-600">
                                <X size={14} />
                            </button>
                        )}
                        {isAnalyzing && <Loader2 size={14} className="animate-spin text-indigo-500" />}
                    </div>
                ))}
             </div>

             <button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing || files.length === 0}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
             >
                {isAnalyzing ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <CheckCircle2 size={16} />
                        Auto-Fill Checklist
                    </>
                )}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};