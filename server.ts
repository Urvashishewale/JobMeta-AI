import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';
import {
  JobMateMcpTools,
  handleStartMockInterview,
  handleEvaluateInterviewAnswer,
  handleGenerateCareerRoadmap,
  handleImproveResume,
  handlePractiseEnglish,
} from './src/mcp/jobmateMcpServer';
import {
  validatePdfBuffer,
  extractTextFromPdfBuffer,
  analyzeCandidateResume,
} from './src/services/resumeAnalysisEngine';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI instance with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'JobMate AI — Your Personal AI Career Coach',
    geminiConfigured: !!apiKey,
    mcpToolsAvailable: JobMateMcpTools.length,
    timestamp: new Date().toISOString(),
  });
});

// Fallback curated questions generator by role & type
function getFallbackQuestions(config: any): any[] {
  const { targetRole, experienceLevel, interviewType, questionCount = 5 } = config;
  const isExp = experienceLevel === 'Intermediate';
  const isHR = interviewType === 'HR';

  const bank: any[] = [];

  // Question 1: Introduction / Role Fit
  bank.push({
    id: 'q-1',
    questionNumber: 1,
    category: isHR ? 'hr' : 'general',
    text: `Tell me about yourself, your background, and why you are interested in this ${targetRole} position?`,
    expectedKeyPoints: [
      'Concise summary of educational and technical training',
      `Direct alignment with ${targetRole} core requirements`,
      'Key projects or hands-on accomplishments',
      'Forward-looking career enthusiasm',
    ],
    modelAnswer: {
      answer: `I am an aspiring ${targetRole} with a strong foundation in problem solving and collaborative engineering. In my projects, I have focused on writing maintainable solutions and tackling real user problems. I am drawn to this role because it aligns directly with my goal to contribute to scalable solutions and grow with a high-impact team.`,
      rationale: 'Follows Present-Past-Future professional structure.',
      starMethod: {
        situation: `Applying for ${targetRole}`,
        task: 'Summarize qualifications and role fit',
        action: 'Highlighted technical training, project milestones, and teamwork',
        result: 'Established credibility and genuine enthusiasm',
      },
    },
    followUpPrompt: 'What specific aspect of our tech stack or domain excites you the most?',
  });

  // Question 2: Technical / Core Competency
  if (isHR) {
    bank.push({
      id: 'q-2',
      questionNumber: 2,
      category: 'behavioral',
      text: 'Describe a situation where you had to work with a team member who had a different perspective or approach. How did you resolve it?',
      expectedKeyPoints: [
        'Objective description of the conflict without personal blame',
        'Active listening and collaborative discussion',
        'Data-driven compromise',
        'Successful project delivery',
      ],
      modelAnswer: {
        answer:
          'In a team project, my colleague and I had opposing views on the component state architecture. I scheduled a quick 15-minute sync where we both listed the trade-offs on memory vs latency. We ran a benchmark test together, agreed on the best approach based on the numbers, and delivered the module ahead of schedule.',
        rationale: 'Uses the STAR framework with a data-driven resolution mindset.',
        starMethod: {
          situation: 'Disagreement over component architecture in milestone project',
          task: 'Resolve technical conflict without stalling project velocity',
          action: 'Conducted an objective trade-off evaluation and collaborative benchmark',
          result: 'Shipped module on time and strengthened mutual trust',
        },
      },
      followUpPrompt: 'How do you ensure constructive feedback is maintained across future projects?',
    });
  } else {
    bank.push({
      id: 'q-2',
      questionNumber: 2,
      category: 'technical',
      text: isExp
        ? `In your experience as a ${targetRole}, how do you evaluate architectural trade-offs between performance optimization and code maintainability?`
        : `As a ${experienceLevel} ${targetRole}, how do you ensure the code you write is clean, debuggable, and well-tested?`,
      expectedKeyPoints: [
        'Modular architecture and single responsibility principle',
        'Automated testing (unit/integration) and linting',
        'Meaningful naming conventions and documentation',
        'Performance profiling before premature optimization',
      ],
      modelAnswer: {
        answer:
          'I prioritize clarity and maintainability first. I adhere to clean code principles, isolate logic into testable units, and write unit tests for critical edge cases. When performance bottlenecks arise, I rely on profiling tools to measure actual latency rather than prematurely complicating the codebase.',
        rationale: 'Demonstrates engineering maturity and practical disciplined habits.',
      },
      followUpPrompt: 'Can you describe a time when premature optimization actually caused an issue in a project?',
    });
  }

  // Question 3: Problem Solving / Challenge
  bank.push({
    id: 'q-3',
    questionNumber: 3,
    category: 'situational',
    text: 'Tell me about the most challenging bug or technical roadblock you faced, and how you systematically diagnosed and resolved it?',
    expectedKeyPoints: [
      'Clear definition of the problem and its impact',
      'Systematic debugging method (logs, breakpoints, isolating variables)',
      'Root cause analysis',
      'Preventive measure or regression test',
    ],
    modelAnswer: {
      answer:
        'During a release, users experienced intermittent timeouts during large payload uploads. I reproduced the issue in a staging sandbox with simulated network throttling, analyzed network traces, and identified that memory was leaking due to unclosed file streams. I refactored the pipeline to use chunked streaming and added automated integration tests.',
      rationale: 'Clear STAR story showcasing systematic diagnostic capabilities.',
      starMethod: {
        situation: 'Intermittent payload timeouts affecting user requests',
        task: 'Identify root cause and resolve without degrading service uptime',
        action: 'Replicated under throttled staging, inspected stream lifecycles, implemented chunking',
        result: 'Eliminated timeouts, reduced memory consumption by 40%, and added regression tests',
      },
    },
    followUpPrompt: 'What monitoring tools would you set up to catch similar regressions in production?',
  });

  // Question 4: Adaptability / Learning
  bank.push({
    id: 'q-4',
    questionNumber: 4,
    category: 'behavioral',
    text: 'Technology stacks evolve rapidly. How do you approach picking up a new tool, framework, or domain requirement on a tight deadline?',
    expectedKeyPoints: [
      'Proactive learning strategy (official docs, minimal proofs-of-concept)',
      'Focus on core principles rather than superficial syntax',
      'Asking focused questions when blocked',
      'Documenting insights for teammates',
    ],
    modelAnswer: {
      answer:
        'When facing a new technology, I start by reviewing official documentation and building a minimal proof-of-concept to understand core paradigms. I isolate what is strictly required for the deliverable versus nice-to-know extras, and I document what I learned for the team.',
      rationale: 'Highlights pragmatic resourcefulness, time-boxing, and team knowledge sharing.',
    },
  });

  // Question 5: Professional Goals
  bank.push({
    id: 'q-5',
    questionNumber: 5,
    category: 'hr',
    text: `Where do you see yourself professionally in the next 2 to 3 years within the ${targetRole} domain?`,
    expectedKeyPoints: [
      'Realistic skill expansion goals',
      'Desire to take on deeper technical or ownership responsibility',
      'Commitment to continuous learning and mentoring others',
    ],
    modelAnswer: {
      answer:
        'In the next 2 to 3 years, I see myself having mastered our core stack and taking end-to-end ownership of major feature initiatives. I want to contribute to architectural discussions, help mentor newer team members, and stay at the forefront of engineering best practices.',
      rationale: 'Shows healthy ambition, organizational loyalty, and balanced growth.',
    },
  });

  return bank.slice(0, questionCount);
}

