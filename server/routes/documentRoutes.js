import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { getTemplateFields, generateDocument, generateDocumentStream, extractNID } from "../controllers/documentController.js";

const router = express.Router();

// Rate limit: 10 document generations per minute
const docLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many document generation requests. Please wait." },
});

// Configure multer for NID image uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.get("/fields/:templateTitle", getTemplateFields);
router.post("/generate", docLimiter, generateDocument);
router.post("/generate/stream", docLimiter, generateDocumentStream);
router.post("/extract-nid", upload.single("nidImage"), extractNID);

export default router;
