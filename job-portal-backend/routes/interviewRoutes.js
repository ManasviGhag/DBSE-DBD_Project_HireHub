import { Router } from "express";
import {
  scheduleInterview,
  getMyInterviews,
  updateInterview,
  submitFeedback,
} from "../controllers/interviewController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, requireRole("recruiter", "admin"), scheduleInterview);
// Candidates get their own interviews; recruiters get interviews for jobs they posted
router.get("/", requireAuth, requireRole("candidate", "recruiter", "admin"), getMyInterviews);
router.patch("/:id", requireAuth, requireRole("recruiter", "admin"), updateInterview);
router.post("/:id/feedback", requireAuth, requireRole("recruiter", "admin"), submitFeedback);

export default router;