// Robust multi-model Gemini caller with automatic fallback across supported model tiers
async function callGeminiWithFallback(params: {
  contents: any;
  config?: any;
  primaryModel?: string;
  fallbackModel?: string;
}): Promise<any> {
  if (!ai) throw new Error('AI service client is not initialized.');
  const primary = params.primaryModel || 'gemini-3.1-flash-lite';
  const fallback = params.fallbackModel || 'gemini-3.8-flash';

  try {
    return await ai.models.generateContent({
      model: primary,
      contents: params.contents,
      config: params.config,
    });
  } catch (primaryErr: any) {
    console.warn(
      `Primary Gemini model (${primary}) call failed: ${primaryErr?.message || primaryErr}. Attempting fallback (${fallback})...`
    );
    return await ai.models.generateContent({
      model: fallback,
      contents: params.contents,
      config: params.config,
    });
  }
}

// Normalizes evaluation objects to simultaneously satisfy AnswerEvaluation and AnswerRubricEvaluation contracts
function normalizeEvaluation(raw: any, question: any, answer: string): any {
  const scores = raw?.scores || {};
  const overall = Number(raw?.overallScore ?? scores.overall ?? 75);
  const relevance = Number(scores.relevance ?? 75);
  const clarity = Number(scores.clarityAndStructure ?? scores.clarity ?? 75);
  const tech = Number(scores.technicalCorrectness ?? scores.completeness ?? 75);
  const examples = Number(scores.specificExamples ?? 70);
  const comm = Number(scores.communicationQuality ?? scores.communication ?? 75);

  const explanation =
    raw?.scoreExplanation ||
    raw?.rubricExplanation ||
    raw?.feedbackSummary ||
    'Evaluation completed against interview rubric.';
  const strengths =
    Array.isArray(raw?.strengths) && raw.strengths.length > 0
      ? raw.strengths
      : ['Demonstrated clear, professional articulation.'];
  const improvements =
    Array.isArray(raw?.improvementSuggestions) && raw.improvementSuggestions.length > 0
      ? raw.improvementSuggestions
      : Array.isArray(raw?.areasToImprove) && raw.areasToImprove.length > 0
      ? raw.areasToImprove
      : ['Structure answers using the STAR method: Situation, Task, Action, and measurable Result.'];
  const missing =
    Array.isArray(raw?.missingInformation) && raw.missingInformation.length > 0
      ? raw.missingInformation
      : ['Quantifiable project outcome or technical trade-off details.'];
  const modelAnswer =
    raw?.strongerSampleAnswer ||
    raw?.betterAnswerExample ||
    question?.modelAnswer?.answer ||
    'A structured response using the STAR method.';
  const disclaimer =
    raw?.confidenceDisclaimer ||
    raw?.audioAnalysisDisclaimer ||
    'Assessment generated based on text transcript.';

  return {
    questionId: question?.id || 'q-1',
    candidateAnswer: answer,
    overallScore: overall,
    scoreExplanation: explanation,
    rubricExplanation: explanation,
    feedbackSummary: explanation,
    scores: {
      overall,
      relevance,
      clarity,
      clarityAndStructure: clarity,
      completeness: tech,
      technicalCorrectness: tech,
      specificExamples: examples,
      communication: comm,
      communicationQuality: comm,
    },
    strengths,
    areasToImprove: improvements,
    improvementSuggestions: improvements,
    missingInformation: missing,
    betterAnswerExample: modelAnswer,
    strongerSampleAnswer: modelAnswer,
    recommendedNextPracticeTask:
      raw?.recommendedNextPracticeTask ||
      'Practice speaking your thoughts aloud using a 60-second timer to detail technical solutions.',
    confidenceDisclaimer: disclaimer,
    audioAnalysisDisclaimer: disclaimer,
  };
}

