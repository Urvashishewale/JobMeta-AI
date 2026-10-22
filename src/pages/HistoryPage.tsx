import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  Calendar,
  Layers,
  Award,
  BookOpen,
  Search,
  Filter,
  AlertTriangle,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { InterviewSessionRecord } from '../types/jobmate';

interface HistoryPageProps {
  onViewReport: (session: any) => void;
  onStartNewInterview: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onViewReport,
  onStartNewInterview,
}) => {
  const [sessions, setSessions] = useState<InterviewSessionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showClearModal, setShowClearModal] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  useEffect(() => {
    setSessions(storageService.getSessions());
  }, []);

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.deleteSession(id);
    setSessions(storageService.getSessions());
    setDeleteCandidateId(null);
  };

  const handleClearAll = () => {
    storageService.clearAllSessions();
    setSessions([]);
    setShowClearModal(false);
  };

  // Unique roles for filter dropdown
  const uniqueRoles = ['All', ...Array.from(new Set(sessions.map((s) => s.config.targetRole)))];

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.config.targetRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.config.interviewType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || s.config.targetRole === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Practice Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interview History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            All practice sessions and AI feedback reports are stored locally in your browser.
          </p>
        </div>

        {sessions.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClearModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              onClick={onStartNewInterview}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>New Interview</span>
            </button>
          </div>
        )}
      </div>

      {sessions.length > 0 ? (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search past sessions by role or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => {
                const score = session.overallScore;
                const scoreBadge =
                  score >= 80
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : score >= 60
                    ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

                return (
                  <div
                    key={session.id}
                    onClick={() => onViewReport(session)}
                    className="p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border shrink-0 ${scoreBadge}`}
                      >
                        {score}%
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                            {session.config.targetRole}
                          </h3>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {session.config.experienceLevel}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {session.config.interviewType}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(session.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span>{session.questionsCompleted} Qs answered</span>
                          <span>•</span>
                          <span className="capitalize">{session.config.language}</span>
                          <span>•</span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            {session.mode === 'voice' ? 'Voice Mode' : 'Written / Typed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReport(session);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Reopen Report</span>
                      </button>

                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        title="Delete Session"
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
                <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium">No matching sessions found</p>
                <p className="text-xs text-slate-500 mt-1">Try modifying your filter or search keywords.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
          <History className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">No Saved Interviews Yet</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-6">
            Whenever you complete a mock interview, your evaluations, scores, and model answers will be saved here.
          </p>
          <button
            onClick={onStartNewInterview}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 transition-all hover:scale-105"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Your First Interview</span>
          </button>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Clear All Interview History?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              This action cannot be undone. All {sessions.length} saved mock interview reports and evaluations stored in your browser's local memory will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors"
              >
                Permanently Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
