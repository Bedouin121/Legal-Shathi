import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Download,
  Printer,
  Languages,
  AlertCircle,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { templateAPI, documentAPI } from "@/services/api";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const FIRST_PAGE_TOP = 385;       // clears header + "একশত টাকা" row
const FOLLOWING_PAGE_TOP = 130;
const PAGE_SIDE_PADDING = 165;    // decorative border ≈111px + 54px breathing room
const PAGE_BOTTOM_PADDING = 110;

// Content area: 794 - 165*2 = 464px wide; ~8.5px/char at 15px → ~54 chars/line
// First page content height: 1123 - 385 - 110 = 628px; 15px*1.9lh=28.5px/line → ~22 lines
// Following pages: 1123 - 130 - 110 = 883px → ~31 lines
const paginateText = (text) => {
  if (!text) return [""];

  const pages = [];
  const paragraphs = text.split("\n");
  let currentLines = 0;
  const charsPerLine = 54;
  let maxLines = 21;
  let currentPage = "";

  paragraphs.forEach((paragraph) => {
    const lines = Math.max(1, Math.ceil((paragraph.length || 1) / charsPerLine));

    if (currentLines + lines > maxLines && currentPage !== "") {
      pages.push(currentPage);
      currentPage = `${paragraph}\n`;
      currentLines = lines;
      maxLines = 30;
      return;
    }

    currentPage += `${paragraph}\n`;
    currentLines += lines;
  });

  if (currentPage) pages.push(currentPage);
  return pages.length ? pages : [""];
};

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const previewViewportRef = useRef(null);

  const [template, setTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState("");
  const [error, setError] = useState(null);
  const [step, setStep] = useState("form");
  const [previewWidth, setPreviewWidth] = useState(() =>
    typeof window !== "undefined"
      ? Math.min(window.innerWidth - 32, PAGE_WIDTH)
      : PAGE_WIDTH
  );

  useLayoutEffect(() => {
    const updatePreviewWidth = () => {
      const viewport = previewViewportRef.current;
      const raw = viewport ? viewport.clientWidth : window.innerWidth - 32;
      const nextWidth = Math.min(raw, PAGE_WIDTH);
      setPreviewWidth(nextWidth > 0 ? nextWidth : Math.min(window.innerWidth - 32, PAGE_WIDTH));
    };

    updatePreviewWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updatePreviewWidth);
      return () => window.removeEventListener("resize", updatePreviewWidth);
    }

    const observer = new ResizeObserver(updatePreviewWidth);
    if (previewViewportRef.current) observer.observe(previewViewportRef.current);
    window.addEventListener("resize", updatePreviewWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePreviewWidth);
    };
  }, []);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const tmpl = await templateAPI.getOne(id);
        setTemplate(tmpl);

        const fieldData = await documentAPI.getFields(tmpl.title);
        setFields(fieldData.fields);

        const initial = {};
        fieldData.fields.forEach((field) => {
          initial[field.name] = "";
        });
        setFormData(initial);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [id]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setGeneratedDoc("");
    setStep("preview");

    try {
      await documentAPI.generateStream(template.title, formData, language, (chunk, fullText) => {
        setGeneratedDoc(fullText);
      });
    } catch (err) {
      setError(err.message || "Failed to generate document");
      if (!generatedDoc) setStep("form");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printContents = generatedDoc;
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const win = window.open("", "_blank");

    win.document.write(`
      <html>
      <head>
        <title>${template.title} - Legal Shathi</title>
        <style>
          @page { size: A4; margin: 0; }
          body {
            margin: 0;
            padding: 0;
            background: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .page {
            width: 210mm;
            height: 297mm;
            position: relative;
            page-break-after: always;
            overflow: hidden;
          }
          .stamp-bg {
            position: absolute;
            inset: 0;
            background-image: url('${baseUrl}/stamp-paper.png');
            background-size: 100% 100%;
            z-index: 0;
          }
          .content {
            position: relative;
            z-index: 1;
            padding: 0 40mm 30mm 40mm;
            font-family: 'Times New Roman', Georgia, serif;
            font-size: 15px;
            line-height: 1.7;
            color: #1a1a1a;
            white-space: pre-wrap;
            word-wrap: break-word;
            text-align: left;
          }
        </style>
      </head>
      <body>
        ${paginateText(printContents)
          .map(
            (pageText, idx) => `
          <div class="page">
            <div class="stamp-bg"></div>
            <div class="content" style="padding-top: ${idx === 0 ? "95mm" : "30mm"}">
              ${pageText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </div>
          </div>
        `
          )
          .join("")}
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDoc], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.title.replace(/\s+/g, "_")}_Legal_Shathi.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pages = paginateText(generatedDoc);
  const previewScale = previewWidth / PAGE_WIDTH;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive">{error}</p>
        <button onClick={() => navigate("/")} className="text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => (step === "preview" ? setStep("form") : navigate("/"))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <h1 className="max-w-[200px] truncate text-sm font-semibold text-foreground sm:max-w-none">
                  {template?.title}
                </h1>
                <span className="text-xs text-muted-foreground">
                  {step === "form" ? "Fill in details" : generating ? "Generating..." : "Document Preview"}
                </span>
              </div>
            </div>
          </div>

          {step === "preview" && !generating && generatedDoc && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {step === "form" ? (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="mb-6 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold text-foreground">{template.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
          </div>

          <div className="mb-6">
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Languages className="h-4 w-4 text-primary" />
              Document Language
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "english", label: "English" },
                { value: "bengali", label: "Bangla (Bengali)" },
                { value: "mixed", label: "Mixed" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLanguage(opt.value)}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm transition-all",
                    language === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {language === opt.value && <Check className="mr-1 inline h-3.5 w-3.5" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerate}>
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {field.label}
                    {field.required && <span className="ml-1 text-destructive">*</span>}
                  </label>
                  {field.name.includes("scope") ||
                  field.name.includes("beneficiaries") ||
                  field.name.includes("assets") ||
                  field.name.includes("assetDivision") ||
                  field.name.includes("settlementDetails") ? (
                    <textarea
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={`Enter ${field.label.split("(")[0].trim().toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                      className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={`Enter ${field.label.split("(")[0].trim().toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={generating}
              className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              Generate Legal Document
            </button>

            <p className="mt-3 text-center text-xs text-muted-foreground/60">
              AI-generated document. Always verify with a licensed lawyer.
            </p>
          </form>
        </div>
      ) : (
        <div className="px-4 py-6" style={{ overflowX: "hidden" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setStep("form")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Edit Details
              </button>

              {!generating && generatedDoc && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              )}
            </div>

            <div ref={previewViewportRef} style={{ width: "100%", padding: "20px 0 60px", overflowX: "hidden" }}>
              <div
                ref={printRef}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                  alignItems: "flex-start",
                }}
              >
                {pages.map((pageText, idx) => (
                  <div
                    key={idx}
                    className="relative overflow-hidden bg-white shadow-2xl shadow-black/20"
                    style={{
                      width: previewWidth,
                      aspectRatio: `${PAGE_WIDTH} / ${PAGE_HEIGHT}`,
                      borderRadius: previewScale < 0.8 ? 12 : 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: PAGE_WIDTH,
                        height: PAGE_HEIGHT,
                        transform: `scale(${previewScale})`,
                        transformOrigin: "top left",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundImage: "url('/stamp-paper.png')",
                          backgroundSize: "100% 100%",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          zIndex: 1,
                          top: idx === 0 ? FIRST_PAGE_TOP : FOLLOWING_PAGE_TOP,
                          left: PAGE_SIDE_PADDING,
                          right: PAGE_SIDE_PADDING,
                          bottom: PAGE_BOTTOM_PADDING,
                          overflow: "hidden",
                          fontFamily: "'Times New Roman', Georgia, 'Noto Serif', serif",
                          fontSize: 15,
                          lineHeight: 1.9,
                          letterSpacing: "0.015em",
                          color: "#1a0e05",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          textAlign: "justify",
                          textRendering: "optimizeLegibility",
                          hyphens: "auto",
                        }}
                      >
                        {idx === 0 && generating && !generatedDoc ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
                              gap: 12,
                              color: "#6b7280",
                            }}
                          >
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span style={{ fontSize: 14 }}>Drafting your legal document...</span>
                          </div>
                        ) : (
                          <>
                            {pageText}
                            {generating && idx === pages.length - 1 && (
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 8,
                                  height: 16,
                                  marginLeft: 2,
                                  verticalAlign: "text-bottom",
                                  background: "#374151",
                                  animation: "pulse 1s ease-in-out infinite",
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground/60">
              Demo document generated by AI Shathi. For legal validity, print on government-issued stamp paper and register at the Sub-Registrar&apos;s office.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateDetail;