// Deterministic semantic rubric evaluator analyzing real answer content across 4 core criteria
function evaluateAnswerSemantically(question: any, answer: string, config: any): any {
  const trimmed = answer.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = trimmed.toLowerCase();
  const targetRole = config?.targetRole || 'Software Developer';
  const roleLower = targetRole.toLowerCase();

  // 1. Technical competencies
  const techKeywords = [
    'react', 'next', 'vue', 'angular', 'javascript', 'typescript', 'node', 'express',
    'python', 'django', 'flask', 'fastapi', 'java', 'spring', 'c++', 'c#', '.net',
    'sql', 'postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'nosql',
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'cloud', 'git', 'github', 'ci/cd',
    'rest', 'api', 'apis', 'graphql', 'microservice', 'microservices', 'html', 'css',
    'tailwind', 'testing', 'jest', 'unit tests', 'system design', 'architecture',
    'frontend', 'backend', 'full stack', 'fullstack', 'database', 'linux'
  ];
  const detectedTech = techKeywords.filter((tk) => lower.includes(tk));

  // Educational background markers
  const eduMarkers = [
    'degree', 'bachelor', 'b.tech', 'm.tech', 'b.s.', 'm.s.', 'master', 'university',
    'college', 'graduated', 'computer science', 'engineering', 'coursework', 'bootcamp',
    'self-taught', 'education'
  ];
  const hasEdu = eduMarkers.some((em) => lower.includes(em));

  // 2. Hands-on projects & measurable achievements
  const projectActionVerbs = [
    'built', 'created', 'developed', 'engineered', 'designed', 'implemented', 'deployed',
    'architected', 'led', 'optimized', 'reduced', 'increased', 'improved', 'scaled',
    'refactored', 'launched', 'automated', 'integrated', 'delivered', 'managed'
  ];
  const detectedActions = projectActionVerbs.filter((act) => lower.includes(act));
  const hasMetrics = /\b(\d+(\.\d+)?%|\d+\s*(years?|yrs?|months?|x|k|m|users?|ms|seconds?|rps))\b/i.test(trimmed);

  // 3. Alignment with Position & Question Key Points
  const questionWords = (question?.text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w: string) => w.length > 3 && !['what', 'tell', 'about', 'your', 'this', 'have', 'with'].includes(w));
  const matchedQuestionThemes = questionWords.filter((qw: string) => lower.includes(qw));
  const mentionsRoleOrIndustry =
    lower.includes(roleLower) || lower.includes('developer') || lower.includes('software') || lower.includes('engineer');

  // 4. Communication & Career Motivation
  const motivationKeywords = [
    'interested', 'passionate', 'excited', 'motivated', 'opportunity', 'align',
    'culture', 'mission', 'growth', 'contribute', 'impact', 'scale', 'challenges',
    'distributed', 'collaborative', 'curious', 'aspire', 'value'
  ];
  const detectedMotivation = motivationKeywords.filter((m) => lower.includes(m));
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  // Compute criteria scores (0-100)
  let relevance = 60;
  if (matchedQuestionThemes.length >= 2) relevance += 18;
  else if (matchedQuestionThemes.length >= 1) relevance += 10;
  if (mentionsRoleOrIndustry) relevance += 10;
  if (detectedMotivation.length >= 1) relevance += 7;
  relevance = Math.min(96, Math.max(45, relevance));

  let technicalCorrectness = 55;
  technicalCorrectness += Math.min(30, detectedTech.length * 6);
  if (hasEdu) technicalCorrectness += 7;
  if (detectedActions.length >= 2) technicalCorrectness += 5;
  technicalCorrectness = Math.min(95, Math.max(40, technicalCorrectness));

  let clarityAndStructure = 62;
  if (wordCount >= 30 && wordCount <= 150) clarityAndStructure += 16;
  else if (wordCount > 150) clarityAndStructure += 8;
  if (sentences.length >= 2 && sentences.length <= 6) clarityAndStructure += 12;
  clarityAndStructure = Math.min(94, Math.max(45, clarityAndStructure));

  let specificExamples = 48;
  if (hasMetrics) specificExamples += 24;
  if (detectedActions.length >= 2) specificExamples += 15;
  else if (detectedActions.length === 1) specificExamples += 8;
  if (
    lower.includes('project') ||
    lower.includes('application') ||
    lower.includes('dashboard') ||
    lower.includes('microservice') ||
    lower.includes('service')
  ) {
    specificExamples += 8;
  }
  specificExamples = Math.min(95, Math.max(35, specificExamples));

  let communicationQuality = 64;
  if (detectedMotivation.length >= 2) communicationQuality += 16;
  else if (detectedMotivation.length === 1) communicationQuality += 8;
  if (wordCount >= 40) communicationQuality += 10;
  communicationQuality = Math.min(95, Math.max(50, communicationQuality));

  const overallScore = Math.round(
    relevance * 0.25 +
      technicalCorrectness * 0.25 +
      clarityAndStructure * 0.2 +
      specificExamples * 0.15 +
      communicationQuality * 0.15
  );

  const strengths: string[] = [];
  if (detectedTech.length > 0) {
    const techSample = detectedTech.slice(0, 3).map((t) => t.toUpperCase()).join(', ');
    strengths.push(`Clearly highlighted foundational technical competencies (${techSample}).`);
  } else {
    strengths.push('Provided a conversational, professional introduction to your profile.');
  }
  if (hasMetrics || detectedActions.length >= 1) {
    strengths.push('Cites tangible engineering actions demonstrating practical hands-on experience.');
  }
  if (detectedMotivation.length > 0) {
    strengths.push(`Articulated genuine career motivation aligned with ${targetRole} responsibilities.`);
  } else {
    strengths.push('Maintained a polite and professional tone throughout the response.');
  }

  const missingInformation: string[] = [];
  if (!hasMetrics) {
    missingInformation.push(
      'Measurable impact or scale metrics (e.g., latency reduction %, active users supported, or deployment speed).'
    );
  }
  if (detectedActions.length < 2) {
    missingInformation.push('Specific engineering decisions or architectural trade-offs encountered in past projects.');
  }
  if (!hasEdu && wordCount < 60) {
    missingInformation.push('Brief mention of formal education, key certifications, or technical milestones.');
  }
  if (detectedMotivation.length === 0) {
    missingInformation.push(`Specific alignment detailing why this particular ${targetRole} position fits your growth goals.`);
  }

  const improvementSuggestions: string[] = [
    'Apply the STAR method (Situation, Task, Action, Result) to give your project descriptions clear narrative momentum.',
    'Anchor claims in quantifiable numbers: quantify system throughput, active users, code coverage, or optimization gains.',
    `Close with a forward-looking statement linking your technical strengths to the challenges faced in a ${targetRole} team.`,
  ];

  const sampleTech = detectedTech.length > 0 ? detectedTech.slice(0, 2).join(' and ') : 'modern full-stack tools';
  const strongerSampleAnswer =
    question?.modelAnswer?.answer ||
    `I am a dedicated ${targetRole} with hands-on experience developing resilient web systems using ${sampleTech}. In my recent project, I architected scalable backend microservices and responsive interfaces, boosting user engagement and reducing API response latency by 35%. I am eager to join your team because your engineering culture tackles distributed challenges at scale, which directly matches my passion for performant, maintainable software.`;

  return {
    scores: {
      relevance,
      technicalCorrectness,
      clarityAndStructure,
      specificExamples,
      communicationQuality,
    },
    overallScore,
    scoreExplanation: `Rubric score calculated across technical depth, practical accomplishments, and ${targetRole} alignment (${wordCount} words).`,
    strengths: strengths.slice(0, 3),
    missingInformation: missingInformation.slice(0, 3),
    improvementSuggestions: improvementSuggestions.slice(0, 3),
    strongerSampleAnswer,
    recommendedNextPracticeTask: `Formulate a 60-second response detailing a specific technical problem you solved using the STAR framework.`,
    confidenceDisclaimer: `Evaluation generated via local rubric evaluator based on the text transcript of your answer.`,
  };
}

