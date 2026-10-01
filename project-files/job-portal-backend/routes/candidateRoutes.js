import { Router } from "express";
import {
  uploadResume,
  deleteResume,
  updateResumeDetails,
  getProfile,
  updateProfile,
  getSavedJobs,
  saveJob,
  unsaveJob,
} from "../controllers/candidateController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { uploadResumeFile } from "../middleware/upload.js";

const router = Router();

router.post(
  "/resume",
  requireAuth,
  requireRole("candidate"),
  uploadResumeFile.single("resume"),
  uploadResume
);
router.delete("/resume", requireAuth, requireRole("candidate"), deleteResume);
router.patch("/resume", requireAuth, requireRole("candidate"), updateResumeDetails);
// Profile read/update is shared with recruiters (for the Recruiter Profile page)
router.get("/profile", requireAuth, requireRole("candidate", "recruiter"), getProfile);
router.put("/profile", requireAuth, requireRole("candidate", "recruiter"), updateProfile);
router.patch("/profile", requireAuth, requireRole("candidate", "recruiter"), updateProfile);

router.get("/saved-jobs", requireAuth, requireRole("candidate"), getSavedJobs);
router.post("/saved-jobs/:job_id", requireAuth, requireRole("candidate"), saveJob);
router.delete("/saved-jobs/:job_id", requireAuth, requireRole("candidate"), unsaveJob);

export default router;
