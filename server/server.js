import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security headers
app.use(helmet());

const configuredClientUrl = process.env.CLIENT_URL || "http://localhost:8080";
const allowedOrigins = new Set([
  configuredClientUrl,
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
]);

// CORS - allow local frontend variants
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Legal Shathi API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\nLegal Shathi API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Env: ${process.env.NODE_ENV || "development"}\n`);
});
