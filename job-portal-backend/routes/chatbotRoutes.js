import { Router } from "express";
import { sendMessage } from "../controllers/chatbotController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/message", requireAuth, sendMessage);

export default router;
