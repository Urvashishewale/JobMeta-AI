import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Helper to create a minimal valid PDF buffer containing test text
function createSamplePdfBuffer(lines: string[]): Buffer {
  const streamLines = lines
    .map((l) => '(' + l.replace(/[()\\\\]/g, ' ') + ") '")
    .join('\n');
  const stream = `BT\n/F1 12 Tf\n72 720 Td\n14 TL\n${streamLines}\nET\n`;
  const len = Buffer.byteLength(stream);

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${len} >>
stream
${stream}endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000350 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
420
%%EOF`;

  return Buffer.from(pdf);
}

async function runHireFlowTests() {
  console.log('====================================================');
  console.log('   HIREFLOW PDF UPLOAD & RESUME SCREENING TEST SUITE');
  console.log('====================================================');

  const BASE_URL = 'http://localhost:3000';
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName} - ${detail || 'Condition not met'}`);
      failed++;
    }
  }

  try {
    // 1. Health check test
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert(healthRes.ok, 'Backend is healthy and reachable');

    // 2. Test: TXT file upload must be REJECTED
    const txtFormData = new FormData();
    const txtBlob = new Blob(['John Doe, Software Engineer, JavaScript, Python'], { type: 'text/plain' });
    txtFormData.append('resumes', txtBlob, 'resume.txt');
    txtFormData.append('targetRole', 'Software Developer');

    const txtRes = await fetch(`${BASE_URL}/upload-resume`, {
      method: 'POST',
      body: txtFormData,
    });
    assert(!txtRes.ok && txtRes.status === 400, 'Rejects .txt resume upload with HTTP 400');
    const txtJson = await txtRes.json();
    assert(
      txtJson.error && txtJson.error.toLowerCase().includes('pdf'),
      'TXT rejection error mentions PDF requirement',
      txtJson.error
    );

    // 3. Test: MD (Markdown) file upload must be REJECTED
    const mdFormData = new FormData();
    const mdBlob = new Blob(['# Alex Smith Resume\n- Skills: React, Node.js'], { type: 'text/markdown' });
    mdFormData.append('resumes', mdBlob, 'resume.md');
    mdFormData.append('targetRole', 'Software Developer');

    const mdRes = await fetch(`${BASE_URL}/upload-resume`, {
      method: 'POST',
      body: mdFormData,
    });
    assert(!mdRes.ok && mdRes.status === 400, 'Rejects .md resume upload with HTTP 400');

    // 4. Test: Renamed plain text file with .pdf extension must be REJECTED via binary magic header check
    const fakePdfFormData = new FormData();
    const fakePdfBlob = new Blob(['This is just plain text renamed to .pdf without %PDF- header'], {
      type: 'application/pdf',
    });
    fakePdfFormData.append('resumes', fakePdfBlob, 'fake_resume.pdf');
    fakePdfFormData.append('targetRole', 'Software Developer');

    const fakePdfRes = await fetch(`${BASE_URL}/upload-resume`, {
      method: 'POST',
      body: fakePdfFormData,
    });
    assert(!fakePdfRes.ok && fakePdfRes.status === 400, 'Rejects renamed text file with .pdf extension via binary header check');
    const fakePdfJson = await fakePdfRes.json();
    assert(
      fakePdfJson.error && fakePdfJson.error.includes('valid PDF resume'),
      'Renamed file rejection has clear message: "Please upload a valid PDF resume."',
      fakePdfJson.error
    );

    // 5. Test: Empty 0-byte PDF must be REJECTED
    const emptyPdfFormData = new FormData();
    const emptyBlob = new Blob([], { type: 'application/pdf' });
    emptyPdfFormData.append('resumes', emptyBlob, 'empty.pdf');
    emptyPdfFormData.append('targetRole', 'Software Developer');

    const emptyRes = await fetch(`${BASE_URL}/upload-resume`, {
      method: 'POST',
      body: emptyPdfFormData,
    });
    assert(!emptyRes.ok && emptyRes.status === 400, 'Rejects empty 0-byte PDF with HTTP 400');

    // 6. Test: Valid PDF resume upload and analysis
    const validResumeText = `Aarav Sharma
aarav.sharma@example.com
+91 9876543210
Bangalore, India

SUMMARY:
Results-driven Software Developer with 3 years of experience building modern web applications using React, TypeScript, Node.js, and PostgreSQL. Passionate about clean code, performance optimization, and scalable microservices.

TECHNICAL SKILLS:
Languages: JavaScript, TypeScript, Python, SQL, HTML, CSS
Frameworks: React, Express, Node.js, Tailwind CSS, Jest
Databases & Cloud: PostgreSQL, MongoDB, Redis, Docker, Git, AWS, CI/CD

WORK EXPERIENCE:
Software Engineer | Acme Cloud Solutions (2022 - Present)
- Engineered 5 responsive web modules using React and TypeScript, serving over 100,000 active users.
- Optimized database queries in PostgreSQL, reducing average API response latency by 40%.
- Integrated Docker and GitHub Actions CI/CD pipeline, reducing deployment times from 45m to 12m.

Junior Web Developer | TechCorp Labs (2021 - 2022)
- Built interactive dashboard widgets and integrated REST APIs with Node.js.
- Authored unit test suites with Jest, increasing test coverage from 60% to 85%.

EDUCATION:
B.Tech in Computer Science and Engineering | State University (2017 - 2021)
GPA: 8.8/10

PROJECTS:
CloudTask Manager: Built full-stack workflow tool using React, Node.js, and Redis.
E-Commerce API: Designed scalable microservice with PostgreSQL and Docker.`;

    const pdfBuffer = createSamplePdfBuffer(
      validResumeText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
    );
    const validFormData = new FormData();
    const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
    validFormData.append('resumes', pdfBlob, 'aarav_sharma_resume.pdf');
    validFormData.append('targetRole', 'Software Developer');
    validFormData.append(
      'jobDescription',
      'Looking for a Software Developer proficient in React, TypeScript, Node.js, SQL, and Docker.'
    );

    const validRes = await fetch(`${BASE_URL}/upload-resume`, {
      method: 'POST',
      body: validFormData,
    });

    assert(validRes.ok && validRes.status === 200, 'Valid PDF resume accepted and analyzed with HTTP 200');
    const validJson = await validRes.json();
    assert(validJson.success === true, 'Response contains success: true');
    assert(!!validJson.candidate, 'Response returns candidate record');

    const candidate = validJson.candidate;
    assert(candidate.targetRole === 'Software Developer', 'Candidate target role matches');
    assert(candidate.matchScore >= 50 && candidate.matchScore <= 100, 'Candidate receives valid match score (0-100)');
    assert(candidate.skills && candidate.skills.length >= 3, 'Candidate has extracted skills');
    assert(candidate.fileName === 'aarav_sharma_resume.pdf', 'Candidate tracks original filename');
    assert(Array.isArray(candidate.bulletPointRevisions), 'Candidate has bullet point revisions');

    // 7. Test: Route aliases /api/upload-resume and /api/resumes/analyze
    const aliasFormData = new FormData();
    aliasFormData.append('resumes', pdfBlob, 'candidate_alias.pdf');
    aliasFormData.append('targetRole', 'Data Analyst');

    const aliasRes = await fetch(`${BASE_URL}/api/upload-resume`, {
      method: 'POST',
      body: aliasFormData,
    });
    assert(aliasRes.ok, 'Endpoint alias /api/upload-resume is operational');

    const analyzeRes = await fetch(`${BASE_URL}/api/resumes/analyze`, {
      method: 'POST',
      body: aliasFormData,
    });
    assert(analyzeRes.ok, 'Endpoint alias /api/resumes/analyze is operational');

    // 8. Test: Missing files payload returns 400
    const emptyPayloadFormData = new FormData();
    emptyPayloadFormData.append('targetRole', 'DevOps Engineer');
    const noFilesRes = await fetch(`${BASE_URL}/upload-resume`, {
      method: 'POST',
      body: emptyPayloadFormData,
    });
    assert(!noFilesRes.ok && noFilesRes.status === 400, 'Rejects upload with no files attached');

  } catch (err: any) {
    console.error('Fatal test exception:', err);
    failed++;
  }

  console.log('====================================================');
  console.log(`HIREFLOW TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runHireFlowTests();
