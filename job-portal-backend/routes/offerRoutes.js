import { Router } from "express";
import {
  createOffer,
  getOfferForApplication,
  getCandidateOffers,
  resendOffer,
} from "../controllers/offerController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, requireRole("recruiter", "admin"), createOffer);
router.get("/candidate", requireAuth, requireRole("candidate"), getCandidateOffers);
// Candidates see their own; recruiters see offers for jobs they posted
router.get("/application/:applicationId", requireAuth, getOfferForApplication);
router.patch("/:id/resend", requireAuth, requireRole("recruiter", "admin"), resendOffer);

export default router;
