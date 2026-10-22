import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Briefcase,
  Layers,
  Code,
  FolderGit2,
  Calendar,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';
import { CareerRoadmapData, RoadmapPhase, RoadmapTask } from '../types/jobmate';

export const CareerRoadmapView: React.FC = () => {
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [currentSkills, setCurrentSkills] = useState('Basic JavaScript, HTML, CSS');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<CareerRoadmapData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const rdm = storageService.getActiveRoadmap();
    if (rdm) {
      setActiveRoadmap(rdm);
      setTargetRole(rdm.targetRole);
      setCurrentSkills(rdm.currentSkills);
      setWeeklyHours(rdm.weeklyHours);
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || !currentSkills.trim()) {
      setErrorMsg('Please specify your target role and current skills.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await apiService.generateRoadmap(
        targetRole.trim(),
        currentSkills.trim(),
        weeklyHours
      );
      const rdm = response.result;
      setActiveRoadmap(rdm);
      storageService.saveRoadmap(rdm);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate career roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = (phaseId: string, taskId: string) => {
    if (!activeRoadmap) return;
    const updated = storageService.toggleRoadmapTask(activeRoadmap.id, phaseId, taskId);
    if (updated) {
      setActiveRoadmap({ ...updated });
    }
  };

  // Calculate completion percentage
  let completedTasks = 0;
  let totalTasks = 0;
  if (activeRoadmap) {
    activeRoadmap.phases.forEach((p) => {
      p.tasks.forEach((t) => {
        totalTasks++;
        if (t.completed) completedTasks++;
      });
    });
  }
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-purple-950/40 border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Personalized Career Roadmap</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">Your Step-by-Step Learning Plan</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Generate realistic learning phases, hands-on portfolio projects, and interactive task checklists to build genuine readiness for your target role.
        </p>
      </div>

      {/* Roadmap Generator Form */}
      <form onSubmit={handleGenerate} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Career Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="Software Developer">Software Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Software Tester">Software Tester (QA)</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Frontend Engineer">Frontend Engineer</option>
              <option value="Backend Engineer">Backend Engineer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Skills & Background
            </label>
            <input
              type="text"
              placeholder="e.g. Basic Python, SQL, Excel"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Weekly Learning Hours ({weeklyHours}h/week)
            </label>
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full mt-2 accent-violet-500 cursor-pointer"
            />
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </p>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-600/20 flex items-center gap-2 disabled:opacity-40 transition-all hover:scale-105"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Generating Roadmap...</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                <span>Generate Customized Roadmap</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Active Roadmap Display */}
      {activeRoadmap && (
        <div className="space-y-6">
          {/* Progress Header Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-violet-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                  Target: {activeRoadmap.targetRole}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Roadmap Progress & Task Tracker
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Estimated duration: {activeRoadmap.totalEstimatedWeeks} weeks at {activeRoadmap.weeklyHours} hours/week.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-2xl font-black text-violet-400">{progressPercent}%</span>
                  <p className="text-[11px] text-slate-400">{completedTasks} of {totalTasks} tasks done</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 4 Phases List */}
          <div className="space-y-5">
            {activeRoadmap.phases.map((phase) => (
              <div
                key={phase.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 font-bold text-xs flex items-center justify-center border border-violet-500/20">
                      P{phase.phaseNumber}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-white">{phase.title}</h4>
                      <p className="text-xs text-slate-400">{phase.focusArea}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                    ~{phase.estimatedWeeks} Weeks
                  </span>
                </div>

                {/* Core Skills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase mr-1">
                    Core Skills:
                  </span>
                  {phase.coreSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20"
                    >
                      {sk}
                    </span>
                  ))}
                </div>

                {/* Interactive Task Checkbox List */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Phase Action Items (Click checkbox to mark complete):
                  </span>
                  <div className="space-y-2">
                    {phase.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(phase.id, task.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                          task.completed
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                            : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800 text-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className={`font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                            {task.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          ~{task.estimatedHours}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Exercise & Portfolio Project */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-violet-400 uppercase flex items-center gap-1">
                      <Code className="w-3.5 h-3.5" />
                      Practical Exercise
                    </span>
                    <p className="text-slate-300">{phase.practicalExercise}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase flex items-center gap-1">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      Portfolio Project: {phase.portfolioProject.title}
                    </span>
                    <p className="text-slate-300">{phase.portfolioProject.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {phase.portfolioProject.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Readiness Checklist */}
          {activeRoadmap.readinessChecklist && activeRoadmap.readinessChecklist.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pre-Application Readiness Checklist</span>
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeRoadmap.readinessChecklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/40">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
