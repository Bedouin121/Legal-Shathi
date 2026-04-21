import express from "express";
import multer from "multer";
import { analyzeDocument } from "../controllers/analysisController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.originalname.endsWith(".docx")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  },
});

// Using protect middleware if we want to force users to login, 
// but for now let's leave it open or use optional auth if needed.
// Let's make it accessible for anyone (or we can add `protect` if required by requirements, but let's leave it open to be consistent with some other parts).
router.post("/", upload.single("document"), analyzeDocument);

export default router;
