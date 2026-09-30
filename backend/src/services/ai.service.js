const { Ollama } = require("ollama");
const { z } = require("zod");
const config = require("../config/config");

const ollama = new Ollama({
  host: config.OLLAMA_HOST,
});

const interviewReportDBSchema = z.object({
  matchScore: z.number().min(0).max(100),

  technicalQuestions: z.array(
    z.object({
      question: z.string().min(1),
      intention: z.string().min(1),
      answer: z.string().min(1),
    })
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string().min(1),
      intention: z.string().min(1),
      answer: z.string().min(1),
    })
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string().min(1),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number().int().positive(),
      focus: z.string().min(1),
      task: z.string().min(1),
    })
  ),
});

async function generateInterviewAIReport({
  jobDescription,
  resume,
  selfDescription,
}) {
  // Validate input
  if (!jobDescription?.trim()) {
    throw new Error("Job description is required");
  }

  if (!resume?.trim()) {
    throw new Error("Resume is required");
  }

  const prompt = `
You are an ATS resume analyzer and technical interview preparation assistant.

Analyze the candidate's resume against the job description.

You MUST return exactly ONE JSON object.

The root object MUST contain these EXACT property names:

matchScore
technicalQuestions
behavioralQuestions
skillGaps
preparationPlan

DO NOT rename these properties.
DO NOT use snake_case.
DO NOT add markdown.
DO NOT return explanations outside the JSON.

Required JSON structure:

{
  "matchScore": 80,
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "string",
      "task": "string"
    }
  ]
}

Rules:

- matchScore must be a number between 0 and 100.
- technicalQuestions must be an array.
- behavioralQuestions must be an array.
- skillGaps must be an array.
- preparationPlan must be an array.
- severity must be exactly one of: low, medium, high.
- Do not invent experience.
- Base the analysis only on the provided resume and job description.
- Return ONLY JSON.

Resume:
${resume}

Job Description:
${jobDescription}

Self Description:
${selfDescription || "Not provided"}
`;

  const response = await ollama.chat({
    model: config.OLLAMA_MODEL,

    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],

    format: "json",
  });

  // Parse AI response
  let aiData;

  try {
    aiData = JSON.parse(response.message.content);
  } catch {
    console.error("Invalid JSON from Ollama:");
    console.error(response.message.content);

    throw new Error("Ollama returned invalid JSON");
  }

  // Validate AI response
  const result = interviewReportDBSchema.safeParse(aiData);

  if (!result.success) {
    console.error(
      "Zod validation failed:",
      JSON.stringify(result.error.format(), null, 2)
    );

    throw new Error("Invalid AI response");
  }

  return result.data;
}

module.exports = generateInterviewAIReport;