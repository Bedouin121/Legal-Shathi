import { Router } from "express";
import { handleSignatureWebhook, handleSignatureCallback } from "../controllers/webhookController.js";

const router = Router();

// Webhook endpoint for signature events
router.post("/signature", handleSignatureWebhook);

// Callback endpoint for signature status updates  
router.post("/signature/callback", handleSignatureCallback);

export default router;
