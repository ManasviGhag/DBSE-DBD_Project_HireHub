import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

const INTERVIEW_STATUSES = ["scheduled", "completed", "cancelled"];

// Loads an interview and checks the recruiter posted its job (admins can act on any).
async function findOwnInterview(req, res) {
  const interview = await Interview.findById(req.params.id).populate("job", "postedBy");
  if (!interview) {
    res.status(404).json({ message: "Interview not found" });
    return null;
  }
  if (req.user.role === "recruiter" && interview.job?.postedBy?.toString() !== req.user.id) {
    res.status(403).json({ message: "You can only manage interviews for jobs you posted" });
    return null;
  }
  return interview;
}

function populateForRecruiter(query) {
  return query
    .populate("job", "title company location type")
    .populate("candidate", "name email")
    .populate("application", "status");
}

export async function scheduleInterview(req, res) {
  try {
    if (req.user.role !== "recruiter" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only recruiters can schedule interviews" });
    }

    const { applicationId, scheduledAt, mode, notes, interviewerName, type, location, meetingLink } = req.body;

    if (!applicationId || !scheduledAt) {
      return res.status(400).json({ message: "applicationId and scheduledAt are required" });
    }

    const application = await Application.findById(applicationId).populate("job", "postedBy");
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (req.user.role === "recruiter" && application.job?.postedBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only schedule interviews for jobs you posted" });
    }

    const interview = await Interview.create({
      application: application._id,
      job: application.job._id,
      candidate: application.candidate,
      scheduledBy: req.user.id,
      scheduledAt,
      mode,
      notes,
      interviewerName,
      type,
      location,
      meetingLink,
    });

    application.status = "interview";
    await application.save();

    return res.status(201).json({ interview });
  } catch (err) {
    console.error("[scheduleInterview]", err);
    return res.status(500).json({ message: "Could not schedule interview" });
  }
}

export async function getMyInterviews(req, res) {
  try {
    if (req.user.role === "candidate") {
      // Candidates see their own interviews, without the recruiter's internal feedback
      const interviews = await Interview.find({ candidate: req.user.id })
        .select("-feedback")
        .populate("job", "title company location type")
        .sort({ scheduledAt: 1 });
      return res.json({ interviews });
    }

    const filter = {};
    if (req.user.role === "recruiter") {
      const myJobs = await Job.find({ postedBy: req.user.id }).select("_id");
      filter.job = { $in: myJobs.map((j) => j._id) };
    }
    // admin: no filter, sees everything

    const interviews = await populateForRecruiter(Interview.find(filter)).sort({ scheduledAt: 1 });
    return res.json({ interviews });
  } catch (err) {
    console.error("[getMyInterviews]", err);
    return res.status(500).json({ message: "Could not load interviews" });
  }
}

// Reschedule (scheduledAt) and/or change status. Cancelling or completing has no
// side effects on the linked application.
export async function updateInterview(req, res) {
  try {
    const interview = await findOwnInterview(req, res);
    if (!interview) return;

    const { scheduledAt, status } = req.body;

    if (scheduledAt === undefined && status === undefined) {
      return res.status(400).json({ message: "Provide scheduledAt and/or status" });
    }

    if (scheduledAt !== undefined) {
      if (Number.isNaN(new Date(scheduledAt).getTime())) {
        return res.status(400).json({ message: "scheduledAt must be a valid date" });
      }
      interview.scheduledAt = scheduledAt;
    }

    if (status !== undefined) {
      if (!INTERVIEW_STATUSES.includes(status)) {
        return res.status(400).json({ message: `status must be one of: ${INTERVIEW_STATUSES.join(", ")}` });
      }
      interview.status = status;
    }

    await interview.save();
    const updated = await populateForRecruiter(Interview.findById(interview._id));
    return res.json({ interview: updated });
  } catch (err) {
    console.error("[updateInterview]", err);
    return res.status(500).json({ message: "Could not update interview" });
  }
}

export async function submitFeedback(req, res) {
  try {
    const interview = await findOwnInterview(req, res);
    if (!interview) return;

    if (interview.status !== "completed") {
      return res.status(400).json({ message: "Mark the interview as completed before adding feedback" });
    }

    const { technicalSkills, communication, problemSolving, comments, recommendation } = req.body;

    for (const [label, value] of [
      ["technicalSkills", technicalSkills],
      ["communication", communication],
      ["problemSolving", problemSolving],
    ]) {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 5) {
        return res.status(400).json({ message: `${label} must be a whole number from 1 to 5` });
      }
    }

    interview.feedback = {
      technicalSkills: Number(technicalSkills),
      communication: Number(communication),
      problemSolving: Number(problemSolving),
      comments: typeof comments === "string" ? comments : "",
      recommendation: typeof recommendation === "string" ? recommendation : "",
    };
    await interview.save();

    const updated = await populateForRecruiter(Interview.findById(interview._id));
    return res.json({ interview: updated });
  } catch (err) {
    console.error("[submitFeedback]", err);
    return res.status(500).json({ message: "Could not save feedback" });
  }
}
