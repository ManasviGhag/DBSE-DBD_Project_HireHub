import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  parseSkillsFromText,
  parseExperienceYears,
  parseEducationLines,
  parseCertifications,
  parseExperienceEntries,
} from "./resumeParser.js";

// If GEMINI_API_KEY is set, resumes are parsed by a real AI model into
// structured skills/education/experience/certifications. Without a key,
// we fall back to the keyword/heuristic parser in resumeParser.js — same
// "mock vs real" pattern used for the chatbot, so uploads never hard-fail.
const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
const genAI = hasApiKey ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const RESUME_SCHEMA = {
  type: "object",
  properties: {
    skills: {
      type: "array",
      items: { type: "string" },
      description: "Technical and professional skills mentioned in the resume.",
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          degree: { type: "string" },
          institution: { type: "string" },
          year: { type: "string" },
        },
        required: ["degree", "institution", "year"],
      },
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          duration: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "company", "duration", "description"],
      },
    },
    certifications: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["skills", "education", "experience", "certifications"],
};

// gemini-2.5-flash is no longer available to new API keys (404), so use its successor.
const GEMINI_MODEL = "gemini-3.8-flash";

const EXTRACTION_PROMPT = `You are a resume parser. Read the resume text below and extract
structured information from it. Follow these rules:
- "skills" should list technical skills, tools, languages and frameworks actually mentioned —
  do not invent skills that aren't in the text.
- "education" should list each degree/qualification with its institution and year, in the
  order they appear. Split degree, institution and year into their own fields. Use "" for any
  field you can't find, never guess.
- "experience" should list each job/internship with title, company, duration (e.g. "Jun 2023 - Present"),
  and a short one-line description of what they did. Use "" for any field you can't find.
- "certifications" should list certificate/course names actually mentioned.
- Return ONLY the JSON object matching the schema — no extra commentary.

Here is an example of the exact conventions to follow. It is only an illustration of the
format — never copy anything from it into your answer.

Example resume text:
"""
EDUCATION
B.Tech in Computer Science, XYZ College of Engineering, 2020–2024 (CGPA 8.6)
Class XII, ABC Junior College, 2020

EXPERIENCE
Software Engineering Intern — Acme Technologies (Jun 2023 – Aug 2023)
Built REST APIs in Node.js and Express for the internal inventory dashboard.

SKILLS: JavaScript, React, Node.js, Express, MongoDB, Git

CERTIFICATIONS
AWS Certified Cloud Practitioner (2023)
"""

Example output:
{
  "skills": ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Git"],
  "education": [
    { "degree": "B.Tech in Computer Science", "institution": "XYZ College of Engineering", "year": "2020 - 2024" },
    { "degree": "Class XII", "institution": "ABC Junior College", "year": "2020" }
  ],
  "experience": [
    {
      "title": "Software Engineering Intern",
      "company": "Acme Technologies",
      "duration": "Jun 2023 - Aug 2023",
      "description": "Built REST APIs in Node.js and Express for the internal inventory dashboard."
    }
  ],
  "certifications": ["AWS Certified Cloud Practitioner"]
}

Now extract from the real resume below.

Resume text:
"""
`;

// Resumes longer than this are split into chunks rather than truncated.
const SINGLE_CALL_LIMIT = 15000;
const CHUNK_SIZE = 12000;

