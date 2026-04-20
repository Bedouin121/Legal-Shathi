import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  uploadProfilePicture,
  deleteProfilePicture,
  sendOtp,
  verifyOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/profile-picture", protect, upload.single("profilePicture"), uploadProfilePicture);
router.delete("/profile-picture", protect, deleteProfilePicture);

export default router;
