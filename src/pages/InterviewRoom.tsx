import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Send,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  Edit3,
  Trash2,
  StopCircle,
} from 'lucide-react';
import { AudioVisualizer, VisualizerState } from '../components/AudioVisualizer';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { apiService } from '../services/apiService';
import {
  InterviewQuestion,
  InterviewSetupConfig,
  AnswerEvaluation,
  CompletedQuestionItem,
} from '../types/interview';

interface InterviewRoomProps {
  config: InterviewSetupConfig;
  questions: InterviewQuestion[];
  onFinishInterview: (completedItems: CompletedQuestionItem[]) => void;
  onExitEarly: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  config,
  questions,
  onFinishInterview,
  onExitEarly,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<CompletedQuestionItem[]>([]);
  const [userTextAnswer, setUserTextAnswer] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<AnswerEvaluation | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [preferredMode, setPreferredMode] = useState<'voice' | 'text'>(config.answerMode);

  const { speak, isSpeaking, stop: stopSpeaking, supported: ttsSupported } = useSpeechSynthesis();
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    supported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechRecognition({
    language: config.language,
  });

  const currentQuestion = questions[currentIndex] || questions[0];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Question timer
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setSecondsElapsed(0);
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Synchronize recognized transcript into editable text answer
  useEffect(() => {
    setUserTextAnswer(transcript);
  }, [transcript]);

  // Compute live combined transcript (confirmed + active interim)
  const displayValue = isListening && interimTranscript
    ? userTextAnswer
      ? `${userTextAnswer} ${interimTranscript}`
      : interimTranscript
    : userTextAnswer;