// 1. Generate Questions Endpoint
app.post('/api/gemini/generate-questions', async (req, res) => {
  try {
    const { config } = req.body;
    if (!config || !config.targetRole) {
      return res.status(400).json({ error: 'Missing required interview configuration.' });
    }

    const {
      targetRole,
      experienceLevel = 'Fresher',
      interviewType = 'Mixed',
      difficulty = 'Medium',
      questionCount = 5,
      language = 'English',
      jobDescription = '',
      targetCompany = '',
    } = config;

    if (!ai) {
      console.warn('GEMINI_API_KEY is not configured on server. Supplying curated simulation questions.');
      const questions = getFallbackQuestions(config);
      return res.json({
        source: 'simulation',
        questions,
        note: 'Generated via curated interview question bank (API key not configured in environment).',
      });
    }

    const prompt = `You are a principal technical recruiter and hiring manager conducting a ${difficulty} difficulty interview for the role of "${targetRole}".
Candidate Profile:
- Target Role: ${targetRole}
- Experience Level: ${experienceLevel}
- Interview Style: ${interviewType}
- Target Company / Context: ${targetCompany || 'General Tech Company'}
- Job Description Context: ${jobDescription || 'Standard industry requirements for this role'}
- Interview Language: ${language}
- Total Questions Requested: ${questionCount}

Generate exactly ${questionCount} distinct, sequential, realistic interview questions.
Each question must include:
1. "id": unique string ("q-1", "q-2", etc.)
2. "questionNumber": 1-indexed number
3. "category": one of ["technical", "behavioral", "hr", "situational", "general"]
4. "text": the exact question to be asked aloud in ${language}. Keep it natural and direct.
5. "expectedKeyPoints": array of 3-5 concise bullets outlining what an excellent candidate covers.
6. "modelAnswer": object with:
   - "answer": exemplary high-scoring answer
   - "rationale": explanation of why this answer succeeds
   - "starMethod": (for behavioral questions) situation, task, action, result.
7. "followUpPrompt": a natural follow-up question the interviewer might ask if the candidate answer is brief.

Return strictly a valid JSON array matching the schema.`;

    const response = await callGeminiWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              questionNumber: { type: Type.INTEGER },
              category: { type: Type.STRING },
              text: { type: Type.STRING },
              expectedKeyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              modelAnswer: {
                type: Type.OBJECT,
                properties: {
                  answer: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  starMethod: {
                    type: Type.OBJECT,
                    properties: {
                      situation: { type: Type.STRING },
                      task: { type: Type.STRING },
                      action: { type: Type.STRING },
                      result: { type: Type.STRING },
                    },
                  },
                },
              },
              followUpPrompt: { type: Type.STRING },
            },
            required: ['id', 'questionNumber', 'category', 'text', 'expectedKeyPoints', 'modelAnswer'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return res.json({
      source: 'gemini',
      questions: parsed,
    });
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error?.message || error);
    const fallback = getFallbackQuestions(req.body?.config || { targetRole: 'Software Developer' });
    return res.json({
      source: 'simulation',
      questions: fallback,
      warning: 'Curated questions loaded due to an external service timeout or quota limit.',
    });
  }
});

