import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored as bcrypt hash
    role: {
      type: String,
      enum: ["candidate", "recruiter", "admin"],
      required: true,
      default: "candidate",
    },

    // Recruiter-specific (optional fields, harmless for other roles)
    company: { type: String, trim: true },
    industry: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    companyDescription: { type: String, trim: true },

    // Candidate-specific denormalized fields, filled in after resume parsing
    skills: [{ type: String }],
    experienceYears: { type: Number, default: 0 },

    // Candidate-editable profile details (all optional)
    title: { type: String, trim: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    about: { type: String, trim: true },

    // Jobs the candidate has bookmarked, with when they saved each one
    savedJobs: [
      {
        job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
        savedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
