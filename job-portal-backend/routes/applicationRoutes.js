import { Router } from "express";
import {
  applyToJob,
  getApplications,
  updateApplicationStatus,
  withdrawApplication,
} from "../controllers/applicationController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Note: mounted at /api so the final path matches /api/jobs/:job_id/apply
router.post("/jobs/:job_id/apply", requireAuth, applyToJob);
router.get("/applications", requireAuth, getApplications);
router.patch("/applications/:id/status", requireAuth, requireRole("recruiter", "admin"), updateApplicationStatus);
router.delete("/applications/:id", requireAuth, requireRole("candidate"), withdrawApplication);

export default router;
