import 'dotenv/config';
import {
  JobMateMcpTools,
  handleStartMockInterview,
  handleEvaluateInterviewAnswer,
  handleGenerateCareerRoadmap,
  handleImproveResume,
  handlePractiseEnglish,
} from '../src/mcp/jobmateMcpServer';

async function runTests() {
  console.log('--- RUNNING JOBMATE AI MCP AUTOMATED ACCEPTANCE TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Verify all 5 required MCP tools are registered
    const toolNames = JobMateMcpTools.map((t) => t.name);
    assert(toolNames.includes('start_mock_interview'), 'Tool start_mock_interview is registered');
    assert(toolNames.includes('evaluate_interview_answer'), 'Tool evaluate_interview_answer is registered');
    assert(toolNames.includes('generate_career_roadmap'), 'Tool generate_career_roadmap is registered');
    assert(toolNames.includes('improve_resume'), 'Tool improve_resume is registered');
    assert(toolNames.includes('practise_english'), 'Tool practise_english is registered');

    // Test 2: start_mock_interview execution
    const interviewRes = await handleStartMockInterview({
      role: 'Data Analyst',
      interview_type: 'Technical',
      difficulty: 'Medium',
      question_count: 3,
    });
    assert(!!interviewRes.session_id, 'start_mock_interview returns session_id');
    assert(interviewRes.first_question?.text?.length > 5, 'start_mock_interview returns valid first question text');

    // Test 3: evaluate_interview_answer execution
    const evalRes = await handleEvaluateInterviewAnswer({
      session_id: interviewRes.session_id,
      question_id: 'q-1',
      question_text: 'Explain how you clean messy datasets in Python',
      answer_text: 'I use pandas to handle null values with dropna or fillna, remove duplicate rows, and cast data types to ensure consistent formats.',
    });
    assert(evalRes.evaluation?.overallScore >= 0, 'evaluate_interview_answer computes overall score');
    assert(Array.isArray(evalRes.evaluation?.strengths), 'evaluate_interview_answer returns strengths array');
    assert(!!evalRes.evaluation?.strongerSampleAnswer, 'evaluate_interview_answer provides stronger sample answer');

    // Test 4: generate_career_roadmap execution
    const roadmapRes = await handleGenerateCareerRoadmap({
      target_role: 'Software Developer',
      current_skills: 'Basic JavaScript and HTML',
      learning_time_weekly: 10,
    });
    assert(Array.isArray(roadmapRes.phases) && roadmapRes.phases.length > 0, 'generate_career_roadmap returns phases');
    assert(Array.isArray(roadmapRes.readinessChecklist), 'generate_career_roadmap provides readiness checklist');

    // Test 5: improve_resume execution
    const resumeRes = await handleImproveResume({
      resume_text: 'Worked on web app. Fixed bugs and added buttons. Used JavaScript and CSS.',
      target_role: 'Software Developer',
      job_description: 'Looking for a Software Developer with React, TypeScript and automated testing experience.',
    });
    assert(resumeRes.overallResumeScore >= 0, 'improve_resume scores resume');
    assert(Array.isArray(resumeRes.bulletPointRevisions), 'improve_resume identifies bullet point revisions');

    // Test 6: practise_english execution
    const englishRes = await handlePractiseEnglish({
      sentence_or_answer: 'I has worked in team project and we was achieving good velocity.',
      practice_goal: 'IT interview answers',
    });
    assert(!!englishRes.correctedSentence, 'practise_english provides corrected sentence');
    assert(Array.isArray(englishRes.explanations), 'practise_english provides explanations');
    assert(!!englishRes.practiceExercise?.prompt, 'practise_english provides interactive exercise');

    // Test 7: Negative schema validation test
    try {
      await handleStartMockInterview({ role: '' } as any);
      assert(false, 'Should throw on empty role');
    } catch (e) {
      assert(true, 'start_mock_interview rejects empty role');
    }

  } catch (err: any) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests();
