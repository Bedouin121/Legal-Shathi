import express from "express";
import rateLimit from "express-rate-limit";
<<<<<<< Updated upstream
import { getTemplateFields, generateDocument, generateDocumentStream } from "../controllers/documentController.js";
=======
import { getTemplateFields, generateDocument, generateDocumentStream, signDocument, getSigningPage } from "../controllers/documentController.js";
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
router.get("/:documentId/sign/:token", getSigningPage);
router.post("/:documentId/sign", signDocument);
>>>>>>> Stashed changes

export default router;