  // Handle manual edits to the transcript textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUserTextAnswer(val);
    setTranscript(val);
  };

  // Auto-speak question when question changes if speechOutput is on
  const hasSpokenRef = useRef<number>(-1);
  useEffect(() => {
    if (config.speechOutput && ttsSupported && currentQuestion && hasSpokenRef.current !== currentIndex) {
      hasSpokenRef.current = currentIndex;
      // Brief delay for transition
      const timer = setTimeout(() => {
        speak(currentQuestion.text, config.language);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, config.speechOutput, config.language, currentQuestion, speak, ttsSupported]);

  // Stop speaking when user activates mic
  const handleToggleListening = async () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const handleRepeatQuestion = () => {
    if (isListening) {
      stopListening();
    }
    speak(currentQuestion.text, config.language);
  };

  const handleClearAnswer = () => {
    if (isListening) {
      stopListening();
    }
    setUserTextAnswer('');
    resetTranscript();
  };

  // Submit Answer for AI evaluation
  const handleSubmitAnswer = async () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    if (isListening) {
      stopListening();
    }

    // Capture latest transcript including any pending interim words
    const finalAnswer = (
      isListening && interimTranscript
        ? userTextAnswer
          ? `${userTextAnswer} ${interimTranscript}`
          : interimTranscript
        : userTextAnswer
    ).trim();

    if (!finalAnswer) {
      setEvaluationError('Please speak or type your answer before submitting for evaluation.');
      return;
    }

    setUserTextAnswer(finalAnswer);
    setTranscript(finalAnswer);

    setIsEvaluating(true);
    setEvaluationError(null);

    const duration = Math.round((Date.now() - questionStartTime) / 1000);

    try {
      const response = await apiService.evaluateAnswer(currentQuestion, finalAnswer, config as any);
      const evalData = response.evaluation as any;
      setCurrentEvaluation(evalData);

      const newItem: CompletedQuestionItem = {
        question: currentQuestion,
        userAnswer: finalAnswer,
        durationSeconds: duration,
        evaluation: evalData,
        timestamp: Date.now(),
      };

      setCompletedItems((prev) => [...prev, newItem]);
    } catch (err: any) {
      console.error('Answer evaluation failed:', err);
      setEvaluationError(err.message || 'Evaluation request failed. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Advance to next question or complete interview
  const handleNextQuestion = () => {
    stopSpeaking();
    stopListening();
    resetTranscript();
    setUserTextAnswer('');
    setCurrentEvaluation(null);
    setEvaluationError(null);
    setShowModelAnswer(false);
    setIsEditingTranscript(false);

    if (isLastQuestion) {
      onFinishInterview(completedItems);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Determine Visualizer Orb state
  let visualizerState: VisualizerState = 'idle';
  if (isEvaluating) {
    visualizerState = 'evaluating';
  } else if (isListening) {
    visualizerState = 'listening';
  } else if (isSpeaking) {
    visualizerState = 'speaking';
  }

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const evalOverall: number = currentEvaluation?.scores?.overall ?? (currentEvaluation as any)?.overallScore ?? 75;
  const evalRelevance: number = currentEvaluation?.scores?.relevance ?? 75;
  const evalClarity: number =
    currentEvaluation?.scores?.clarity ?? (currentEvaluation?.scores as any)?.clarityAndStructure ?? 75;
  const evalCompleteness: number =
    currentEvaluation?.scores?.completeness ?? currentEvaluation?.scores?.technicalCorrectness ?? 75;
  const evalCommunication: number =
    currentEvaluation?.scores?.communication ?? (currentEvaluation?.scores as any)?.communicationQuality ?? 75;
  const evalRubricText: string =
    currentEvaluation?.rubricExplanation ||
    (currentEvaluation as any)?.scoreExplanation ||
    (currentEvaluation as any)?.feedbackSummary ||
    'Evaluation completed.';
  const evalStrengths: string[] = currentEvaluation?.strengths || [];
  const evalImprovements: string[] =
    (currentEvaluation?.areasToImprove as string[]) ||
    ((currentEvaluation as any)?.improvementSuggestions as string[]) ||
    [];
  const evalModelAnswer: string =
    currentEvaluation?.betterAnswerExample || (currentEvaluation as any)?.strongerSampleAnswer || '';
  const evalDisclaimer: string =
    currentEvaluation?.audioAnalysisDisclaimer || (currentEvaluation as any)?.confidenceDisclaimer || '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Progress & Role */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center justify-center">
            {currentIndex + 1}/{questions.length}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{config.targetRole}</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {config.experienceLevel}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentQuestion.category.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatTimer(secondsElapsed)}
              </span>
              <span>•</span>
              <span>{config.language}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="hidden md:flex flex-col flex-1 max-w-xs mx-4">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Interview Progress</span>
            <span>{Math.round(((currentIndex + (currentEvaluation ? 1 : 0)) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 rounded-full"
              style={{
                width: `${((currentIndex + (currentEvaluation ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* End interview button */}
        <button
          onClick={() => setShowEndModal(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1.5"
        >
          <StopCircle className="w-4 h-4 text-rose-400" />
          <span>End Interview</span>
        </button>
      </div>

      {/* Main Room Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Interviewer Orb & Question */}
        <div className="lg:col-span-12">
          <div className="bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-[#0d121f] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            {/* Visualizer Orb */}
            <div className="flex flex-col items-center justify-center pb-6">
              <AudioVisualizer
                state={visualizerState}
                size="md"
                caption={
                  isEvaluating
                    ? 'Gemini is evaluating your answer against professional rubrics...'
                    : isListening
                    ? 'Listening... Speak clearly into your microphone'
                    : isSpeaking
                    ? 'Interviewer is speaking...'
                    : 'Listen to the question and activate mic to respond'
                }
                onClick={
                  !currentEvaluation && preferredMode === 'voice' && speechSupported
                    ? handleToggleListening
                    : undefined
                }
              />
            </div>

            {/* Spoken Question Display */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 sm:p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Interviewer Question #{currentQuestion.questionNumber}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRepeatQuestion}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                      isSpeaking
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'Speaking...' : 'Repeat Question'}</span>
                  </button>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                "{currentQuestion.text}"
              </h2>

              {currentQuestion.expectedKeyPoints && currentQuestion.expectedKeyPoints.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Expected Core Focus:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {currentQuestion.expectedKeyPoints.map((pt, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {pt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Evaluation Banner if evaluated */}
            {currentEvaluation ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Score Summary Box */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl border ${
                          evalOverall >= 80
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                            : evalOverall >= 60
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/40'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                        }`}
                      >
                        {evalOverall}%
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Answer Evaluation</h3>
                        <p className="text-xs text-slate-400">{evalRubricText}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                      <span>{isLastQuestion ? 'Complete Interview & View Final Report' : 'Next Question'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Rubric Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-[11px] text-slate-400 uppercase">Relevance</span>
                      <p className="text-lg font-bold text-white">{evalRelevance}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-[11px] text-slate-400 uppercase">Clarity</span>
                      <p className="text-lg font-bold text-white">{evalClarity}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-[11px] text-slate-400 uppercase">Completeness</span>
                      <p className="text-lg font-bold text-white">{evalCompleteness}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-[11px] text-slate-400 uppercase">Communication</span>
                      <p className="text-lg font-bold text-white">{evalCommunication}%</p>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Identified Strengths
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {evalStrengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Key Areas to Elevate
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {evalImprovements.map((area: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Candidate Answer Transcript Display */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      Your Submitted Response:
                    </span>
                    <p className="mt-1 text-xs sm:text-sm text-slate-300 italic">
                      "{currentEvaluation.candidateAnswer}"
                    </p>
                  </div>

                  {/* Model Answer Expander */}
                  <div className="mt-4 border-t border-slate-800/80 pt-4">
                    <button
                      onClick={() => setShowModelAnswer(!showModelAnswer)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Award className="w-4 h-4" />
                      <span>{showModelAnswer ? 'Hide Exemplary Model Answer' : 'View Exemplary Model Answer & STAR Structure'}</span>
                      {showModelAnswer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showModelAnswer && (
                      <div className="mt-3 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                        <div>
                          <span className="text-[11px] font-bold text-indigo-300 uppercase">
                            Model High-Scoring Response:
                          </span>
                          <p className="mt-1 text-xs sm:text-sm text-slate-200 leading-relaxed">
                            {evalModelAnswer}
                          </p>
                        </div>

                        {currentQuestion.modelAnswer?.starMethod && (
                          <div className="pt-2 border-t border-indigo-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded bg-slate-900/60">
                              <strong className="text-indigo-400">Situation: </strong>
                              <span className="text-slate-300">{currentQuestion.modelAnswer.starMethod.situation}</span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/60">
                              <strong className="text-indigo-400">Task: </strong>
                              <span className="text-slate-300">{currentQuestion.modelAnswer.starMethod.task}</span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/60">
                              <strong className="text-indigo-400">Action: </strong>
                              <span className="text-slate-300">{currentQuestion.modelAnswer.starMethod.action}</span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/60">
                              <strong className="text-indigo-400">Result: </strong>
                              <span className="text-slate-300">{currentQuestion.modelAnswer.starMethod.result}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Disclaimer */}
                  <p className="mt-4 text-[10px] text-slate-500 text-center">
                    {evalDisclaimer}
                  </p>
                </div>
              </div>
            ) : (
              /* Candidate Answering Interface */
              <div className="space-y-4">
                {/* Mode Selector and Tools */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Answer Mode:</span>
                    <button
                      onClick={() => setPreferredMode('voice')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                        preferredMode === 'voice'
                          ? 'bg-indigo-600/30 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-indigo-400" />
                      Voice
                    </button>
                    <button
                      onClick={() => setPreferredMode('text')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                        preferredMode === 'text'
                          ? 'bg-indigo-600/30 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      Text Fallback
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {userTextAnswer && (
                      <button
                        onClick={handleClearAnswer}
                        className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear Answer
                      </button>
                    )}
                  </div>
                </div>

                {/* Speech Error Banner if any */}
                {speechError && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{speechError}</span>
                    </div>
                    <button
                      onClick={() => setPreferredMode('text')}
                      className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 font-semibold text-[11px] whitespace-nowrap"
                    >
                      Switch to Text Mode
                    </button>
                  </div>
                )}

                {/* Evaluation Error Banner with Retry */}
                {evaluationError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{evaluationError}</span>
                    </div>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={isEvaluating || !userTextAnswer.trim()}
                      className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-white font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Retry Review
                    </button>
                  </div>
                )}

                {/* Voice Mode Live Microphone Section */}
                {preferredMode === 'voice' && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Big Mic Toggle Button */}
                      <button
                        onClick={handleToggleListening}
                        className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                          isListening
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-5 h-5" />
                            <span>Stop Speaking (Finished)</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5" />
                            <span>
                              {userTextAnswer ? 'Resume Speaking' : 'Start Speaking Your Answer'}
                            </span>
                          </>
                        )}
                      </button>

                      {/* Live status badge */}
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                          }`}
                        />
                        <span className="text-slate-400">
                          {isListening
                            ? 'Microphone active (transcribing speech...)'
                            : userTextAnswer
                            ? 'Answer recorded. You can edit text below before submitting.'
                            : 'Click Start Speaking when ready to formulate your thoughts.'}
                        </span>
                      </div>
                    </div>

                    {/* Live Transcript Box */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                          Live Spoken Transcript (Editable)
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {displayValue.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>

                      <textarea
                        rows={4}
                        placeholder={
                          isListening
                            ? 'Listening to your microphone... Your spoken words will appear here automatically in real time.'
                            : 'Click "Start Speaking" to answer aloud, or type directly here...'
                        }
                        value={displayValue}
                        onChange={handleTextareaChange}
                        className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 resize-y leading-relaxed font-normal"
                      />

                      {/* Live Interim Speech Preview Pill */}
                      {isListening && (
                        <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                          <span className="font-semibold text-emerald-400 shrink-0">Live Voice Stream:</span>
                          <span className="truncate italic text-slate-200">
                            {interimTranscript ? `"${interimTranscript}"` : 'Listening for your voice...'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Text Fallback Mode */}
                {preferredMode === 'text' && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-300">
                        Type Your Answer (Text Mode Fallback)
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {userTextAnswer.trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>

                    <textarea
                      rows={5}
                      placeholder="Type your interview response here. Aim for 2-4 comprehensive sentences covering the core question..."
                      value={userTextAnswer}
                      onChange={handleTextareaChange}
                      className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 resize-y leading-relaxed"
                    />
                  </div>
                )}

                {/* Submit Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-400">
                    💡 Tip: Review your transcript for typos before submitting to ensure accurate scoring.
                  </p>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isEvaluating || !userTextAnswer.trim()}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    {isEvaluating ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" />
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
        </div>
      </div>

      {/* End Interview Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">End Interview Early?</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              You have answered {completedItems.length} of {questions.length} questions.
              If you finish now, a performance report will be generated based on your completed answers.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
              >
                Continue Practice
              </button>
              {completedItems.length > 0 ? (
                <button
                  onClick={() => {
                    stopSpeaking();
                    stopListening();
                    setShowEndModal(false);
                    onFinishInterview(completedItems);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                >
                  Generate Partial Report
                </button>
              ) : (
                <button
                  onClick={() => {
                    stopSpeaking();
                    stopListening();
                    setShowEndModal(false);
                    onExitEarly();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors"
                >
                  Exit Without Saving
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
