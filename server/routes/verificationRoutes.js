import { Router } from "express";
import { verifySignature } from "../controllers/verificationController.js";

const router = Router();

// Route for signature verification from QR code
router.get("/signature/verify/:documentId", verifySignature);

export default router;
