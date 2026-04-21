import express from "express";
import { getActivity, exportActivity } from "../controllers/activityController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getActivity);
router.get("/export", protect, exportActivity);

export default router;
