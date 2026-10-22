import React, { useState, useEffect } from 'react';
import {
  PlayCircle,
  Mic,
  Languages,
  FileText,
  Compass,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Users,
  Upload,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { NavItemId, InterviewSessionRecord } from '../types/jobmate';

interface DashboardViewProps {
  onNavigate: (tab: NavItemId) => void;
  onViewSessionReport: (session: InterviewSessionRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onViewSessionReport,
}) => {
  const [stats, setStats] = useState(() => storageService.getAnalyticsSummary());
  const [candidateStats, setCandidateStats] = useState(() => storageService.getCandidateStats());

  useEffect(() => {
    setStats(storageService.getAnalyticsSummary());
    setCandidateStats(storageService.getCandidateStats());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const hasData = stats.totalSessions > 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 p-6 sm:p-8 border border-blue-500/20 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JobMate AI — Career & Voice Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {getGreeting()}, Job Seeker!
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Prepare for interviews, refine your spoken English, optimize your resume, and track your personalized career roadmap. What would you like to practice today?
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('mock-interview')}
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Start Mock Interview</span>
            </button>
            <button
              onClick={() => onNavigate('voice-interview')}
              className="px-5 py-3 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Mic className="w-4 h-4 text-indigo-400" />
              <span>Voice Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* HireFlow Recruitment Pipeline Quick Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">HireFlow Candidate Screening & Pipeline</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PDF ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {candidateStats.totalCandidates > 0
                ? `${candidateStats.totalCandidates} PDF resumes screened • ${candidateStats.shortlistedCount} shortlisted • ${candidateStats.averageMatchScore}% average role match score`
                : 'Upload PDF resumes to screen candidate competencies and track your hiring pipeline.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('candidates')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Open Pipeline</span>
          </button>
          <button
            onClick={() => onNavigate('resume-assistant')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Quick Action Hub: 5 Core Career Modules */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Core Career Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Mock Interview */}
          <div
            onClick={() => onNavigate('mock-interview')}
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PlayCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">
                AI Mock Interview
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Written Q&A with real-time rubric feedback and adaptive follow-up questions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
              <span>Launch Practice</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2: Live Voice Room */}
          <div
            onClick={() => onNavigate('voice-interview')}
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                Live Voice Room
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Simulated Alexa+ spoken mock interview with live speech-to-text transcription.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
              <span>Start Speaking</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3: English Practice */}
          <div
            onClick={() => onNavigate('english-coach')}
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Languages className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                English Coach
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Grammar corrections, natural phrasing, vocabulary, and interactive exercises.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
              <span>Practice English</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 4: Resume Assistant */}
          <div
            onClick={() => onNavigate('resume-assistant')}
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                Resume Intelligence
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Audit weak bullets, detect present skills, and check job description alignment.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
              <span>Audit Resume</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 5: Career Roadmap */}
          <div
            onClick={() => onNavigate('career-roadmap')}
            className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                Career Roadmap
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Personalized learning phases with interactive checkboxes and portfolio projects.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs text-violet-400 font-semibold group-hover:translate-x-1 transition-transform">
              <span>View Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Completed Interviews
            </span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{stats.totalSessions}</p>
          <p className="text-xs text-slate-400 mt-1">
            {hasData ? `${stats.totalQuestionsAnswered} questions answered` : 'No sessions recorded yet'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Average Rubric Score
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">
            {hasData ? `${stats.averageOverallScore}%` : '--'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {hasData ? 'Derived from transparent 5-point rubric' : 'Complete a session to evaluate score'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              English Practice Sentences
            </span>
            <Languages className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{stats.englishPracticesCount}</p>
          <p className="text-xs text-slate-400 mt-1">Sentences analyzed & corrected</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Roadmap Progress
            </span>
            <Compass className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{stats.roadmapProgress}%</p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.totalTasks > 0
              ? `${stats.completedTasks} of ${stats.totalTasks} learning tasks completed`
              : 'Create a roadmap to track milestones'}
          </p>
        </div>
      </div>

      {/* Main Content Layout: Recent Sessions + Coaching Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Practice Sessions */}
        <div className="lg:col-span-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Recent Interview Sessions</h3>
                <p className="text-xs text-slate-400">Past mock interviews stored locally in your browser</p>
              </div>
              {hasData && (
                <button
                  onClick={() => onNavigate('analytics')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  <span>View All Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {hasData ? (
              <div className="space-y-3">
                {stats.recentSessions.map((session) => {
                  const score = session.overallScore;
                  const scoreColor =
                    score >= 80
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                      : score >= 60
                      ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

                  const dateStr = new Date(session.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={session.id}
                      className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base border shrink-0 ${scoreColor}`}
                        >
                          {score}%
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-white text-sm">{session.config.targetRole}</h4>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {session.config.experienceLevel}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              {session.config.interviewType}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {dateStr}
                            </span>
                            <span>•</span>
                            <span>{session.questionsCompleted} of {session.totalQuestions} questions</span>
                            <span>•</span>
                            <span className="capitalize">{session.mode} Mode</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onViewSessionReport(session)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <PlayCircle className="w-7 h-7 text-blue-400" />
                </div>
                <h4 className="text-base font-semibold text-white mb-1">No Practice Sessions Yet</h4>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-5">
                  Launch your first mock interview to practice answering technical and HR questions.
                </p>
                <button
                  onClick={() => onNavigate('mock-interview')}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 inline-flex items-center gap-2 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Start First Interview</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recommended Focus & Motivation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Recommended Focus Areas</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {hasData
                ? 'Synthesized from frequent improvement points in your past evaluations:'
                : 'Key communication strategies every student and entry-level candidate should master:'}
            </p>

            <div className="space-y-3">
              {stats.frequentlyMissedSkills.map((skill, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-xs text-slate-200 font-medium">{skill}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Educational STAR Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20">
            <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              The STAR Interview Framework
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              When answering behavioral questions, structure your thoughts with <strong>Situation</strong> (the context), <strong>Task</strong> (your objective), <strong>Action</strong> (what you did), and <strong>Result</strong> (quantifiable impact).
            </p>
            <button
              onClick={() => onNavigate('mock-interview')}
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition-colors flex items-center justify-center gap-1.5"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Practice STAR Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
