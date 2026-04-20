import express from "express";
import rateLimit from "express-rate-limit";
import { getTemplateFields, generateDocument, generateDocumentStream } from "../controllers/documentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Rate limit: 10 document generations per minute
const docLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many document generation requests. Please wait." },
});

router.get("/fields/:templateTitle", getTemplateFields);
router.post("/generate", protect, docLimiter, generateDocument);
router.post("/generate/stream", protect, docLimiter, generateDocumentStream);

export default router;
