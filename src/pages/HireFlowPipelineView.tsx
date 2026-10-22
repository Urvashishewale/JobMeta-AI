import React, { useState, useEffect } from 'react';
import {
  Users,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Award,
  Clock,
  Sparkles,
  FileText,
  Mail,
  Phone,
  Trash2,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { CandidateRecord, CandidateStatus } from '../types/jobmate';
import { ResumeUploadModal } from '../components/ResumeUploadModal';
import { CandidateDetailModal } from '../components/CandidateDetailModal';

export const HireFlowPipelineView: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [stats, setStats] = useState(() => storageService.getCandidateStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [scoreFilter, setScoreFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'score-desc' | 'score-asc' | 'date-desc' | 'name-asc'>('score-desc');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);

  // Reload data
  const refreshData = () => {
    setCandidates(storageService.getCandidates());
    setStats(storageService.getCandidateStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Update candidate status
  const handleUpdateStatus = (id: string, status: CandidateStatus) => {
    const updated = storageService.updateCandidateStatus(id, status);
    if (updated && selectedCandidate?.id === id) {
      setSelectedCandidate(updated);
    }
    refreshData();
  };

  // Delete candidate
  const handleDeleteCandidate = (id: string) => {
    storageService.deleteCandidate(id);
    if (selectedCandidate?.id === id) {
      setSelectedCandidate(null);
    }
    refreshData();
  };

  // Filtered and sorted candidates
  const filteredCandidates = candidates
    .filter((c) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesRole = c.targetRole.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        const matchesSkill = c.skills?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesRole && !matchesEmail && !matchesSkill) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'All' && c.status !== statusFilter) {
        return false;
      }

      // Score filter
      if (scoreFilter === 'high' && c.matchScore < 80) return false;
      if (scoreFilter === 'moderate' && (c.matchScore < 60 || c.matchScore >= 80)) return false;
      if (scoreFilter === 'low' && c.matchScore >= 60) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score-desc') return b.matchScore - a.matchScore;
      if (sortBy === 'score-asc') return a.matchScore - b.matchScore;
      if (sortBy === 'date-desc') return b.uploadedAt - a.uploadedAt;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

  const getScoreBadge = (score: number) => {
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

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 p-6 sm:p-8 border border-blue-500/20 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HireFlow — AI-Powered Resume Screening & Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Candidate Pipeline & Analytics
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Screen, evaluate, and rank PDF resumes against target job descriptions. Extract verified skills, calculate transparent match scores, and track recruitment stages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-indigo-600/25 flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF Resumes</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Screened</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalCandidates}</div>
          <span className="text-[11px] text-slate-500">PDF resumes parsed</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Shortlisted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.shortlistedCount}</div>
          <span className="text-[11px] text-slate-500">Top talent flagged</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Avg Match Score</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">{stats.averageMatchScore}%</div>
          <span className="text-[11px] text-slate-500">Benchmark coverage</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">High Match (80%+)</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">{stats.highMatchCount}</div>
          <span className="text-[11px] text-slate-500">Exemplary profiles</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Under Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stats.underReviewCount}</div>
          <span className="text-[11px] text-slate-500">Active evaluation queue</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate name, role, email, or skill (e.g. React, Python, SQL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="New">Status: New</option>
              <option value="Under Review">Status: Under Review</option>
              <option value="Shortlisted">Status: Shortlisted</option>
              <option value="Reviewed">Status: Reviewed</option>
              <option value="Rejected">Status: Rejected</option>
            </select>
          </div>

          {/* Score filter */}
          <div className="relative">
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Scores</option>
              <option value="high">Score: 80%+ (High)</option>
              <option value="moderate">Score: 60-79% (Moderate)</option>
              <option value="low">Score: &lt;60% (Low)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              <option value="score-desc">Sort: Highest Match</option>
              <option value="score-asc">Sort: Lowest Match</option>
              <option value="date-desc">Sort: Most Recent</option>
              <option value="name-asc">Sort: Name (A-Z)</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'All' || scoreFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setScoreFilter('All');
              }}
              className="p-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700"
              title="Reset filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map((candidate) => {
            const dateStr = new Date(candidate.uploadedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={candidate.id}
                className="rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 p-5 flex flex-col justify-between transition-all hover:shadow-xl group"
              >
                <div className="space-y-4">
                  {/* Top card row: Score + Info + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-sm border shrink-0 ${getScoreBadge(
                          candidate.matchScore
                        )}`}
                      >
                        <span>{candidate.matchScore}%</span>
                        <span className="text-[8px] uppercase tracking-wider font-semibold opacity-80">Match</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                          {candidate.name}
                        </h3>
                        <p className="text-xs text-indigo-400 font-medium">{candidate.targetRole}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getStatusBadge(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </div>

                  {/* Contact Info preview */}
                  <div className="text-xs text-slate-400 space-y-1">
                    {candidate.email && candidate.email !== 'Not provided in resume' && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                    )}
                    {candidate.phone && candidate.phone !== 'Not provided in resume' && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{candidate.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Summary preview */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {candidate.summary}
                  </p>

                  {/* Skills badges */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Top Matched Skills:</span>
                      <span className="text-emerald-400 font-semibold">{candidate.matchedSkills.length} matched</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {candidate.matchedSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/50 border border-emerald-500/20 text-emerald-300"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                      {candidate.matchedSkills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 bg-slate-800">
                          +{candidate.matchedSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Metadata & Action buttons */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{candidate.fileName}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Dossier</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete Candidate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-12 text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">
              {candidates.length === 0 ? 'No Candidates Screened Yet' : 'No Candidates Match Your Filters'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {candidates.length === 0
                ? 'Upload your first batch of PDF resumes to automatically extract candidate competencies, calculate precision match scores, and track your hiring pipeline.'
                : 'Try adjusting your search query, status dropdown, or match score filters to find candidates.'}
            </p>
          </div>

          {candidates.length === 0 ? (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-indigo-600/20 inline-flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload First PDF Resume</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setScoreFilter('All');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 hover:bg-indigo-900/50"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Pipeline Skills Intelligence Overview */}
      {stats.topSkills && stats.topSkills.length > 0 && (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pipeline Skills Intelligence</h3>
              <p className="text-xs text-slate-400">Aggregate competencies and frequent skill gaps across your screened candidates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Most Prevalent Candidate Skills
              </span>
              <div className="space-y-2">
                {stats.topSkills.map((sk) => (
                  <div key={sk.name} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">{sk.name}</span>
                    <span className="text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                      {sk.count} candidate{sk.count === 1 ? '' : 's'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Most Frequent Skill Gaps
              </span>
              <div className="space-y-2">
                {stats.topMissingSkills.map((ms) => (
                  <div key={ms.name} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">{ms.name}</span>
                    <span className="text-amber-400 font-mono font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20">
                      Missing in {ms.count} candidate{ms.count === 1 ? '' : 's'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(newCandidates) => {
          refreshData();
          if (newCandidates.length === 1) {
            setSelectedCandidate(newCandidates[0]);
          }
        }}
      />

      {/* Candidate Detail Dossier Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteCandidate}
        />
      )}
    </div>
  );
};
