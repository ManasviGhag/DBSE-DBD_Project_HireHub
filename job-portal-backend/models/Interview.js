import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    mode: { type: String, enum: ["online", "in-person", "phone"], default: "online" },
    notes: { type: String },
    // Optional details shown to the candidate when present
    interviewerName: { type: String, trim: true },
    type: { type: String, trim: true }, // e.g. "Technical", "HR", "Screening"
    location: { type: String, trim: true }, // for in-person interviews
    meetingLink: { type: String, trim: true }, // for online interviews

    // Recruiter's assessment once the interview is completed (not shown to candidates)
    feedback: {
      technicalSkills: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      problemSolving: { type: Number, min: 1, max: 5 },
      comments: { type: String, trim: true },
      recommendation: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
