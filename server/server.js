import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
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
import liveChatRoutes from "./routes/liveChatRoutes.js";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import LiveChatSession from "./models/LiveChatSession.js";
import { setLiveChatIO, markLawyerOnline, markLawyerOffline, emitToOnlineLawyers, getOnlineLawyerCount } from "./services/liveChatSocket.js";

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
app.use("/api/live-chat", liveChatRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: function(origin, callback) {
      if (isLocalOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  }
});

setLiveChatIO(io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const guestId = socket.handshake.auth?.guestId || null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        socket.data.user = {
          _id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    }

    socket.data.guestId = guestId;
    next();
  } catch (error) {
    next();
  }
});

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  if (["lawyer", "admin"].includes(socket.data.user?.role)) {
    markLawyerOnline(socket.data.user, socket.id);
    emitToOnlineLawyers("live_lawyer_presence", { onlineLawyers: getOnlineLawyerCount() });
  }

  socket.on("join_chat", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("register_lawyer_online", () => {
    if (!["lawyer", "admin"].includes(socket.data.user?.role)) return;
    markLawyerOnline(socket.data.user, socket.id);
    emitToOnlineLawyers("live_lawyer_presence", { onlineLawyers: getOnlineLawyerCount() });
  });

  socket.on("unregister_lawyer_online", () => {
    if (!["lawyer", "admin"].includes(socket.data.user?.role)) return;
    markLawyerOffline(socket.data.user._id, socket.id);
    emitToOnlineLawyers("live_lawyer_presence", { onlineLawyers: getOnlineLawyerCount() });
  });

  socket.on("join_live_chat_room", (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
  });

  socket.on("send_live_chat_message", async (payload, ack) => {
    try {
      const { sessionId, text, image } = payload || {};
      if (!sessionId || (!text?.trim() && !image)) {
        ack?.({ ok: false, message: "Message content is required" });
        return;
      }

      const session = await LiveChatSession.findById(sessionId);
      if (!session) {
        ack?.({ ok: false, message: "Session not found" });
        return;
      }

      const user = socket.data.user;
      const guestId = socket.data.guestId;

      let senderType = "client";
      let senderId = null;
      let senderName = "Guest User";
      let authorized = false;

      if (user && ["lawyer", "admin"].includes(user.role)) {
        authorized = session.assignedLawyerId && String(session.assignedLawyerId) === String(user._id);
        senderType = "lawyer";
        senderId = user._id;
        senderName = user.name;
      } else if (user) {
        authorized = session.clientUserId && String(session.clientUserId) === String(user._id);
        senderType = "client";
        senderId = user._id;
        senderName = user.name;
      } else if (guestId) {
        authorized = session.guestId && session.guestId === guestId;
        senderType = "client";
        senderName = session.clientName || "Guest User";
      }

      if (!authorized) {
        ack?.({ ok: false, message: "Not authorized for this session" });
        return;
      }

      const message = {
        senderType,
        senderId,
        senderName,
        text: text?.trim() || "Sent an image",
        image: image || null,
        createdAt: new Date(),
      };

      session.messages.push(message);
      session.lastMessageAt = new Date();
      await session.save();

      const emittedMessage = {
        ...message,
        sessionId: String(session._id),
        roomId: session.roomId,
      };

      io.to(session.roomId).emit("live_chat_message", emittedMessage);
      if (senderType === "client") {
        emitToOnlineLawyers("live_chat_message_alert", {
          sessionId: String(session._id),
          roomId: session.roomId,
          clientName: session.clientName,
          preview: message.text,
          lastMessageAt: session.lastMessageAt,
        });
      }

      ack?.({ ok: true, message: emittedMessage });
    } catch (error) {
      console.error("Live chat send error:", error);
      ack?.({ ok: false, message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
    if (["lawyer", "admin"].includes(socket.data.user?.role)) {
      markLawyerOffline(socket.data.user._id, socket.id);
      emitToOnlineLawyers("live_lawyer_presence", { onlineLawyers: getOnlineLawyerCount() });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`\nLegal Shathi API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Env: ${process.env.NODE_ENV || "development"}\n`);
});
