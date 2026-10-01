import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import User from "../models/User.js";
import { calculateMatchScore } from "../utils/matchScore.js";

export async function applyToJob(req, res) {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ message: "Only candidates can apply to jobs" });
    }

    const { job_id } = req.params;
    const job = await Job.findById(job_id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const existing = await Application.findOne({ job: job_id, candidate: req.user.id });
    if (existing) {
      return res.status(409).json({ message: "You have already applied to this job" });
    }

    const user = await User.findById(req.user.id);
    const latestResume = await Resume.findOne({ candidate: req.user.id }).sort({ createdAt: -1 });
    const matchScore = calculateMatchScore(user.skills, job);

    const application = await Application.create({
      job: job_id,
      candidate: req.user.id,
      resume: latestResume ? latestResume._id : undefined,
      matchScore,
    });

    return res.status(201).json({ application });
  } catch (err) {
    console.error("[applyToJob]", err);
    return res.status(500).json({ message: "Could not submit application" });
  }
}

export async function getApplications(req, res) {
  try {
    let filter = {};

    if (req.user.role === "candidate") {
      filter.candidate = req.user.id;
    } else if (req.user.role === "recruiter") {
      // Recruiters see applications for jobs they posted
      const myJobs = await Job.find({ postedBy: req.user.id }).select("_id");
      filter.job = { $in: myJobs.map((j) => j._id) };
    }
    // admin: no filter, sees everything

    const applications = await Application.find(filter)
      .populate("job", "title company location type")
      .populate("candidate", "name email skills experienceYears")
      .populate("resume", "fileName filePath createdAt")
      .sort({ createdAt: -1 });

    return res.json({ applications });
  } catch (err) {
    console.error("[getApplications]", err);
    return res.status(500).json({ message: "Could not load applications" });
  }
}

// Stages a recruiter can move an application to ("withdrawn" is the candidate's call).
const RECRUITER_SETTABLE_STATUSES = ["applied", "under_review", "shortlisted", "interview", "rejected", "hired"];

export async function updateApplicationStatus(req, res) {
  try {
    const { status } = req.body;
    if (!RECRUITER_SETTABLE_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${RECRUITER_SETTABLE_STATUSES.join(", ")}`,
      });
    }

    const application = await Application.findById(req.params.id).populate("job", "postedBy");
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (req.user.role === "recruiter" && application.job?.postedBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only update applications for jobs you posted" });
    }

    application.status = status;
    await application.save();

    const updated = await Application.findById(application._id)
      .populate("job", "title company location type")
      .populate("candidate", "name email skills")
      .populate("resume", "fileName filePath createdAt");

    return res.json({ application: updated });
  } catch (err) {
    console.error("[updateApplicationStatus]", err);
    return res.status(500).json({ message: "Could not update application status" });
  }
}

export async function withdrawApplication(req, res) {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (application.candidate.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only withdraw your own applications" });
    }

    await application.deleteOne();
    return res.json({ message: "Application withdrawn" });
  } catch (err) {
    console.error("[withdrawApplication]", err);
    return res.status(500).json({ message: "Could not withdraw application" });
  }
}
