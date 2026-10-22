import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { InterviewRoom } from './InterviewRoom';
import { ReportPage } from './ReportPage';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';
import {
  InterviewQuestion,
  InterviewSetupConfig,
  CompletedInterviewItem,
  InterviewSessionRecord,
  ExperienceLevel,
  InterviewType,
  DifficultyLevel,
  InterviewLanguage,
} from '../types/jobmate';

export const VoiceInterviewView: React.FC = () => {
  const [stage, setStage] = useState<'config' | 'room' | 'report'>('config');

  // Config
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Fresher');
  const [interviewType, setInterviewType] = useState<InterviewType>('Mixed');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [language, setLanguage] = useState<InterviewLanguage>('English');
  const [speechOutput, setSpeechOutput] = useState<boolean>(true);

  // Active state
  const [activeConfig, setActiveConfig] = useState<InterviewSetupConfig | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [activeReportSession, setActiveReportSession] = useState<InterviewSessionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLaunchRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = isCustomRole ? customRoleInput.trim() : targetRole;
    if (!finalRole) {
      setErrorMsg('Please specify target job role.');
      return;
    }

    const config: InterviewSetupConfig = {
      targetRole: finalRole,
      isCustomRole,
      experienceLevel,
      interviewType,
      difficulty,
      questionCount,
      language,
      answerMode: 'voice',
      speechOutput,
    };

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiService.generateQuestions(config);
      if (!res.questions || res.questions.length === 0) {
        throw new Error('Failed to generate interview questions.');
      }
      setActiveConfig(config);
      setQuestions(res.questions as any);
      setStage('room');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not initialize voice room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishInterview = async (completedItems: any[]) => {
    if (!activeConfig) return;

    if (completedItems.length === 0) {
      setStage('config');
      return;
    }

    let totalScore = 0;
    let sumRel = 0;
    let sumTech = 0;
    let sumClar = 0;
    let sumEx = 0;
    let sumComm = 0;

    completedItems.forEach((it: any) => {
      const overall = it.evaluation?.scores?.overall || it.evaluation?.overallScore || 75;
      totalScore += overall;
      sumRel += it.evaluation?.scores?.relevance || overall;
      sumTech += it.evaluation?.scores?.technicalCorrectness || overall;
      sumClar += it.evaluation?.scores?.clarity || it.evaluation?.scores?.clarityAndStructure || overall;
      sumEx += it.evaluation?.scores?.specificExamples || overall;
      sumComm += it.evaluation?.scores?.communication || it.evaluation?.scores?.communicationQuality || overall;
    });

    const cnt = completedItems.length;
    const overallScore = Math.round(totalScore / cnt);

    const sessionRecord: InterviewSessionRecord = {
      id: `voice-sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      config: activeConfig,
      questionsCompleted: completedItems.length,
      totalQuestions: questions.length,
      overallScore,
      criteriaAverage: {
        relevance: Math.round(sumRel / cnt),
        technicalCorrectness: Math.round(sumTech / cnt),
        clarityAndStructure: Math.round(sumClar / cnt),
        specificExamples: Math.round(sumEx / cnt),
        communicationQuality: Math.round(sumComm / cnt),
      },
      items: completedItems,
      mode: 'voice',
      source: 'gemini',
      summaryReport: {
        strongestAnswer: `Question #${completedItems[0]?.question?.questionNumber}: "${completedItems[0]?.question?.text}"`,
        priorityImprovements: [
          'Maintain steady pacing during spoken explanations',
          'Quantify project results with metrics',
        ],
        recommendedTopics: [`${activeConfig.targetRole} Spoken Technical Recaps`],
        actionableNextSteps: ['Practice speaking with 60-second timer'],
        verdict: 'Constructive spoken practice session with good voice projection.',
      },
    };

    storageService.saveSession(sessionRecord);
    setActiveReportSession(sessionRecord);
    setStage('report');
  };

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fadeIn">
      {stage === 'config' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-blue-950/40 border border-slate-800">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <Mic className="w-3.5 h-3.5" />
              <span>Amazon Alexa+-Style Voice Room</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Live Voice Interview Setup</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Speak naturally into your microphone. The AI interviewer speaks questions aloud, transcribes your answers in real time with progressive interim text, and provides instant scoring.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLaunchRoom} className="space-y-5">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>1. Target Job Role</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Software Developer', 'Data Analyst', 'Software Tester', 'DevOps Engineer'].map(
                  (r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => {
                        setTargetRole(r);
                        setIsCustomRole(false);
                      }}
                      className={`p-3 rounded-xl text-xs sm:text-sm font-semibold border text-left transition-all ${
                        !isCustomRole && targetRole === r
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setIsCustomRole(true)}
                  className={`p-3 rounded-xl text-xs sm:text-sm font-semibold border text-left transition-all ${
                    isCustomRole
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                  }`}
                >
                  + Custom Role...
                </button>
              </div>

              {isCustomRole && (
                <input
                  type="text"
                  placeholder="Enter role title..."
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-indigo-500 text-white text-sm focus:outline-none"
                  autoFocus
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-white">Experience Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Fresher', 'Beginner', 'Intermediate'] as ExperienceLevel[]).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        experienceLevel === lvl
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-white">Round Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Mixed', 'Technical', 'HR', 'Behavioral'] as InterviewType[]).map((typ) => (
                    <button
                      type="button"
                      key={typ}
                      onClick={() => setInterviewType(typ)}
                      className={`py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        interviewType === typ
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {typ}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-white">Questions & Language</label>
                <div className="flex gap-2">
                  {[3, 5].map((cnt) => (
                    <button
                      type="button"
                      key={cnt}
                      onClick={() => setQuestionCount(cnt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        questionCount === cnt
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {cnt} Qs {cnt === 3 ? '(Quick)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-white">AI Spoken Voice Output</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSpeechOutput(true)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      speechOutput
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    Voice Audio ON
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeechOutput(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      !speechOutput
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    Silent
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Connecting Voice Room...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Launch Voice Interview Room</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {stage === 'room' && activeConfig && questions.length > 0 && (
        <InterviewRoom
          config={activeConfig as any}
          questions={questions as any}
          onFinishInterview={handleFinishInterview}
          onExitEarly={() => setStage('config')}
        />
      )}

      {stage === 'report' && activeReportSession && (
        <ReportPage
          session={activeReportSession as any}
          onRestartInterview={() => setStage('config')}
          onGoToDashboard={() => setStage('config')}
        />
      )}
    </div>
  );
};
