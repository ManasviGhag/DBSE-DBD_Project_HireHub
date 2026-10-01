import { GoogleGenerativeAI } from "@google/generative-ai";
import Conversation from "../models/Conversation.js";

// If no key is set yet, we skip creating a real client and fall back to
// mocked replies below — lets the rest of the backend run/demo without
// needing a Gemini API key yet. Add GEMINI_API_KEY to .env later and
// this switches back to real Gemini calls automatically.
const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
const genAI = hasApiKey ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const MOCK_REPLIES = {
  candidate:
    "(Mock chatbot reply — GEMINI_API_KEY not set yet) Here's some general advice: tailor your resume's " +
    "keywords to the job description, keep it to one page if you're early-career, and follow up on applications " +
    "after about a week. Add your real Gemini API key to .env to get live Gemini-generated answers here.",
  recruiter:
    "(Mock chatbot reply — GEMINI_API_KEY not set yet) Here's some general advice: a clear job posting with " +
    "specific required skills and a realistic experience range gets better-matched applicants, and structured " +
    "interview scorecards make candidate comparisons fairer. Add your real Gemini API key to .env to get live " +
    "Gemini-generated answers here.",
};

const CANDIDATE_SYSTEM_PROMPT = `You are HireHub's assistant, helping a JOB CANDIDATE on a job portal platform.
You answer questions about: job searching, resume writing, interview preparation, career advice,
how to use the platform (applying to jobs, checking application status, uploading a resume),
and general job-market questions.
Keep answers practical, encouraging, and concise. If asked something outside job/career topics,
politely steer the conversation back to job-related help.
You do not have access to this specific candidate's live application data yet — if asked about
the exact status of a specific application, tell them to check their Applications page, and answer
generally otherwise.`;

const RECRUITER_SYSTEM_PROMPT = `You are HireHub's assistant, helping a RECRUITER on a job portal platform.
You answer questions about: writing effective job postings, screening and shortlisting candidates,
structuring interviews, hiring best practices, and general recruiting/HR questions.
Keep answers practical and concise. If asked something outside hiring/recruiting topics,
politely steer the conversation back to job-related help.
You do not have access to this recruiter's live candidate/application data yet — if asked about
specific candidates, tell them to check their Applications or Candidates page, and answer generally otherwise.`;

function getSystemPrompt(role) {
  if (role === "recruiter" || role === "admin") return RECRUITER_SYSTEM_PROMPT;
  return CANDIDATE_SYSTEM_PROMPT;
}

export async function sendMessage(req, res) {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    let conversation = conversationId
      ? await Conversation.findOne({ _id: conversationId, user: req.user.id })
      : null;

    if (!conversation) {
      conversation = await Conversation.create({
        user: req.user.id,
        userRole: req.user.role,
        messages: [],
      });
    }

    let replyText;

    if (hasApiKey) {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: getSystemPrompt(req.user.role),
      });

      // Gemini's chat history uses role "model" instead of "assistant"
      const history = conversation.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      replyText = result.response.text().trim();
    } else {
      const role = req.user.role === "recruiter" || req.user.role === "admin" ? "recruiter" : "candidate";
      replyText = MOCK_REPLIES[role];
    }

    conversation.messages.push({ role: "user", content: message });
    conversation.messages.push({ role: "assistant", content: replyText });
    await conversation.save();

    return res.json({
      conversationId: conversation._id,
      reply: replyText,
    });
  } catch (err) {
    console.error("[chatbot.sendMessage]", err);
    return res.status(500).json({ message: "Chatbot request failed" });
  }
}