import User from "../models/User.js";
import { logActivity } from "../utils/logActivity.js";

// @desc    Get user's favorites
// @route   GET /api/favorites
export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    res.json(user.favorites);
  } catch (error) {
    next(error);
  }
};

// @desc    Add template to favorites
// @route   POST /api/favorites/:templateId
export const addFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const templateId = req.params.templateId;

    if (user.favorites.includes(templateId)) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    user.favorites.push(templateId);
    await user.save();

    logActivity(req.user._id, "favorite_added", { templateId });

    res.json({ message: "Added to favorites", favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove template from favorites
// @route   DELETE /api/favorites/:templateId
export const removeFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const templateId = req.params.templateId;

    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== templateId
    );
    await user.save();

    logActivity(req.user._id, "favorite_removed", { templateId });

    res.json({ message: "Removed from favorites", favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};
