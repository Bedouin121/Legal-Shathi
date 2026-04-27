import express from "express";
import rateLimit from "express-rate-limit";
import { getTemplateFields, generateDocument, generateDocumentStream } from "../controllers/documentController.js";
import { analyzeUploadedDocument } from "../controllers/documentAnalysisController.js";
import documentUpload from "../middleware/documentUpload.js";

const router = express.Router();

// Rate limit: 10 document generations per minute
const docLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many document generation requests. Please wait." },
});

// Rate limit: 10 analyses per minute
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many document analysis requests. Please wait." },
});

router.get("/fields/:templateTitle", getTemplateFields);
router.post("/generate", docLimiter, generateDocument);
router.post("/generate/stream", docLimiter, generateDocumentStream);
router.post("/analyze", analyzeLimiter, documentUpload.single("file"), analyzeUploadedDocument);

export default router;
