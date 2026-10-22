export type ExperienceLevel = 'Fresher' | 'Entry-Level' | 'Experienced';

export type InterviewType = 'Technical' | 'HR' | 'Behavioral' | 'Mixed';

export type InterviewLanguage = 'English' | 'Hindi' | 'Marathi';

export type AnswerMode = 'voice' | 'text';

export interface InterviewSetupConfig {
  targetRole: string;
  isCustomRole?: boolean;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  questionCount: number;
  language: InterviewLanguage;
  answerMode: AnswerMode;
  speechOutput: boolean;
  targetCompany?: string;
  jobDescription?: string;
}

export interface QuestionModelAnswer {
  answer: string;
  rationale: string;
  starMethod?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  text: string;
  category: 'technical' | 'behavioral' | 'hr' | 'situational' | 'general';
  expectedKeyPoints?: string[];
  modelAnswer?: QuestionModelAnswer;
}

export interface AnswerScores {
  overall: number; // 0-100
  relevance: number; // 0-100
  clarity: number; // 0-100
  completeness: number; // 0-100
  communication: number; // 0-100
  technicalCorrectness?: number; // 0-100
}

export interface AnswerEvaluation {
  questionId: string;
  candidateAnswer: string;
  scores: AnswerScores;
  strengths: string[];
  areasToImprove: string[];
  grammarAndLanguageFeedback?: string;
  betterAnswerExample: string;
  feedbackSummary: string;
  rubricExplanation: string;
  audioAnalysisDisclaimer: string;
}

export interface CompletedQuestionItem {
  question: InterviewQuestion;
  userAnswer: string;
  durationSeconds: number;
  evaluation: AnswerEvaluation;
  timestamp: number;
}

export interface InterviewSessionSummary {
  strongestAnswer: string;
  priorityImprovementAreas: string[];
  recommendedTopics: string[];
  actionableNextSteps: string[];
  verdict: string;
}

export interface InterviewSessionRecord {
  id: string;
  createdAt: number;
  config: InterviewSetupConfig;
  questionsCompleted: number;
  totalQuestions: number;
  overallScore: number;
  categoryScores: {
    relevance: number;
    clarity: number;
    completeness: number;
    communication: number;
    technical?: number;
  };
  items: CompletedQuestionItem[];
  summaryReport: InterviewSessionSummary;
  mode: 'gemini' | 'simulation';
}

export interface UserSettings {
  speechRate: number; // 0.5 to 2.0 (default 1.0)
  speechPitch: number; // 0.5 to 1.5 (default 1.0)
  preferredVoiceURI: string;
  autoPlayQuestions: boolean;
  defaultRole: string;
  defaultExperience: ExperienceLevel;
  defaultLanguage: InterviewLanguage;
}
