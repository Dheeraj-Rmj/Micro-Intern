import { z } from "zod";

/**
 * Prompt Manager — versioned, typed prompt templates.
 *
 * Design: Prompts are code, not data.
 * Storing prompts in the DB enables unreviewed changes. Storing in code means:
 * - Every prompt change goes through PR review
 * - Version history is in git
 * - TypeScript types validate prompt inputs
 * - Easy A/B testing via prompt version parameter
 *
 * Each prompt has:
 * - id: stable identifier (never changes)
 * - version: increment when prompt changes (enables A/B testing)
 * - inputSchema: Zod schema for template variables
 * - systemPrompt: invariant instructions
 * - userPromptTemplate: template with {{variable}} placeholders
 */

export type PromptTemplate<TInput> = {
  id: string;
  version: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  systemPrompt: string;
  userPromptTemplate: string;
};

export type CompiledPrompt = {
  systemMessage: string;
  userMessage: string;
  promptId: string;
  promptVersion: string;
};

/**
 * Compile a prompt template with input variables.
 * Validates input against schema before compilation.
 */
export function compilePrompt<T>(template: PromptTemplate<T>, input: T): CompiledPrompt {
  // Validate input
  const parsed = template.inputSchema.parse(input);

  // Replace {{variable}} placeholders
  let userMessage = template.userPromptTemplate;
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    userMessage = userMessage.replaceAll(`{{${key}}}`, String(value));
  }

  return {
    systemMessage: template.systemPrompt,
    userMessage,
    promptId: template.id,
    promptVersion: template.version,
  };
}

// ── Foundation Prompts ────────────────────────────────────────────────────────
// Feature teams add domain-specific prompts in their respective modules.
// Example structure shown here as reference.

