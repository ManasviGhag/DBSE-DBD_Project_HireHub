import Job from "../models/Job.js";

export async function getJobs(req, res) {
  try {
    const { q, location, type, category, experience } = req.query;
    const filter = { status: "open" };

    if (q) filter.title = { $regex: q, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (type) filter.type = type;
    if (experience === "fresher") filter.experienceRequired = { $lte: 1 };

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).populate("postedBy", "name company");
    return res.json({ jobs });
  } catch (err) {
    console.error("[getJobs]", err);
    return res.status(500).json({ message: "Could not load jobs" });
  }
}

const EDITABLE_JOB_FIELDS = [
  "title",
  "company",
  "location",
  "type",
  "description",
  "requiredSkills",
  "experienceRequired",
  "salaryRange",
  "status",
];

export async function updateJob(req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (req.user.role === "recruiter" && job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit jobs you posted" });
    }

    for (const field of EDITABLE_JOB_FIELDS) {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    }

    if (!Array.isArray(job.requiredSkills)) job.requiredSkills = [];
    if (!job.title?.trim() || !job.company?.trim() || !job.description?.trim()) {
      return res.status(400).json({ message: "title, company and description are required" });
    }

    await job.save(); // enum validation for type/status happens here
    return res.json({ job });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    console.error("[updateJob]", err);
    return res.status(500).json({ message: "Could not update job" });
  }
}

export async function createJob(req, res) {
  try {
    if (req.user.role !== "recruiter" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only recruiters can post jobs" });
    }

    const { title, company, location, type, description, requiredSkills, experienceRequired, salaryRange } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({ message: "title, company and description are required" });
    }

    const job = await Job.create({
      title,
      company,
      location,
      type,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      experienceRequired: experienceRequired || 0,
      salaryRange,
      postedBy: req.user.id,
    });

    return res.status(201).json({ job });
  } catch (err) {
    console.error("[createJob]", err);
    return res.status(500).json({ message: "Could not create job" });
  }
}
