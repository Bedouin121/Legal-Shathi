import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logActivity } from "../utils/logActivity.js";
import { sendEmail } from "../utils/emailService.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const generateOtpCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

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

    logActivity(user._id, "register", { name: user.name });

    // Fire-and-forget: send OTP verification email if email service is configured
    try {
      const otp = generateOtpCode();
      user.otpCode = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendEmail({
        to: user.email,
        subject: "Verify your Legal Shathi account",
        text: `Your Legal Shathi verification code is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your Legal Shathi verification code is:</p><p style="font-size:20px;font-weight:bold;">${otp}</p><p>This code will expire in 10 minutes.</p>`,
      });
    } catch (err) {
      console.warn("[Auth] Failed to send verification OTP email", err?.message);
    }

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

    // Check if email is verified
    if (!user.emailVerified) {
      const otp = generateOtpCode();
      user.otpCode = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      try {
        await sendEmail({
          to: user.email,
          subject: "Your Legal Shathi login verification code",
          text: `Your Legal Shathi login verification code is: ${otp}. It will expire in 10 minutes.`,
          html: `<p>Your Legal Shathi login verification code is:</p><p style="font-size:20px;font-weight:bold;">${otp}</p><p>This code will expire in 10 minutes.</p>`,
        });
      } catch (err) {
        console.warn("[Auth] Failed to send login OTP email", err?.message);
      }

      return res.status(403).json({
        message: "Email not verified. We've sent a verification code to your email.",
        requiresVerification: true,
        email: user.email,
      });
    }

    logActivity(user._id, "login");

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      favorites: user.favorites,
      emailVerified: user.emailVerified,
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

// @desc    Send / resend OTP verification code
// @route   POST /api/auth/send-otp
export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtpCode();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your Legal Shathi verification code",
      text: `Your Legal Shathi verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your Legal Shathi verification code is:</p><p style="font-size:20px;font-weight:bold;">${otp}</p><p>This code will expire in 10 minutes.</p>`,
    });

    res.json({ message: "Verification code sent to your email" });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP code and mark email as verified
// @route   POST /api/auth/verify-otp
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otpCode || !user.otpExpires) {
      return res.status(400).json({ message: "No active verification code. Please request a new one." });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (user.otpCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.emailVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user._id);
    logActivity(user._id, "email_verified");

    res.json({
      message: "Email verified successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      favorites: user.favorites,
      emailVerified: user.emailVerified,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    res.json({ message: "Logged out successfully" });
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

    const base64Data = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64Data}`;

    req.user.profilePicture = dataUri;
    req.user.profilePicturePublicId = null;
    await req.user.save();

    logActivity(req.user._id, "profile_picture_uploaded");

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profilePicture: req.user.profilePicture,
      favorites: req.user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete profile picture
// @route   DELETE /api/auth/profile-picture
export const deleteProfilePicture = async (req, res, next) => {
  try {
    if (!req.user.profilePicture) {
      return res.status(400).json({ message: "No profile picture to delete" });
    }

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
