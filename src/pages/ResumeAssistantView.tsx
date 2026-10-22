import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
  ArrowRight,
  Briefcase,
  Copy,
  Check,
  Loader2,
  Trash2,
  Eye,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';
import { CandidateRecord, ResumeAnalysisResult } from '../types/jobmate';
import { CandidateDetailModal } from '../components/CandidateDetailModal';

export const ResumeAssistantView: React.FC = () => {
  const [inputMode, setInputMode] = useState<'pdf' | 'text'>('pdf');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active analyzed candidate
  const [currentCandidate, setCurrentCandidate] = useState<CandidateRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const candidates = storageService.getCandidates();
    if (candidates.length > 0) {
      setCurrentCandidate(candidates[0]);
    }
  }, []);

  // Strict client-side PDF validation
  const validatePdfFile = (file: File): { isValid: boolean; error?: string } => {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const isPdfExt = ext === '.pdf';
    const isPdfMime = file.type === 'application/pdf' || file.type === 'application/x-pdf' || file.type === '';

    if (!isPdfExt || (!isPdfMime && file.type !== '')) {
      return {
        isValid: false,
        error: `Please upload a valid PDF resume. "${file.name}" is not a PDF file. Text (.txt), Markdown (.md), Word (.docx), and other formats are strictly rejected.`,
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
        error: `File "${file.name}" exceeds the 15MB limit. Please upload a PDF under 15MB.`,
      };
    }

    return { isValid: true };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      setErrorMsg(validation.error!);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
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
    setErrorMsg(null);
    setSuccessMsg(null);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      setErrorMsg(validation.error!);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (inputMode === 'pdf') {
      if (!selectedFile) {
        setErrorMsg('Please select a valid PDF resume (.pdf) to upload.');
        return;
      }

      setIsLoading(true);

      try {
        const response = await apiService.uploadAndAnalyzeResumes(
          [selectedFile],
          targetRole.trim(),
          jobDescription.trim() || undefined
        );

        if (response.candidate) {
          const saved = storageService.saveCandidate(response.candidate);
          setCurrentCandidate(saved);
          setSuccessMsg(`Successfully analyzed "${selectedFile.name}" with a ${saved.matchScore}% role match score!`);
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          throw new Error('Resume analysis failed: No candidate profile was returned.');
        }
      } catch (err: any) {
        console.error('PDF upload analysis failed:', err);
        setErrorMsg(err.message || 'Resume analysis failed. Please ensure the file is a valid, readable PDF document.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Manual text mode fallback
      if (!resumeText.trim()) {
        setErrorMsg('Please enter or paste your resume content.');
        return;
      }

      setIsLoading(true);

      try {
        const response = await apiService.improveResume(
          resumeText.trim(),
          targetRole.trim(),
          jobDescription.trim() || undefined
        );

        const res = response.result;
        // Transform to candidate format for local consistency
        const newCandidate: CandidateRecord = {
          id: res.id || `cand-${Date.now()}`,
          name: 'Manual Entry Candidate',
          email: 'Provided in text',
          phone: '',
          targetRole,
          matchScore: res.overallResumeScore || 75,
          status: 'New',
          skills: res.detectedSkills || [],
          matchedSkills: res.jdMatchingKeywords || [],
          missingSkills: res.missingJdKeywords || [],
          experienceYears: 1,
          workExperience: [],
          education: [],
          projects: [],
          certifications: [],
          summary: res.groundedProfessionalSummary || 'Text entry evaluated.',
          bulletPointRevisions: res.bulletPointRevisions || [],
          completenessScore: 80,
          actionableSuggestions: res.improvementAreas || [],
          rawExtractedText: resumeText.slice(0, 2000),
          fileName: 'Manual Text Submission',
          fileSize: `${Math.round(resumeText.length / 1024)} KB`,
          uploadedAt: Date.now(),
        };

        const saved = storageService.saveCandidate(newCandidate);
        setCurrentCandidate(saved);
        setSuccessMsg('Resume text successfully analyzed and saved to your candidates pipeline.');
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to analyze resume text. Please check your network.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopySummary = () => {
    if (currentCandidate?.summary) {
      navigator.clipboard.writeText(currentCandidate.summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HireFlow Resume Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-400" />
            <span>PDF Resume Screening & Audit</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload PDF resumes for automated skill extraction, JD keyword alignment, bullet point optimization, and candidate scoring.
          </p>
        </div>

        {/* Input Mode Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => {
              setInputMode('pdf');
              setErrorMsg(null);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              inputMode === 'pdf'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF (.pdf only)</span>
          </button>
          <button
            onClick={() => {
              setInputMode('text');
              setErrorMsg(null);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              inputMode === 'text'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text Fallback</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMsg}</div>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1 leading-relaxed font-medium">{successMsg}</div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Target Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Role to Evaluate Against</span>
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Software Developer">Software Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Software Tester">Software Tester / QA</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Full Stack Engineer">Full Stack Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Frontend Developer">Frontend Developer</option>
            </select>
          </div>

          {/* Job Description (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Job Description Context (Optional)</span>
              </span>
              <span className="text-[10px] text-slate-500">For keyword matching</span>
            </label>
            <textarea
              placeholder="Paste job description requirements to identify matched and missing keywords..."
              rows={2}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Input Mode 1: PDF Upload Only */}
        {inputMode === 'pdf' ? (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-950/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7" />
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                {selectedFile ? selectedFile.name : 'Choose or Drop PDF Resume'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {selectedFile
                  ? `Selected: ${(selectedFile.size / 1024).toFixed(0)} KB. Click "Audit & Analyze Resume" below.`
                  : 'Strictly accepts PDF files (.pdf) up to 15MB. Non-PDF formats are automatically rejected.'}
              </p>

              <div className="flex items-center justify-center gap-2 mt-4 text-[11px]">
                <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-semibold">
                  ✓ PDF ONLY (.pdf)
                </span>
                <span className="px-2.5 py-1 rounded bg-rose-950/40 border border-rose-500/20 text-rose-400 line-through">
                  TXT / MD / DOC
                </span>
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-white font-medium truncate">{selectedFile.name}</span>
                  <span className="text-slate-500 font-mono">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Input Mode 2: Manual Text Fallback */
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Paste Resume Plain Text (Fallback Mode)
            </label>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the plain text of the resume here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-y"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Validates binary PDF headers and runs text extraction without hallucinations.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || (inputMode === 'pdf' ? !selectedFile : !resumeText.trim())}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting & Analyzing PDF...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Audit & Analyze Resume</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Latest Analysis Results Dossier Card */}
      {currentCandidate && (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-xl border shrink-0 ${
                  currentCandidate.matchScore >= 80
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                    : 'text-blue-400 bg-blue-950/60 border-blue-500/30'
                }`}
              >
                <span>{currentCandidate.matchScore}%</span>
                <span className="text-[9px] font-semibold tracking-wider uppercase opacity-80">Match</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-white">{currentCandidate.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {currentCandidate.status}
                  </span>
                </div>
                <p className="text-xs text-indigo-400 font-medium mt-0.5">{currentCandidate.targetRole}</p>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                  <span>File: {currentCandidate.fileName}</span>
                  <span>•</span>
                  <span>Size: {currentCandidate.fileSize}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Eye className="w-4 h-4" />
              <span>Open Candidate Dossier</span>
            </button>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Grounded Professional Summary
              </span>
              <button
                onClick={handleCopySummary}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{currentCandidate.summary}</p>
          </div>

          {/* Matched vs Missing Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({currentCandidate.matchedSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentCandidate.matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Missing Role Keywords ({currentCandidate.missingSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentCandidate.missingSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-950/60 border border-amber-500/30 text-amber-300"
                  >
                    ✕ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bullet Point Revisions */}
          {currentCandidate.bulletPointRevisions && currentCandidate.bulletPointRevisions.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>High-Impact Bullet Point Transformations</span>
              </h4>

              <div className="space-y-3">
                {currentCandidate.bulletPointRevisions.map((rev, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs text-rose-300 bg-rose-950/20 p-2 rounded-xl border border-rose-500/20">
                      <strong>Before:</strong> "{rev.original}"
                    </div>
                    <div className="text-xs text-emerald-200 bg-emerald-950/30 p-2 rounded-xl border border-emerald-500/30 font-medium">
                      <strong>After:</strong> "{rev.improved || rev.revised}"
                    </div>
                    <div className="text-[11px] text-slate-400 italic">
                      Why: {rev.reason || rev.impactImprovement}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Candidate Dossier Modal */}
      {showDetailModal && currentCandidate && (
        <CandidateDetailModal
          candidate={currentCandidate}
          onClose={() => setShowDetailModal(false)}
          onUpdateStatus={(id, status) => {
            const updated = storageService.updateCandidateStatus(id, status);
            if (updated) setCurrentCandidate(updated);
          }}
          onDelete={(id) => {
            storageService.deleteCandidate(id);
            setCurrentCandidate(null);
            setShowDetailModal(false);
          }}
        />
      )}
    </div>
  );
};
