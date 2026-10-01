import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";

export async function getAnalytics(req, res) {
  try {
    const [totalCandidates, totalRecruiters, totalJobs, totalApplications, totalInterviews] =
      await Promise.all([
        User.countDocuments({ role: "candidate" }),
        User.countDocuments({ role: "recruiter" }),
        Job.countDocuments(),
        Application.countDocuments(),
        Interview.countDocuments(),
      ]);

    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return res.json({
      totals: {
        candidates: totalCandidates,
        recruiters: totalRecruiters,
        jobs: totalJobs,
        applications: totalApplications,
        interviews: totalInterviews,
      },
      applicationsByStatus,
    });
  } catch (err) {
    console.error("[getAnalytics]", err);
    return res.status(500).json({ message: "Could not load analytics" });
  }
}
