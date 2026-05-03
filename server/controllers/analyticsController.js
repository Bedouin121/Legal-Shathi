import User from "../models/User.js";
import Template from "../models/Template.js";
import ChatHistory from "../models/ChatHistory.js";
<<<<<<< Updated upstream
=======
import ActivityLog from "../models/ActivityLog.js";
>>>>>>> Stashed changes

// @desc    Get high-level analytics summary for dashboard
// @route   GET /api/analytics/summary
export const getAnalyticsSummary = async (req, res, next) => {
  try {
    // Basic counts
    const [totalUsers, totalTemplates, chatSessions] = await Promise.all([
      User.countDocuments(),
      Template.countDocuments(),
      ChatHistory.countDocuments(),
    ]);

<<<<<<< Updated upstream
    // Approximate "generated documents" as total assistant replies across all chats
    const generatedAgg = await ChatHistory.aggregate([
      { $unwind: "$messages" },
      { $match: { "messages.role": "assistant" } },
      { $count: "count" },
    ]);
    const generatedDocuments = generatedAgg[0]?.count || 0;

    // Popular templates based on favorites, with fallback to isPopular flag / recent templates
    const favoritesAgg = await User.aggregate([
      { $unwind: "$favorites" },
      { $group: { _id: "$favorites", count: { $sum: 1 } } },
=======
    // Count actual document generations from ActivityLog
    const generatedDocuments = await ActivityLog.countDocuments({ type: "document_generated" });

    // Popular templates based on actual document generation from ActivityLog
    const documentGenAgg = await ActivityLog.aggregate([
      { $match: { type: "document_generated" } },
      { $group: { _id: "$metadata.templateTitle", count: { $sum: 1 } } },
>>>>>>> Stashed changes
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]);

    let popularTemplates = [];

<<<<<<< Updated upstream
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
=======
    if (documentGenAgg.length > 0) {
      const templateTitles = documentGenAgg.map(d => d._id);
      const templates = await Template.find({ title: { $in: templateTitles } })
        .select("title")
        .lean();
      const titleById = new Map(templates.map((t) => [t.title, t.title]));
      
      popularTemplates = documentGenAgg
        .map((d) => ({
          name: titleById.get(d._id) || d._id,
          count: d.count,
        }));
>>>>>>> Stashed changes
    }

    // Fallback if no favorites data yet
    if (popularTemplates.length === 0) {
      const fallback = await Template.find({})
        .sort({ isPopular: -1, createdAt: -1 })
        .limit(4)
        .select("title isPopular")
        .lean();
      popularTemplates = fallback.map((t) => ({
        name: t.title,
        // Give a simple score so charts look meaningful
        count: t.isPopular ? 100 : 40,
      }));
    }

    // API usage: group chat sessions by month to approximate traffic
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
<<<<<<< Updated upstream
      month: monthNames[(u._id.month ?? 1) - 1] ?? "Unknown",
      count: u.count,
    }));

    // If there is no usage yet, return a simple placeholder series
    if (apiUsage.length === 0) {
      apiUsage = [
        { month: "Jan", count: 0 },
        { month: "Feb", count: 0 },
        { month: "Mar", count: 0 },
        { month: "Apr", count: 0 },
        { month: "May", count: 0 },
=======
      date: `${monthNames[(u._id.month ?? 1) - 1] ?? "Unknown"} ${u._id.year}`,
      month: monthNames[(u._id.month ?? 1) - 1] ?? "Unknown",
      year: u._id.year,
      count: u.count,
    }));

    // If there is no usage yet, return a simple placeholder series with current year
    const currentYear = new Date().getFullYear();
    if (apiUsage.length === 0) {
      apiUsage = [
        { date: `Jan ${currentYear}`, month: "Jan", year: currentYear, count: 0 },
        { date: `Feb ${currentYear}`, month: "Feb", year: currentYear, count: 0 },
        { date: `Mar ${currentYear}`, month: "Mar", year: currentYear, count: 0 },
        { date: `Apr ${currentYear}`, month: "Apr", year: currentYear, count: 0 },
        { date: `May ${currentYear}`, month: "May", year: currentYear, count: 0 },
        { date: `Jun ${currentYear}`, month: "Jun", year: currentYear, count: 0 },
>>>>>>> Stashed changes
      ];
    } else if (apiUsage.length > 6) {
      // Limit to last 6 months to keep the chart readable
      apiUsage = apiUsage.slice(-6);
    }

    // Very rough storage approximation so the card isn't hardcoded
    // Assume each chat session + history = ~10 KB
    const estimatedKb = chatSessions * 10;
    const storageUsed = Number((estimatedKb / (1024 * 1024)).toFixed(2)); // in GB

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

