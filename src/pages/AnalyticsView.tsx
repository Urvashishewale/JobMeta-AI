import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Award,
  TrendingUp,
  Layers,
  Calendar,
  AlertTriangle,
  Download,
  Trash2,
  BookOpen,
  ArrowRight,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { InterviewSessionRecord } from '../types/jobmate';

interface AnalyticsViewProps {
  onReopenSession: (session: InterviewSessionRecord) => void;
  onStartNewInterview: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onReopenSession,
  onStartNewInterview,
}) => {
  const [analytics, setAnalytics] = useState(() => storageService.getAnalyticsSummary());
  const [sessions, setSessions] = useState<InterviewSessionRecord[]>([]);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    setAnalytics(storageService.getAnalyticsSummary());
    setSessions(storageService.getSessions());
  }, []);

  const handleExportAll = () => {
    const allData = {
      interviewSessions: storageService.getSessions(),
      englishPractices: storageService.getEnglishPractices(),
      resumeAnalyses: storageService.getResumeAnalyses(),
      careerRoadmaps: storageService.getRoadmaps(),
      userSettings: storageService.getSettings(),
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `JobMate_AI_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const handleClearAll = () => {
    storageService.clearAllSessions();
    setAnalytics(storageService.getAnalyticsSummary());
    setSessions([]);
    setShowClearModal(false);
  };

  const hasSessions = analytics.totalSessions > 0;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Real Performance Analytics</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Your Career Readiness Metrics</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Aggregated purely from your genuine practice history stored in local browser memory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportAll}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export JSON</span>
          </button>
          {hasSessions && (
            <button
              onClick={() => setShowClearModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Sessions</span>
          <p className="text-3xl font-extrabold text-white mt-1">{analytics.totalSessions}</p>
          <p className="text-xs text-slate-500 mt-1">{analytics.totalQuestionsAnswered} questions completed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Average Rubric Score</span>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">
            {hasSessions ? `${analytics.averageOverallScore}%` : '--'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {hasSessions ? (analytics.averageOverallScore >= 80 ? 'Competitive' : 'Developing') : 'No evaluations yet'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">English Practice</span>
          <p className="text-3xl font-extrabold text-blue-400 mt-1">{analytics.englishPracticesCount}</p>
          <p className="text-xs text-slate-500 mt-1">Sentences analyzed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Roadmap Completion</span>
          <p className="text-3xl font-extrabold text-violet-400 mt-1">{analytics.roadmapProgress}%</p>
          <p className="text-xs text-slate-500 mt-1">{analytics.completedTasks} tasks finished</p>
        </div>
      </div>

      {/* Rubric Criteria Averages */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Average Performance by Rubric Criterion
        </h3>

        {hasSessions ? (
          <div className="space-y-3.5">
            {[
              { label: 'Relevance to Prompt', score: analytics.criteriaAverages.relevance, color: 'bg-blue-500' },
              { label: 'Technical Correctness', score: analytics.criteriaAverages.technicalCorrectness, color: 'bg-emerald-500' },
              { label: 'Clarity & Logical Structure', score: analytics.criteriaAverages.clarityAndStructure, color: 'bg-indigo-500' },
              { label: 'Specific Examples & Metrics', score: analytics.criteriaAverages.specificExamples, color: 'bg-amber-500' },
              { label: 'Communication Quality', score: analytics.criteriaAverages.communicationQuality, color: 'bg-violet-500' },
            ].map((crit, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{crit.label}</span>
                  <span className="text-white font-bold">{crit.score}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${crit.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${crit.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            Complete at least one mock interview or voice interview to calculate your criteria metrics.
          </div>
        )}
      </div>

      {/* Frequently Missed Skills & Action Plan */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Frequently Identified Improvement Themes
        </h3>
        <p className="text-xs text-slate-400">
          Synthesized from missing details and recommendations in past question evaluations:
        </p>

        <div className="space-y-2 pt-1">
          {analytics.frequentlyMissedSkills.map((sk, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200">
              <span className="text-amber-400 font-bold">•</span>
              <span>{sk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Session History Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Practice History Records ({sessions.length})
        </h3>

        {hasSessions ? (
          <div className="space-y-2.5">
            {sessions.map((sess) => {
              const score = sess.overallScore;
              const dateStr = new Date(sess.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl bg-slate-950/50 hover:bg-slate-800/40 border border-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                        score >= 80
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : score >= 60
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {score}%
                    </span>
                    <div>
                      <p className="font-bold text-white text-sm">{sess.config.targetRole}</p>
                      <p className="text-slate-400 text-[11px]">
                        {dateStr} • {sess.questionsCompleted} Qs • {sess.mode} mode
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onReopenSession(sess)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1 self-end sm:self-center"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Report</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No interview history records found.
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-base font-bold text-white">Clear All Local Practice History?</h4>
            </div>
            <p className="text-xs text-slate-300">
              This will permanently delete all {sessions.length} saved interview sessions and evaluations from your browser's LocalStorage. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500"
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
