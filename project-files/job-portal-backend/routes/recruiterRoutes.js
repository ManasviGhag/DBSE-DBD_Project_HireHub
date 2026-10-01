import { Router } from "express";
import { getRecruiterStats, getApplicants } from "../controllers/recruiterController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAuth, requireRole("recruiter", "admin"), getRecruiterStats);
router.get("/applicants", requireAuth, requireRole("recruiter", "admin"), getApplicants);

export default router;
