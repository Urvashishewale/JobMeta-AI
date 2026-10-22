import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Award,
  Zap,
  BookOpen,
  Languages,
  Headphones,
  RotateCcw,
} from 'lucide-react';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface LandingPageProps {
  onStartInterview: () => void;
  onGoToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartInterview,
  onGoToDashboard,
}) => {
  const { speak, isSpeaking, stop } = useSpeechSynthesis();
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    supported: speechRecSupported,
  } = useSpeechRecognition({ language: 'English' });

  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);

  const previewQuestions = [
    {
      role: 'Software Developer',
      text: 'Tell me about a challenging bug you encountered in production, and what systematic steps you took to diagnose and resolve it?',
    },
    {
      role: 'Data Analyst',
      text: 'How do you handle incomplete or noisy datasets when your stakeholders need immediate predictive business insights?',
    },
    {
      role: 'HR & People Operations',
      text: 'How do you foster psychological safety and resolve interpersonal friction across remote engineering teams?',
    },
  ];

  const currentPreview = previewQuestions[previewQuestionIndex];

  const handleTestSpeech = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(currentPreview.text, 'English');
    }
  };

  const handleToggleMicTest = async () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      await startListening();
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-blue-600/15 to-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Next-Gen Alexa-Style AI Voice Interview Coach</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Practice Smarter.{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Speak Confidently.
                </span>{' '}
                Get Hired.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                JobMeta AI transforms stressful job interviews into natural, spoken conversations.
                Practice with an adaptive AI interviewer that speaks realistic questions aloud,
                listens to your voice in real time, evaluates your answers against industry rubrics,
                and gives you model answers using the proven STAR method.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={onStartInterview}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 text-base transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Mock Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onGoToDashboard}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2 text-base transition-colors cursor-pointer"
                >
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <span>View Dashboard</span>
                </button>
              </div>

              {/* Trust & capability badges */}
              <div className="mt-10 pt-8 border-t border-slate-800/70 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-white">100%</p>
                  <p className="text-xs text-slate-400">Voice-Driven Practice</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-400">STAR</p>
                  <p className="text-xs text-slate-400">Method Feedback</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400">Instant</p>
                  <p className="text-xs text-slate-400">Score & Rubrics</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Conversational Orb & Live Tester */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-[#0d121f] p-6 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
                {/* Header tag */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-300">Live Interactive Orb</span>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {currentPreview.role}
                  </span>
                </div>

                {/* Orb visualizer */}
                <div className="py-6 flex flex-col items-center">
                  <AudioVisualizer
                    state={isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'}
                    size="md"
                    caption={
                      isSpeaking
                        ? 'Interviewer is speaking...'
                        : isListening
                        ? 'Listening to your voice...'
                        : 'Tap below to audition voice interview'
                    }
                  />
                </div>

                {/* Interactive Question Card */}
                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                      Sample Question
                    </span>
                    <button
                      onClick={() =>
                        setPreviewQuestionIndex((prev) => (prev + 1) % previewQuestions.length)
                      }
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Next Role
                    </button>
                  </div>
                  <p className="text-sm font-medium text-slate-200 italic leading-snug">
                    "{currentPreview.text}"
                  </p>
                </div>

                {/* Live Controls */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={handleTestSpeech}
                    className={`px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isSpeaking
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isSpeaking ? 'Stop Audio' : 'Hear Question'}</span>
                  </button>

                  <button
                    onClick={handleToggleMicTest}
                    disabled={!speechRecSupported}
                    className={`px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isListening
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isListening ? 'Stop Mic Test' : 'Test Your Mic'}</span>
                  </button>
                </div>

                {/* Live Speech Recognition output box */}
                {(transcript || interimTranscript) && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-emerald-200">
                    <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Live Speech Recognized:
                    </p>
                    <p className="italic">
                      "{transcript ? (interimTranscript ? `${transcript} ${interimTranscript}` : transcript) : interimTranscript}"
                    </p>
                  </div>
                )}
                {!speechRecSupported && (
                  <p className="text-[11px] text-amber-400/90 text-center">
                    Web Speech API not supported in this browser. Text mode will be used automatically.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-[#090d16] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-2">
              Conversational Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How JobMeta AI Simulates Real Job Interviews
            </h3>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              From verbal question prompt to actionable scoring in four seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold mb-4">
                01
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Select Target Role</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Choose Software Developer, Data Analyst, HR, or paste your exact job description to calibrate questions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold mb-4">
                02
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Listen & Speak</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                The AI interviewer asks questions out loud. Click your microphone and answer naturally in your own words.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold mb-4">
                03
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Instant Rubric Analysis</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Get immediate scores on relevance, clarity, completeness, and communication, plus a concise model answer.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold mb-4">
                04
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Executive Report</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Review your overall readiness score, strongest responses, study recommendations, and download a printable report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-2">
              Core Capabilities
            </h2>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              Designed for Confident, High-Scoring Candidates
            </h3>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Built with modern speech intelligence to bridge the gap between knowing the material and communicating it under pressure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Voice-First Experience</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Practice talking instead of typing. Web Speech API transcribes your answers in real time, with the ability to edit before submitting.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Gemini 3.8 Intelligence</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generates realistic, non-repetitive questions tailored for freshers or experienced candidates across Technical, Behavioral, and HR domains.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">STAR Framework Coaching</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Learn how hiring managers evaluate behavioral questions. Get model answers structured into Situation, Task, Action, and Result.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Languages className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Multilingual Mock Support</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Practice in English, Hindi, or Marathi where supported by your browser's speech recognition and text-to-speech engines.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Deep Performance Analytics</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track your historical score trends, aggregate weaknesses, and review detailed question-by-question evaluations anytime.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">100% Private Local Storage</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your past sessions and reports remain securely in your browser's LocalStorage. No microphone recordings are saved on external servers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action footer banner */}
      <section className="mt-auto py-12 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-violet-950/60 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Ace Your Next Interview?
          </h3>
          <p className="mt-2 text-slate-300 text-sm sm:text-base">
            Take a 5-minute practice round right now and identify your high-impact improvement areas.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={onStartInterview}
              className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
            >
              <Mic className="w-5 h-5" />
              <span>Launch Interview Setup</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
