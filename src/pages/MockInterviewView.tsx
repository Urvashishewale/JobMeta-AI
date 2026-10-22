import React, { useState, useEffect } from 'react';
import {
  FileQuestion,
  PlayCircle,
  RotateCcw,
  SkipForward,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Briefcase,
  GraduationCap,
  SlidersHorizontal,
  Mic,
  MicOff,
  CornerDownRight,
  Printer,
  Download,
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  InterviewQuestion,
  InterviewSetupConfig,
  CompletedInterviewItem,
  InterviewSessionRecord,
  AnswerRubricEvaluation,
  JobRole,
  ExperienceLevel,
  InterviewType,
  DifficultyLevel,
  InterviewLanguage,
} from '../types/jobmate';

interface MockInterviewViewProps {
  onSessionComplete?: (session: InterviewSessionRecord) => void;
}

export const MockInterviewView: React.FC<MockInterviewViewProps> = ({ onSessionComplete }) => {
  // Step in workflow: 'setup' | 'active' | 'summary'
  const [step, setStep] = useState<'setup' | 'active' | 'summary'>('setup');

  // Setup configuration state
  const [targetRole, setTargetRole] = useState<string>('Software Developer');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Fresher');
  const [interviewType, setInterviewType] = useState<InterviewType>('Mixed');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [language, setLanguage] = useState<InterviewLanguage>('English');
  const [targetCompany, setTargetCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Active interview state
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<CompletedInterviewItem[]>([]);
  const [answerInput, setAnswerInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<AnswerRubricEvaluation | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [activeVoiceInput, setActiveVoiceInput] = useState(false);
  const [finalSessionRecord, setFinalSessionRecord] = useState<InterviewSessionRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Speech recognition for voice mode within mock interview
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    supported: speechSupported,
  } = useSpeechRecognition({ language });

  // Update answerInput when speech transcript is received
  useEffect(() => {
    if (transcript) {
      setAnswerInput(transcript);
    }
  }, [transcript]);

  // Question elapsed timer
  useEffect(() => {
    if (step === 'active') {
      setQuestionStartTime(Date.now());
      setSecondsElapsed(0);
      const timer = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentIndex, step]);

  const currentQuestion = questions[currentIndex] || questions[0];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Launch interview
  const handleStartSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const role = isCustomRole ? customRoleInput.trim() : targetRole;
    if (!role) {
      setErrorMessage('Please specify your target job role.');
      return;
    }

    const config: InterviewSetupConfig = {
      targetRole: role,
      isCustomRole,
      experienceLevel,
      interviewType,
      difficulty,
      questionCount,
      language,
      answerMode: 'text',
      speechOutput: false,
      targetCompany: targetCompany.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
    };

    setIsEvaluating(true);
    try {
      const response = await apiService.generateQuestions(config);
      if (!response.questions || response.questions.length === 0) {
        throw new Error('Failed to generate interview questions.');
      }
      setQuestions(response.questions);
      setCurrentIndex(0);
      setCompletedItems([]);
      setAnswerInput('');
      setCurrentEvaluation(null);
      setStep('active');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not start interview. Please check connection.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (isListening) stopListening();

    const finalAnswer = answerInput.trim();
    if (!finalAnswer) {
      setErrorMessage('Please enter your answer before submitting.');
      return;
    }

    setIsEvaluating(true);
    setErrorMessage(null);

    const duration = Math.round((Date.now() - questionStartTime) / 1000);
    const config: InterviewSetupConfig = {
      targetRole: isCustomRole ? customRoleInput : targetRole,
      experienceLevel,
      interviewType,
      difficulty,
      questionCount,
      language,
      answerMode: 'text',
      speechOutput: false,
    };

    try {
      const response = await apiService.evaluateAnswer(currentQuestion, finalAnswer, config);
      const evalData = response.evaluation;
      setCurrentEvaluation(evalData);

      const item: CompletedInterviewItem = {
        question: currentQuestion,
        userAnswer: finalAnswer,
        durationSeconds: duration,
        evaluation: evalData,
        timestamp: Date.now(),
      };

      setCompletedItems((prev) => [...prev, item]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Generate Follow-up Question
  const handleAskFollowUp = async () => {
    if (!answerInput.trim()) return;
    setIsGeneratingFollowUp(true);

    const config: InterviewSetupConfig = {
      targetRole: isCustomRole ? customRoleInput : targetRole,
      experienceLevel,
      interviewType,
      difficulty,
      questionCount,
      language,
      answerMode: 'text',
      speechOutput: false,
    };

    try {
      const res = await apiService.generateFollowUp(currentQuestion, answerInput.trim(), config);
      if (res.followUp) {
        // Insert follow-up right after current question
        const updated = [...questions];
        updated.splice(currentIndex + 1, 0, res.followUp);
        setQuestions(updated);
        handleNextQuestion();
      }
    } catch (e) {
      console.warn('Failed to generate follow-up question', e);
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  // Retry Question
  const handleRetry = () => {
    setAnswerInput('');
    resetTranscript();
    setCurrentEvaluation(null);
    setErrorMessage(null);
    setShowModelAnswer(false);
  };

  // Skip Question
  const handleSkip = () => {
    handleRetry();
    if (isLastQuestion) {
      finishInterview();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    handleRetry();
    if (isLastQuestion) {
      finishInterview();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Finish Interview & Synthesize Final Report
  const finishInterview = async () => {
    if (completedItems.length === 0) {
      setStep('setup');
      return;
    }

    setIsEvaluating(true);
    const config: InterviewSetupConfig = {
      targetRole: isCustomRole ? customRoleInput : targetRole,
      experienceLevel,
      interviewType,
      difficulty,
      questionCount,
      language,
      answerMode: 'text',
      speechOutput: false,
    };

    // Calculate averages
    let totalScore = 0;
    let sumRel = 0;
    let sumTech = 0;
    let sumClar = 0;
    let sumEx = 0;
    let sumComm = 0;

    completedItems.forEach((it) => {
      totalScore += it.evaluation.overallScore;
      sumRel += it.evaluation.scores.relevance;
      sumTech += it.evaluation.scores.technicalCorrectness;
      sumClar += it.evaluation.scores.clarityAndStructure;
      sumEx += it.evaluation.scores.specificExamples;
      sumComm += it.evaluation.scores.communicationQuality;
    });

    const cnt = completedItems.length;
    const overallScore = Math.round(totalScore / cnt);
    const criteriaAverage = {
      relevance: Math.round(sumRel / cnt),
      technicalCorrectness: Math.round(sumTech / cnt),
      clarityAndStructure: Math.round(sumClar / cnt),
      specificExamples: Math.round(sumEx / cnt),
      communicationQuality: Math.round(sumComm / cnt),
    };

    let summaryReport;
    try {
      const rep = await apiService.generateFinalReport(config, completedItems);
      summaryReport = rep.summaryReport;
    } catch (e) {
      summaryReport = {
        strongestAnswer: `Question #${completedItems[0]?.question.questionNumber}: "${completedItems[0]?.question.text}"`,
        priorityImprovements: [
          'Incorporate concrete metrics into technical narratives',
          'Structure behavioral responses using Situation-Task-Action-Result',
        ],
        recommendedTopics: [`${config.targetRole} Core Competencies`, 'Systematic Debugging Recaps'],
        actionableNextSteps: [
          'Review the model answers provided for each question',
          'Practice speaking in 60-second time-boxed segments',
        ],
        verdict:
          overallScore >= 80
            ? 'Strong Candidate: High potential with clear communication and solid answers.'
            : 'Promising Candidate: Good foundational knowledge; focus on structure and depth.',
      };
    }

    const sessionRecord: InterviewSessionRecord = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      config,
      questionsCompleted: completedItems.length,
      totalQuestions: questions.length,
      overallScore,
      criteriaAverage,
      items: completedItems,
      mode: 'typed',
      source: 'gemini',
      summaryReport,
    };

    storageService.saveSession(sessionRecord);
    setFinalSessionRecord(sessionRecord);
    if (onSessionComplete) onSessionComplete(sessionRecord);
    setStep('summary');
    setIsEvaluating(false);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fadeIn">
      {/* STAGE 1: SETUP FORM */}
      {step === 'setup' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-800">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
              <FileQuestion className="w-3.5 h-3.5" />
              <span>AI Mock Interview Configuration</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Configure Your Practice Session</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Select your role, experience level, and round type. Gemini generates tailored questions evaluated against transparent 5-point hiring rubrics.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleStartSetup} className="space-y-6">
            {/* Role Picker */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>1. Target Job Role</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  'Software Developer',
                  'Data Analyst',
                  'Software Tester',
                  'DevOps Engineer',
                  'HR / People Operations',
                ].map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => {
                      setTargetRole(role);
                      setIsCustomRole(false);
                    }}
                    className={`p-3 rounded-xl text-xs sm:text-sm font-semibold border text-left transition-all ${
                      !isCustomRole && targetRole === role
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                        : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {role}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomRole(true)}
                  className={`p-3 rounded-xl text-xs sm:text-sm font-semibold border text-left transition-all ${
                    isCustomRole
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                      : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  + Custom Role...
                </button>
              </div>

              {isCustomRole && (
                <input
                  type="text"
                  placeholder="Enter target role name (e.g. Cloud Security Specialist, Machine Learning Engineer)"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-blue-500 text-white text-sm focus:outline-none"
                  autoFocus
                />
              )}
            </div>

            {/* Experience Level & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>2. Experience Level</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Fresher', 'Beginner', 'Intermediate'] as ExperienceLevel[]).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        experienceLevel === lvl
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                  <span>3. Difficulty Level</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((diff) => (
                    <button
                      type="button"
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        difficulty === diff
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Round Type & Question Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <label className="text-sm font-bold text-white">4. Round Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Mixed', 'Technical', 'HR', 'Behavioral'] as InterviewType[]).map((typ) => (
                    <button
                      type="button"
                      key={typ}
                      onClick={() => setInterviewType(typ)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                        interviewType === typ
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {typ}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <label className="text-sm font-bold text-white">5. Question Count</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((cnt) => (
                    <button
                      type="button"
                      key={cnt}
                      onClick={() => setQuestionCount(cnt)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        questionCount === cnt
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {cnt} Qs {cnt === 3 ? '(Quick)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isEvaluating}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <span>Start Mock Interview</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STAGE 2: ACTIVE QUESTION INTERFACE */}
      {step === 'active' && currentQuestion && (
        <div className="space-y-6">
          {/* Active Navigation Header */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 font-bold text-sm flex items-center justify-center border border-blue-500/20">
                {currentIndex + 1}/{questions.length}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {isCustomRole ? customRoleInput : targetRole}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {currentQuestion.category.toUpperCase()}
                  </span>
                  {currentQuestion.isFollowUp && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 font-semibold">
                      Follow-Up Question
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(secondsElapsed)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>
              <button
                onClick={finishInterview}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0c121e] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Question #{currentQuestion.questionNumber}
              </span>
              <span className="text-xs text-slate-500 font-mono">Difficulty: {difficulty}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              "{currentQuestion.text}"
            </h3>

            {currentQuestion.expectedKeyPoints && currentQuestion.expectedKeyPoints.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Core Evaluation Topics:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {currentQuestion.expectedKeyPoints.map((pt, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {pt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Answer & Evaluation Section */}
          {currentEvaluation ? (
            /* Rubric Result Card */
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-6 animate-fadeIn shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl border ${
                      currentEvaluation.overallScore >= 80
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                        : currentEvaluation.overallScore >= 60
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/40'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                    }`}
                  >
                    {currentEvaluation.overallScore}%
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Answer Evaluation</h4>
                    <p className="text-xs text-slate-400">{currentEvaluation.scoreExplanation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetry}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
                  >
                    <span>{isLastQuestion ? 'View Final Report' : 'Next Question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 5-Point Rubric Criteria Grid */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Criterion-by-Criterion Scoring Rubric
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Relevance</span>
                    <p className="text-lg font-bold text-white mt-1">
                      {currentEvaluation.scores.relevance}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Technical Depth</span>
                    <p className="text-lg font-bold text-white mt-1">
                      {currentEvaluation.scores.technicalCorrectness}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Clarity & Flow</span>
                    <p className="text-lg font-bold text-white mt-1">
                      {currentEvaluation.scores.clarityAndStructure}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Specific Examples</span>
                    <p className="text-lg font-bold text-white mt-1">
                      {currentEvaluation.scores.specificExamples}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400">Communication</span>
                    <p className="text-lg font-bold text-white mt-1">
                      {currentEvaluation.scores.communicationQuality}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Strengths & Missing Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Key Strengths Observed
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {currentEvaluation.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1.5">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Missing or Unclear Information
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {currentEvaluation.missingInformation.map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Specific Improvement Suggestions */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Specific Actionable Suggestions
                </h5>
                <ul className="space-y-1 text-xs text-slate-300">
                  {currentEvaluation.improvementSuggestions.map((imp, i) => (
                    <li key={i}>→ {imp}</li>
                  ))}
                </ul>
              </div>

              {/* Stronger Sample Answer Toggle */}
              <div className="border-t border-slate-800 pt-3">
                <button
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-4 h-4" />
                  <span>{showModelAnswer ? 'Hide Stronger Sample Answer' : 'View Stronger Sample Answer'}</span>
                  {showModelAnswer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showModelAnswer && (
                  <div className="mt-3 p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-2 text-xs text-slate-200">
                    <p className="font-semibold text-blue-300">Exemplary Answer Structure:</p>
                    <p className="italic leading-relaxed">{currentEvaluation.strongerSampleAnswer}</p>
                  </div>
                )}
              </div>

              {/* Follow-up Question Trigger */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CornerDownRight className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Want to go deeper into your answer? Generate an adaptive follow-up question.</span>
                </div>
                <button
                  onClick={handleAskFollowUp}
                  disabled={isGeneratingFollowUp}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 transition-all flex items-center gap-1.5 shrink-0"
                >
                  {isGeneratingFollowUp ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Formulating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask Follow-Up</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Answer Input Box */
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Your Answer</span>
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (isListening) {
                          stopListening();
                        } else {
                          await startListening();
                        }
                      }}
                      className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors ${
                        isListening
                          ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{isListening ? 'Stop Mic' : 'Voice Dictate'}</span>
                    </button>
                  )}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {answerInput.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <textarea
                rows={6}
                placeholder="Type your structured answer here. Include relevant context, action taken, and technical reasoning..."
                value={
                  isListening && interimTranscript
                    ? answerInput ? `${answerInput} ${interimTranscript}` : interimTranscript
                    : answerInput
                }
                onChange={(e) => setAnswerInput(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500 leading-relaxed resize-y"
              />

              {isListening && (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Listening... Spoken words will appear in the box.</span>
                </div>
              )}

              {errorMessage && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorMessage}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleRetry}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Clear Text
                </button>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || !answerInput.trim()}
                  className="px-7 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Evaluating Response...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Answer for AI Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE 3: FINAL SESSION REPORT */}
      {step === 'summary' && finalSessionRecord && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Session Completed
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {finalSessionRecord.config.targetRole} Mock Report
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {finalSessionRecord.questionsCompleted} questions completed with an overall score of{' '}
                  <strong className="text-blue-400">{finalSessionRecord.overallScore}%</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={() => setStep('setup')}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>New Practice</span>
                </button>
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                Criteria Averages
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(finalSessionRecord.criteriaAverage).map(([key, val]) => (
                  <div key={key} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] text-slate-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <p className="text-xl font-bold text-white mt-1">{val}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Breakdown List */}
            <div className="space-y-3 pt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Question-by-Question Evaluation
              </span>
              {finalSessionRecord.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Q{idx + 1}: {it.question.text}
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {it.evaluation.overallScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 italic">"{it.userAnswer}"</p>
                  <p className="text-xs text-slate-300">
                    <strong className="text-blue-400">Feedback: </strong>
                    {it.evaluation.scoreExplanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
