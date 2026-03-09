import express from "express";
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/templateController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getTemplates);
router.get("/:id", getTemplate);
router.post("/", protect, admin, createTemplate);
router.put("/:id", protect, admin, updateTemplate);
router.delete("/:id", protect, admin, deleteTemplate);

export default router;
