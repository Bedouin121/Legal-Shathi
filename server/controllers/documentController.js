import OpenAI from "openai";
import Template from "../models/Template.js";
import { logActivity } from "../utils/logActivity.js";

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

const buildUserPrompt = (fields, formData, language) => {
  const details = Object.entries(formData)
    .filter(([, val]) => val && val.trim())
    .map(([key, val]) => {
      const field = fields.find((f) => f.name === key);
      return `${field ? field.label : key}: ${val}`;
    })
    .join("\n");

  const languageInstruction =
    language === "bengali"
      ? "Write the ENTIRE document in Bengali (বাংলা). All text must be in Bengali script."
      : language === "mixed"
      ? "Write Bengali section headers with English body text."
      : "Write the document primarily in English with Bengali terms where legally appropriate.";

  return `Generate a complete, ready-to-use legal document with the following details:\n\n${details}\n\n${languageInstruction}\n\nIMPORTANT: Generate ONLY the document text. Do NOT include any explanations, notes, or markdown formatting. The document should be ready to print on stamp paper. Use proper spacing, numbered clauses, and formal legal language. Include spaces for signatures at the end.`;
};

// @desc    Get form fields for a template
// @route   GET /api/documents/fields/:templateTitle
export const getTemplateFields = async (req, res, next) => {
  try {
    const title = decodeURIComponent(req.params.templateTitle);
    const template = await Template.findOne({ title });

    if (!template || !template.fields.length) {
      return res.status(404).json({ message: "Template configuration not found" });
    }

    res.json({ fields: template.fields, title });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate legal document from template + form data
// @route   POST /api/documents/generate
export const generateDocument = async (req, res, next) => {
  try {
    const { templateTitle, formData, language = "english" } = req.body;

    if (!templateTitle || !formData) {
      return res.status(400).json({ message: "Template title and form data are required" });
    }

    const template = await Template.findOne({ title: templateTitle });
    if (!template || !template.systemPrompt) {
      return res.status(404).json({ message: "Template configuration not found" });
    }

    const userPrompt = buildUserPrompt(template.fields, formData, language);

    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: template.systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 3000,
      temperature: 0.3,
    });

    const document = completion.choices[0].message.content;

    if (req.user) {
      logActivity(req.user._id, "document_generated", { templateTitle, language });
    }

    res.json({
      document,
      templateTitle,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error?.status === 429) {
      return res.status(429).json({ message: "AI is busy. Please try again in a moment." });
    }
    next(error);
  }
};

// @desc    Generate legal document with STREAMING
// @route   POST /api/documents/generate/stream
export const generateDocumentStream = async (req, res) => {
  try {
    const { templateTitle, formData, language = "english" } = req.body;

    if (!templateTitle || !formData) {
      return res.status(400).json({ message: "Template title and form data are required" });
    }

    const template = await Template.findOne({ title: templateTitle });
    if (!template || !template.systemPrompt) {
      return res.status(404).json({ message: "Template configuration not found" });
    }

    const userPrompt = buildUserPrompt(template.fields, formData, language);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const client = getOpenAI();
    const stream = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: template.systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 3000,
      temperature: 0.3,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    if (req.user) {
      logActivity(req.user._id, "document_generated", { templateTitle, language });
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Doc stream error:", error);
    if (!res.headersSent) {
      if (error?.status === 429) {
        return res.status(429).json({ message: "AI is busy. Please try again." });
      }
      return res.status(500).json({ message: "Document generation failed" });
    }
    res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
    res.end();
  }
};
