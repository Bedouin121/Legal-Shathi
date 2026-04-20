import User from "../models/User.js";
import Template from "../models/Template.js";

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
