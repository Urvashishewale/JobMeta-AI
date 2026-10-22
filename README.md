 HEAD
# JobMeta AI — Your Personal AI Career Coach
### Amazon Alexa+ Hackathon Project & Model Context Protocol (MCP) Integration

**JobMate AI** is an advanced AI career assistant and voice-powered interview coach built for college students, fresh graduates, and career changers. It bridges the gap between academic education and modern technical hiring by offering spoken interview simulations, adaptive follow-ups, real-time rubric evaluations, professional English communication coaching, grounded resume intelligence, and actionable 4-phase career roadmaps.

JobMate AI is fully equipped with an **Amazon Alexa+ Model Context Protocol (MCP)** server over **Streamable HTTP & JSON-RPC 2.0**, allowing Alexa+ skills and modern AI agents to interact with all coaching tools seamlessly.

---

## 🌟 The 5 Core Career Modules

### 1. 🎙️ Live Voice Interview Room (Alexa+ Style Voice Experience)
- **Natural Voice Interaction**: Built on native browser `SpeechRecognition` and `webkitSpeechRecognition` APIs with microphone auto-detection.
- **Interim Streaming Transcripts**: Spoken words appear in real time as the candidate speaks without waiting for silence, eliminating artificial delay.
- **Soundwave Orb Visualizer**: Reactive audio visualizer with distinct states: *Listening*, *Speaking*, *Evaluating*, and *Idle*.
- **SpeechSynthesis (TTS)**: Realistic AI interviewer voices with configurable speaking rate and pitch.
- **Editable Transcripts**: Candidates can edit or append their recognized text prior to submission to correct misheard terminology.

### 2. 📝 AI Mock Interview Engine & Adaptive Evaluator
- **Role-Calibrated Question Banks**: Dedicated question paths for **Software Developer**, **Data Analyst**, **Software Tester**, **DevOps Engineer**, **HR**, or any custom target role.
- **5-Dimension Rubric Scoring (0–100)**:
  - **Relevance**: Direct alignment with the interview prompt.
  - **Technical Correctness**: Accurate concepts, architectures, and terminology.
  - **Clarity & Structure**: Logical flow, concise delivery, avoiding run-on thoughts.
  - **Specific Examples**: Concrete project contexts, quantifiable metrics, and results.
  - **Communication Quality**: Professional fluency, absence of filler words, and articulation.
- **STAR Behavioral Breakdown**: Evaluates answers through *Situation*, *Task*, *Action*, and *Result*.
- **Adaptive Follow-Up Questions**: If a candidate provides a brief or vague answer, the system automatically detects missing details and asks targeted follow-up questions just like a human interviewer.
- **Final Performance Dossier**: Comprehensive report with overall scores, category breakdowns, print-to-PDF formatting, and JSON export.

### 3. 🗣️ English Communication Coach
- **Scenario-Specific Drills**: Practice answering in everyday workplace English, HR introductions, and technical IT explanations.
- **Deep Explanations**:
  - *Original vs. Corrected* side-by-side comparison.
  - *Why this correction was made* grammatical and professional insights.
  - *More Natural Alternative* for executive-level phrasing.
  - *Practice Exercise* to reinforce learned concepts.

### 4. 📄 Resume Assistant & JD Keyword Matcher
- **Anti-Hallucination Guardrails**: Audits only text explicitly present in the candidate's resume; never fabricates fictitious metrics or companies.
- **Bullet-Point Transformation**: Converts passive task descriptions into impact-oriented statements using the formula: *Action Verb + Specific Context + Quantified Outcome*.
- **JD Skill Gap Analysis**: Compares candidate's skills against job description requirements to identify matched skills and critical missing keywords.
- **Prompt Injection Defense**: Filters untrusted instructions embedded in pasted resume text.

### 5. 🗺️ Personalized Career Roadmap
- **4 Progressive Phases**:
  1. *Phase 1: Foundations & Core Competencies*
  2. *Phase 2: Applied Skills & Modern Tooling*
  3. *Phase 3: Real-World Portfolio Projects*
  4. *Phase 4: Interview Readiness & System Design*
- **Interactive Checklist**: Check off completed learning milestones with immediate progress calculation and LocalStorage state persistence.
- **Portfolio Specifications**: Concrete project ideas including tech stacks and architecture requirements.

---

## 🤖 Amazon Alexa+ & Model Context Protocol (MCP) Integration

JobMate AI includes a Model Context Protocol (MCP) server integrated into the Express backend at `/api/mcp`. It implements both Streamable HTTP discovery and JSON-RPC 2.0 specs.

### Registered MCP Tools:

| Tool Name | Description | Key Arguments |
|:---|:---|:---|
| `start_mock_interview` | Generates role-specific questions and STAR criteria | `jobRole`, `experienceLevel`, `interviewType`, `questionCount`, `language` |
| `evaluate_interview_answer` | Scores response across 5 criteria and generates follow-ups | `question`, `candidateAnswer`, `jobRole`, `experienceLevel`, `targetLanguage` |
| `generate_career_roadmap` | Creates 4-phase step-by-step learning roadmap | `targetRole`, `currentSkills`, `weeklyHours` |
| `improve_resume` | Audits bullet points and aligns with JD keywords | `resumeText`, `targetRole`, `jobDescription` |
| `practise_english` | Corrects sentences with natural corporate phrasing | `originalSentence`, `goal` |

### Testing MCP via cURL:

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "alexa-request-1",
    "method": "tools/call",
    "params": {
      "name": "practise_english",
      "arguments": {
        "originalSentence": "I am working on frontend since two years and made good apps.",
        "goal": "IT interview answers"
      }
    }
  }'
```

### Automated Acceptance Tests:

Run the 18 automated MCP verification tests:
```bash
npx tsx tests/mcp.test.ts
```

All 18 tests cover schema compliance, tool listings, valid parameter handling, invalid argument rejections, and fallback resiliency.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js, Express, TSX.
- **AI Engine**: `@google/genai` TypeScript SDK (`gemini-2.5-flash`).
- **Protocol**: `@modelcontextprotocol/sdk` (Model Context Protocol).
- **Speech Technologies**:
  - Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with stream aggregation.
  - Browser `SpeechSynthesis` API with custom pitch/rate controls.
  - Web Audio API `AudioContext` & `AnalyserNode` for live hardware diagnostics.
- **Storage**: Browser `LocalStorage` with zero third-party telemetry.

---

## 🚀 Getting Started

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in Google Chrome or any Chromium-based browser for full Web Speech API support.

4. **Run MCP Server Tests**:
   ```bash
   npx tsx tests/mcp.test.ts
   ```
=======
# JobMeta-AI
An AI-powered voice-based interview preparation platform that uses speech recognition and AI-generated speech to conduct mock interviews, provide personalized feedback, and help users improve their communication skills and interview performance.

