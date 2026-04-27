import Template from "../models/Template.js";

// @desc    Get all templates (with filtering, search, pagination)
// @route   GET /api/templates
export const getTemplates = async (req, res, next) => {
  try {
    const { category, search, tab, language, page = 1, limit = 8 } = req.query;

    const query = {};

    // Category filter
    if (category && category !== "All Templates") {
      query.category = category;
    }

    // Language filter (EN or BN)
    if (language && language !== "All") {
      query.languages = language; // matches array field containing the value
    }

    // Search filter — title, description, category
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Tab filter
    if (tab === "Popular") {
      query.isPopular = true;
    } else if (tab === "Free") {
      query.isFree = true;
    } else if (tab === "Bengali") {
      query.languages = "BN";
    } else if (tab === "English") {
      query.languages = "EN";
    }

    // Sort: Popular tab → sort by isPopular desc, others → latest
    let sortOption = tab === "Popular"
      ? { isPopular: -1, createdAt: -1 }
      : { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Template.countDocuments(query);
    const templates = await Template.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      templates,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single template
// @route   GET /api/templates/:id
export const getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    next(error);
  }
};

// @desc    Create template (admin only)
// @route   POST /api/templates
export const createTemplate = async (req, res, next) => {
  try {
    const template = await Template.create(req.body);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
};

// @desc    Update template (admin only)
// @route   PUT /api/templates/:id
export const updateTemplate = async (req, res, next) => {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete template (admin only)
// @route   DELETE /api/templates/:id
export const deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json({ message: "Template deleted" });
  } catch (error) {
    next(error);
  }
};
