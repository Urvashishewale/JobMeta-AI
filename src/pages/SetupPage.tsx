import React, { useState } from 'react';
import {
  Mic,
  Keyboard,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building,
} from 'lucide-react';
import {
  ExperienceLevel,
  InterviewLanguage,
  InterviewSetupConfig,
  InterviewType,
  AnswerMode,
} from '../types/interview';

interface SetupPageProps {
  onStart: (config: InterviewSetupConfig) => void;
  isLoading: boolean;
  error?: string | null;
}

const PRESET_ROLES = [
  'Software Developer',
  'Data Analyst',
  'Web Developer',
  'HR / People Operations',
  'Product Manager',
  'DevOps Engineer',
];

export const SetupPage: React.FC<SetupPageProps> = ({ onStart, isLoading, error }) => {
  const [selectedRole, setSelectedRole] = useState('Software Developer');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Fresher');
  const [interviewType, setInterviewType] = useState<InterviewType>('Mixed');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [language, setLanguage] = useState<InterviewLanguage>('English');
  const [answerMode, setAnswerMode] = useState<AnswerMode>('voice');
  const [speechOutput, setSpeechOutput] = useState<boolean>(true);
  const [targetCompany, setTargetCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const finalRole = isCustomRole ? customRoleInput.trim() : selectedRole;
    if (!finalRole) {
      setValidationError('Please enter a target job role name.');
      return;
    }

    const config: InterviewSetupConfig = {
      targetRole: finalRole,
      isCustomRole,
      experienceLevel,
      interviewType,
      questionCount,
      language,
      answerMode,
      speechOutput,
      targetCompany: targetCompany.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
    };

    onStart(config);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Interview Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Configure Your Mock Interview
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Customize your role, difficulty level, and conversational preferences.
          Gemini will generate realistic, non-repetitive interview questions tailored specifically to your profile.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Setup Error</p>
            <p className="text-xs text-rose-200 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {validationError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{validationError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Target Job Role */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>1. Target Job Role</span>
            </label>
            <span className="text-xs text-slate-400">Required</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESET_ROLES.map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setIsCustomRole(false);
                }}
                className={`p-3 rounded-xl text-xs sm:text-sm font-semibold border text-left transition-all ${
                  !isCustomRole && selectedRole === role
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
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
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
              }`}
            >
              + Custom Role...
            </button>
          </div>

          {isCustomRole && (
            <div className="pt-2">
              <input
                type="text"
                placeholder="Enter custom role title (e.g. AI Prompt Engineer, Cloud Architect)"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* 2. Experience Level & Interview Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experience Level */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>2. Experience Level</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {(['Fresher', 'Entry-Level', 'Experienced'] as ExperienceLevel[]).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setExperienceLevel(level)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    experienceLevel === level
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {experienceLevel === 'Fresher'
                ? 'Tailored for students and fresh graduates. Emphasizes foundational concepts and academic projects.'
                : experienceLevel === 'Entry-Level'
                ? 'Focuses on 1-2 years of practical experience, debugging, and collaboration.'
                : 'Focuses on 3+ years of architectural trade-offs, system design, and leadership.'}
            </p>
          </div>

          {/* Interview Type */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>3. Interview Type</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {(['Mixed', 'Technical', 'HR', 'Behavioral'] as InterviewType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setInterviewType(type)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                    interviewType === type
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {interviewType === 'Mixed'
                ? 'Balanced blend of technical concepts, teamwork, and behavioral scenarios.'
                : interviewType === 'Technical'
                ? 'Deep dive into coding concepts, architecture, and problem-solving.'
                : interviewType === 'HR'
                ? 'Focuses on cultural fit, work ethic, communication, and motivations.'
                : 'Evaluates past actions using the STAR method (Situation, Task, Action, Result).'}
            </p>
          </div>
        </div>

        {/* 3. Number of Questions & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Question Count */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white">4. Number of Questions</label>
              <span className="text-xs text-indigo-400 font-mono">{questionCount} Questions</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 10, 15].map((cnt) => (
                <button
                  type="button"
                  key={cnt}
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    questionCount === cnt
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {cnt} Qs {cnt === 3 ? '(Quick)' : cnt === 5 ? '(Standard)' : ''}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Select 3 or 5 for quick mock practice; 10 or 15 for complete hiring simulation.
            </p>
          </div>

          {/* Interview Language */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <label className="text-sm font-bold text-white">5. Spoken Language</label>

            <div className="grid grid-cols-3 gap-2">
              {(['English', 'Hindi', 'Marathi'] as InterviewLanguage[]).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    language === lang
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Web Speech recognition will tune its acoustic model to the selected language.
            </p>
          </div>
        </div>

        {/* 4. Conversational Modes: Voice vs Text & Speech Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Answer Mode */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <label className="text-sm font-bold text-white">6. Answer Input Mode</label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAnswerMode('voice')}
                className={`p-3 rounded-xl text-xs sm:text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${
                  answerMode === 'voice'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <Mic className="w-4 h-4 text-indigo-400" />
                <span>Microphone Voice</span>
              </button>

              <button
                type="button"
                onClick={() => setAnswerMode('text')}
                className={`p-3 rounded-xl text-xs sm:text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${
                  answerMode === 'text'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <Keyboard className="w-4 h-4 text-indigo-400" />
                <span>Keyboard Text</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {answerMode === 'voice'
                ? 'Speak your responses using microphone speech recognition. You can review and edit before submitting.'
                : 'Type your answers using the keyboard. Helpful in noisy environments.'}
            </p>
          </div>

          {/* Speech Output (TTS) */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <label className="text-sm font-bold text-white">7. AI Speech Output</label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSpeechOutput(true)}
                className={`p-3 rounded-xl text-xs sm:text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${
                  speechOutput
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Audio Speech ON</span>
              </button>

              <button
                type="button"
                onClick={() => setSpeechOutput(false)}
                className={`p-3 rounded-xl text-xs sm:text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${
                  !speechOutput
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-slate-800/40 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Silent Mode</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {speechOutput
                ? 'The AI interviewer speaks each question out loud using browser speech synthesis.'
                : 'Questions will be displayed silently as text only.'}
            </p>
          </div>
        </div>

        {/* Optional Target Company & Job Description */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              <span>Optional Target Company & Job Description</span>
            </label>
            <span className="text-xs text-slate-400">Optional</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Google, Microsoft, Amazon, FinTech Startup"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Role Context or Tech Stack
              </label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, PostgreSQL, AWS"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Providing specific technologies allows Gemini to formulate deep, relevant technical questions.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ready to generate {questionCount} questions for {isCustomRole ? customRoleInput || 'Custom Role' : selectedRole}</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Synthesizing Interview Room...</span>
              </>
            ) : (
              <>
                <span>Enter Live Interview Room</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