// 2. Evaluate Answer Endpoint (Full Rubric Criteria across Educational/Tech background, Projects, Role Alignment & Communication)
app.post('/api/gemini/evaluate-answer', async (req, res) => {
  try {
    const { question, candidateAnswer, config } = req.body;

    if (!question || typeof candidateAnswer !== 'string') {
      return res.status(400).json({ error: 'Missing question or candidate answer in request payload.' });
    }

    const trimmed = candidateAnswer.trim();
    if (trimmed.length === 0) {
      return res.status(400).json({
        error: 'Answer cannot be empty. Please speak or type your response before submitting.',
      });
    }

    // If Gemini is configured, attempt real AI evaluation with resilient fallback
    if (ai) {
      try {
        const prompt = `You are a senior hiring interviewer and engineering leader evaluating a candidate's response.
Context:
- Target Role: ${config?.targetRole || 'Software Developer'}
- Experience Level: ${config?.experienceLevel || 'Fresher'}
- Interview Type: ${config?.interviewType || 'General'}
- Language: ${config?.language || 'English'}

Question: "${question.text}"
Expected Key Points: ${JSON.stringify(question.expectedKeyPoints || [])}
Candidate's Answer: "${trimmed}"

Evaluate the answer objectively across these 4 core dimensions:
1. Educational and Technical Background ("technicalCorrectness"): Did the candidate demonstrate foundational technical knowledge, relevant technologies, and core fundamentals?
2. Relevant Projects and Hands-On Accomplishments ("specificExamples"): Did the candidate cite tangible projects, scale, measurable impact, or problem-solving experience?
3. Alignment with the ${config?.targetRole || 'Software Developer'} Position ("relevance"): Did the candidate directly address the prompt and show fit for the role?
4. Communication and Career Motivation ("communicationQuality" & "clarityAndStructure"): Was the answer well-structured, professional, concise, and articulate, demonstrating genuine motivation?

Return strictly valid JSON:
{
  "scores": {
    "relevance": 85,
    "technicalCorrectness": 82,
    "clarityAndStructure": 80,
    "specificExamples": 75,
    "communicationQuality": 88
  },
  "overallScore": 82,
  "scoreExplanation": "One or two clear sentences explaining the score verdict.",
  "strengths": ["Identified strength 1 referencing their answer", "Identified strength 2"],
  "missingInformation": ["Specific missing detail 1 that was expected", "Specific missing detail 2"],
  "improvementSuggestions": ["Actionable improvement suggestion 1", "Actionable improvement suggestion 2"],
  "strongerSampleAnswer": "A concise, exemplary answer (under 120 words) applying the STAR method and highlighting metrics.",
  "recommendedNextPracticeTask": "One actionable task to practice next",
  "confidenceDisclaimer": "Assessment based strictly on the text transcript of your answer."
}`;

        const response = await callGeminiWithFallback({
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(response.text || '{}');
        const normalized = normalizeEvaluation(parsed, question, trimmed);
        return res.json({
          evaluation: normalized,
          source: 'gemini',
        });
      } catch (geminiError: any) {
        console.warn('Gemini evaluation request encountered an issue, invoking semantic rubric engine:', geminiError?.message || geminiError);
        const semanticResult = evaluateAnswerSemantically(question, trimmed, config);
        const normalized = normalizeEvaluation(semanticResult, question, trimmed);
        return res.json({
          evaluation: normalized,
          source: 'rubric-engine',
        });
      }
    }

    // Offline / unconfigured AI fallback using deterministic semantic evaluator
    const semanticResult = evaluateAnswerSemantically(question, trimmed, config);
    const normalized = normalizeEvaluation(semanticResult, question, trimmed);
    return res.json({
      evaluation: normalized,
      source: 'rubric-engine',
    });
  } catch (error: any) {
    console.error('Unexpected error in evaluate-answer route:', error);
    return res.status(500).json({
      error: `Failed to evaluate answer: ${error?.message || 'Internal evaluation exception'}. Please try again.`,
    });
  }
});

// 3. Generate Follow-Up Question Endpoint
app.post('/api/gemini/generate-follow-up', async (req, res) => {
  try {
    const { question, candidateAnswer, config } = req.body;

    if (!question || !candidateAnswer) {
      return res.status(400).json({ error: 'Missing question or answer.' });
    }

    if (!ai) {
      return res.json({
        followUp: {
          id: `fu-${Date.now()}`,
          questionNumber: question.questionNumber,
          category: question.category,
          text: question.followUpPrompt || `Could you elaborate on the technical trade-offs you considered in that scenario?`,
          isFollowUp: true,
        },
        source: 'simulation',
      });
    }

    const prompt = `You are an interviewer asking a follow-up question.
Role: ${config?.targetRole || 'Software Developer'}
Original Question: "${question.text}"
Candidate's Answer: "${candidateAnswer}"

Generate a natural, probing follow-up question (1 sentence) that asks the candidate to dive deeper into one specific aspect of what they just said.
Return valid JSON:
{
  "text": "The follow up question to speak aloud",
  "expectedKeyPoints": ["point 1", "point 2"]
}`;

    const response = await callGeminiWithFallback({
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      followUp: {
        id: `fu-${Date.now()}`,
        questionNumber: question.questionNumber,
        category: question.category,
        text: parsed.text || question.followUpPrompt || 'Could you provide a concrete example of how that worked?',
        expectedKeyPoints: parsed.expectedKeyPoints || [],
        isFollowUp: true,
      },
      source: 'gemini',
    });
  } catch (e) {
    return res.json({
      followUp: {
        id: `fu-${Date.now()}`,
        questionNumber: req.body?.question?.questionNumber || 1,
        category: req.body?.question?.category || 'technical',
        text: 'What was the most significant technical takeaway from that experience?',
        isFollowUp: true,
      },
      source: 'simulation',
    });
  }
});

// 4. Generate Final Interview Report Endpoint
app.post('/api/gemini/generate-report', async (req, res) => {
  try {
    const { config, items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No interview items provided.' });
    }

    const avgScore = Math.round(
      items.reduce((sum: number, it: any) => sum + (it.evaluation?.overallScore || it.evaluation?.scores?.overall || 0), 0) / items.length
    );

    const generateFallbackReport = () => {
      const strongest = [...items].sort(
        (a: any, b: any) => (b.evaluation?.overallScore || b.evaluation?.scores?.overall || 0) - (a.evaluation?.overallScore || a.evaluation?.scores?.overall || 0)
      )[0];

      return {
        strongestAnswer: strongest
          ? `Question #${strongest.question.questionNumber}: "${strongest.question.text}" (${strongest.evaluation?.overallScore || strongest.evaluation?.scores?.overall || avgScore}%)`
          : 'Good effort across the interview session.',
        priorityImprovements: [
          'Incorporate concrete metrics into project descriptions',
          'Structure behavioral answers into Situation, Task, Action, and Result (STAR)',
          'Articulate technical trade-offs more explicitly',
        ],
        recommendedTopics: [
          `${config?.targetRole || 'Domain'} Architecture & Patterns`,
          'STAR Storytelling for Behavioral Rounds',
          'Time-Boxed Verbal Communication',
        ],
        actionableNextSteps: [
          'Practice answering questions within a 90-second target window',
          'Review the model answers provided for each question',
          'Practice another round on JobMate AI to reinforce pacing',
        ],
        verdict:
          avgScore >= 80
            ? 'Strong Candidate: High potential with clear communication and solid answers.'
            : avgScore >= 60
            ? 'Promising Candidate: Good foundational knowledge; focus on structure and depth.'
            : 'Developing Candidate: Needs more structured practice and detailed examples.',
      };
    };

    if (!ai) {
      return res.json({
        source: 'simulation',
        summaryReport: generateFallbackReport(),
      });
    }

    try {
      const prompt = `You are an executive hiring mentor analyzing a full mock interview session.
Role: ${config?.targetRole || 'Professional'} (${config?.experienceLevel || 'Fresher'})
Interview Type: ${config?.interviewType || 'Mixed'}

Interview Questions and Candidate Answers:
${items
  .map(
    (it: any, i: number) => `
Q${i + 1}: ${it.question.text}
Answer: "${it.userAnswer}"
Score: ${it.evaluation?.overallScore || it.evaluation?.scores?.overall || 0}/100
`
  )
  .join('\n---\n')}

Generate an executive interview summary report with:
1. "strongestAnswer": Acknowledgment of which question was answered best and why.
2. "priorityImprovements": Array of 3 high-impact improvement priorities.
3. "recommendedTopics": Array of 3 specific technical or behavioral topics to study.
4. "actionableNextSteps": Array of 3 concrete next steps.
5. "verdict": A 2-sentence encouraging yet realistic assessment.

Return valid JSON matching the structure.`;

      const response = await callGeminiWithFallback({
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        source: 'gemini',
        summaryReport: parsed,
      });
    } catch (aiErr: any) {
      console.warn('AI report generation failed, falling back to structured summary:', aiErr?.message || aiErr);
      return res.json({
        source: 'simulation',
        summaryReport: generateFallbackReport(),
      });
    }
  } catch (error: any) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
});

// 5. English Communication Coach Endpoint
app.post('/api/gemini/practise-english', async (req, res) => {
  try {
    const { sentence, goal = 'IT interview answers' } = req.body;
    if (!sentence || typeof sentence !== 'string') {
      return res.status(400).json({ error: 'Missing sentence to practice.' });
    }

    const result = await handlePractiseEnglish({
      sentence_or_answer: sentence,
      practice_goal: goal as any,
    });

    return res.json({
      result: {
        id: `eng-${Date.now()}`,
        originalSentence: sentence,
        goal,
        ...result,
        timestamp: Date.now(),
      },
      source: ai ? 'gemini' : 'simulation',
    });
  } catch (error: any) {
    console.error('Error in English coach:', error);
    return res.status(500).json({ error: 'Failed to evaluate English practice sentence' });
  }
});

// 6. Resume Intelligence Endpoint
app.post('/api/gemini/improve-resume', async (req, res) => {
  try {
    const { resumeText, targetRole, jobDescription } = req.body;
    if (!resumeText || !targetRole) {
      return res.status(400).json({ error: 'Missing resume text or target role.' });
    }

    const result = await handleImproveResume({
      resume_text: resumeText,
      target_role: targetRole,
      job_description: jobDescription || undefined,
    });

    return res.json({
      result: {
        id: `res-${Date.now()}`,
        targetRole,
        ...result,
        timestamp: Date.now(),
      },
      source: ai ? 'gemini' : 'simulation',
    });
  } catch (error: any) {
    console.error('Error in Resume Intelligence:', error);
    return res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// --- HIREFLOW PDF-ONLY RESUME UPLOAD & ANALYSIS ROUTES ---
const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    // Strict PDF validation: check extension and mime type
    if (ext !== '.pdf' || (mime !== 'application/pdf' && mime !== 'application/x-pdf' && mime !== 'binary/octet-stream')) {
      return cb(new Error('Please upload a valid PDF resume. Only PDF files (.pdf) are accepted.'));
    }
    cb(null, true);
  },
});

// Middleware wrapper for multer error handling
const handlePdfUploadMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  pdfUpload.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Please upload a valid PDF resume. File size exceeds the 15MB maximum limit.',
        });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message || 'Please upload a valid PDF resume.' });
    }
    next();
  });
};

