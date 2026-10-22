import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Printer,
  Download,
  Share2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { InterviewSessionRecord } from '../types/interview';

interface ReportPageProps {
  session: InterviewSessionRecord;
  onRestartInterview: () => void;
  onGoToDashboard: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  session,
  onRestartInterview,
  onGoToDashboard,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const { overallScore, categoryScores, summaryReport, items, config } = session;

  const scoreBadgeColor =
    overallScore >= 80
      ? 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40'
      : overallScore >= 60
      ? 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/40'
      : 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/40';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `JobMeta_Interview_Report_${config.targetRole.replace(/\s+/g, '_')}_${new Date(
        session.createdAt
      )
        .toISOString()
        .slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onGoToDashboard}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors mb-1"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interview Performance Report
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleDownloadJSON}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Report</span>
          </button>
        </div>
      </div>

      {/* Main Printable Card */}
      <div className="print-page bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Executive Score Summary */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-800">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JobMeta AI Official Assessment</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {config.targetRole} Mock Evaluation
            </h2>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {new Date(session.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Level: {config.experienceLevel}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                Type: {config.interviewType}
              </span>
              <span>•</span>
              <span>{session.questionsCompleted} of {session.totalQuestions} Questions Answered</span>
            </div>

            <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-xl">
              {summaryReport.verdict}
            </p>
          </div>

          {/* Large Radial Overall Score Card */}
          <div
            className={`w-44 h-44 rounded-3xl bg-gradient-to-br ${scoreBadgeColor} border flex flex-col items-center justify-center p-4 shadow-xl shrink-0`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
              Overall Score
            </span>
            <span className="text-5xl font-black tracking-tight my-1">{overallScore}%</span>
            <span className="text-xs font-medium text-center opacity-90">
              {overallScore >= 80 ? 'Interview Ready' : overallScore >= 60 ? 'Competitive' : 'Needs Practice'}
            </span>
          </div>
        </div>

        {/* 4 Rubric Metrics */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Rubric Category Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Relevance</span>
              <p className="text-2xl font-bold text-white mt-1">{categoryScores.relevance}%</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${categoryScores.relevance}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Clarity</span>
              <p className="text-2xl font-bold text-white mt-1">{categoryScores.clarity}%</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${categoryScores.clarity}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Completeness</span>
              <p className="text-2xl font-bold text-white mt-1">{categoryScores.completeness}%</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-violet-500 h-full rounded-full"
                  style={{ width: `${categoryScores.completeness}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400">Communication</span>
              <p className="text-2xl font-bold text-white mt-1">{categoryScores.communication}%</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${categoryScores.communication}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Executive Highlights Grid: Strongest Answer + Priority Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strongest Answer */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wide">
                Strongest Spoken Performance
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {summaryReport.strongestAnswer}
            </p>
          </div>

          {/* Priority Improvement Areas */}
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
                Priority Improvement Areas
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {summaryReport.priorityImprovementAreas.map((area, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Practice Topics & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Recommended Study Topics
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {summaryReport.recommendedTopics.map((topic, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold">✓</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Actionable Next Steps
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {summaryReport.actionableNextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-blue-400 font-bold">→</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Question-by-Question Breakdown */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Question-by-Question Evaluation ({items.length})
            </h3>
            <span className="text-xs text-slate-400">Click to expand details</span>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const isExpanded = expandedIndex === index;
              const qScore = item.evaluation.scores.overall;

              return (
                <div
                  key={item.question.id || index}
                  className="rounded-2xl bg-slate-950/60 border border-slate-800/80 overflow-hidden"
                >
                  {/* Accordion Header */}
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-white">
                          {item.question.text}
                        </p>
                        <span className="text-[11px] text-slate-400 uppercase font-mono mt-0.5 inline-block">
                          Category: {item.question.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          qScore >= 80
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : qScore >= 60
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {qScore}%
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-800/80 space-y-4 bg-slate-900/30">
                      {/* Candidate Answer */}
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">
                          Your Spoken Response:
                        </span>
                        <p className="mt-1 text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                          "{item.userAnswer}"
                        </p>
                      </div>

                      {/* Feedback Summary */}
                      <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                        <span className="text-[11px] font-semibold text-indigo-300 uppercase">
                          AI Evaluator Feedback:
                        </span>
                        <p className="mt-1 text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {item.evaluation.feedbackSummary}
                        </p>
                      </div>

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                          <span className="text-[11px] font-bold text-emerald-400 uppercase">
                            Strengths:
                          </span>
                          <ul className="mt-1 space-y-1 text-xs text-slate-300">
                            {item.evaluation.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20">
                          <span className="text-[11px] font-bold text-amber-400 uppercase">
                            Improvements:
                          </span>
                          <ul className="mt-1 space-y-1 text-xs text-slate-300">
                            {item.evaluation.areasToImprove.map((a, i) => (
                              <li key={i}>• {a}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Model Answer */}
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] font-semibold text-indigo-400 uppercase">
                          Exemplary Model Answer:
                        </span>
                        <p className="mt-1 text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {item.evaluation.betterAnswerExample}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 space-y-1">
          <p>
            Notice: All evaluations are generated from the text transcript of candidate speech. JobMeta AI does not analyze facial expressions, ocular movements, or vocal tone.
          </p>
          <p>
            JobMeta AI session scores are designed for personal interview practice and confidence training.
          </p>
        </div>
      </div>

      {/* Bottom Nav / Restart (hidden on print) */}
      <div className="no-print mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onGoToDashboard}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          Return to Dashboard
        </button>

        <button
          onClick={onRestartInterview}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Practice Another Mock Interview</span>
        </button>
      </div>
    </div>
  );
};