export const PROMPTS = {
  /**
   * General skill assessment evaluation prompt.
   * Used by: EvaluationModule
   */
  ASSESSMENT_EVALUATION: {
    id: "assessment-evaluation",
    version: "1.0.0",
    description: "Evaluate a candidate submission against assessment criteria",
    inputSchema: z.object({
      assessmentTitle: z.string(),
      assessmentInstructions: z.string(),
      candidateAnswer: z.string(),
      passingScore: z.number(),
      taskTitle: z.string(),
      maxPoints: z.number(),
    }),
    systemPrompt: `You are an expert technical evaluator for a skill assessment platform.
Your role is to objectively evaluate candidate submissions against the provided criteria.
You must be fair, consistent, and constructive in your feedback.
Always respond with valid JSON matching the specified output schema.
Never make up information not present in the submission.`,
    userPromptTemplate: `# Assessment: {{assessmentTitle}}

## Task: {{taskTitle}}
**Instructions**: {{assessmentInstructions}}

## Candidate's Submission:
{{candidateAnswer}}

## Evaluation Criteria:
- Maximum Points: {{maxPoints}}
- Passing Score: {{passingScore}}%

## Required Response Format (JSON):
{
  "earnedPoints": <number 0-{{maxPoints}}>,
  "percentageScore": <number 0-100>,
  "isPassed": <boolean>,
  "summary": "<2-3 sentence objective evaluation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "feedback": "<detailed constructive feedback>"
}`,
  } satisfies PromptTemplate<{
    assessmentTitle: string;
    assessmentInstructions: string;
    candidateAnswer: string;
    passingScore: number;
    taskTitle: string;
    maxPoints: number;
  }>,

  /**
   * AI Role Understanding Engine
   * Analyzes a Job Description to generate a Competency Matrix.
   */
  ROLE_UNDERSTANDING: {
    id: "role-understanding",
    version: "1.0.0",
    description: "Analyze a Job Description to extract competencies and difficulty profile",
    inputSchema: z.object({
      jobTitle: z.string(),
      jobDescription: z.string(),
      seniorityLevel: z.string(),
      companyStandards: z.string().optional(),
    }),
    systemPrompt: `You are an expert Talent Intelligence AI for a Skill-Based Hiring Platform.
Your goal is to parse raw job descriptions and extract structured competency requirements.
Always respond with valid JSON matching the specified output schema.
Do not include markdown code blocks, just raw JSON.`,
    userPromptTemplate: `# Role Analysis Request

## Title: {{jobTitle}}
## Seniority: {{seniorityLevel}}
## Company Standards: {{companyStandards}}

## Job Description:
{{jobDescription}}

## Required Response Format (JSON):
{
  "competencies": [
    {
      "name": "<e.g., React.js, System Design, Communication>",
      "importance": "<High|Medium|Low>",
      "proficiencyLevel": "<Beginner|Intermediate|Advanced|Expert>"
    }
  ],
  "difficultyProfile": "<Easy|Medium|Hard>",
  "recommendedAssessmentDurationMins": <number>
}`,
  } satisfies PromptTemplate<{
    jobTitle: string;
    jobDescription: string;
    seniorityLevel: string;
    companyStandards?: string;
  }>,

  /**
   * AI Assessment Generator
   * Automatically generates an assessment blueprint with MCQs and Coding Challenges.
   */
  ASSESSMENT_GENERATOR: {
    id: "assessment-generator",
    version: "2.0.0", // Bumped for Phase 5
    description:
      "Generates structured assessment tasks based on competencies and Skill Trail Rules",
    inputSchema: z.object({
      roleProfile: z.string(),
      competencies: z.string(), // stringified JSON
      configurationRules: z.string(), // stringified JSON of SkillTrailConfiguration
    }),
    systemPrompt: `You are an expert Technical Assessment Creator.
Your job is to generate fair, highly-calibrated assessment tasks that strictly adhere to the recruiter's Configuration Rules.
Always respond with valid JSON matching the specified output schema.
Do not include markdown code blocks, just raw JSON.`,
    userPromptTemplate: `# Assessment Generation Request

## Role: {{roleProfile}}

## Required Competencies:
{{competencies}}

## Configuration Rules:
{{configurationRules}}

Generate an assessment blueprint that STRICTLY adheres to the Configuration Rules (e.g. number of questions, difficulty distribution).
Ensure questions are unique and strictly map to the requested competencies.

## Required Response Format (JSON):
{
  "blueprint": {
    "title": "Generated Assessment for {{roleProfile}}",
    "tasks": [
      {
        "type": "MCQ",
        "title": "<Question Title>",
        "description": "<The actual question>",
        "competencies": ["<Mapped Competency>"],
        "maxPoints": 10,
        "difficulty": "<Easy|Medium|Hard>",
        "options": ["A", "B", "C", "D"],
        "correctOptionIndex": <0-3>,
        "explanation": "<Why is it correct>"
      },
      {
        "type": "CODE",
        "title": "<Coding Challenge Title>",
        "description": "<Detailed requirements>",
        "competencies": ["<Mapped Competency>"],
        "maxPoints": 50,
        "difficulty": "<Medium|Hard>",
        "starterCode": "function solve() {}",
        "rubric": ["<Criteria 1>", "<Criteria 2>"]
      }
    ]
  }
}`,
  } satisfies PromptTemplate<{
    roleProfile: string;
    competencies: string;
    configurationRules: string;
  }>,

  /**
   * AI Micro-Task Generator (USP Feature)
   * Automatically generates Micro-Internship assessments from project context or Jira tickets.
   */
  MICRO_TASK_GENERATOR: {
    id: "micro-task-generator",
    version: "1.0.0",
    description: "Generates structured micro-internship tasks based on project context",
    inputSchema: z.object({
      projectContext: z.string(),
      techStack: z.string(),
      difficulty: z.string(),
    }),
    systemPrompt: `You are an expert Technical Architect creating bite-sized "Micro-Internships" for junior/mid-level developers.
Your job is to read a project description, Jira ticket, or codebase context, and extract fully fleshed out coding challenges that can be assigned to a candidate.
Always respond with valid JSON matching the specified output schema.
Do not include markdown code blocks, just raw JSON.`,
    userPromptTemplate: `# Micro-Task Generation Request

## Project Context / Issue:
{{projectContext}}

## Tech Stack:
{{techStack}}

## Difficulty Level:
{{difficulty}}

Generate a micro-internship assessment containing 1-3 tasks that can be completed in a few hours. The tasks should be practical, real-world, and relevant to the project context provided. Focus heavily on CODE tasks.

## Required Response Format (JSON):
{
  "blueprint": {
    "title": "Micro-Task: <Generated Title based on context>",
    "description": "<Brief summary of what the candidate will achieve>",
    "tasks": [
      {
        "type": "CODE",
        "title": "<Coding Challenge Title>",
        "description": "<Detailed requirements, acceptance criteria, and constraints based on the project context>",
        "maxPoints": 100,
        "starterCode": "// Add starter code here if applicable",
        "rubric": ["<Criteria 1>", "<Criteria 2>"]
      }
    ]
  }
}`,
  } satisfies PromptTemplate<{
    projectContext: string;
    techStack: string;
    difficulty: string;
  }>,

  /**
   * Advanced Assessment Evaluation
   * Includes Performance Classification and Deep Rubric Analysis.
   */
  ADVANCED_EVALUATION: {
    id: "advanced-evaluation",
    version: "2.0.0",
    description: "Advanced candidate evaluation generating Performance Classifications",
    inputSchema: z.object({
      assessmentTitle: z.string(),
      candidateSubmissionJSON: z.string(),
      passingScore: z.number(),
    }),
    systemPrompt: `You are an expert Senior Engineering Manager grading candidate submissions.
You must objectively evaluate the candidate's work and output a detailed performance classification.
Always respond with valid JSON matching the specified output schema.
Do not include markdown code blocks, just raw JSON.`,
    userPromptTemplate: `# Advanced Evaluation Request

## Assessment: {{assessmentTitle}}
## Passing Threshold: {{passingScore}}%

## Candidate Submission (Tasks & Answers):
{{candidateSubmissionJSON}}

Analyze all answers. Provide an aggregate evaluation and classify the candidate.

Performance Classifications: "Exceptional", "Outstanding", "Above Average", "Good", "Average", "Below Average", "Needs Improvement".

## Required Response Format (JSON):
{
  "overallScore": <number 0-100>,
  "performanceClassification": "<Classification>",
  "isPassed": <boolean>,
  "confidenceScore": <number 0-100>,
  "summary": "<2-3 sentence objective evaluation>",
  "strengths": ["<strength 1>"],
  "weaknesses": ["<weakness 1>"],
  "learningGaps": ["<gap 1>"]
}`,
  } satisfies PromptTemplate<{
    assessmentTitle: string;
    candidateSubmissionJSON: string;
    passingScore: number;
  }>,

  // ── Phase 3: AI Hiring OS Prompts ──────────────────────────────────────────

  CANDIDATE_RANKING: {
    id: "candidate-ranking",
    version: "1.0.0",
    description: "Ranks a list of candidates against a Role Profile",
    inputSchema: z.object({
      roleProfile: z.string(),
      candidatesDataJSON: z.string(),
    }),
    systemPrompt: `You are an expert AI Recruiter for a Skill-Based Hiring Platform.
Your goal is to evaluate and rank candidates based on their verified skills and assessment performance against the given Role Profile.
Always respond with valid JSON matching the specified output schema.`,
    userPromptTemplate: `# Candidate Ranking Request

## Target Role:
{{roleProfile}}

## Candidates Data:
{{candidatesDataJSON}}

Analyze the candidates. Output a ranked list with a calculated Fit Score (0-100) and reasoning for each.

## Required Response Format (JSON):
{
  "rankedCandidates": [
    {
      "candidateId": "<string>",
      "rank": <number>,
      "fitScore": <number 0-100>,
      "reasoning": "<1-2 sentence explanation>"
    }
  ]
}`,
  } satisfies PromptTemplate<{
    roleProfile: string;
    candidatesDataJSON: string;
  }>,

  INTERVIEW_KIT_GENERATOR: {
    id: "interview-kit-generator",
    version: "1.0.0",
    description: "Generates structured interview questions and rubrics",
    inputSchema: z.object({
      roleProfile: z.string(),
      competencies: z.string(),
    }),
    systemPrompt: `You are an expert Technical Interviewer.
Your job is to generate a comprehensive Interview Kit containing technical and behavioral questions tailored to the required competencies.
Always respond with valid JSON matching the specified output schema.`,
    userPromptTemplate: `# Interview Kit Generation Request

## Target Role:
{{roleProfile}}

## Required Competencies:
{{competencies}}

Generate an interview kit with exactly 2 technical questions and 1 behavioral question.

## Required Response Format (JSON):
{
  "interviewKit": {
    "title": "Interview Kit for {{roleProfile}}",
    "questions": [
      {
        "type": "<Technical|Behavioral|Situational>",
        "question": "<The question to ask>",
        "expectedAnswer": "<What a good answer sounds like>",
        "rubric": ["<Criteria 1>", "<Criteria 2>"],
        "difficulty": "<Medium|Hard>",
        "competencyTargeted": "<Competency Name>",
        "timeEstimateMins": <number>
      }
    ]
  }
}`,
  } satisfies PromptTemplate<{
    roleProfile: string;
    competencies: string;
  }>,

  PROJECT_EVALUATION: {
    id: "project-evaluation",
    version: "1.0.0",
    description: "Evaluates GitHub repositories or ZIP project submissions",
    inputSchema: z.object({
      projectInstructions: z.string(),
      repositoryContextJSON: z.string(),
    }),
    systemPrompt: `You are a Principal Software Engineer evaluating a candidate's project repository.
Analyze the codebase structure, code quality, architecture, and maintainability.
Always respond with valid JSON matching the specified output schema.`,
    userPromptTemplate: `# Project Evaluation Request

## Project Instructions / Requirements:
{{projectInstructions}}

## Extracted Repository Context (Metadata & Code Snippets):
{{repositoryContextJSON}}

Evaluate the project holistically.

## Required Response Format (JSON):
{
  "projectScore": <number 0-100>,
  "codeQuality": <number 0-100>,
  "architectureScore": <number 0-100>,
  "maintainability": <number 0-100>,
  "strengths": ["<strength 1>"],
  "improvements": ["<improvement 1>"],
  "summary": "<Objective evaluation summary>"
}`,
  } satisfies PromptTemplate<{
    projectInstructions: string;
    repositoryContextJSON: string;
  }>,

  // ── Phase 4: Candidate Recovery Engine Prompts ───────────────────────────

  CANDIDATE_RECOVERY_REPORT: {
    id: "candidate-recovery-report",
    version: "1.0.0",
    description: "Generates a comprehensive rejection and recovery report",
    inputSchema: z.object({
      roleProfile: z.string(),
      candidateEvaluationJSON: z.string(),
    }),
    systemPrompt: `You are an empathetic Technical Mentor.
A candidate was rejected for a role. You must generate a highly constructive, motivating Recovery Report that highlights their skill gaps and gives them a clear readiness score.
Always respond with valid JSON matching the specified output schema.`,
    userPromptTemplate: `# Candidate Recovery Request

## Role Applied For:
{{roleProfile}}

## Candidate Evaluation Data:
{{candidateEvaluationJSON}}

Analyze the data and produce the Recovery Report. Always end with a positive, motivating summary estimating the time needed to reach the required level.

## Required Response Format (JSON):
{
  "readinessScore": <number 0-100>,
  "performanceRating": "<Classification>",
  "strengths": ["<strength 1>"],
  "weakSkills": ["<weak skill 1>"],
  "missingCompetencies": ["<missing competency 1>"],
  "areasForImprovement": ["<area 1>"],
  "skillGapAnalysis": {
    "skillsYouHave": ["<skill 1>"],
    "skillsYouNeed": ["<skill 2>"]
  },
  "motivationalSummary": "<2-3 sentence positive conclusion>"
}`,
  } satisfies PromptTemplate<{
    roleProfile: string;
    candidateEvaluationJSON: string;
  }>,

  CANDIDATE_LEARNING_RECOMMENDATIONS: {
    id: "candidate-learning-recommendations",
    version: "1.0.0",
    description: "Generates specific learning and practice project recommendations",
    inputSchema: z.object({
      weakSkills: z.string(), // stringified array
      missingCompetencies: z.string(), // stringified array
    }),
    systemPrompt: `You are an AI Career Coach.
Based on the candidate's weak skills and missing competencies, recommend specific learning resources (docs, courses, tutorials) and a practice project.
Always respond with valid JSON matching the specified output schema.`,
    userPromptTemplate: `# Learning Recommendations Request

## Weak Skills:
{{weakSkills}}

## Missing Competencies:
{{missingCompetencies}}

Generate specific learning paths and a practice project.

## Required Response Format (JSON):
{
  "learningRecommendations": [
    {
      "skill": "<Skill Name>",
      "resources": ["<Resource 1>", "<Resource 2>"],
      "estimatedLearningDays": <number>
    }
  ],
  "practiceProject": {
    "title": "<Project Title>",
    "description": "<What to build>",
    "targetSkills": ["<Skill 1>", "<Skill 2>"],
    "difficulty": "<Beginner|Intermediate|Advanced>",
    "estimatedDays": <number>
  },
  "recommendedSkillTrails": ["<Trail 1>", "<Trail 2>"]
}`,
  } satisfies PromptTemplate<{
    weakSkills: string;
    missingCompetencies: string;
  }>,

  CANDIDATE_CAREER_RECOMMENDATIONS: {
    id: "candidate-career-recommendations",
    version: "1.0.0",
    description: "Recommends alternative roles based on current strengths",
    inputSchema: z.object({
      verifiedSkills: z.string(), // stringified array
      appliedRole: z.string(),
    }),
    systemPrompt: `You are an AI Career Advisor.
The candidate was rejected for their applied role. Based on their verified skills, recommend 3 alternative roles they are better suited for.
Always respond with valid JSON matching the specified output schema.`,
    userPromptTemplate: `# Career Recommendation Request

## Applied Role:
{{appliedRole}}

## Candidate Verified Skills:
{{verifiedSkills}}

Generate exactly 3 alternative role recommendations with a match percentage.

## Required Response Format (JSON):
{
  "alternativeRoles": [
    {
      "role": "<Role Name>",
      "matchPercentage": <number 0-100>,
      "reasoning": "<1 sentence explanation>"
    }
  ]
}`,
  } satisfies PromptTemplate<{
    verifiedSkills: string;
    appliedRole: string;
  }>,

  /**
   * PHASE 7: AI Integrity Engine
   */
  INTEGRITY_ANALYZER: {
    id: "integrity-analyzer-v1",
    version: "1.0.0",
    description: "Analyzes a submission for potential AI plagiarism or cheating.",
    inputSchema: z.object({
      taskContext: z.string(),
      candidateSubmission: z.string(),
      metadata: z.string(), // E.g., time taken, paste events if any
    }),
    systemPrompt: `You are a strict Code Integrity & Proctoring Analyst.
Your job is to analyze a candidate's submission and determine the likelihood that it was generated by an AI (like ChatGPT or Claude) rather than written by a human.
Analyze the provided metadata (time spent, paste events) and the code itself (semantic structure, overly generic comments, use of advanced language features not standard for the role level).
Provide an integrityScore from 0 to 100, where 100 means 'definitely human' and 0 means 'definitely AI generated'.
Flag any suspicious findings. If the score is below 50, mark isSuspicious as true.
Always respond with valid JSON.`,
    userPromptTemplate: `# Integrity Analysis Request

## Task Context:
{{taskContext}}

## Submission Metadata (Time taken, etc.):
{{metadata}}

## Candidate Submission:
{{candidateSubmission}}

## Required Response Format (JSON):
{
  "integrityScore": <number 0-100>,
  "isSuspicious": <boolean>,
  "flags": [
    "<Flag 1>",
    "<Flag 2>"
  ],
  "reasoning": "<String explanation>"
}`,
  } satisfies PromptTemplate<{
    taskContext: string;
    candidateSubmission: string;
    metadata: string;
  }>,

  /**
   * PHASE 7: AI Onboarding Plan Generator
   */
  ONBOARDING_PLAN_GENERATOR: {
    id: "onboarding-plan-generator-v1",
    version: "1.0.0",
    description: "Generates a 30-day onboarding plan for hired candidates based on skill deltas.",
    inputSchema: z.object({
      roleProfileRequirements: z.string(),
      candidateVerifiedSkills: z.string(),
    }),
    systemPrompt: `You are an Expert Technical Onboarding Manager.
The candidate has been HIRED. Your job is to create a 30-day (4 week) personalized onboarding plan.
Compare their Verified Skills against the Role Requirements. Identify the "Delta" (what they don't know well yet).
Focus the first 2 weeks on closing that specific skill gap.
Always respond with valid JSON.`,
    userPromptTemplate: `# Onboarding Plan Request

## Role Requirements (Target):
{{roleProfileRequirements}}

## Candidate Verified Skills (Current State):
{{candidateVerifiedSkills}}

## Required Response Format (JSON):
{
  "skillGapsIdentified": ["<Gap 1>", "<Gap 2>"],
  "weeklyPlan": [
    {
      "week": 1,
      "focus": "<String>",
      "tasks": ["<Task 1>", "<Task 2>"]
    },
    {
      "week": 2,
      "focus": "<String>",
      "tasks": ["<Task 1>", "<Task 2>"]
    },
    {
      "week": 3,
      "focus": "<String>",
      "tasks": ["<Task 1>", "<Task 2>"]
    },
    {
      "week": 4,
      "focus": "<String>",
      "tasks": ["<Task 1>", "<Task 2>"]
    }
  ],
  "messageToCandidate": "<Welcoming, motivational message about the onboarding plan>"
}`,
  } satisfies PromptTemplate<{
    roleProfileRequirements: string;
    candidateVerifiedSkills: string;
  }>,

  /**
   * PHASE 8: Recruiter Copilot
   */
  COPILOT_QUERY_GENERATOR: {
    id: "copilot-query-generator-v1",
    version: "1.0.0",
    description: "Translates natural language recruiter requests into Prisma ORM query parameters.",
    inputSchema: z.object({
      recruiterQuery: z.string(),
      companyId: z.string(),
    }),
    systemPrompt: `You are an AI Recruiter Copilot Database Translator.
Your job is to translate a recruiter's natural language request into a valid JSON object representing a Prisma ORM 'where' clause for the 'CandidateProfile' or 'Submission' models.
Always ensure the query is scoped to the provided companyId if applicable.
Do not write code, ONLY write valid JSON that can be passed directly to prisma.candidateProfile.findMany({ where: ... }).`,
    userPromptTemplate: `# Natural Language Query

Recruiter Query: "{{recruiterQuery}}"
Company ID to scope: "{{companyId}}"

Generate exactly the JSON object for the Prisma "where" clause. Return only valid JSON.`,
  } satisfies PromptTemplate<{
    recruiterQuery: string;
    companyId: string;
  }>,

  // ── Phase 10: High & Medium Value Feature Prompts ─────────────────────────

  INTERVIEW_ANSWER_EVALUATOR: {
    id: "interview-answer-evaluator-v1",
    version: "1.0.0",
    description: "Evaluates a candidate interview answer and returns a score with feedback.",
    inputSchema: z.object({
      questionText: z.string(),
      rubric: z.string(),
      answerText: z.string(),
      maxPoints: z.number(),
    }),
    systemPrompt: `You are an expert technical interviewer evaluating candidate responses.
Evaluate the candidate's answer based on the question and rubric provided.
Score strictly and objectively. Return ONLY valid JSON:
{ "score": <number 0 to maxPoints>, "feedback": "<2-3 sentence specific actionable feedback>" }`,
    userPromptTemplate: `# Interview Question
{{questionText}}

# Evaluation Rubric
{{rubric}}

# Candidate Answer
{{answerText}}

# Max Points: {{maxPoints}}

Return JSON with score and feedback.`,
  } satisfies PromptTemplate<{
    questionText: string;
    rubric: string;
    answerText: string;
    maxPoints: number;
  }>,

  RESUME_EXTRACTOR: {
    id: "resume-extractor-v1",
    version: "1.0.0",
    description: "Extracts structured candidate data from raw resume text.",
    inputSchema: z.object({
      resumeText: z.string(),
    }),
    systemPrompt: `You are an expert resume parser. Extract structured information.
Return ONLY valid JSON:
{
  "summary": "2-3 sentence professional summary",
  "yearsOfExperience": 0,
  "skills": ["skill1"],
  "experience": [{ "title": "", "company": "", "duration": "", "description": "" }],
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "certifications": [],
  "languages": []
}`,
    userPromptTemplate: `# Resume Content\n\n{{resumeText}}\n\nExtract and return structured JSON.`,
  } satisfies PromptTemplate<{
    resumeText: string;
  }>,

  JOB_DESCRIPTION_GENERATOR: {
    id: "job-description-generator-v1",
    version: "1.0.0",
    description: "Generates a professional job description and suggested role profile.",
    inputSchema: z.object({
      roleName: z.string(),
      companyName: z.string(),
      companyIndustry: z.string(),
      keyResponsibilities: z.string(),
      additionalContext: z.string(),
    }),
    systemPrompt: `You are an expert HR consultant. Generate a compelling, modern job description.
Return ONLY valid JSON:
{
  "jobTitle": "",
  "jobDescription": "full markdown job description",
  "seniority": "Junior | Mid | Senior | Lead",
  "suggestedSkills": [],
  "suggestedCompetencies": [],
  "estimatedSalaryRange": { "min": 0, "max": 0, "currency": "USD" },
  "workType": "Remote | Hybrid | On-site"
}`,
    userPromptTemplate: `Role: {{roleName}}
Company: {{companyName}}
Industry: {{companyIndustry}}
Responsibilities: {{keyResponsibilities}}
Context: {{additionalContext}}

Generate the job description JSON.`,
  } satisfies PromptTemplate<{
    roleName: string;
    companyName: string;
    companyIndustry: string;
    keyResponsibilities: string;
    additionalContext: string;
  }>,

  QUESTION_GENERATOR: {
    id: "question-generator-v1",
    version: "1.0.0",
    description: "Generates assessment questions for given skills and difficulty.",
    inputSchema: z.object({
      skills: z.string(),
      competencies: z.string(),
      questionType: z.string(),
      difficulty: z.string(),
      count: z.number(),
    }),
    systemPrompt: `You are an expert technical assessment designer. Generate high-quality assessment questions.
Return ONLY a valid JSON array:
[{
  "question": "Question text",
  "type": "MCQ | CODE | OPEN_ENDED",
  "difficulty": "Easy | Medium | Hard",
  "options": [{"text": "Option", "isCorrect": false}],
  "explanation": "Why correct answer is correct",
  "skills": [],
  "competencies": []
}]
For MCQ: include exactly 4 options, only one isCorrect.`,
    userPromptTemplate: `Skills: {{skills}}
Competencies: {{competencies}}
Type: {{questionType}}
Difficulty: {{difficulty}}
Count: {{count}}

Generate {{count}} questions as JSON array.`,
  } satisfies PromptTemplate<{
    skills: string;
    competencies: string;
    questionType: string;
    difficulty: string;
    count: number;
  }>,

  OFFER_LETTER_GENERATOR: {
    id: "offer-letter-generator-v1",
    version: "1.0.0",
    description: "Generates a professional offer letter for a hired candidate.",
    inputSchema: z.object({
      companyName: z.string(),
      candidateName: z.string(),
      roleName: z.string(),
      startDate: z.string(),
      salary: z.string(),
      additionalTerms: z.string(),
    }),
    systemPrompt: `You are an expert HR professional. Generate a warm, professional offer letter.
Return ONLY valid JSON: { "offerLetter": "full markdown letter" }
Include: greeting, role offer, compensation, start date, key terms, professional closing.`,
    userPromptTemplate: `Company: {{companyName}}
Candidate: {{candidateName}}
Role: {{roleName}}
Start Date: {{startDate}}
Compensation: {{salary}}
Additional Terms: {{additionalTerms}}

Generate the offer letter JSON.`,
  } satisfies PromptTemplate<{
    companyName: string;
    candidateName: string;
    roleName: string;
    startDate: string;
    salary: string;
    additionalTerms: string;
  }>,

  SKILL_TRAIL_MCQ_GENERATOR: {
    id: "skill-trail-mcq-generator-v1",
    version: "1.0.0",
    description: "Generates objective MCQ questions directly tied to Skill Trail rules",
    inputSchema: z.object({
      skillTrailName: z.string(),
      skillTrailDescription: z.string(),
      skills: z.string(),
      competencies: z.string(),
      difficulty: z.string(),
      count: z.number(),
    }),
    systemPrompt: `You are a strict, expert technical assessment generator.
Your ONLY job is to produce a JSON object containing exactly the requested number of MCQ questions.
Rules:
- Generate EXACTLY the requested number of questions.
- Never duplicate questions.
- Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["A", "B", "C", "D"],
      "correctOption": "Exact string matching one of the options",
      "skillId": "Matching skill name from the input",
      "competencyId": "Matching competency name from the input",
      "difficulty": "Easy, Intermediate, or Hard",
      "explanation": "Why this is correct"
    }
  ]
}
No other text outside the JSON.`,
    userPromptTemplate: `Skill Trail: {{skillTrailName}}
Description: {{skillTrailDescription}}
Skills to test: {{skills}}
Competencies to test: {{competencies}}
Target Difficulty: {{difficulty}}
Number of Questions to Generate: {{count}}

Generate the JSON array of questions now.`,
  } satisfies PromptTemplate<{
    skillTrailName: string;
    skillTrailDescription: string;
    skills: string;
    competencies: string;
    difficulty: string;
    count: number;
  }>,

  SKILL_TRAIL_CANDIDATE_ANALYSIS: {
    id: "skill-trail-candidate-analysis-v1",
    version: "1.0.0",
    description: "Analyzes candidate MCQ performance for skill gaps",
    inputSchema: z.object({
      roleProfile: z.string(),
      totalScore: z.number(),
      maxScore: z.number(),
      resultsJSON: z.string(),
    }),
    systemPrompt: `You are an expert technical hiring manager analyzing a candidate's deterministic MCQ results.
Your job is to identify what the candidate knows, where they are weak, and what their next steps should be.
Return ONLY valid JSON matching this schema:
{
  "summary": "A 2-3 sentence overall performance interpretation.",
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "learningGaps": ["string", "string"],
  "learningRecommendations": ["string", "string"]
}
Do not fabricate URLs or course links. Provide learning topics only.`,
    userPromptTemplate: `Role Profile: {{roleProfile}}
Score: {{totalScore}} / {{maxScore}}

Detailed Deterministic Results:
{{resultsJSON}}

Generate the candidate analysis JSON now.`,
  } satisfies PromptTemplate<{
    roleProfile: string;
    totalScore: number;
    maxScore: number;
    resultsJSON: string;
  }>,

  SKILL_TRAIL_TASK_RECOMMENDER: {
    id: "skill-trail-task-recommender-v1",
    version: "1.0.0",
    description: "Recommends an existing task based on candidate weaknesses",
    inputSchema: z.object({
      candidateAnalysisJSON: z.string(),
      availableTasksJSON: z.string(),
    }),
    systemPrompt: `You are an intelligent task routing engine.
You must recommend the MOST suitable task from the provided list of AVAILABLE tasks to test the candidate's weaknesses or validate their strengths.
If NO available tasks are suitable, you must explicitly state that. Do NOT invent task IDs.
Return ONLY valid JSON matching this schema:
{
  "recommendedTaskId": "The exact ID of the recommended task, or null if none",
  "rationale": "Why this task was selected based on the candidate's skill gaps"
}`,
    userPromptTemplate: `Candidate Analysis:
{{candidateAnalysisJSON}}

Available Configured Tasks:
{{availableTasksJSON}}

Generate the task recommendation JSON now.`,
  } satisfies PromptTemplate<{
    candidateAnalysisJSON: string;
    availableTasksJSON: string;
  }>,
} as const;
