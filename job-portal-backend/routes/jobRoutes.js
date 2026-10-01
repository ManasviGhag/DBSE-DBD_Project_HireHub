import { Router } from "express";
import { getJobs, createJob, updateJob } from "../controllers/jobController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", getJobs); // public — job seekers can browse without logging in
router.post("/", requireAuth, createJob);
router.patch("/:id", requireAuth, requireRole("recruiter", "admin"), updateJob);

export default router;
