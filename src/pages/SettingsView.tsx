import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Volume2,
  Mic,
  Sliders,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Activity,
  Cpu,
  Copy,
  Check,
  Terminal,
  Database,
  Trash2,
  Download,
  AlertTriangle,
  Play,
  Square,
  Radio,
} from 'lucide-react';
import { storageService, DEFAULT_SETTINGS } from '../services/storageService';
import { UserSettings, ExperienceLevel, InterviewLanguage } from '../types/jobmate';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedRpc, setCopiedRpc] = useState(false);
  const [mcpPingStatus, setMcpPingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [mcpPingLatency, setMcpPingLatency] = useState<number | null>(null);

  // Microphone hardware test
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [micStatusMsg, setMicStatusMsg] = useState<string>('Ready to test microphone hardware.');
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Speech synthesis
  const { voices, speak, isSpeaking, stop } = useSpeechSynthesis();

  // Clear modal
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, []);

  const handleSave = (newSettings?: Partial<UserSettings>) => {
    const toSave = newSettings ? { ...settings, ...newSettings } : settings;
    const updated = storageService.saveSettings(toSave);
    setSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    const updated = storageService.saveSettings(DEFAULT_SETTINGS);
    setSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestVoice = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak('Hello! I am JobMate AI, your personal career and interview preparation coach. Welcome to the Amazon Alexa+ hackathon experience.');
    }
  };

  // Real Web Audio API microphone diagnostic
  const startMicTest = async () => {
    try {
      setMicStatusMsg('Requesting microphone permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      setIsMicTesting(true);
      setMicStatusMsg('Microphone active! Speak into your microphone to test sensitivity levels.');

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err: any) {
      console.error('Failed to access microphone for diagnostic:', err);
      setIsMicTesting(false);
      setMicStatusMsg('Permission denied or microphone hardware unavailable. Please allow microphone access.');
    }
  };

  const stopMicTest = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicTesting(false);
    setMicVolume(0);
    setMicStatusMsg('Microphone test ended.');
  };

  const testMcpPing = async () => {
    setMcpPingStatus('testing');
    const start = performance.now();
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'ping-test-1',
          method: 'ping',
        }),
      });
      const end = performance.now();
      if (res.ok) {
        setMcpPingStatus('success');
        setMcpPingLatency(Math.round(end - start));
      } else {
        setMcpPingStatus('failed');
      }
    } catch {
      setMcpPingStatus('failed');
    }
  };

  const curlExample = `curl -X POST http://localhost:3000/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": "alexa-1",
    "method": "tools/call",
    "params": {
      "name": "start_mock_interview",
      "arguments": {
        "jobRole": "Software Developer",
        "experienceLevel": "Fresher",
        "questionCount": 3
      }
    }
  }'`;

  const jsonRpcSample = `{
  "jsonrpc": "2.0",
  "id": "alexa-session-101",
  "method": "tools/call",
  "params": {
    "name": "evaluate_interview_answer",
    "arguments": {
      "question": "Explain how you handle deadlocks in database transactions.",
      "candidateAnswer": "I use deadlock detection, short transaction durations, and consistent lock ordering across services.",
      "jobRole": "Software Developer",
      "targetLanguage": "English"
    }
  }
}`;

  const copyToClipboard = (text: string, isRpc = false) => {
    navigator.clipboard.writeText(text);
    if (isRpc) {
      setCopiedRpc(true);
      setTimeout(() => setCopiedRpc(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const handleExportData = () => {
    const data = {
      settings: storageService.getSettings(),
      sessions: storageService.getSessions(),
      englishPractices: storageService.getEnglishPractices(),
      resumeAnalyses: storageService.getResumeAnalyses(),
      activeRoadmap: storageService.getActiveRoadmap(),
      analyticsSummary: storageService.getAnalyticsSummary(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobmate-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = () => {
    storageService.clearAllData();
    setSettings(storageService.getSettings());
    setShowClearModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const sessions = storageService.getSessions();
  const englishCount = storageService.getEnglishPractices().length;
  const resumeCount = storageService.getResumeAnalyses().length;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-indigo-400" />
            <span>Preferences & Hardware Diagnostics</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure speech synthesis, test microphone audio levels, inspect the Amazon Alexa+ Model Context Protocol (MCP) server, and manage local storage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={() => handleSave()}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-sm flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Preferences updated and saved to your browser storage!</span>
        </div>
      )}

      {/* Grid: Audio Settings + Mic Diagnostic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Speech Synthesis Settings */}
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Speech Synthesis (TTS)</h3>
                  <p className="text-xs text-slate-400">Alexa+ simulated voice reader configuration</p>
                </div>
              </div>
              <button
                onClick={handleTestVoice}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 hover:bg-indigo-900/40 flex items-center gap-1.5"
              >
                {isSpeaking ? <Square className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> : <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />}
                <span>{isSpeaking ? 'Stop Voice' : 'Test Speech'}</span>
              </button>
            </div>

            {/* Voice dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Preferred Voice ({voices.length} available in browser)
              </label>
              <select
                value={settings.preferredVoiceURI}
                onChange={(e) => setSettings({ ...settings, preferredVoiceURI: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">System Default Voice</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Speech Rate Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-300 mb-2">
                <span>Speaking Rate</span>
                <span className="text-indigo-400 font-bold">{settings.speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.speechRate}
                onChange={(e) => setSettings({ ...settings, speechRate: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.5x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>

            {/* Speech Pitch Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-300 mb-2">
                <span>Voice Pitch</span>
                <span className="text-indigo-400 font-bold">{settings.speechPitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settings.speechPitch}
                onChange={(e) => setSettings({ ...settings, speechPitch: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.5 (Deep)</span>
                <span>1.0 (Standard)</span>
                <span>1.5 (High)</span>
              </div>
            </div>

            {/* Auto Play Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">Auto-speak questions</div>
                <div className="text-[11px] text-slate-400">Play interview questions immediately when displayed</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPlayQuestions}
                onChange={(e) => setSettings({ ...settings, autoPlayQuestions: e.target.checked })}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Microphone Hardware Diagnostic */}
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Microphone Diagnostic</h3>
                  <p className="text-xs text-slate-400">Real-time Web Audio API frequency meter</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isMicTesting ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                <span className="text-xs text-slate-400">{isMicTesting ? 'Live Feed' : 'Standby'}</span>
              </div>
            </div>

            {/* Live Audio Meter */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Input Signal Strength</span>
                <span className="text-white font-mono font-bold">{micVolume}%</span>
              </div>

              {/* Meter bar */}
              <div className="h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${micVolume}%`,
                    background:
                      micVolume > 80
                        ? 'linear-gradient(to right, #10b981, #f59e0b, #ef4444)'
                        : micVolume > 40
                        ? 'linear-gradient(to right, #10b981, #3b82f6, #6366f1)'
                        : 'linear-gradient(to right, #059669, #10b981)',
                  }}
                />
              </div>

              {/* Status Message */}
              <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>{micStatusMsg}</span>
              </p>
            </div>

            {/* Test Trigger Button */}
            <div>
              {!isMicTesting ? (
                <button
                  onClick={startMicTest}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Microphone Test</span>
                </button>
              ) : (
                <button
                  onClick={stopMicTest}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Microphone Test</span>
                </button>
              )}
            </div>

            {/* Web Speech API Support Badge */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Browser Web Speech API:</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Supported (SpeechRecognition)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Amazon Alexa+ & Model Context Protocol (MCP) Server Inspector */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Amazon Alexa+ & MCP Server Endpoint</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  JSON-RPC 2.0
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Streamable HTTP & JSON-RPC Model Context Protocol (MCP) server running on <code className="text-indigo-300 font-mono">/api/mcp</code>
              </p>
            </div>
          </div>

          {/* Test Ping MCP */}
          <div className="flex items-center gap-2">
            <button
              onClick={testMcpPing}
              disabled={mcpPingStatus === 'testing'}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{mcpPingStatus === 'testing' ? 'Testing Ping...' : 'Test MCP Ping'}</span>
            </button>
            {mcpPingStatus === 'success' && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 200 OK ({mcpPingLatency}ms)
              </span>
            )}
            {mcpPingStatus === 'failed' && (
              <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Endpoint Error
              </span>
            )}
          </div>
        </div>

        {/* 5 Registered Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              name: 'start_mock_interview',
              desc: 'Generates job-specific questions, criteria rubrics, and STAR model answers.',
              schema: 'jobRole, experienceLevel, interviewType, questionCount, language',
            },
            {
              name: 'evaluate_interview_answer',
              desc: 'Scores responses across 5 rubric dimensions, extracts STAR points, generates follow-up.',
              schema: 'question, candidateAnswer, jobRole, experienceLevel, targetLanguage',
            },
            {
              name: 'generate_career_roadmap',
              desc: 'Generates 4 progressive learning phases, weekly hours, milestones, portfolio specs.',
              schema: 'targetRole, currentSkills, weeklyHours',
            },
            {
              name: 'improve_resume',
              desc: 'Audits bullet points with quantifiable metrics, matches JD keywords without hallucinations.',
              schema: 'resumeText, targetRole, jobDescription',
            },
            {
              name: 'practise_english',
              desc: 'Corrects grammar, explains professional phrasing, provides natural alternatives.',
              schema: 'originalSentence, goal',
            },
          ].map((tool) => (
            <div key={tool.name} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-300">{tool.name}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">{tool.desc}</p>
              <div className="text-[10px] text-slate-500 font-mono truncate">Args: {tool.schema}</div>
            </div>
          ))}
        </div>

        {/* cURL & Code snippets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* cURL Snippet */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" /> cURL Alexa+ Tool Invocation
              </span>
              <button
                onClick={() => copyToClipboard(curlExample, false)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCurl ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/90 p-3 rounded-xl overflow-x-auto border border-slate-800/80">
              {curlExample}
            </pre>
          </div>

          {/* JSON-RPC Sample */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Alexa+ JSON-RPC 2.0 Payload
              </span>
              <button
                onClick={() => copyToClipboard(jsonRpcSample, true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedRpc ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRpc ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/90 p-3 rounded-xl overflow-x-auto border border-slate-800/80">
              {jsonRpcSample}
            </pre>
          </div>
        </div>
      </div>

      {/* Section 4: Data Management & Privacy */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Browser Storage & Privacy Disclosure</h3>
              <p className="text-xs text-slate-400">All practice logs and resume audits stay stored locally in your browser.</p>
            </div>
          </div>
        </div>

        {/* Current storage counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400">Interview Sessions</span>
            <div className="text-xl font-bold text-white mt-1">{sessions.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400">English Practice Drills</span>
            <div className="text-xl font-bold text-white mt-1">{englishCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400">Resume Audits</span>
            <div className="text-xl font-bold text-white mt-1">{resumeCount}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero telemetry or third-party ad tracking. Your resume and voice notes never leave your personal browser session.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Data (JSON)</span>
            </button>
            <button
              onClick={() => setShowClearModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Local Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Clear All Local Data?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This will delete your recorded interview scores, question feedback, English practice drills, and resume audits from this browser. This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500"
              >
                Yes, Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
