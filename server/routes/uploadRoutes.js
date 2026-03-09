import express from "express";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();

// @desc    Upload profile picture (no auth required)
// @route   POST /api/upload/profile-picture
router.post("/profile-picture", upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    // Upload to Cloudinary with optimization
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "legal-shathi/profile-pictures",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Image upload failed" });
        }

        res.json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
});

// @desc    Delete profile picture (no auth required)
// @route   DELETE /api/upload/profile-picture/:publicId
router.delete("/profile-picture/:publicId", async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    
    await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete image" });
  }
});

export default router;
