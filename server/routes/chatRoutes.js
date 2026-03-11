import express from "express";
import rateLimit from "express-rate-limit";
import {
  sendMessage,
  sendMessageStream,
  getChatHistory,
  getChatSession,
  deleteChatSession,
  guestMessage,
  guestMessageStream,
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Rate limit chat: 20 messages per minute
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: "Too many messages. Please wait a moment." },
});

// Guest chat (no auth, rate-limited)
router.post("/guest", chatLimiter, guestMessage);
router.post("/guest/stream", chatLimiter, guestMessageStream);

// Authenticated chat routes
router.post("/message", protect, chatLimiter, sendMessage);
router.post("/message/stream", protect, chatLimiter, sendMessageStream);
router.get("/history", protect, getChatHistory);
router.get("/history/:id", protect, getChatSession);
router.delete("/history/:id", protect, deleteChatSession);

export default router;
