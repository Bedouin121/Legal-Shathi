import OpenAI from "openai";
import ChatHistory from "../models/ChatHistory.js";
import { logActivity } from "../utils/logActivity.js";

const SYSTEM_PROMPT = `You are "AI Shathi", an expert AI legal assistant for the Legal Shathi platform in Bangladesh.
Your role is to help users:
- Understand legal documents and templates
- Choose the right legal template for their needs
- Explain legal terms in simple Bengali or English
- Guide users through legal processes in Bangladesh
- Answer questions about Bangladeshi law (family law, property law, business law, employment law, etc.)

Always be helpful, empathetic, and clear. If a question is outside your legal expertise or requires a licensed lawyer, recommend consulting a professional.
Respond in the same language as the user (Bengali or English). Keep responses concise and actionable.`;

let openai = null;

const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    });
  }
  return openai;
};

// @desc    Send message with STREAMING (guest mode)
// @route   POST /api/chat/guest/stream
export const guestMessageStream = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const client = getOpenAI();
    const stream = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: aiMessages,
      max_tokens: 800,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Stream error:", error);
    if (!res.headersSent) {
      if (error?.status === 429) {
        return res.status(429).json({ message: "AI is busy. Please try again." });
      }
      return res.status(500).json({ message: "AI service error" });
    }
    res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
    res.end();
  }
};

// @desc    Send message with STREAMING (authenticated)
// @route   POST /api/chat/message/stream
export const sendMessageStream = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Find or create chat session
    let chat;
    if (chatId) {
      chat = await ChatHistory.findOne({ _id: chatId, userId: req.user._id });
    }
    if (!chat) {
      chat = await ChatHistory.create({
        userId: req.user._id,
        messages: [],
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
      });
    }

    chat.messages.push({ role: "user", content: message });

    // SESSION MEMORY: Only send the last 10 messages to the AI
    const SESSION_LIMIT = 10;
    const recentMessages = chat.messages.slice(-SESSION_LIMIT);

    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...recentMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Send chatId immediately
    res.write(`data: ${JSON.stringify({ chatId: chat._id })}\n\n`);

    const client = getOpenAI();
    const stream = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: aiMessages,
      max_tokens: 800,
      temperature: 0.7,
      stream: true,
    });

    let fullReply = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullReply += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save AI reply to DB
    chat.messages.push({ role: "assistant", content: fullReply });

    // TRIM: Keep only the last 20 messages (10 user + 10 assistant) to avoid DB bloat
    if (chat.messages.length > 20) {
      chat.messages = chat.messages.slice(-20);
    }

    await chat.save();

    logActivity(req.user._id, "chat_sent", { chatId: chat._id, preview: message.slice(0, 60) });

    res.write(`data: ${JSON.stringify({ done: true, messageCount: chat.messages.length })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Stream error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "AI service error" });
    }
    res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
    res.end();
  }
};


// ============= Non-streaming endpoints (kept as fallback) =============

// @desc    Send message to AI (no streaming)
// @route   POST /api/chat/message
export const sendMessage = async (req, res, next) => {
  try {
    const { message, chatId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    let chat;
    if (chatId) {
      chat = await ChatHistory.findOne({ _id: chatId, userId: req.user._id });
    }
    if (!chat) {
      chat = await ChatHistory.create({
        userId: req.user._id,
        messages: [],
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
      });
    }

    chat.messages.push({ role: "user", content: message });

    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chat.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: aiMessages,
      max_tokens: 800,
      temperature: 0.7,
    });

    const assistantContent = completion.choices[0].message.content;
    chat.messages.push({ role: "assistant", content: assistantContent });
    await chat.save();

    res.json({ chatId: chat._id, reply: assistantContent, title: chat.title });
  } catch (error) {
    if (error?.status === 429) {
      return res.status(429).json({ message: "AI is busy. Please try again." });
    }
    next(error);
  }
};

// @desc    Guest message (no streaming)
// @route   POST /api/chat/guest
export const guestMessage = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: aiMessages,
      max_tokens: 600,
      temperature: 0.7,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    if (error?.status === 429) {
      return res.status(429).json({ message: "AI is busy. Please try again." });
    }
    next(error);
  }
};

// @desc    Get user's chat history
export const getChatHistory = async (req, res, next) => {
  try {
    const chats = await ChatHistory.find({ userId: req.user._id })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(chats);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific chat session
export const getChatSession = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chat session
export const deleteChatSession = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat deleted" });
  } catch (error) {
    next(error);
  }
};
