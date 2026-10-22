import {
  InterviewSessionRecord,
  EnglishCorrectionResult,
  ResumeAnalysisResult,
  CareerRoadmapData,
  UserSettings,
  CandidateRecord,
  CandidateStatus,
} from '../types/jobmate';

const STORAGE_KEYS = {
  SESSIONS: 'jobmate_interview_sessions_v2',
  ENGLISH: 'jobmate_english_sessions_v1',
  RESUME: 'jobmate_resume_analyses_v1',
  ROADMAPS: 'jobmate_career_roadmaps_v1',
  SETTINGS: 'jobmate_user_settings_v2',
  CANDIDATES: 'hireflow_candidates_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  speechRate: 1.0,
  speechPitch: 1.0,
  preferredVoiceURI: '',
  autoPlayQuestions: true,
  defaultRole: 'Software Developer',
  defaultExperience: 'Fresher',
  defaultLanguage: 'English',
};

export const storageService = {
  // --- INTERVIEW SESSIONS ---
  getSessions(): InterviewSessionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => b.createdAt - a.createdAt);
      }
      return [];
    } catch (e) {
      console.error('Failed to read sessions', e);
      return [];
    }
  },

  getSessionById(id: string): InterviewSessionRecord | null {
    return this.getSessions().find((s) => s.id === id) || null;
  },

  saveSession(session: InterviewSessionRecord): void {
    try {
      const sessions = this.getSessions();
      const idx = sessions.findIndex((s) => s.id === session.id);
      if (idx >= 0) {
        sessions[idx] = session;
      } else {
        sessions.unshift(session);
      }
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  },

  deleteSession(id: string): void {
    try {
      const filtered = this.getSessions().filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  },

  clearAllSessions(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    } catch (e) {
      console.error('Failed to clear sessions', e);
    }
  },

  // --- ENGLISH COACH HISTORY ---
  getEnglishPractices(): EnglishCorrectionResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENGLISH);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.sort((a, b) => b.timestamp - a.timestamp) : [];
    } catch (e) {
      return [];
    }
  },

  saveEnglishPractice(result: EnglishCorrectionResult): void {
    try {
      const items = this.getEnglishPractices();
      items.unshift(result);
      localStorage.setItem(STORAGE_KEYS.ENGLISH, JSON.stringify(items.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save English practice', e);
    }
  },

  // --- RESUME ASSISTANT HISTORY ---
  getResumeAnalyses(): ResumeAnalysisResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESUME);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.sort((a, b) => b.timestamp - a.timestamp) : [];
    } catch (e) {
      return [];
    }
  },

  saveResumeAnalysis(analysis: ResumeAnalysisResult): void {
    try {
      const list = this.getResumeAnalyses();
      list.unshift(analysis);
      localStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(list.slice(0, 20)));
    } catch (e) {
      console.error('Failed to save resume analysis', e);
    }
  },

  // --- CAREER ROADMAPS ---
  getRoadmaps(): CareerRoadmapData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROADMAPS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.sort((a, b) => b.createdAt - a.createdAt) : [];
    } catch (e) {
      return [];
    }
  },

  getActiveRoadmap(): CareerRoadmapData | null {
    const list = this.getRoadmaps();
    return list.length > 0 ? list[0] : null;
  },

  saveRoadmap(roadmap: CareerRoadmapData): void {
    try {
      const list = this.getRoadmaps();
      const idx = list.findIndex((r) => r.id === roadmap.id);
      if (idx >= 0) {
        list[idx] = roadmap;
      } else {
        list.unshift(roadmap);
      }
      localStorage.setItem(STORAGE_KEYS.ROADMAPS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save roadmap', e);
    }
  },

  toggleRoadmapTask(roadmapId: string, phaseId: string, taskId: string): CareerRoadmapData | null {
    try {
      const list = this.getRoadmaps();
      const roadmap = list.find((r) => r.id === roadmapId);
      if (!roadmap) return null;

      const phase = roadmap.phases.find((p) => p.id === phaseId);
      if (!phase) return null;

      const task = phase.tasks.find((t) => t.id === taskId);
      if (!task) return null;

      task.completed = !task.completed;
      this.saveRoadmap(roadmap);
      return roadmap;
    } catch (e) {
      console.error('Failed to toggle roadmap task', e);
      return null;
    }
  },

  // --- USER SETTINGS ---
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<UserSettings>): UserSettings {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  // --- AGGREGATE PERFORMANCE ANALYTICS ---
  getAnalyticsSummary() {
    const sessions = this.getSessions();
    const englishPractices = this.getEnglishPractices();
    const resumeAnalyses = this.getResumeAnalyses();
    const activeRoadmap = this.getActiveRoadmap();

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

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalQuestionsAnswered: 0,
        averageOverallScore: 0,
        criteriaAverages: {
          relevance: 0,
          technicalCorrectness: 0,
          clarityAndStructure: 0,
          specificExamples: 0,
          communicationQuality: 0,
        },
        englishPracticesCount: englishPractices.length,
        resumeAnalysesCount: resumeAnalyses.length,
        roadmapProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        completedTasks,
        totalTasks,
        frequentlyMissedSkills: [
          'Quantifying project results with measurable metrics',
          'Structuring responses using Situation-Task-Action-Result (STAR)',
          'Clear technical trade-off explanation',
          'Eliminating filler words during verbal delivery',
        ],
        recentSessions: [],
      };
    }

    let sumOverall = 0;
    let sumRel = 0;
    let sumTech = 0;
    let sumClar = 0;
    let sumEx = 0;
    let sumComm = 0;
    let totalQs = 0;
    const missingCounts: Record<string, number> = {};

    sessions.forEach((s) => {
      sumOverall += s.overallScore;
      sumRel += s.criteriaAverage.relevance;
      sumTech += s.criteriaAverage.technicalCorrectness;
      sumClar += s.criteriaAverage.clarityAndStructure;
      sumEx += s.criteriaAverage.specificExamples;
      sumComm += s.criteriaAverage.communicationQuality;
      totalQs += s.questionsCompleted;

      s.items.forEach((item) => {
        item.evaluation.missingInformation?.forEach((m) => {
          const trimmed = m.trim();
          if (trimmed.length > 5) {
            missingCounts[trimmed] = (missingCounts[trimmed] || 0) + 1;
          }
        });
        item.evaluation.improvementSuggestions?.forEach((imp) => {
          const trimmed = imp.trim();
          if (trimmed.length > 5) {
            missingCounts[trimmed] = (missingCounts[trimmed] || 0) + 1;
          }
        });
      });
    });

    const count = sessions.length;
    const sortedMissed = Object.entries(missingCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill)
      .slice(0, 5);

    return {
      totalSessions: count,
      totalQuestionsAnswered: totalQs,
      averageOverallScore: Math.round(sumOverall / count),
      criteriaAverages: {
        relevance: Math.round(sumRel / count),
        technicalCorrectness: Math.round(sumTech / count),
        clarityAndStructure: Math.round(sumClar / count),
        specificExamples: Math.round(sumEx / count),
        communicationQuality: Math.round(sumComm / count),
      },
      englishPracticesCount: englishPractices.length,
      resumeAnalysesCount: resumeAnalyses.length,
      roadmapProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      completedTasks,
      totalTasks,
      frequentlyMissedSkills:
        sortedMissed.length > 0
          ? sortedMissed
          : [
              'Framing problem statements objectively',
              'Providing concrete project metrics',
              'Consistent past tense in project recaps',
            ],
      recentSessions: sessions.slice(0, 6),
    };
  },

  // --- HIREFLOW CANDIDATE MANAGEMENT ---
  getCandidates(): CandidateRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => b.uploadedAt - a.uploadedAt);
      }
      return [];
    } catch (e) {
      console.error('Failed to read candidates', e);
      return [];
    }
  },

  getCandidateById(id: string): CandidateRecord | null {
    return this.getCandidates().find((c) => c.id === id) || null;
  },

  saveCandidate(candidate: CandidateRecord): CandidateRecord {
    try {
      const list = this.getCandidates();
      // Check for duplicate by email (if available) or normalized name + role
      const duplicateIndex = list.findIndex((c) => {
        if (candidate.email && c.email && candidate.email.toLowerCase() === c.email.toLowerCase()) {
          return true;
        }
        return (
          c.name.trim().toLowerCase() === candidate.name.trim().toLowerCase() &&
          c.targetRole.trim().toLowerCase() === candidate.targetRole.trim().toLowerCase()
        );
      });

      if (duplicateIndex >= 0) {
        // Update existing record, preserving original ID and status if already customized
        const existing = list[duplicateIndex];
        const updated: CandidateRecord = {
          ...candidate,
          id: existing.id,
          status: existing.status !== 'New' ? existing.status : candidate.status,
          uploadedAt: Date.now(),
        };
        list[duplicateIndex] = updated;
        localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(list));
        return updated;
      } else {
        list.unshift(candidate);
        localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(list));
        return candidate;
      }
    } catch (e) {
      console.error('Failed to save candidate', e);
      return candidate;
    }
  },

  updateCandidateStatus(id: string, status: CandidateStatus): CandidateRecord | null {
    try {
      const list = this.getCandidates();
      const candidate = list.find((c) => c.id === id);
      if (!candidate) return null;
      candidate.status = status;
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(list));
      return candidate;
    } catch (e) {
      console.error('Failed to update candidate status', e);
      return null;
    }
  },

  deleteCandidate(id: string): boolean {
    try {
      const list = this.getCandidates();
      const filtered = list.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Failed to delete candidate', e);
      return false;
    }
  },

  clearCandidates(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    } catch (e) {
      console.error('Failed to clear candidates', e);
    }
  },

  getCandidateStats() {
    const candidates = this.getCandidates();
    const total = candidates.length;
    if (total === 0) {
      return {
        totalCandidates: 0,
        averageMatchScore: 0,
        shortlistedCount: 0,
        underReviewCount: 0,
        reviewedCount: 0,
        highMatchCount: 0,
        topSkills: [],
        topMissingSkills: [],
      };
    }

    const sumScore = candidates.reduce((sum, c) => sum + (c.matchScore || 0), 0);
    const shortlistedCount = candidates.filter((c) => c.status === 'Shortlisted').length;
    const underReviewCount = candidates.filter((c) => c.status === 'Under Review' || c.status === 'New').length;
    const reviewedCount = candidates.filter((c) => c.status === 'Reviewed').length;
    const highMatchCount = candidates.filter((c) => c.matchScore >= 80).length;

    const skillCounts: Record<string, number> = {};
    const missingCounts: Record<string, number> = {};

    candidates.forEach((c) => {
      c.skills?.forEach((s) => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
      c.missingSkills?.forEach((m) => {
        missingCounts[m] = (missingCounts[m] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    const topMissingSkills = Object.entries(missingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalCandidates: total,
      averageMatchScore: Math.round(sumScore / total),
      shortlistedCount,
      underReviewCount,
      reviewedCount,
      highMatchCount,
      topSkills,
      topMissingSkills,
    };
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.ENGLISH);
      localStorage.removeItem(STORAGE_KEYS.RESUME);
      localStorage.removeItem(STORAGE_KEYS.ROADMAPS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    } catch (e) {
      console.error('Failed to clear local data', e);
    }
  },

  getStats() {
    return this.getAnalyticsSummary();
  },
};

