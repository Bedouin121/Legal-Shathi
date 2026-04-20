import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, admin, getAnalytics);

export default router;