// Route handler supporting /upload-resume, /api/upload-resume, and /api/resumes/analyze
app.post(['/upload-resume', '/api/upload-resume', '/api/resumes/analyze'], handlePdfUploadMiddleware, async (req, res) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const targetRole = (req.body?.targetRole || req.body?.role || 'Software Developer').trim();
    const jobDescription = (req.body?.jobDescription || '').trim();

    if (files.length === 0) {
      return res.status(400).json({
        error: 'Please upload a valid PDF resume. No PDF files were uploaded.',
      });
    }

    const processedCandidates: any[] = [];
    const errors: Array<{ fileName: string; error: string }> = [];

    for (const file of files) {
      // 1. Double check extension
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext !== '.pdf') {
        errors.push({
          fileName: file.originalname,
          error: `Please upload a valid PDF resume. "${file.originalname}" is not a PDF file.`,
        });
        continue;
      }

      // 2. Binary Magic Header Check (%PDF-)
      const validation = validatePdfBuffer(file.buffer, file.originalname);
      if (!validation.isValid) {
        errors.push({
          fileName: file.originalname,
          error: validation.error!,
        });
        continue;
      }

      // 3. Extract text from PDF buffer
      let extraction;
      try {
        extraction = await extractTextFromPdfBuffer(file.buffer);
      } catch (extErr: any) {
        errors.push({
          fileName: file.originalname,
          error: extErr.message || 'Failed to extract text from PDF.',
        });
        continue;
      }

      // 4. Handle Scanned PDFs (OCR required)
      if (extraction.isScanned) {
        errors.push({
          fileName: file.originalname,
          error: `"${file.originalname}" appears to contain scanned or image-based pages without readable text. Optical Character Recognition (OCR) is required to parse this document.`,
        });
        continue;
      }

      // 5. Format file size
      const sizeKb = Math.round(file.size / 1024);
      const fileSizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      // 6. Run comprehensive candidate analysis
      const { candidate, source } = await analyzeCandidateResume(
        ai,
        extraction.text,
        targetRole,
        jobDescription,
        file.originalname,
        fileSizeStr
      );

      processedCandidates.push({
        ...candidate,
        analysisSource: source,
      });
    }

    // If all files errored, return 400 with first error
    if (processedCandidates.length === 0 && errors.length > 0) {
      return res.status(400).json({
        error: errors[0].error,
        details: errors,
      });
    }

    return res.json({
      success: true,
      message: `Successfully processed ${processedCandidates.length} resume(s).`,
      count: processedCandidates.length,
      candidate: processedCandidates[0] || null,
      candidates: processedCandidates,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Resume upload/analysis exception:', error);
    return res.status(500).json({
      error: `Resume analysis failed: ${error.message || 'Internal server error'}`,
    });
  }
});


