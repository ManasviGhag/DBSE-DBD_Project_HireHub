import mongoose from "mongoose";

const educationEntrySchema = new mongoose.Schema(
  {
    degree: { type: String, default: "" },
    institution: { type: String, default: "" },
    year: { type: String, default: "" },
  },
  { _id: false }
);

const experienceEntrySchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    company: { type: String, default: "" },
    duration: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    rawText: { type: String }, // full extracted text

    // Used for match scoring — kept as-is for backward compatibility
    parsedSkills: [{ type: String }],
    parsedExperienceYears: { type: Number, default: 0 },

    // Structured AI-extracted fields
    education: [educationEntrySchema],
    experience: [experienceEntrySchema],
    certifications: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);