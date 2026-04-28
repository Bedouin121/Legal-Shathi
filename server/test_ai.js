import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
});

async function test() {
  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: "Output ONLY valid JSON." },
        { role: "user", content: "Test JSON." },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });
    console.log(completion.choices[0].message.content);
  } catch (err) {
    console.error("AI Error:", err.message);
  }
}
test();
