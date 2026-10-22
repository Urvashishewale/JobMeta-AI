import React, { useState, useEffect } from 'react';
import {
  Languages,
  Sparkles,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Mic,
  MicOff,
  BookOpen,
  ArrowRight,
  Lightbulb,
  Check,
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { EnglishPracticeGoal, EnglishCorrectionResult } from '../types/jobmate';

export const EnglishCoachView: React.FC = () => {
  const [goal, setGoal] = useState<EnglishPracticeGoal>('IT interview answers');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<EnglishCorrectionResult | null>(null);
  const [history, setHistory] = useState<EnglishCorrectionResult[]>([]);
  const [showExerciseAnswer, setShowExerciseAnswer] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Speech recognition for dictating English sentences
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    supported: speechSupported,
  } = useSpeechRecognition({ language: 'English' });

  useEffect(() => {
    setHistory(storageService.getEnglishPractices());
  }, []);

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) stopListening();

    const sentenceToTest = (
      isListening && interimTranscript
        ? inputText ? `${inputText} ${interimTranscript}` : interimTranscript
        : inputText
    ).trim();

    if (!sentenceToTest) {
      setErrorMsg('Please write or speak an English sentence to practice.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setShowExerciseAnswer(false);

    try {
      const response = await apiService.practiseEnglish(sentenceToTest, goal);
      const res = response.result;
      setCurrentResult(res);
      storageService.saveEnglishPractice(res);
      setHistory(storageService.getEnglishPractices());
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze sentence. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (isListening) stopListening();
    setInputText('');
    resetTranscript();
    setCurrentResult(null);
    setErrorMsg(null);
    setShowExerciseAnswer(false);
  };

  const samplePromptsByGoal: Record<EnglishPracticeGoal, string[]> = {
    'IT interview answers': [
      'I has worked in team project and we was achieving good velocity.',
      'My responsibility is to fixing the bug in database query.',
      'I am knowing Python and SQL very well for data analysis.',
    ],
    'HR interview practice': [
      'My biggest weakness is I am working too much hard.',
      'I want this job because I want to learn and company is good.',
      'In five years I will see myself in managerial position.',
    ],
    'Professional workplace communication': [
      'Please do the needful and revert back to me asap.',
      'I am not able to attending the meeting today because of some work.',
      'Kindly share the document which we discuss yesterday.',
    ],
    'Daily conversation': [
      'Yesterday I went to market and buyinged some fruits.',
      'Can you tell me where is the bus stop located at?',
      'I am feeling very much happy today.',
    ],
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
          <Languages className="w-3.5 h-3.5" />
          <span>English Communication Coach</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">Refine Your Professional English</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Get constructive, friendly grammar corrections, vocabulary suggestions, and natural professional phrasing for interview answers and workplace communication.
        </p>
      </div>

      {/* Goal Selector */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Select Practice Context / Goal
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(
            [
              'IT interview answers',
              'HR interview practice',
              'Professional workplace communication',
              'Daily conversation',
            ] as EnglishPracticeGoal[]
          ).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGoal(g)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                goal === g
                  ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                  : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Input & Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <span>Type or speak your sentence to practice:</span>
          </label>

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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListening ? 'Stop Mic' : 'Speak into Mic'}</span>
            </button>
          )}
        </div>

        <textarea
          rows={3}
          placeholder="e.g. In my project, I am responsible to develop the user authentication and making the queries faster..."
          value={
            isListening && interimTranscript
              ? inputText ? `${inputText} ${interimTranscript}` : interimTranscript
              : inputText
          }
          onChange={(e) => setInputText(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500 resize-y leading-relaxed"
        />

        {isListening && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Transcribing speech in real-time...</span>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </p>
        )}

        {/* Quick Sample Prompts */}
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Try sample sentence:</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {samplePromptsByGoal[goal].map((p, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setInputText(p)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors text-left"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Clear Text
          </button>

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none transition-all hover:scale-105"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Analyzing English...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analyze & Improve Sentence</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Analysis Result Display */}
      {currentResult && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-6 animate-fadeIn shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Coaching Feedback & Corrections</span>
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
              Goal: {currentResult.goal}
            </span>
          </div>

          {/* 1. Original vs 2. Corrected */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1. Original Sentence
              </span>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "{currentResult.originalSentence}"
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                2. Grammatically Corrected Sentence
              </span>
              <p className="text-sm text-emerald-200 font-medium leading-relaxed">
                "{currentResult.correctedSentence}"
              </p>
            </div>
          </div>

          {/* 3. Explanations */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              3. Explanation of Corrections
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {currentResult.explanations.map((exp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. More Natural Alternative */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1.5">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              4. More Natural Professional Phrasing
            </span>
            <p className="text-sm text-blue-100 font-medium leading-relaxed">
              "{currentResult.moreNaturalAlternative}"
            </p>
            {currentResult.toneAssessment && (
              <p className="text-xs text-slate-400 pt-1">
                <span className="text-blue-300 font-semibold">Tone assessment: </span>
                {currentResult.toneAssessment}
              </p>
            )}
          </div>

          {/* 5. Short Practice Exercise */}
          {currentResult.practiceExercise && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                5. Quick Practice Exercise
              </span>
              <p className="text-xs sm:text-sm text-slate-200">
                {currentResult.practiceExercise.prompt}
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => setShowExerciseAnswer(!showExerciseAnswer)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {showExerciseAnswer ? 'Hide Suggested Rephrasing' : 'Reveal Suggested Rephrasing →'}
                </button>

                {showExerciseAnswer && (
                  <div className="mt-2 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200">
                    <span className="font-bold">Suggested Answer: </span>
                    {currentResult.practiceExercise.suggestedAnswer}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Practice History */}
      {history.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Practice Sentences ({history.length})
          </h4>
          <div className="space-y-2">
            {history.slice(0, 5).map((h) => (
              <div
                key={h.id}
                onClick={() => setCurrentResult(h)}
                className="p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div className="truncate">
                  <span className="text-slate-400 line-through mr-2">"{h.originalSentence}"</span>
                  <span className="text-emerald-300 font-medium">"{h.correctedSentence}"</span>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0 font-mono">{h.goal}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
