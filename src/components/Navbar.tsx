import React from 'react';
import {
  Mic,
  LayoutDashboard,
  PlayCircle,
  History,
  Settings,
  Sparkles,
  Home,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export type ActivePage = 'landing' | 'dashboard' | 'setup' | 'interview' | 'report' | 'history' | 'settings';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  geminiConnected: boolean;
  activeInterviewInProgress?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  geminiConnected,
  activeInterviewInProgress = false,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => {
            if (activeInterviewInProgress) {
              if (window.confirm('An interview is in progress. Exit to home?')) {
                onNavigate('landing');
              }
            } else {
              onNavigate('landing');
            }
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                JobMeta<span className="text-indigo-400">AI</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">AI Voice Interview Coach</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activePage === 'landing'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activePage === 'dashboard'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activePage === 'history'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activePage === 'settings'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>

        {/* Right action & AI Engine Status Badge */}
        <div className="flex items-center gap-3">
          <div
            title={
              geminiConnected
                ? 'Gemini 3.8 Flash Engine Connected'
                : 'Simulation / Fallback Mode (No API key found in env, using curated rubric)'
            }
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              geminiConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
          >
            {geminiConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gemini AI Connected</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>Simulation / Demo Mode</span>
              </>
            )}
          </div>

          <button
            onClick={() => onNavigate('setup')}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlayCircle className="w-4 h-4" />
            <span className="hidden xs:inline">Start</span> Interview
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 py-2 px-2 bg-[#0d121f]">
        <button
          onClick={() => onNavigate('landing')}
          className={`flex flex-col items-center gap-0.5 text-xs py-1 px-2 rounded ${
            activePage === 'landing' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-xs py-1 px-2 rounded ${
            activePage === 'dashboard' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => onNavigate('history')}
          className={`flex flex-col items-center gap-0.5 text-xs py-1 px-2 rounded ${
            activePage === 'history' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center gap-0.5 text-xs py-1 px-2 rounded ${
            activePage === 'settings' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
};
