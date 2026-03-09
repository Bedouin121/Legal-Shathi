import express from "express";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // All favorite routes require auth

router.get("/", getFavorites);
router.post("/:templateId", addFavorite);
router.delete("/:templateId", removeFavorite);

export default router;
