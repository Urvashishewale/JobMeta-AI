export type NavItemId =
  | 'dashboard'
  | 'mock-interview'
  | 'voice-interview'
  | 'english-coach'
  | 'resume-assistant'
  | 'career-roadmap'
  | 'analytics'
  | 'settings'
  | 'candidates';

export type JobRole =
  | 'Data Analyst'
  | 'Software Developer'
  | 'Software Tester'
  | 'DevOps Engineer'
  | 'HR / People Operations'
  | 'Custom Role';

export type ExperienceLevel = 'Fresher' | 'Beginner' | 'Intermediate';

export type InterviewType = 'HR' | 'Technical' | 'Behavioral' | 'Mixed';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type InterviewLanguage = 'English' | 'Hindi' | 'Marathi';

// --- MOCK & VOICE INTERVIEW TYPES ---
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
  followUpPrompt?: string;
  isFollowUp?: boolean;
}

export interface RubricCriteriaScores {
  relevance: number; // 0-100
  technicalCorrectness: number; // 0-100
  clarityAndStructure: number; // 0-100
  specificExamples: number; // 0-100
  communicationQuality: number; // 0-100
}

export interface AnswerRubricEvaluation {
  questionId: string;
  candidateAnswer: string;
  scores: RubricCriteriaScores;
  overallScore: number; // 0-100
  scoreExplanation: string;
  strengths: string[];
  missingInformation: string[];
  improvementSuggestions: string[];
  strongerSampleAnswer: string;
  recommendedNextPracticeTask: string;
  confidenceDisclaimer: string;
}

export interface CompletedInterviewItem {
  question: InterviewQuestion;
  userAnswer: string;
  durationSeconds: number;
  evaluation: AnswerRubricEvaluation;
  timestamp: number;
}

export interface InterviewSetupConfig {
  targetRole: string;
  isCustomRole?: boolean;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  questionCount: number;
  language: InterviewLanguage;
  answerMode: 'text' | 'voice';
  speechOutput: boolean;
  targetCompany?: string;
  jobDescription?: string;
}

export interface InterviewSessionRecord {
  id: string;
  createdAt: number;
  config: InterviewSetupConfig;
  questionsCompleted: number;
  totalQuestions: number;
  overallScore: number;
  criteriaAverage: RubricCriteriaScores;
  items: CompletedInterviewItem[];
  mode: 'typed' | 'voice';
  source: 'gemini' | 'simulation';
  summaryReport?: {
    strongestAnswer: string;
    priorityImprovements: string[];
    recommendedTopics: string[];
    actionableNextSteps: string[];
    verdict: string;
  };
}

// --- ENGLISH COMMUNICATION COACH TYPES ---
export type EnglishPracticeGoal =
  | 'Daily conversation'
  | 'HR interview practice'
  | 'Professional workplace communication'
  | 'IT interview answers';

export interface EnglishCorrectionResult {
  id: string;
  originalSentence: string;
  correctedSentence: string;
  goal: EnglishPracticeGoal;
  explanations: string[];
  moreNaturalAlternative: string;
  practiceExercise: {
    prompt: string;
    suggestedAnswer: string;
  };
  vocabularySuggestions?: Array<{
    originalWord: string;
    suggestedWord: string;
    reason: string;
  }>;
  toneAssessment: string;
  timestamp: number;
}

// --- RESUME INTELLIGENCE TYPES ---
export interface BulletPointRevision {
  original: string;
  revised: string;
  improved?: string;
  issueIdentified: string;
  impactImprovement: string;
  reason?: string;
}

export interface ResumeAnalysisResult {
  id: string;
  targetRole: string;
  overallResumeScore: number; // 0-100
  strengths: string[];
  improvementAreas: string[];
  missingOrUnclearInfo: string[];
  detectedSkills: string[];
  jdMatchingKeywords: string[];
  missingJdKeywords: string[];
  bulletPointRevisions: BulletPointRevision[];
  groundedProfessionalSummary: string;
  securityNotice: string;
  timestamp: number;
}

export type CandidateStatus = 'New' | 'Under Review' | 'Shortlisted' | 'Reviewed' | 'Rejected';

export interface WorkExperienceItem {
  role: string;
  company: string;
  duration: string;
  details: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  techStack: string[];
}

export interface CandidateRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  targetRole: string;
  matchScore: number; // 0-100
  status: CandidateStatus;
  skills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  experienceYears: number;
  workExperience: WorkExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: string[];
  summary: string;
  bulletPointRevisions: BulletPointRevision[];
  completenessScore: number;
  actionableSuggestions: string[];
  rawExtractedText: string;
  fileName: string;
  fileSize: string;
  uploadedAt: number;
  jobDescriptionContext?: string;
}

// --- CAREER ROADMAP TYPES ---
export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  completed: boolean;
  resourceTip?: string;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  focusArea: string;
  estimatedWeeks: number;
  coreSkills: string[];
  tasks: RoadmapTask[];
  practicalExercise: string;
  portfolioProject: {
    title: string;
    description: string;
    techStack: string[];
  };
}

export interface CareerRoadmapData {
  id: string;
  targetRole: string;
  currentSkills: string;
  weeklyHours: number;
  totalEstimatedWeeks: number;
  phases: RoadmapPhase[];
  readinessChecklist: string[];
  createdAt: number;
}

// --- USER SETTINGS ---
export interface UserSettings {
  speechRate: number;
  speechPitch: number;
  preferredVoiceURI: string;
  autoPlayQuestions: boolean;
  defaultRole: string;
  defaultExperience: ExperienceLevel;
  defaultLanguage: InterviewLanguage;
}
