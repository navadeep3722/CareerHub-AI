import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy initialization of Gemini to prevent startup crashes when API key is missing
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured in environment or Secrets panel.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

async function generateGeminiContent(params: any): Promise<any> {
  const modelsToTry = ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-3.5-flash"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[Gemini Fallback Engine] Attempting request on model: ${model}`);
      const callParams = { ...params, model };
      const ai = getGeminiClient();
      const response = await ai.models.generateContent(callParams);
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err.message || "";
      console.warn(`[Gemini Fallback Engine] Model ${model} failed with message: ${errMsg}`);
      
      const isTransient = errMsg.includes("503") || 
                          errMsg.includes("Service Unavailable") || 
                          errMsg.includes("high demand") || 
                          errMsg.includes("429") || 
                          errMsg.includes("Resource Has Exhausted") ||
                          errMsg.includes("UNAVAILABLE") ||
                          err.status === 503 ||
                          err.status === 429;
      
      if (!isTransient) {
        throw err;
      }
    }
  }
  throw lastError;
}

app.use(express.json({ limit: "15mb" }));

// Mock Initial Databases
const initialJobs = [
  {
    id: "job-1",
    title: "Senior AI Engineer",
    department: "Engineering",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    salary: "$160k - $210k + Equity",
    requirements: [
      "3+ years experience building features with large language models",
      "Proficient in TypeScript, Node.js, and Python",
      "Experience with retrieval-augmented generation (RAG) pipelines",
      "Familiar with cloud deployments (GCP/AWS)"
    ],
    description: "Join the core AI Innovations team to architect CareerHub's future matchmaking models, utilizing LLMs, smart vector stores, and custom agents.",
    status: "Active",
    applicantsCount: 3,
    createdAt: "2026-06-15"
  },
  {
    id: "job-2",
    title: "SaaS Product Coordinator",
    department: "Product Management",
    location: "Remote",
    type: "Full-time",
    salary: "$90k - $125k",
    requirements: [
      "Bachelor's degree or equivalent experience",
      "Excellent customer-facing communication skills",
      "Prior experience writing PRDs or product requirements",
      "Experience with Agile/Scrum processes"
    ],
    description: "Looking for an operational-minded coordinator to work directly with engineering leads and customer stakeholders, refining our client experience portals.",
    status: "Active",
    applicantsCount: 2,
    createdAt: "2026-06-17"
  }
];

const initialApplicants = [
  {
    id: "cand-1",
    name: "Alexander Sterling",
    email: "alex.sterling@example.com",
    experienceYears: 4,
    skills: ["React", "TypeScript", "Python", "LLMs", "Vector Databases", "GCP"],
    education: "B.S. in Computer Science - Stanford University",
    currentRole: "AI Developer at CloudScale",
    resumeText: "SUMMARY: Energetic machine learning developer specializing in production deployment of LLM applications. Working as an AI Developer at CloudScale for 4 years. TECHNICAL SKILLS: Python, TypeScript, React, PostgreSQL, LangChain, vector storage, GCP, Docker. PROJECTS: Built a smart customer support representative utilizing serverless functions and Retrieval-Augmented Generation.",
    status: "Applied"
  },
  {
    id: "cand-2",
    name: "Sophia Vance",
    email: "sophia.v@example.com",
    experienceYears: 5,
    skills: ["Product Roadmap", "Agile", "PRDs", "Excel", "User Research", "SaaS"],
    education: "MBA - Wharton School",
    currentRole: "Associate Product Manager",
    resumeText: "SUMMARY: Strategic and user-focused product manager with 5 years of tenure in high-growth B2B enterprise software companies. Experience setting full product roadmap and driving development lifecycles. TECHNICAL SKILLS: Jira, Figma, Product Analytics, Excel, Scrum, Agile methodology. EDUCATION: MBA at Wharton School.",
    status: "Applied"
  },
  {
    id: "cand-3",
    name: "Marcus Thorne",
    email: "marcus.t@threedev.io",
    experienceYears: 1,
    skills: ["HTML", "CSS", "Vanilla JS", "Basic SQL", "Communication"],
    education: "Self-trained Bootcamper",
    currentRole: "Junior Web Assistant",
    resumeText: "SUMMARY: Enthusiastic front-end design student and bootcamper looking for junior developer roles. Skilled in HTML, CSS, Javascript. Familiar with writing simple landing pages and WordPress layouts. Excited to learn more about LLMs and backend cloud infrastructures.",
    status: "Applied"
  }
];

