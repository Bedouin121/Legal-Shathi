import User from "../models/User.js";
import Template from "../models/Template.js";
import ChatHistory from "../models/ChatHistory.js";
import ActivityLog from "../models/ActivityLog.js";

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

    const generatedDocuments = await ActivityLog.countDocuments({ type: "document_generated" });

    const documentGenAgg = await ActivityLog.aggregate([
      { $match: { type: "document_generated" } },
      { $group: { _id: "$metadata.templateTitle", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]);

    let popularTemplates = [];

    if (documentGenAgg.length > 0) {
      const templateTitles = documentGenAgg.map(d => d._id).filter(Boolean);
      const templates = await Template.find({ title: { $in: templateTitles } })
        .select("title")
        .lean();
      const titleById = new Map(templates.map((t) => [t.title, t.title]));

      popularTemplates = documentGenAgg
        .filter((d) => d._id)
        .map((d) => ({
          name: titleById.get(d._id) || d._id,
          count: d.count,
        }));
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
      date: `${monthNames[(u._id.month ?? 1) - 1] ?? "Unknown"} ${u._id.year}`,
      month: monthNames[(u._id.month ?? 1) - 1] ?? "Unknown",
      year: u._id.year,
      count: u.count,
    }));

    const currentYear = new Date().getFullYear();
    if (apiUsage.length === 0) {
      apiUsage = [
        { date: `Jan ${currentYear}`, month: "Jan", year: currentYear, count: 0 },
        { date: `Feb ${currentYear}`, month: "Feb", year: currentYear, count: 0 },
        { date: `Mar ${currentYear}`, month: "Mar", year: currentYear, count: 0 },
        { date: `Apr ${currentYear}`, month: "Apr", year: currentYear, count: 0 },
        { date: `May ${currentYear}`, month: "May", year: currentYear, count: 0 },
        { date: `Jun ${currentYear}`, month: "Jun", year: currentYear, count: 0 },
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
