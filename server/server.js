import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(helmet());

const configuredClientUrl = process.env.CLIENT_URL || "http://localhost:8080";

const isLocalOrigin = (origin) => {
  if (!origin) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true;
  } catch (_) {}
  return origin === configuredClientUrl;
};

app.use(
  cors({
    origin(origin, callback) {
      if (isLocalOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Legal Shathi API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\nLegal Shathi API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Env: ${process.env.NODE_ENV || "development"}\n`);
});
