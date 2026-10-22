import React from 'react';
import { Menu, Sparkles, PlayCircle, Radio, Mic } from 'lucide-react';
import { NavItemId } from '../types/jobmate';

interface HeaderProps {
  currentTab: NavItemId;
  onOpenMobileMenu: () => void;
  onStartInterview: () => void;
  onStartVoice: () => void;
  geminiConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onStartInterview,
  onStartVoice,
  geminiConnected,
}) => {
  const getPageTitle = (tab: NavItemId) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Career & Recruitment Dashboard', subtitle: 'Welcome to your AI Career, Resume Screening & Interview Hub' };
      case 'candidates':
        return { title: 'HireFlow Candidate Pipeline', subtitle: 'Automated PDF resume screening, skill gap matching, and candidate ranking' };
      case 'mock-interview':
        return { title: 'AI Mock Interview', subtitle: 'Practice structured written interviews with follow-up evaluations' };
      case 'voice-interview':
        return { title: 'Live Voice Interview Room', subtitle: 'Simulate natural spoken interviews powered by Web Speech & Alexa+ Audio' };
      case 'english-coach':
        return { title: 'English Communication Coach', subtitle: 'Polish your professional fluency, sentence structure, and vocabulary' };
      case 'resume-assistant':
        return { title: 'Resume Intelligence', subtitle: 'Audit bullet points, detect skills, and align with job descriptions' };
      case 'career-roadmap':
        return { title: 'Personalized Career Roadmap', subtitle: 'Step-by-step learning milestones, hands-on tasks, and readiness checklist' };
      case 'analytics':
        return { title: 'Performance Analytics', subtitle: 'Real progress metrics and criteria averages derived from your practice sessions' };
      case 'settings':
        return { title: 'Preferences & Hardware', subtitle: 'Configure voice models, microphone sensitivity, and Alexa+ MCP settings' };
      default:
        return { title: 'JobMate AI', subtitle: 'Your Personal AI Career Coach' };
    }
  };

  const { title, subtitle } = getPageTitle(currentTab);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onStartVoice}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all flex items-center gap-1.5"
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Voice</span> Room
        </button>

        <button
          onClick={onStartInterview}
          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Mock Interview</span>
        </button>
      </div>
    </header>
  );
};
