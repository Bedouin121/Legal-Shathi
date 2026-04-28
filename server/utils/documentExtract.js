import pdf from "pdf-parse";
import mammoth from "mammoth";

const MAX_CHARS = 30000;

const normalizeText = (t) =>
  (t || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export async function extractTextFromUpload(file) {
  if (!file?.buffer) throw new Error("No file buffer received");

  let raw = "";
  if (file.mimetype === "application/pdf") {
    const out = await pdf(file.buffer);
    raw = out?.text || "";
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const out = await mammoth.extractRawText({ buffer: file.buffer });
    raw = out?.value || "";
  } else {
    throw new Error("Unsupported file type");
  }

  const text = normalizeText(raw);
  const truncated = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
  return { text: truncated, wasTruncated: text.length > MAX_CHARS };
}