// Splits text into ~maxLen chunks, preferring paragraph breaks, then line
// breaks, then sentence ends — only hard-cutting a single oversized run.
export function splitIntoChunks(text, maxLen = CHUNK_SIZE) {
  const pieces = [];
  for (const paragraph of text.split(/\n\s*\n/)) {
    if (paragraph.length <= maxLen) {
      pieces.push(paragraph);
      continue;
    }
    for (const line of paragraph.split(/\n/)) {
      if (line.length <= maxLen) {
        pieces.push(line);
        continue;
      }
      for (const sentence of line.split(/(?<=[.!?])\s+/)) {
        for (let i = 0; i < sentence.length; i += maxLen) {
          pieces.push(sentence.slice(i, i + maxLen));
        }
      }
    }
  }

  const chunks = [];
  let current = "";
  for (const piece of pieces) {
    if (current && current.length + piece.length + 2 > maxLen) {
      chunks.push(current);
      current = piece;
    } else {
      current = current ? `${current}\n\n${piece}` : piece;
    }
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}

const MAX_RETRY_WAIT_MS = 30000;

// How long to wait before retrying: Gemini's own RetryInfo hint for quota
// errors (429, e.g. "retryDelay": "20s"), otherwise exponential backoff.
function retryDelayMs(err, attempt) {
  const hint = (err.errorDetails || []).find((d) => d.retryDelay)?.retryDelay;
  const hintedSeconds = hint ? parseFloat(hint) : NaN;
  const ms = Number.isFinite(hintedSeconds) ? hintedSeconds * 1000 + 500 : 2000 * 2 ** (attempt - 1);
  return Math.min(ms, MAX_RETRY_WAIT_MS);
}

// Retries when Gemini is overloaded (503) or rate-limiting (429) — both are
// common on the free tier (5 requests/minute), especially for chunked resumes.
async function extractChunk(model, chunk) {
  const maxAttempts = 4;
  for (let attempt = 1; ; attempt++) {
    try {
      const result = await model.generateContent(EXTRACTION_PROMPT + chunk + '\n"""');
      return JSON.parse(result.response.text());
    } catch (err) {
      const status = err.status ?? Number(err.message.match(/\[(\d{3}) /)?.[1]);
      // A per-day quota won't recover within seconds (despite the retry hint),
      // so fail fast to the keyword fallback instead of making the upload wait.
      const dailyQuota = (err.errorDetails || []).some((d) =>
        (d.violations || []).some((v) => /PerDay/i.test(v.quotaId || ""))
      );
      if (![429, 503].includes(status) || dailyQuota || attempt >= maxAttempts) throw err;
      const wait = retryDelayMs(err, attempt);
      console.warn(`[aiResumeParser] Gemini ${status}, retrying in ${Math.round(wait / 1000)}s (attempt ${attempt + 1}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
}

function dedupeStrings(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    if (typeof value !== "string" || !value.trim()) continue;
    const key = value.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value.trim());
  }
  return out;
}

function dedupeEntries(entries, fields) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = JSON.stringify(fields.map((f) => String(entry?.[f] ?? "").trim()));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function mergeChunkResults(results) {
  const all = (key) => results.flatMap((r) => (Array.isArray(r?.[key]) ? r[key] : []));
  return {
    skills: dedupeStrings(all("skills")),
    education: dedupeEntries(all("education"), ["degree", "institution", "year"]),
    experience: dedupeEntries(all("experience"), ["title", "company", "duration", "description"]),
    certifications: dedupeStrings(all("certifications")),
  };
}

// Fallback when no API key is set (or Gemini fails): the rule-based parser in
// resumeParser.js, which already returns the same shape the AI parser does.
function fallbackParse(text) {
  return {
    skills: parseSkillsFromText(text),
    education: parseEducationLines(text),
    experience: parseExperienceEntries(text),
    certifications: parseCertifications(text),
  };
}

export async function parseResumeWithAI(text) {
  if (!hasApiKey) {
    return {
      ...fallbackParse(text),
      parsedExperienceYears: parseExperienceYears(text),
      source: "fallback",
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESUME_SCHEMA,
      },
    });

    // Long resumes are processed chunk by chunk (sequentially, to stay under
    // rate limits) instead of being cut off at 15,000 characters.
    const chunks = text.length > SINGLE_CALL_LIMIT ? splitIntoChunks(text) : [text];
    if (chunks.length > 1) {
      console.log(`[aiResumeParser] ${text.length}-char resume split into ${chunks.length} chunks`);
    }
    const results = [];
    for (const chunk of chunks) {
      results.push(await extractChunk(model, chunk));
    }
    const parsed = mergeChunkResults(results);

    return {
      skills: parsed.skills,
      education: parsed.education,
      experience: parsed.experience,
      certifications: parsed.certifications,
      // Match scoring still uses a numeric years figure — derive it with the
      // same heuristic regex rather than asking the model to guess a total.
      parsedExperienceYears: parseExperienceYears(text),
      source: "gemini",
    };
  } catch (err) {
    console.error("[aiResumeParser] Gemini parse failed, using fallback:", err.message);
    return {
      ...fallbackParse(text),
      parsedExperienceYears: parseExperienceYears(text),
      source: "fallback",
    };
  }
}