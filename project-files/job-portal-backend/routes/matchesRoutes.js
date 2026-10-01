import { Router } from "express";
import { getMatches } from "../controllers/candidateController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole("candidate"), getMatches);

export default router;
