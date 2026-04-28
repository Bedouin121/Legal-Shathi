import express from "express";
import { getAnalytics, getAnalyticsSummary } from "../controllers/analyticsController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, admin, getAnalytics);
router.get("/summary", getAnalyticsSummary);

export default router;
