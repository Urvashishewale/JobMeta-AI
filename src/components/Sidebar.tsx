import React from 'react';
import {
  LayoutDashboard,
  FileQuestion,
  Mic,
  Languages,
  FileText,
  Compass,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Radio,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { NavItemId } from '../types/jobmate';

interface SidebarProps {
  currentTab: NavItemId;
  onSelectTab: (tab: NavItemId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  geminiConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  geminiConnected,
}) => {
  const navItems: Array<{
    id: NavItemId;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'candidates',
      label: 'HireFlow Pipeline',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      badge: 'PDF Screening',
    },
    {
      id: 'mock-interview',
      label: 'AI Mock Interview',
      icon: <FileQuestion className="w-5 h-5" />,
      badge: 'Interactive',
    },
    {
      id: 'voice-interview',
      label: 'Live Voice Room',
      icon: <Mic className="w-5 h-5 text-indigo-400" />,
      badge: 'Alexa+ Voice',
    },
    {
      id: 'english-coach',
      label: 'English Practice',
      icon: <Languages className="w-5 h-5" />,
    },
    {
      id: 'resume-assistant',
      label: 'Resume Audit (PDF)',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'career-roadmap',
      label: 'Career Roadmap',
      icon: <Compass className="w-5 h-5" />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-[#070b14] border-r border-slate-800/80 flex flex-col no-print ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white leading-tight">
                JobMate<span className="text-blue-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Career & Voice Coach</span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors hidden lg:block"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="shrink-0 transition-transform group-hover:scale-110">{item.icon}</div>
              {!collapsed && (
                <div className="flex-1 text-left flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Integration Badges */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* Gemini Engine Status */}
        <div
          title={geminiConnected ? 'Gemini 3.8 Flash Connected' : 'Simulation Mode'}
          className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              geminiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          {!collapsed && (
            <div className="text-[11px] truncate">
              <span className="font-semibold text-slate-300">
                {geminiConnected ? 'Gemini AI Active' : 'Simulation Mode'}
              </span>
            </div>
          )}
        </div>

        {/* Alexa+ MCP Integration Badge */}
        {!collapsed && (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/20">
            <div className="flex items-center gap-1.5 text-blue-400 mb-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Alexa+ MCP Server</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Streamable HTTP endpoint active at <code className="text-blue-300 font-mono">/api/mcp</code>
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
