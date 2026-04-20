import express from "express";
import { getAnalyticsSummary } from "../controllers/analyticsController.js";

const router = express.Router();

// In a real production app you'd likely protect this with admin auth,
// but for now we keep it open so the dashboard "just works".
router.get("/summary", getAnalyticsSummary);

export default router;

