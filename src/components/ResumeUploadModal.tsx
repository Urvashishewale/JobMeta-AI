import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  Trash2,
  Layers,
  Briefcase,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';
import { CandidateRecord, JobRole } from '../types/jobmate';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidates: CandidateRecord[]) => void;
}

interface FileUploadItem {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  candidate?: CandidateRecord;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [targetRole, setTargetRole] = useState<string>('Software Developer');
  const [customRole, setCustomRole] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [fileList, setFileList] = useState<FileUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const effectiveRole = targetRole === 'Custom Role' && customRole.trim() ? customRole.trim() : targetRole;

  // Validate single file client-side (Strict PDF ONLY)
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const isPdfExt = ext === '.pdf';
    const isPdfMime = file.type === 'application/pdf' || file.type === 'application/x-pdf' || file.type === '';

    if (!isPdfExt || (!isPdfMime && file.type !== '')) {
      return {
        isValid: false,
        error: `Please upload a valid PDF resume. "${file.name}" is not a PDF file (rejected ${ext || 'file'}). Only .pdf files are accepted.`,
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: `Please upload a valid PDF resume. "${file.name}" is empty (0 bytes).`,
      };
    }

    if (file.size > 15 * 1024 * 1024) {
      return {
        isValid: false,
        error: `File "${file.name}" exceeds the 15MB maximum size limit.`,
      };
    }

    return { isValid: true };
  };

  const handleFilesAdded = (rawFiles: FileList | File[]) => {
    setGlobalError(null);
    const newItems: FileUploadItem[] = [];
    const errors: string[] = [];

    Array.from(rawFiles).forEach((file) => {
      // Check for duplicate in current selection list
      if (fileList.some((it) => it.file.name === file.name && it.file.size === file.size)) {
        return;
      }

      const validation = validateFile(file);
      if (!validation.isValid) {
        errors.push(validation.error!);
      } else {
        newItems.push({
          file,
          id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          status: 'pending',
        });
      }
    });

    if (errors.length > 0) {
      setGlobalError(errors.join(' '));
    }

    if (newItems.length > 0) {
      setFileList((prev) => [...prev, ...newItems]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFileList((prev) => prev.filter((it) => it.id !== id));
  };

  const handleStartAnalysis = async () => {
    if (fileList.length === 0) {
      setGlobalError('Please select at least one valid PDF resume to upload and analyze.');
      return;
    }

    setIsProcessing(true);
    setGlobalError(null);

    const pendingItems = fileList.filter((it) => it.status !== 'success');
    const successfulCandidates: CandidateRecord[] = [];

    // Mark items as uploading
    setFileList((prev) =>
      prev.map((it) => (it.status === 'pending' ? { ...it, status: 'uploading' } : it))
    );

    try {
      // Batch send files to the backend PDF analysis route
      const filesToSend = pendingItems.map((it) => it.file);
      const res = await apiService.uploadAndAnalyzeResumes(
        filesToSend,
        effectiveRole,
        jobDescription.trim() || undefined
      );

      const returnedCandidates = res.candidates || (res.candidate ? [res.candidate] : []);

      // Update state for each file and persist in localStorage
      returnedCandidates.forEach((candidate) => {
        const saved = storageService.saveCandidate(candidate);
        successfulCandidates.push(saved);
      });

      // Update file list status
      setFileList((prev) =>
        prev.map((it) => {
          const matched = returnedCandidates.find((c) => c.fileName === it.file.name);
          if (matched) {
            return { ...it, status: 'success', candidate: matched };
          }
          const matchedError = res.errors?.find((e) => e.fileName === it.file.name);
          if (matchedError) {
            return { ...it, status: 'error', errorMessage: matchedError.error };
          }
          return { ...it, status: 'success' };
        })
      );

      if (res.errors && res.errors.length > 0) {
        setGlobalError(`Some files had issues: ${res.errors.map((e) => e.error).join(' | ')}`);
      }

      if (successfulCandidates.length > 0) {
        setTimeout(() => {
          onSuccess(successfulCandidates);
          handleClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      const msg = err.message || 'Resume analysis failed. Please check that you uploaded a valid PDF document.';
      setGlobalError(msg);
      setFileList((prev) =>
        prev.map((it) => (it.status === 'uploading' ? { ...it, status: 'error', errorMessage: msg } : it))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setFileList([]);
    setGlobalError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Upload PDF Resumes</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PDF ONLY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Single or batch PDF screening with automated text extraction and skill gap analysis
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 disabled:opacity-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{globalError}</div>
          </div>
        )}

        {/* Target Role & Job Description Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Job Role</span>
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Software Developer">Software Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Software Tester">Software Tester / QA</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Full Stack Engineer">Full Stack Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Custom Role">Custom Role...</option>
            </select>
            {targetRole === 'Custom Role' && (
              <input
                type="text"
                placeholder="e.g. Cloud Security Architect"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Job Description (Optional)</span>
              </span>
              <span className="text-[10px] text-slate-500">For keyword matching</span>
            </label>
            <textarea
              placeholder="Paste job description or key requirements here to calculate precision match scores..."
              rows={2}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={(e) => {
              if (e.target.files) handleFilesAdded(e.target.files);
            }}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-bold text-white mb-1">
            Drag & Drop PDF Resumes Here, or <span className="text-indigo-400 underline">Browse</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Strictly accepts <strong className="text-white">PDF format (.pdf)</strong> up to 15MB each.
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-semibold">
              ✓ Validated .PDF
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/20 text-rose-400 font-semibold line-through">
              TXT / MD / DOC
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Bulk Upload Supported
            </span>
          </div>
        </div>

        {/* Selected Files List */}
        {fileList.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 px-1">
              <span>Selected Resumes ({fileList.length})</span>
              <button
                onClick={() => setFileList([])}
                disabled={isProcessing}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
              >
                Clear all
              </button>
            </div>

            {fileList.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-medium text-white truncate block">{item.file.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {(item.file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'pending' && (
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Ready
                    </span>
                  )}
                  {item.status === 'uploading' && (
                    <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Analyzing...
                    </span>
                  )}
                  {item.status === 'success' && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Analyzed ({item.candidate?.matchScore || 80}%)
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1" title={item.errorMessage}>
                      <AlertCircle className="w-3 h-3" />
                      Failed
                    </span>
                  )}

                  {!isProcessing && (
                    <button
                      onClick={() => removeFile(item.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Server validates binary PDF magic headers (`%PDF-`) and extracts text without OCR hallucinations.</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleStartAnalysis}
              disabled={fileList.length === 0 || isProcessing}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Resumes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze {fileList.length} Resume{fileList.length === 1 ? '' : 's'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
