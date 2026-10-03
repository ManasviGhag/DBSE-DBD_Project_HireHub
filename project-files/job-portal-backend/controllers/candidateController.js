import fs from "fs/promises";
import User from "../models/User.js";
import Resume from "../models/Resume.js";
import Job from "../models/Job.js";
import { extractTextFromResume } from "../utils/resumeParser.js";
import { parseResumeWithAI } from "../utils/aiResumeParser.js";
import { calculateMatchScore } from "../utils/matchScore.js";

export async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file uploaded (field name must be 'resume')" });
    }

    const text = await extractTextFromResume(req.file.path);
    const parsed = await parseResumeWithAI(text);

    // A candidate keeps only one resume: remove any previous ones
    // (database documents and their files on disk) before saving the new one.
    const oldResumes = await Resume.find({ candidate: req.user.id });
    await Resume.deleteMany({ candidate: req.user.id });
    for (const old of oldResumes) {
      try {
        await fs.unlink(old.filePath);
      } catch (unlinkErr) {
        console.warn("[uploadResume] could not delete old file", old.filePath, unlinkErr.code);
      }
    }

    const resume = await Resume.create({
      candidate: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      rawText: text,
      parsedSkills: parsed.skills,
      parsedExperienceYears: parsed.parsedExperienceYears,
      education: parsed.education,
      experience: parsed.experience,
      certifications: parsed.certifications,
    });

    // Keep the candidate's profile in sync with their latest resume —
    // match scoring (getMatches below) reads skills/experienceYears from here.
    await User.findByIdAndUpdate(req.user.id, {
      skills: parsed.skills,
      experienceYears: parsed.parsedExperienceYears,
    });

    return res.status(201).json({
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        parsedSkills: resume.parsedSkills,
        parsedExperienceYears: resume.parsedExperienceYears,
        education: resume.education,
        experience: resume.experience,
        certifications: resume.certifications,
      },
    });
  } catch (err) {
    console.error("[uploadResume]", err);
    return res.status(500).json({ message: "Resume upload/parsing failed" });
  }
}

export async function deleteResume(req, res) {
  try {
    const latestResume = await Resume.findOne({ candidate: req.user.id }).sort({ createdAt: -1 });
    if (!latestResume) {
      return res.status(404).json({ message: "No resume to remove" });
    }

    await latestResume.deleteOne();

    // Remove the uploaded file as well, as uploadResume does for replaced resumes.
    try {
      await fs.unlink(latestResume.filePath);
    } catch (unlinkErr) {
      console.warn("[deleteResume] could not delete file", latestResume.filePath, unlinkErr.code);
    }

    // Reset the profile fields that were populated from the resume,
    // so match scoring falls back to the "no resume" state.
    await User.findByIdAndUpdate(req.user.id, {
      skills: [],
      experienceYears: 0,
    });

    return res.json({ message: "Resume removed" });
  } catch (err) {
    console.error("[deleteResume]", err);
    return res.status(500).json({ message: "Could not remove resume" });
  }
}

// Candidate corrections to the AI-extracted fields of their latest resume.
function cleanStringList(value) {
  const seen = new Set();
  const out = [];
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) continue;
    const key = item.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item.trim());
  }
  return out;
}

function cleanEntries(value, fields) {
  return value
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) =>
      Object.fromEntries(
        fields.map((f) => [f, typeof entry[f] === "string" ? entry[f].trim() : ""])
      )
    )
    .filter((entry) => fields.some((f) => entry[f])); // drop fully blank rows
}

export async function updateResumeDetails(req, res) {
  try {
    const { parsedSkills, education, experience, certifications } = req.body;
    const updates = {};

    for (const [key, value] of Object.entries({ parsedSkills, education, experience, certifications })) {
      if (value !== undefined && !Array.isArray(value)) {
        return res.status(400).json({ message: `${key} must be an array` });
      }
    }

    if (parsedSkills) updates.parsedSkills = cleanStringList(parsedSkills);
    if (certifications) updates.certifications = cleanStringList(certifications);
    if (education) updates.education = cleanEntries(education, ["degree", "institution", "year"]);
    if (experience) {
      updates.experience = cleanEntries(experience, ["title", "company", "duration", "description"]);
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const resume = await Resume.findOne({ candidate: req.user.id }).sort({ createdAt: -1 });
    if (!resume) return res.status(404).json({ message: "Upload a resume first" });

    Object.assign(resume, updates);
    await resume.save();

    // Match scoring reads skills from the User document
    if (updates.parsedSkills) {
      await User.findByIdAndUpdate(req.user.id, { skills: updates.parsedSkills });
    }

    return res.json({ resume });
  } catch (err) {
    console.error("[updateResumeDetails]", err);
    return res.status(500).json({ message: "Could not update resume details" });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const latestResume = await Resume.findOne({ candidate: req.user.id }).sort({ createdAt: -1 });

    return res.json({ profile: user, latestResume });
  } catch (err) {
    console.error("[getProfile]", err);
    return res.status(500).json({ message: "Could not load profile" });
  }
}

const EDITABLE_PROFILE_FIELDS = ["name", "title", "phone", "location", "linkedin", "github", "about"];
const RECRUITER_PROFILE_FIELDS = ["name", "phone", "location", "company", "industry", "companyWebsite", "companyDescription"];

export async function updateProfile(req, res) {
  try {
    const editable = req.user.role === "recruiter" ? RECRUITER_PROFILE_FIELDS : EDITABLE_PROFILE_FIELDS;
    const updates = {};
    for (const field of editable) {
      if (typeof req.body[field] === "string") {
        updates[field] = req.body[field].trim();
      }
    }

    if ("name" in updates && !updates.name) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ profile: user });
  } catch (err) {
    console.error("[updateProfile]", err);
    return res.status(500).json({ message: "Could not update profile" });
  }
}

export async function getSavedJobs(req, res) {
  try {
    const user = await User.findById(req.user.id).populate("savedJobs.job");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Drop entries whose job has since been deleted
    const savedJobs = user.savedJobs
      .filter((entry) => entry.job)
      .sort((a, b) => b.savedAt - a.savedAt);

    return res.json({ savedJobs });
  } catch (err) {
    console.error("[getSavedJobs]", err);
    return res.status(500).json({ message: "Could not load saved jobs" });
  }
}

export async function saveJob(req, res) {
  try {
    const { job_id } = req.params;
    const job = await Job.findById(job_id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only add if not already saved, so the original savedAt is kept
    await User.updateOne(
      { _id: req.user.id, "savedJobs.job": { $ne: job._id } },
      { $push: { savedJobs: { job: job._id, savedAt: new Date() } } }
    );

    return res.status(201).json({ message: "Job saved" });
  } catch (err) {
    console.error("[saveJob]", err);
    return res.status(500).json({ message: "Could not save job" });
  }
}

export async function unsaveJob(req, res) {
  try {
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { savedJobs: { job: req.params.job_id } } }
    );

    return res.json({ message: "Job removed from saved" });
  } catch (err) {
    console.error("[unsaveJob]", err);
    return res.status(500).json({ message: "Could not remove saved job" });
  }
}

export async function getMatches(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const jobs = await Job.find({ status: "open" });

    const scored = jobs
      .map((job) => ({
        job,
        matchScore: calculateMatchScore(user.skills, job),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    return res.json({ matches: scored });
  } catch (err) {
    console.error("[getMatches]", err);
    return res.status(500).json({ message: "Could not calculate matches" });
  }
}