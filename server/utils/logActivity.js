import ActivityLog from "../models/ActivityLog.js";

/**
 * Fire-and-forget activity logger — never throws, never blocks a response.
 */
export const logActivity = (userId, type, metadata = {}) => {
  if (!userId) return;
  ActivityLog.create({ userId, type, metadata }).catch((err) =>
    console.error("Activity log error:", err.message)
  );
};