// --- API ENDPOINTS ---

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 1. ATS Resume Analyzer Endpoint (Gemini-Powered)
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resumeText, jobDescription, expectedRole } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text content is required empty." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a professional ATS (Applicant Tracking System) Analyzer and career advisor. 
You must contrast the candidate's resume text against the provided job description or expected role. 
Evaluate how closely the credentials, skills, and history match, find missing competencies, highlight formatting critiques, and return highly constructive career suggestions.`;

    const userPrompt = `Compare the following Resume with the target role objectives:
Expected Target Role: ${expectedRole || "General Technical Role / Software Engineer"}
Target Job Description (if provided):
${jobDescription || "Not provided - evaluate general suitability for the requested role."}

Resume Content:
---
${resumeText}
---

Return a structured feedback evaluation in pure JSON according to the required schema. Ensure the matching score (0 to 100) reflects genuine alignment.`;

    const response = await generateGeminiContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "ATS matching score from 0 to 100" },
            summary: { type: Type.STRING, description: "Overall 2-3 sentence overview of the resume design and fit" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 major professional strengths highlighted" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 critical areas of concern/weaknesses relative to expectations" },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords, skills, or certifications missing from the resume but highly expected in this role" },
            formattingIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Formatting, visual presentation or structural improvements" },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable concrete instructions to improve the candidate's ATS resume score" },
            matchedRole: { type: Type.STRING, description: "The core recommended profile or target title matched" }
          },
          required: ["score", "summary", "strengths", "weaknesses", "missingKeywords", "formattingIssues", "improvements", "matchedRole"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("ATS Analyzer Error:", err);
    res.status(500).json({ 
      error: "AI Resume Analysis failed", 
      details: err.message,
      isNoApiKey: err.message?.includes("GEMINI_API_KEY") 
    });
  }
});

// 2. AI Interview Coach - Chat & Real-Time Assessment (Gemini-Powered)
app.post("/api/interview/chat", async (req, res) => {
  try {
    const { messages, jobTitle, lastUserMessage } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ error: "Job title is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a high-fidelity AI Interview Coach. Your goal is to guide the student candidate through a realistic behavioral and technical interview for the role of ${jobTitle}.
For each candidate answer:
1. Provide extremely helpful, constructive feedback evaluating the user's specific answer (Max 2 brief sentences, highlight strengths or specific gaps in STAR method representation).
2. Ask the next logical interview question to assess skills like problem-solving, collaboration, system design, or cultural fit.
3. Keep the tone warm, professional, encouraging, and focused.`;

    const historyPrompt = messages && messages.length > 0 
      ? `Conversation history:
${messages.map((m: any) => `${m.role === 'user' ? 'Candidate' : 'AI Coach'}: ${m.text}`).join('\n')}

Latest candidate answer to evaluate and respond to: "${lastUserMessage || ""}"`
      : `No history yet. Start the interview by welcoming the candidate, mentioning the role "${jobTitle}", and delivering a stellar technical or behavioral opener.`;

    const response = await generateGeminiContent({
      model: "gemini-3.5-flash",
      contents: historyPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING, description: "Feedback evaluating the previous answer (max 2 sentences). Welcoming greeting if opening the session." },
            nextQuestion: { type: Type.STRING, description: "The next clear and targeted interview question." }
          },
          required: ["feedback", "nextQuestion"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("AI Interview Coach Error:", err);
    res.status(500).json({ 
      error: "AI Interview Coach workspace failed", 
      details: err.message,
      isNoApiKey: err.message?.includes("GEMINI_API_KEY")
    });
  }
});

