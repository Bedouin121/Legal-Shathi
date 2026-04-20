import express from "express";
import { sendSignatureRequest } from "../controllers/notificationController.js";

const router = express.Router();

// In the future you may want to protect this route (e.g. only logged-in users)
router.post("/signature-request", sendSignatureRequest);

export default router;

