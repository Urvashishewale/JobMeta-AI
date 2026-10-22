import {
  InterviewQuestion,
  InterviewSetupConfig,
  AnswerRubricEvaluation,
  CompletedInterviewItem,
  EnglishPracticeGoal,
  EnglishCorrectionResult,
  ResumeAnalysisResult,
  CareerRoadmapData,
  CandidateRecord,
} from '../types/jobmate';

export interface HealthResponse {
  status: string;
  appName: string;
  geminiConfigured: boolean;
  mcpToolsAvailable: number;
  timestamp: string;
}

export const apiService = {
  async checkHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (e) {
      return {
        status: 'offline',
        appName: 'JobMate AI',
        geminiConfigured: false,
        mcpToolsAvailable: 5,
        timestamp: new Date().toISOString(),
      };
    }
  },

  async generateQuestions(config: InterviewSetupConfig): Promise<{
    questions: InterviewQuestion[];
    source: 'gemini' | 'simulation';
    note?: string;
  }> {
    const res = await fetch('/api/gemini/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to generate questions (${res.status})`);
    }

    return await res.json();
  },

  async evaluateAnswer(
    question: InterviewQuestion,
    candidateAnswer: string,
    config: InterviewSetupConfig
  ): Promise<{
    evaluation: AnswerRubricEvaluation;
    source: 'gemini' | 'simulation' | 'local-validation';
  }> {
    const res = await fetch('/api/gemini/evaluate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, candidateAnswer, config }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to evaluate answer (${res.status})`);
    }

    return await res.json();
  },

  async generateFollowUp(
    question: InterviewQuestion,
    candidateAnswer: string,
    config: InterviewSetupConfig
  ): Promise<{
    followUp: InterviewQuestion;
    source: 'gemini' | 'simulation';
  }> {
    const res = await fetch('/api/gemini/generate-follow-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, candidateAnswer, config }),
    });

    if (!res.ok) {
      throw new Error('Failed to generate follow up question');
    }

    return await res.json();
  },

  async generateFinalReport(
    config: InterviewSetupConfig,
    items: CompletedInterviewItem[]
  ): Promise<{
    summaryReport: {
      strongestAnswer: string;
      priorityImprovements: string[];
      recommendedTopics: string[];
      actionableNextSteps: string[];
      verdict: string;
    };
    source: 'gemini' | 'simulation';
  }> {
    const res = await fetch('/api/gemini/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config, items }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to generate report (${res.status})`);
    }

    return await res.json();
  },

  async practiseEnglish(
    sentence: string,
    goal: EnglishPracticeGoal
  ): Promise<{
    result: EnglishCorrectionResult;
    source: 'gemini' | 'simulation';
  }> {
    const res = await fetch('/api/gemini/practise-english', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence, goal }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to check English sentence (${res.status})`);
    }

    return await res.json();
  },

  async improveResume(
    resumeText: string,
    targetRole: string,
    jobDescription?: string
  ): Promise<{
    result: ResumeAnalysisResult;
    source: 'gemini' | 'simulation';
  }> {
    const res = await fetch('/api/gemini/improve-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, targetRole, jobDescription }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to audit resume (${res.status})`);
    }

    return await res.json();
  },

  async generateRoadmap(
    targetRole: string,
    currentSkills: string,
    weeklyHours: number
  ): Promise<{
    result: CareerRoadmapData;
    source: 'gemini' | 'simulation';
  }> {
    const res = await fetch('/api/gemini/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole, currentSkills, weeklyHours }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to generate career roadmap (${res.status})`);
    }

    return await res.json();
  },

  async uploadAndAnalyzeResumes(
    files: File[],
    targetRole: string,
    jobDescription?: string
  ): Promise<{
    success: boolean;
    count: number;
    candidate: CandidateRecord;
    candidates: CandidateRecord[];
    errors?: Array<{ fileName: string; error: string }>;
  }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('resumes', file);
    });
    formData.append('targetRole', targetRole);
    if (jobDescription) {
      formData.append('jobDescription', jobDescription);
    }

    const res = await fetch('/upload-resume', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Resume analysis failed (${res.status})`);
    }

    return await res.json();
  },
};

