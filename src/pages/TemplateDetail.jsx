import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Loader2, Download, Printer, Languages, AlertCircle, Sparkles, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { templateAPI, documentAPI } from "@/services/api";

const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [template, setTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("form"); // "form" | "preview"

  // Load template and fields
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const tmpl = await templateAPI.getOne(id);
        setTemplate(tmpl);

        const fieldData = await documentAPI.getFields(tmpl.title);
        setFields(fieldData.fields);

        // Initialize form with empty values
        const initial = {};
        fieldData.fields.forEach((f) => {
          initial[f.name] = "";
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

    try {
      const result = await documentAPI.generate(template.title, formData, language);
      setGeneratedDoc(result.document);
      setStep("preview");
    } catch (err) {
      setError(err.message || "Failed to generate document");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
      <head>
        <title>${template.title} - Legal Shathi</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; }
          .stamp-page {
            width: 210mm;
            min-height: 297mm;
            background-image: url('/stamp-paper.png');
            background-size: 100% auto;
            background-repeat: no-repeat;
            background-position: top center;
            padding: 200px 60px 80px 60px;
            box-sizing: border-box;
            font-family: 'Times New Roman', Georgia, serif;
          }
          .doc-content {
            font-size: 13px;
            line-height: 1.9;
            color: #1a1a1a;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        </style>
      </head>
      <body>
        <div class="stamp-page">
          <div class="doc-content">${generatedDoc.replace(/\n/g, "<br>")}</div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => step === "preview" ? setStep("form") : navigate("/")}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-semibold text-foreground text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                  {template?.title}
                </h1>
                <span className="text-xs text-muted-foreground">
                  {step === "form" ? "Fill in details" : "Document Preview"}
                </span>
              </div>
            </div>
          </div>

          {step === "preview" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Print on Stamp Paper</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {step === "form" ? (
        /* ======= FORM STEP ======= */
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Template Info Card */}
          <div className="mb-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">{template.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                <div className="flex gap-2 mt-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {template.category}
                  </span>
                  {template.languages.map((lang) => (
                    <span key={lang} className="px-2.5 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1.5">
              <Languages className="h-4 w-4 text-primary" />
              Document Language
            </label>
            <div className="flex gap-2">
              {[
                { value: "english", label: "English" },
                { value: "bengali", label: "বাংলা (Bengali)" },
                { value: "mixed", label: "Mixed" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLanguage(opt.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm border transition-all",
                    language === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {language === opt.value && <Check className="inline h-3.5 w-3.5 mr-1" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerate}>
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
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
                      className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
              <div className="mt-4 flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={generating}
              className="mt-8 w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Document...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Legal Document
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground/60 mt-3">
              AI-generated document. Always verify with a licensed lawyer before legal use.
            </p>
          </form>
        </div>
      ) : (
        /* ======= PREVIEW STEP — STAMP PAPER ======= */
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Action Bar */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setStep("form")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Edit Details
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print on Stamp Paper
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Text
                </button>
              </div>
            </div>

            {/* Stamp Paper Preview */}
            <div
              ref={printRef}
              className="relative mx-auto shadow-2xl shadow-black/40 rounded-lg overflow-hidden"
              style={{
                width: "100%",
                maxWidth: "750px",
                minHeight: "1060px",
                backgroundImage: "url('/stamp-paper.png')",
                backgroundSize: "100% auto",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top center",
                backgroundColor: "#f5f0e1",
              }}
            >
              {/* Document content area - positioned below stamp header */}
              <div
                className="relative"
                style={{
                  paddingTop: "250px",
                  paddingBottom: "60px",
                  paddingLeft: "55px",
                  paddingRight: "55px",
                }}
              >
                <div
                  className="text-[13px] leading-[1.9] text-gray-900 whitespace-pre-wrap break-words"
                  style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
                >
                  {generatedDoc}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground/60">
                This is a demo document generated by AI Shathi. For legal validity, this document must be printed on
                government-issued stamp paper, signed by all parties, and registered at the relevant Sub-Registrar's office.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateDetail;
