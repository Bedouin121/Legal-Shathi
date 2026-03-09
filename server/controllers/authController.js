import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register new user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      favorites: user.favorites,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      favorites: user.favorites,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/profile-picture
export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const cloudinary = (await import("../config/cloudinary.js")).default;
    const streamifier = (await import("streamifier")).default;

    // Delete old profile picture if exists
    if (req.user.profilePicturePublicId) {
      await cloudinary.uploader.destroy(req.user.profilePicturePublicId);
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
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: "Image upload failed" });
        }

        // Update user with new profile picture
        req.user.profilePicture = result.secure_url;
        req.user.profilePicturePublicId = result.public_id;
        await req.user.save();

        res.json({
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          profilePicture: req.user.profilePicture,
          favorites: req.user.favorites,
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete profile picture
// @route   DELETE /api/auth/profile-picture
export const deleteProfilePicture = async (req, res, next) => {
  try {
    if (!req.user.profilePicturePublicId) {
      return res.status(400).json({ message: "No profile picture to delete" });
    }

    const cloudinary = (await import("../config/cloudinary.js")).default;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(req.user.profilePicturePublicId);

    // Update user
    req.user.profilePicture = null;
    req.user.profilePicturePublicId = null;
    await req.user.save();

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profilePicture: null,
      favorites: req.user.favorites,
    });
  } catch (error) {
    next(error);
  }
};
