import ActivityLog from "../models/ActivityLog.js";

// @desc    Get current user's activity timeline
// @route   GET /api/activity
export const getActivity = async (req, res, next) => {
  try {
    const { type, from, to, page = 1, limit = 20 } = req.query;

    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    res.json({
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export activity as CSV or JSON
// @route   GET /api/activity/export
export const exportActivity = async (req, res, next) => {
  try {
    const { type, from, to, format = "json" } = req.query;

    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).lean();

    if (format === "csv") {
      const rows = [
        ["Date", "Type", "Details"],
        ...logs.map((l) => [
          new Date(l.createdAt).toISOString(),
          l.type,
          JSON.stringify(l.metadata || {}),
        ]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=activity.csv");
      return res.send(csv);
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=activity.json");
    res.send(JSON.stringify(logs, null, 2));
  } catch (error) {
    next(error);
  }
};