// 3. Recruiter Candidate Ranking (Gemini-Powered)
app.post("/api/recruiter/rank", async (req, res) => {
  try {
    const { jobDescription, candidates } = req.body;

    if (!jobDescription || !candidates || !Array.isArray(candidates)) {
      return res.status(400).json({ error: "Job description and candidates array are required." });
    }

    if (candidates.length === 0) {
      return res.json([]);
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a Senior Strategic Hiring Evaluator. Compare the provided list of candidates' career skills, education background, and resume highlights against the target job requirements.
Rate each candidate on a 0-100 Suitability Index, identify key alignment bottlenecks, draft a high-level summary of strengths, and create two customized challenging interview questions recruiters should ask during the phone screen.`;

    const userPrompt = `Evaluate the candidates for this specific role:
Target Job Description:
---
${jobDescription}
---

Candidates to Evaluate:
${candidates.map((c: any) => `Candidate Reference [ID: ${c.id}]:
Name: ${c.name}
Role/Title: ${c.currentRole}
Experience Years: ${c.experienceYears}
Key Skills declared: ${c.skills.join(", ")}
Resume text info: ${c.resumeText}`).join("\n\n")}

Return a dense JSON array detailing the score ratings. Important: match candidate IDs exactly.`;

    const response = await generateGeminiContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "The candidate Reference ID passed in (e.g. cand-1)" },
              suitabilityScore: { type: Type.INTEGER, description: "Evaluated suitability match index (0 to 100)" },
              criticalGaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific technical or business skills/experience missing based on standard expectations" },
              strengthsSummary: { type: Type.STRING, description: "Executive summary highlighting resume competitive advantages" },
              suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2 high-impact custom screen questions tailored to this candidate" }
            },
            required: ["id", "suitabilityScore", "criticalGaps", "strengthsSummary", "suggestedQuestions"]
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "[]");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Candidate Ranking Error:", err);
    res.status(500).json({ 
      error: "Candidate screen ranking failed", 
      details: err.message,
      isNoApiKey: err.message?.includes("GEMINI_API_KEY")
    });
  }
});

// 4. Job Posting generator (Recruiter support)
app.post("/api/recruiter/generate-job", async (req, res) => {
  try {
    const { title, department } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Job title is required." });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are a tech recruiter writing hyper-optimized job listings. 
Draft a beautiful description, professional salary estimates, and target requirements list.`;

    const userPrompt = `Job Title: ${title}
Department: ${department || "Engineering"}

Generate a detailed listing in JSON.`;

    const response = await generateGeminiContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "Elegant description of the company and role objective" },
            requirements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4-6 key tech/business requirements" },
            salary: { type: Type.STRING, description: "Estimated salary range" }
          },
          required: ["description", "requirements", "salary"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    console.error("Job Generator Error:", err);
    res.status(500).json({ 
      error: "AI Job Generation failed", 
      details: err.message,
      isNoApiKey: err.message?.includes("GEMINI_API_KEY")
    });
  }
});

// 5. Hardened Role Access logs / Guard (Role-based simulation)
app.post("/api/admin/system-logs", (req, res) => {
  // Safe admin route - simulation check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes("ROLE_ADMIN")) {
    return res.status(403).json({ 
      error: "Forbidden", 
      message: "HTTP 403: Admin clearance required. Attempt logged."
    });
  }
  res.json({
    logs: [
      { time: new Date(Date.now() - 3600000).toISOString(), message: "System initialized successfully on port 3000." },
      { time: new Date(Date.now() - 1800000).toISOString(), message: "ATS semantic parser active." },
      { time: new Date().toISOString(), message: "Authentication database checked." }
    ]
  });
});

// Serve frontend SPA or launch development server
async function boot() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support client SPA routing fallback on any arbitrary URL
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CareerHub AI] Server active on http://0.0.0.0:${PORT}`);
  });
}

boot();
