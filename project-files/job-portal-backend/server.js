import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import matchesRoutes from "./routes/matchesRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Uploaded resume files, so the frontend can open them via "View Resume"
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Route mounting — matches the contract in api.js / README
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/matches", matchesRoutes);
app.use("/api", applicationRoutes); // exposes /api/jobs/:job_id/apply and /api/applications
app.use("/api/interviews", interviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/offers", offerRoutes);

// Fallback 404 for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized error handler (e.g. multer file-type errors)
app.use((err, req, res, next) => {
  console.error("[unhandled error]", err.message);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
});

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[server] HireHub backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[server] failed to start:", err.message);
    process.exit(1);
  }
}

start();