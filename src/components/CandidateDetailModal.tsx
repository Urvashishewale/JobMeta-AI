import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Layers,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  FolderGit2,
  ExternalLink,
} from 'lucide-react';
import { CandidateRecord, CandidateStatus } from '../types/jobmate';

interface CandidateDetailModalProps {
  candidate: CandidateRecord;
  onClose: () => void;
  onUpdateStatus: (id: string, status: CandidateStatus) => void;
  onDelete: (id: string) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onUpdateStatus,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'match' | 'experience' | 'education' | 'revisions' | 'rawText'>('match');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopy = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
    if (score >= 60) return 'text-blue-400 bg-blue-950/60 border-blue-500/30';
    return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
  };

  const getStatusBadge = (status: CandidateStatus) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'Under Review':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'Reviewed':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-xl border shrink-0 ${getScoreColor(
                candidate.matchScore
              )}`}
            >
              <span>{candidate.matchScore}%</span>
              <span className="text-[9px] font-semibold tracking-wider uppercase opacity-80">Match</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{candidate.name}</h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getStatusBadge(candidate.status)}`}>
                  {candidate.status}
                </span>
              </div>
              <p className="text-xs text-indigo-400 font-medium mt-0.5">{candidate.targetRole}</p>

              {/* Contact strip */}
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                {candidate.email && candidate.email !== 'Not provided in resume' && (
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <a href={`mailto:${candidate.email}`} className="underline">
                      {candidate.email}
                    </a>
                    <button
                      onClick={() => handleCopy(candidate.email, 'email')}
                      className="p-1 hover:text-indigo-400"
                      title="Copy email"
                    >
                      {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </span>
                )}
                {candidate.phone && candidate.phone !== 'Not provided in resume' && (
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <a href={`tel:${candidate.phone}`}>{candidate.phone}</a>
                    <button
                      onClick={() => handleCopy(candidate.phone, 'phone')}
                      className="p-1 hover:text-indigo-400"
                      title="Copy phone"
                    >
                      {copiedPhone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <FileText className="w-3 h-3" />
                  <span>{candidate.fileName}</span>
                  <span>({candidate.fileSize})</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Status Selector */}
            <div className="relative">
              <select
                value={candidate.status}
                onChange={(e) => onUpdateStatus(candidate.id, e.target.value as CandidateStatus)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                <option value="New">Status: New</option>
                <option value="Under Review">Status: Under Review</option>
                <option value="Shortlisted">Status: Shortlisted</option>
                <option value="Reviewed">Status: Reviewed</option>
                <option value="Rejected">Status: Rejected</option>
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
              title="Print Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-950/30 border border-slate-700 hover:border-rose-500/30 transition-colors"
              title="Delete Candidate"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-800 bg-slate-950/30 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('match')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'match'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Match & Skills Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'experience'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Work & Projects</span>
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'education'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education & Certs</span>
          </button>
          <button
            onClick={() => setActiveTab('revisions')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'revisions'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Bullet Point Revisions</span>
          </button>
          <button
            onClick={() => setActiveTab('rawText')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'rawText'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Parsed PDF Text</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'match' && (
            <div className="space-y-6">
              {/* Grounded Summary */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Professional Assessment Summary
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">{candidate.summary}</p>
              </div>

              {/* Match Score & Completeness Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Role Match Score</span>
                    <span className="font-mono font-bold text-indigo-400">{candidate.matchScore}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${candidate.matchScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Calculated objectively against verified requirements for {candidate.targetRole}.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Resume Completeness</span>
                    <span className="font-mono font-bold text-emerald-400">{candidate.completenessScore}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${candidate.completenessScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Evaluates presence of contact info, education, skills, and quantifiable achievements.
                  </p>
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Matched Skills ({candidate.matchedSkills.length})
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.matchedSkills.length > 0 ? (
                      candidate.matchedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/70 border border-emerald-500/30 text-emerald-300"
                        >
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No exact target keywords detected yet.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Missing Role Keywords ({candidate.missingSkills.length})
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.missingSkills.length > 0 ? (
                      candidate.missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-950/70 border border-amber-500/30 text-amber-300"
                        >
                          ✕ {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium">
                        All core role keywords matched in resume!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* All Detected Skills */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  All Detected Skills in Document ({candidate.skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Suggestions */}
              {candidate.actionableSuggestions && candidate.actionableSuggestions.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Actionable Candidate Recommendations
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {candidate.actionableSuggestions.map((sug, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6">
              {/* Work Experience */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  <span>Work Experience & Internships</span>
                </h3>

                {candidate.workExperience && candidate.workExperience.length > 0 ? (
                  <div className="space-y-3">
                    {candidate.workExperience.map((exp, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                          <span className="text-xs text-slate-400">{exp.duration}</span>
                        </div>
                        <div className="text-xs font-medium text-indigo-300">{exp.company}</div>
                        {exp.details && exp.details.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pt-1">
                            {exp.details.map((d, dIdx) => (
                              <li key={dIdx}>{d}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                    No explicit prior work experience entries detected in PDF. Candidate appears to be a fresh graduate or entry-level applicant.
                  </div>
                )}
              </div>

              {/* Projects */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-blue-400" />
                  <span>Projects</span>
                </h3>

                {candidate.projects && candidate.projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {candidate.projects.map((proj, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <h4 className="text-xs font-bold text-white">{proj.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                        {proj.techStack && proj.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-400"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                    No structured project blocks were extracted.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              {/* Education */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>Academic Qualifications</span>
                </h3>

                {candidate.education && candidate.education.length > 0 ? (
                  <div className="space-y-3">
                    {candidate.education.map((edu, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-white">{edu.degree}</h4>
                          <span className="text-xs text-slate-400">{edu.year}</span>
                        </div>
                        <p className="text-xs text-indigo-300">{edu.institution}</p>
                        {edu.gpa && <p className="text-xs text-slate-400 font-mono">GPA / Score: {edu.gpa}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                    No academic degree entries found in document.
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Certifications</span>
                </h3>

                {candidate.certifications && candidate.certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {candidate.certifications.map((cert, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/50 border border-emerald-500/30 text-emerald-300"
                      >
                        🏅 {cert}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                    No third-party certifications explicitly listed.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'revisions' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
                <span className="font-bold">Resume Bullet Point Optimization Formula:</span> Action Verb + Specific Context + Quantified Metric outcome.
              </div>

              {candidate.bulletPointRevisions && candidate.bulletPointRevisions.length > 0 ? (
                <div className="space-y-4">
                  {candidate.bulletPointRevisions.map((rev, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Original Bullet Point:</span>
                        <p className="text-xs text-slate-300 bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-xl">
                          "{rev.original}"
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Improved High-Impact Revision:</span>
                        <p className="text-xs text-emerald-200 bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl font-medium">
                          "{rev.improved || rev.revised}"
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-400 italic">
                        <strong>Rationale:</strong> {rev.reason || rev.impactImprovement}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                  No bullet point revisions available.
                </div>
              )}
            </div>
          )}

          {activeTab === 'rawText' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">
                  Direct Text Extracted from Uploaded PDF ({candidate.rawExtractedText?.length || 0} characters)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Zero Hallucinations Verified
                </span>
              </div>
              <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
                {candidate.rawExtractedText || 'No text extracted.'}
              </pre>
            </div>
          )}
        </div>

        {/* Delete Confirmation Sub-Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white">Delete Candidate Record?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove <strong>{candidate.name}</strong> from your HireFlow pipeline? This cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(candidate.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500"
                >
                  Yes, Delete Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
