import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Resume from "../models/Resume.js";

export async function getRecruiterStats(req, res) {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({ job: { $in: jobIds } });

    const countStatus = (apps, status) => apps.filter((a) => a.status === status).length;

    const perJob = jobs.map((job) => {
      const jobApplications = applications.filter(
        (app) => app.job.toString() === job._id.toString()
      );

      return {
        jobId: job._id,
        job, // full job (open or closed) for the recruiter's Jobs page
        applicantsCount: jobApplications.length,
        underReviewCount: countStatus(jobApplications, "under_review"),
        shortlistedCount: countStatus(jobApplications, "shortlisted"),
        interviewsCount: countStatus(jobApplications, "interview"),
        hiresCount: countStatus(jobApplications, "hired"),
      };
    });

    const totals = {
      totalActiveOpenings: jobs.filter((job) => job.status === "open").length,
      totalApplicants: applications.length,
      totalUnderReview: countStatus(applications, "under_review"),
      totalShortlisted: countStatus(applications, "shortlisted"),
      totalInterviews: countStatus(applications, "interview"),
      totalHires: countStatus(applications, "hired"),
    };

    return res.json({ perJob, totals });
  } catch (err) {
    console.error("[getRecruiterStats]", err);
    return res.status(500).json({ message: "Could not load recruiter stats" });
  }
}

// One row per candidate who applied to any of this recruiter's jobs,
// with their applications nested and their most recent resume attached.
export async function getApplicants(req, res) {
  try {
    const filter = {};
    if (req.user.role === "recruiter") {
      const myJobs = await Job.find({ postedBy: req.user.id }).select("_id");
      filter.job = { $in: myJobs.map((j) => j._id) };
    }
    // admin: no filter, sees everything

    const applications = await Application.find(filter)
      .populate("job", "title company location type status")
      .populate("candidate", "name email skills phone location title")
      .sort({ createdAt: -1 });

    const rows = new Map();
    for (const app of applications) {
      if (!app.candidate) continue; // candidate account was deleted
      const id = app.candidate._id.toString();
      if (!rows.has(id)) {
        rows.set(id, {
          candidate: app.candidate,
          latestAppliedAt: app.createdAt, // applications are newest-first
          latestResume: null,
          applications: [],
        });
      }
      rows.get(id).applications.push({
        _id: app._id,
        job: app.job,
        status: app.status,
        matchScore: app.matchScore,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      });
    }

    const resumes = await Resume.find({ candidate: { $in: [...rows.keys()] } })
      .select("candidate fileName filePath createdAt parsedSkills education experience certifications")
      .sort({ createdAt: -1 });
    for (const resume of resumes) {
      const row = rows.get(resume.candidate.toString());
      if (row && !row.latestResume) row.latestResume = resume;
    }

    return res.json({ applicants: [...rows.values()] });
  } catch (err) {
    console.error("[getApplicants]", err);
    return res.status(500).json({ message: "Could not load applicants" });
  }
}
