import jwt from "jsonwebtoken";
import LiveChatSession from "../models/LiveChatSession.js";
import User from "../models/User.js";
import { emitToOnlineLawyers, getOnlineLawyerCount, getLiveChatIO } from "../services/liveChatSocket.js";

const createRoomId = () => `live_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const formatSession = (session) => ({
  id: session._id,
  roomId: session.roomId,
  clientName: session.clientName,
  clientEmail: session.clientEmail,
  issueSummary: session.issueSummary,
  status: session.status,
  assignedLawyerId: session.assignedLawyerId,
  assignedLawyerName: session.assignedLawyerName,
  claimedAt: session.claimedAt,
  closedAt: session.closedAt,
  lastMessageAt: session.lastMessageAt,
  createdAt: session.createdAt,
  messages: session.messages,
});

const getUserFromToken = async (authorizationHeader) => {
  if (!authorizationHeader?.startsWith("Bearer ")) return null;
  try {
    const token = authorizationHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select("-password");
  } catch {
    return null;
  }
};

export const createLiveChatRequest = async (req, res, next) => {
  try {
    const { guestId, guestName, issueSummary } = req.body;
    if (!issueSummary || !issueSummary.trim()) {
      return res.status(400).json({ message: "Issue summary is required" });
    }

    const authUser = req.user || (await getUserFromToken(req.headers.authorization));
    const normalizedGuestId = authUser ? null : guestId?.trim();
    if (!authUser && !normalizedGuestId) {
      return res.status(400).json({ message: "Guest ID is required for unauthenticated users" });
    }

    const existingPending = await LiveChatSession.findOne(
      authUser
        ? {
            clientUserId: authUser._id,
            status: { $in: ["pending", "active"] },
          }
        : {
            guestId: normalizedGuestId,
            status: { $in: ["pending", "active"] },
          }
    ).sort({ createdAt: -1 });

    if (existingPending) {
      return res.json({
        session: formatSession(existingPending),
        onlineLawyers: getOnlineLawyerCount(),
      });
    }

    const clientName = authUser?.name || guestName?.trim() || "Guest User";
    const clientEmail = authUser?.email || null;

    const session = await LiveChatSession.create({
      roomId: createRoomId(),
      clientUserId: authUser?._id || null,
      guestId: authUser ? null : normalizedGuestId,
      clientName,
      clientEmail,
      issueSummary: issueSummary.trim(),
      messages: [
        {
          senderType: "system",
          senderName: "Legal Shathi",
          text: "Your request has been sent to available lawyers. The first available lawyer can claim this conversation and assist you here.",
        },
      ],
      lastMessageAt: new Date(),
    });

    emitToOnlineLawyers("live_chat_request_created", {
      session: formatSession(session),
      onlineLawyers: getOnlineLawyerCount(),
    });

    res.status(201).json({
      session: formatSession(session),
      onlineLawyers: getOnlineLawyerCount(),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLiveChatSession = async (req, res, next) => {
  try {
    const guestId = req.query.guestId?.trim();
    const session = await LiveChatSession.findOne(
      req.user
        ? { clientUserId: req.user._id, status: { $in: ["pending", "active"] } }
        : { guestId, status: { $in: ["pending", "active"] } }
    ).sort({ createdAt: -1 });

    if (!session) return res.json({ session: null, onlineLawyers: getOnlineLawyerCount() });
    res.json({ session: formatSession(session), onlineLawyers: getOnlineLawyerCount() });
  } catch (error) {
    next(error);
  }
};

export const getLawyerQueue = async (req, res, next) => {
  try {
    if (!req.user || !["lawyer", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Lawyer access required" });
    }

    const [pending, assigned] = await Promise.all([
      LiveChatSession.find({ status: "pending" }).sort({ createdAt: 1 }).limit(100),
      LiveChatSession.find({
        status: "active",
        assignedLawyerId: req.user._id,
      }).sort({ lastMessageAt: -1 }),
    ]);

    res.json({
      pending: pending.map(formatSession),
      assigned: assigned.map(formatSession),
      onlineLawyers: getOnlineLawyerCount(),
    });
  } catch (error) {
    next(error);
  }
};

export const claimLiveChatSession = async (req, res, next) => {
  try {
    if (!req.user || !["lawyer", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Lawyer access required" });
    }

    const session = await LiveChatSession.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      {
        $set: {
          status: "active",
          assignedLawyerId: req.user._id,
          assignedLawyerName: req.user.name,
          claimedAt: new Date(),
          lastMessageAt: new Date(),
        },
        $push: {
          messages: {
            senderType: "system",
            senderId: req.user._id,
            senderName: "Legal Shathi",
            text: `${req.user.name} has joined the conversation and is ready to help.`,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!session) {
      return res.status(409).json({ message: "This request has already been claimed or is no longer available" });
    }

    emitToOnlineLawyers("live_chat_request_claimed", {
      sessionId: String(session._id),
      assignedLawyerName: req.user.name,
    });
    getLiveChatIO()?.to(session.roomId).emit("live_chat_request_claimed", {
      sessionId: String(session._id),
      assignedLawyerName: req.user.name,
    });

    res.json({ session: formatSession(session) });
  } catch (error) {
    next(error);
  }
};

export const getLiveChatSessionForLawyer = async (req, res, next) => {
  try {
    if (!req.user || !["lawyer", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Lawyer access required" });
    }

    const session = await LiveChatSession.findOne({
      _id: req.params.id,
      $or: [
        { assignedLawyerId: req.user._id },
        { status: "pending" },
      ],
    });

    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ session: formatSession(session) });
  } catch (error) {
    next(error);
  }
};

export const closeLiveChatSession = async (req, res, next) => {
  try {
    const session = await LiveChatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const guestId = req.body?.guestId?.trim();
    const isAssignedLawyer =
      ["lawyer", "admin"].includes(req.user?.role) &&
      session.assignedLawyerId &&
      String(session.assignedLawyerId) === String(req.user._id);
    const isClient =
      req.user && session.clientUserId && String(session.clientUserId) === String(req.user._id);
    const isGuestClient =
      !req.user && guestId && session.guestId && session.guestId === guestId;

    if (!isAssignedLawyer && !isClient && !isGuestClient) {
      return res.status(403).json({ message: "Not authorized for this session" });
    }

    session.status = "closed";
    session.closedAt = new Date();
    session.lastMessageAt = new Date();
    session.messages.push({
      senderType: "system",
      senderId: req.user?._id || null,
      senderName: "Legal Shathi",
      text: "This live consultation has been closed.",
      createdAt: new Date(),
    });
    await session.save();

    const formatted = formatSession(session);
    getLiveChatIO()?.to(session.roomId).emit("live_chat_session_closed", {
      session: formatted,
    });
    emitToOnlineLawyers("live_chat_session_closed", {
      session: formatted,
    });

    res.json({ session: formatted });
  } catch (error) {
    next(error);
  }
};
