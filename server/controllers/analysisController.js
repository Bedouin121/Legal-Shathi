import OpenAI from "openai";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// pdf-parse@1.1.1 exports a plain function via module.exports
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";

export const analyzeDocument = async (req, res, next) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { buffer, originalname, mimetype } = req.file;
    let extractedText = "";

    // Extract text based on file type
    if (mimetype === "application/pdf") {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      originalname.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return res.status(400).json({ message: "Unsupported file format. Please upload PDF or DOCX." });
    }

    if (!extractedText || extractedText.trim() === "") {
      return res.status(400).json({ message: "Could not extract text from the document. It might be scanned or empty." });
    }

    // Truncate text if too long to save tokens (approx limit to 15k chars for safety)
    const maxLength = 15000; 
    if (extractedText.length > maxLength) {
      extractedText = extractedText.substring(0, maxLength) + "... [Truncated due to length]";
    }

    const systemPrompt = `You are an expert legal AI assistant specializing in Bangladeshi law. 
    Analyze the following legal document and provide a JSON response with the following structure:
    {
      "riskScore": Number (0-100, where 0 is very safe and 100 is highly risky),
      "riskLevel": String ("Low", "Medium", "High"),
      "missingClauses": Array of Strings (List important clauses that are missing from the document),
      "riskyTerms": Array of Objects { "term": "The exact wording or clause", "reason": "Why it's risky", "suggestion": "How to fix or improve it" },
      "generalSuggestions": Array of Strings (Overall improvements)
    }
    Make sure the response is purely valid JSON without any markdown formatting wrappers. Do not wrap with \`\`\`json.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the document text:\n\n${extractedText}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const analysisResult = JSON.parse(response.choices[0].message.content);

    res.status(200).json(analysisResult);
  } catch (error) {
    console.error("Document analysis error:", error);
    next(error);
  }
};
