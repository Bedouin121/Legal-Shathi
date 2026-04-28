import OpenAI from "openai";
import { extractTextFromUpload } from "../utils/documentExtract.js";

// Initialize OpenAI/OpenRouter
let openai = null;
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
    });
  }
  return openai;
};

export const analyzeUploadedDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File is required." });

    // 1. Extract and Clean Text
    const { text, wasTruncated } = await extractTextFromUpload(req.file);
    const documentType = req.body?.documentType || "auto";

    const client = getOpenAI();
    if (!client) {
      return res.status(500).json({ message: "AI Service not configured." });
    }

    // 2. The High-Level Expert Prompt
    const systemPrompt = `
      You are a Senior Legal Counsel with expertise in Bangladesh contract law. 
      Your task is to perform a high-fidelity audit of the provided document text.
      
      CRITICAL INSTRUCTIONS:
      1. Identify missing clauses essential for a ${documentType} agreement.
      2. Flag risky language, especially around liability, indemnity, and termination.
      3. Provide a Risk Score where 0 is perfectly safe and 100 is extremely dangerous.
      4. Output ONLY valid JSON.
    `;

    const userPrompt = `
      Analyze this document (Type: ${documentType}):
      
      Text: "${text}"

      Return this JSON structure:
      {
        "detectedType": "The type of document identified",
        "riskScore": 0-100,
        "riskLevel": "low" | "medium" | "high" | "critical",
        "summary": "One sentence overview of the document safety",
        "missingClauses": [
          { "clause": "Name", "reason": "Why it is dangerous to miss this", "suggestion": "Suggested text or action" }
        ],
        "riskyTerms": [
          { "term": "The exact word/phrase", "severity": "low"|"medium"|"high", "excerpt": "Quote from document", "whyRisky": "Legal implication", "suggestion": "How to rewrite it" }
        ],
        "suggestions": ["Strategic legal advice point 1", "Point 2"]
      }
    `;

    // 3. AI Call
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3, // Keeps it focused and professional
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    // 4. Send the Full AI Response
    res.json({
      ...aiResponse,
      wasTruncated,
      analyzedAt: new Date().toISOString(),
      aiUsed: true
    });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ message: "AI Analysis failed to process the document." });
  }
};