// 7. Personalized Career Roadmap Endpoint
app.post('/api/gemini/generate-roadmap', async (req, res) => {
  try {
    const { targetRole, currentSkills, weeklyHours = 10 } = req.body;
    if (!targetRole || !currentSkills) {
      return res.status(400).json({ error: 'Missing target role or current skills.' });
    }

    const result = await handleGenerateCareerRoadmap({
      target_role: targetRole,
      current_skills: currentSkills,
      learning_time_weekly: Number(weeklyHours) || 10,
    });

    return res.json({
      result: {
        id: `rdm-${Date.now()}`,
        currentSkills,
        weeklyHours: Number(weeklyHours) || 10,
        ...result,
        createdAt: Date.now(),
      },
      source: ai ? 'gemini' : 'simulation',
    });
  } catch (error: any) {
    console.error('Error in Roadmap generation:', error);
    return res.status(500).json({ error: 'Failed to generate career roadmap' });
  }
});

// --- AMAZON ALEXA+ HACKATHON MCP SERVER (STREAMABLE HTTP / JSON-RPC) ---
// MCP Info Endpoint (Streamable HTTP capability discovery)
app.get('/api/mcp', (req, res) => {
  res.json({
    mcpVersion: '2024-11-05',
    serverName: 'jobmate-ai-mcp-server',
    serverVersion: '1.0.0',
    description: 'JobMate AI Alexa+ Hackathon Model Context Protocol (MCP) Server',
    transport: 'Streamable HTTP / JSON-RPC 2.0',
    tools: JobMateMcpTools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  });
});

