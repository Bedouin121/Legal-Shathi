import express from "express";
import {
  createLiveChatRequest,
  getMyLiveChatSession,
  getLawyerQueue,
  claimLiveChatSession,
  getLiveChatSessionForLawyer,
  closeLiveChatSession,
} from "../controllers/liveChatController.js";
import { optionalAuth, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/request", optionalAuth, createLiveChatRequest);
router.get("/my-session", optionalAuth, getMyLiveChatSession);
router.get("/lawyer/queue", protect, getLawyerQueue);
router.post("/lawyer/sessions/:id/claim", protect, claimLiveChatSession);
router.get("/lawyer/sessions/:id", protect, getLiveChatSessionForLawyer);
router.post("/sessions/:id/close", optionalAuth, closeLiveChatSession);

export default router;
