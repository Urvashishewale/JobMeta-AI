// Automated Verification Suite for Interview Answer Evaluation & Text Fallback
const BASE_URL = 'http://localhost:3000';

function assert(condition: boolean, message: string, extra?: any) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`, extra ? JSON.stringify(extra) : '');
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ PASS: ${message}`);
}

async function runEvaluationTests() {
  console.log('====================================================');
  console.log('   INTERVIEW ANSWER EVALUATION & TEXT FALLBACK SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert(healthRes.ok, 'Backend server is active on port 3000');
    passed++;

    // 2. Test empty answer submission returns 400 with actionable error
    const emptyRes = await fetch(`${BASE_URL}/api/gemini/evaluate-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: {
          id: 'q-1',
          questionNumber: 1,
          text: 'Tell me about yourself, your background, and why you are interested in this Software Developer position?',
        },
        candidateAnswer: '   ',
        config: { targetRole: 'Software Developer' },
      }),
    });
    assert(!emptyRes.ok && emptyRes.status === 400, 'Rejects empty answer with HTTP 400');
    passed++;
    const emptyJson = await emptyRes.json();
    assert(
      emptyJson.error && emptyJson.error.toLowerCase().includes('cannot be empty'),
      'Clear error message returned for empty answer',
      emptyJson.error
    );
    passed++;

    // 3. Test missing payload fields returns 400
    const missingPayloadRes = await fetch(`${BASE_URL}/api/gemini/evaluate-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(!missingPayloadRes.ok && missingPayloadRes.status === 400, 'Rejects missing payload with HTTP 400');
    passed++;

    // 4. Test User Prompt Specific Evaluation (Valid Answer via Text Fallback)
    const userPromptPayload = {
      question: {
        id: 'q-1',
        questionNumber: 1,
        text: 'Tell me about yourself, your background, and why you are interested in this Software Developer position?',
        category: 'general',
        expectedKeyPoints: [
          'Overview of educational/technical background',
          'Relevance to Software Developer role',
          'Core strengths and career trajectory',
        ],
        modelAnswer: {
          answer:
            'I have 3 years of hands-on experience developing web applications with modern technologies. In my previous role, I engineered scalable microservices, reduced latency by 35%, and collaborated with cross-functional teams to deliver customer-facing features.',
          rationale: 'Follows STAR method with quantified results and role alignment.',
        },
      },
      candidateAnswer:
        'I have 3 years of experience as a full stack developer working with React, TypeScript, and Node.js. I have built scalable microservices and customer facing dashboards. I am interested in this Software Developer position because your team is solving high-scale distributed problems.',
      config: {
        targetRole: 'Software Developer',
        experienceLevel: 'Intermediate',
        interviewType: 'Technical',
        difficulty: 'Medium',
        questionCount: 3,
        language: 'English',
        answerMode: 'text',
        speechOutput: false,
      },
    };

    const evalRes = await fetch(`${BASE_URL}/api/gemini/evaluate-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPromptPayload),
    });

    assert(evalRes.ok && evalRes.status === 200, 'Valid answer submitted and evaluated successfully with HTTP 200');
    passed++;

    const evalJson = await evalRes.json();
    assert(!!evalJson.evaluation, 'Response contains evaluation payload');
    passed++;

    const evalObj = evalJson.evaluation;
    assert(evalObj.questionId === 'q-1', 'Evaluation matches target question ID');
    passed++;

    // Verify both contract schemas are present and populated
    // InterviewRoom contract checks
    assert(typeof evalObj.scores?.overall === 'number' && evalObj.scores.overall >= 50, 'AnswerEvaluation scores.overall is valid number (>= 50)');
    passed++;
    assert(typeof evalObj.scores?.relevance === 'number', 'AnswerEvaluation scores.relevance is populated');
    passed++;
    assert(typeof evalObj.scores?.clarity === 'number', 'AnswerEvaluation scores.clarity is populated');
    passed++;
    assert(typeof evalObj.scores?.completeness === 'number', 'AnswerEvaluation scores.completeness is populated');
    passed++;
    assert(typeof evalObj.scores?.communication === 'number', 'AnswerEvaluation scores.communication is populated');
    passed++;
    assert(typeof evalObj.rubricExplanation === 'string' && evalObj.rubricExplanation.length > 10, 'AnswerEvaluation rubricExplanation is populated');
    passed++;
    assert(Array.isArray(evalObj.areasToImprove) && evalObj.areasToImprove.length > 0, 'AnswerEvaluation areasToImprove is non-empty array');
    passed++;
    assert(typeof evalObj.betterAnswerExample === 'string' && evalObj.betterAnswerExample.length > 20, 'AnswerEvaluation betterAnswerExample is populated');
    passed++;

    // MockInterviewView contract checks
    assert(typeof evalObj.overallScore === 'number' && evalObj.overallScore >= 50, 'AnswerRubricEvaluation overallScore is valid number (>= 50)');
    passed++;
    assert(typeof evalObj.scores?.technicalCorrectness === 'number', 'AnswerRubricEvaluation scores.technicalCorrectness is populated');
    passed++;
    assert(typeof evalObj.scores?.clarityAndStructure === 'number', 'AnswerRubricEvaluation scores.clarityAndStructure is populated');
    passed++;
    assert(typeof evalObj.scores?.specificExamples === 'number', 'AnswerRubricEvaluation scores.specificExamples is populated');
    passed++;
    assert(typeof evalObj.scores?.communicationQuality === 'number', 'AnswerRubricEvaluation scores.communicationQuality is populated');
    passed++;
    assert(Array.isArray(evalObj.strengths) && evalObj.strengths.length > 0, 'AnswerRubricEvaluation strengths is non-empty array');
    passed++;
    assert(Array.isArray(evalObj.improvementSuggestions) && evalObj.improvementSuggestions.length > 0, 'AnswerRubricEvaluation improvementSuggestions is non-empty array');
    passed++;

    // 5. Check semantic detection of candidate stack
    const detectedReactOrTS = evalObj.strengths.some((s: string) => s.toUpperCase().includes('REACT') || s.toUpperCase().includes('TYPESCRIPT') || s.toUpperCase().includes('NODE'));
    assert(detectedReactOrTS, 'Evaluation identifies candidate React / TypeScript / Node.js stack in strengths');
    passed++;

    // 6. Test Question Generation endpoint
    const qGenRes = await fetch(`${BASE_URL}/api/gemini/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          targetRole: 'Software Developer',
          experienceLevel: 'Intermediate',
          interviewType: 'Technical',
          questionCount: 3,
        },
      }),
    });
    assert(qGenRes.ok && qGenRes.status === 200, 'Question generation succeeds with HTTP 200');
    passed++;
    const qGenJson = await qGenRes.json();
    assert(Array.isArray(qGenJson.questions) && qGenJson.questions.length === 3, 'Returns 3 structured interview questions');
    passed++;

    // 7. Test Follow-Up generation endpoint
    const fuRes = await fetch(`${BASE_URL}/api/gemini/generate-follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: userPromptPayload.question,
        candidateAnswer: userPromptPayload.candidateAnswer,
        config: userPromptPayload.config,
      }),
    });
    assert(fuRes.ok && fuRes.status === 200, 'Follow-up question generation succeeds with HTTP 200');
    passed++;

    // 8. Test Summary Report generation endpoint
    const reportRes = await fetch(`${BASE_URL}/api/gemini/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: userPromptPayload.config,
        items: [
          {
            question: userPromptPayload.question,
            userAnswer: userPromptPayload.candidateAnswer,
            evaluation: evalObj,
            durationSeconds: 45,
          },
        ],
      }),
    });
    assert(reportRes.ok && reportRes.status === 200, 'Executive summary report generation succeeds with HTTP 200');
    passed++;
    const reportJson = await reportRes.json();
    assert(!!reportJson.summaryReport, 'Summary report object returned');
    passed++;

  } catch (err: any) {
    console.error('Fatal error during test run:', err);
    failed++;
  }

  console.log('====================================================');
  console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runEvaluationTests();