// MCP JSON-RPC 2.0 Dispatcher (supports tools/list and tools/call)
app.post(['/api/mcp', '/api/mcp/rpc'], async (req, res) => {
  const { jsonrpc, id, method, params } = req.body || {};

  // Standard MCP JSON-RPC response envelope
  if (method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      id: id || 1,
      result: {
        tools: JobMateMcpTools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      },
    });
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};

    const tool = JobMateMcpTools.find((t) => t.name === toolName);
    if (!tool) {
      return res.status(404).json({
        jsonrpc: '2.0',
        id: id || 1,
        error: { code: -32601, message: `Tool not found: ${toolName}` },
      });
    }

    try {
      const output = await tool.handler(toolArgs as any);
      return res.json({
        jsonrpc: '2.0',
        id: id || 1,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(output, null, 2),
            },
          ],
        },
      });
    } catch (err: any) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: id || 1,
        error: {
          code: -32602,
          message: err.message || 'Invalid tool arguments',
        },
      });
    }
  }

  if (method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id: id || 1,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'jobmate-ai-mcp-server',
          version: '1.0.0',
        },
      },
    });
  }

  if (method === 'ping') {
    return res.json({ jsonrpc: '2.0', id: id || 1, result: {} });
  }

  // Fallback for general tool execution via { tool: "name", arguments: { ... } }
  if (req.body?.tool) {
    const tool = JobMateMcpTools.find((t) => t.name === req.body.tool);
    if (!tool) {
      return res.status(404).json({ error: `Tool ${req.body.tool} not found` });
    }
    try {
      const output = await tool.handler(req.body.arguments || {});
      return res.json({ success: true, result: output });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(400).json({
    jsonrpc: '2.0',
    id: id || null,
    error: { code: -32600, message: 'Invalid Request. Supported methods: initialize, tools/list, tools/call, ping' },
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JobMate AI Full-Stack Server listening on http://0.0.0.0:${PORT}`);
    console.log(`Alexa+ Hackathon MCP endpoint active at http://0.0.0.0:${PORT}/api/mcp`);
  });
}

startServer();
