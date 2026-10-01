import { Router } from "express";
import { getAnalytics } from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/analytics", requireAuth, requireRole("admin"), getAnalytics);

export default router;
