import User from "../models/User.js";
import Template from "../models/Template.js";
import ChatHistory from "../models/ChatHistory.js";

// @desc    Get admin analytics (real DB data)
// @route   GET /api/analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalTemplates,
      templatesByCategory,
      popularTemplates,
      usersByMonth,
    ] = await Promise.all([
      User.countDocuments(),

      Template.countDocuments(),

      Template.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      User.aggregate([
        { $unwind: { path: "$favorites", preserveNullAndEmpty: false } },
        { $group: { _id: "$favorites", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "templates",
            localField: "_id",
            foreignField: "_id",
            as: "template",
          },
        },
        { $unwind: "$template" },
        { $project: { _id: 0, name: "$template.title", count: 1 } },
      ]),

      User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 6 },
        {
          $project: {
            _id: 0,
            month: {
              $let: {
                vars: {
                  months: [
                    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                  ],
                },
                in: { $arrayElemAt: ["$$months", "$_id.month"] },
              },
            },
            count: 1,
          },
        },
      ]),
    ]);

    res.json({
      totalUsers,
      totalTemplates,
      templatesByCategory,
      popularTemplates,
      usersByMonth,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get high-level analytics summary for dashboard
// @route   GET /api/analytics/summary
export const getAnalyticsSummary = async (req, res, next) => {
  try {
    const [totalUsers, totalTemplates, chatSessions] = await Promise.all([
      User.countDocuments(),
      Template.countDocuments(),
      ChatHistory.countDocuments(),
    ]);

    const generatedAgg = await ChatHistory.aggregate([
      { $unwind: "$messages" },
      { $match: { "messages.role": "assistant" } },
      { $count: "count" },
    ]);
    const generatedDocuments = generatedAgg[0]?.count || 0;

    const favoritesAgg = await User.aggregate([
      { $unwind: "$favorites" },
      { $group: { _id: "$favorites", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]);

    let popularTemplates = [];

    if (favoritesAgg.length > 0) {
      const templateIds = favoritesAgg.map((f) => f._id);
      const templates = await Template.find({ _id: { $in: templateIds } })
        .select("title")
        .lean();
      const titleById = new Map(templates.map((t) => [String(t._id), t.title]));
      popularTemplates = favoritesAgg
        .map((f) => ({
          name: titleById.get(String(f._id)) || "Unknown Template",
          count: f.count,
        }))
        .filter((t) => t.name !== "Unknown Template");
    }

    if (popularTemplates.length === 0) {
      const fallback = await Template.find({})
        .sort({ isPopular: -1, createdAt: -1 })
        .limit(4)
        .select("title isPopular")
        .lean();
      popularTemplates = fallback.map((t) => ({
        name: t.title,
        count: t.isPopular ? 100 : 40,
      }));
    }

    const usageAgg = await ChatHistory.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let apiUsage = usageAgg.map((u) => ({
      month: monthNames[(u._id.month ?? 1) - 1] ?? "Unknown",
      count: u.count,
    }));

    if (apiUsage.length === 0) {
      apiUsage = [
        { month: "Jan", count: 0 },
        { month: "Feb", count: 0 },
        { month: "Mar", count: 0 },
        { month: "Apr", count: 0 },
        { month: "May", count: 0 },
      ];
    } else if (apiUsage.length > 6) {
      apiUsage = apiUsage.slice(-6);
    }

    const estimatedKb = chatSessions * 10;
    const storageUsed = Number((estimatedKb / (1024 * 1024)).toFixed(2));

    res.json({
      totalUsers,
      generatedDocuments,
      popularTemplates,
      apiUsage,
      storageUsed,
      totalTemplates,
      chatSessions,
    });
  } catch (error) {
    next(error);
  }
};
