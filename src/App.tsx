import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './pages/DashboardView';
import { MockInterviewView } from './pages/MockInterviewView';
import { VoiceInterviewView } from './pages/VoiceInterviewView';
import { EnglishCoachView } from './pages/EnglishCoachView';
import { ResumeAssistantView } from './pages/ResumeAssistantView';
import { HireFlowPipelineView } from './pages/HireFlowPipelineView';
import { CareerRoadmapView } from './pages/CareerRoadmapView';
import { AnalyticsView } from './pages/AnalyticsView';
import { SettingsView } from './pages/SettingsView';
import { ReportPage } from './pages/ReportPage';
import { apiService } from './services/apiService';
import { NavItemId, InterviewSessionRecord } from './types/jobmate';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavItemId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [geminiConnected, setGeminiConnected] = useState(true);
  const [viewingReportSession, setViewingReportSession] = useState<InterviewSessionRecord | null>(null);

  // Check health and connectivity
  useEffect(() => {
    apiService
      .checkHealth()
      .then((res) => {
        setGeminiConnected(res.geminiConfigured);
      })
      .catch(() => {
        setGeminiConnected(false);
      });
  }, []);

  const handleSelectTab = (tab: NavItemId) => {
    setViewingReportSession(null);
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewSessionReport = (session: InterviewSessionRecord) => {
    setViewingReportSession(session);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Desktop & Tablet Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        geminiConnected={geminiConnected}
      />

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onStartInterview={() => handleSelectTab('mock-interview')}
          onStartVoice={() => handleSelectTab('voice-interview')}
          geminiConnected={geminiConnected}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {viewingReportSession ? (
            <div className="space-y-6">
              <button
                onClick={() => setViewingReportSession(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ← Return to {currentTab === 'analytics' ? 'Analytics' : 'Dashboard'}
              </button>
              <ReportPage
                session={viewingReportSession as any}
                onRestartInterview={() => {
                  setViewingReportSession(null);
                  handleSelectTab('mock-interview');
                }}
                onGoToDashboard={() => {
                  setViewingReportSession(null);
                  handleSelectTab('dashboard');
                }}
              />
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  onNavigate={handleSelectTab}
                  onViewSessionReport={handleViewSessionReport}
                />
              )}

              {currentTab === 'candidates' && <HireFlowPipelineView />}

              {currentTab === 'mock-interview' && (
                <MockInterviewView
                  onSessionComplete={(session) => handleViewSessionReport(session)}
                />
              )}

              {currentTab === 'voice-interview' && <VoiceInterviewView />}

              {currentTab === 'english-coach' && <EnglishCoachView />}

              {currentTab === 'resume-assistant' && <ResumeAssistantView />}

              {currentTab === 'career-roadmap' && <CareerRoadmapView />}

              {currentTab === 'analytics' && (
                <AnalyticsView
                  onReopenSession={handleViewSessionReport}
                  onStartNewInterview={() => handleSelectTab('mock-interview')}
                />
              )}

              {currentTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
