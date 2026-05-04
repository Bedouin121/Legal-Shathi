import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Files
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { cn } from "@/lib/utils";
import { templateAPI, documentAPI } from "@/services/api";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const FIRST_PAGE_TOP = 475;
const FOLLOWING_PAGE_TOP = FIRST_PAGE_TOP;
const PAGE_SIDE_PADDING = 120;
const PAGE_BOTTOM_PADDING = 110;
const FIRST_PAGE_PRINT_TOP = "125mm";
const FOLLOWING_PAGE_PRINT_TOP = FIRST_PAGE_PRINT_TOP;
const PRINT_SIDE_PADDING = "32mm";

const paginateText = (text) => {
  if (!text) return [""];
  const pages = [];
  const paragraphs = text.split("\n");
  let currentLines = 0;
  const charsPerLine = 58;
  const maxLinesPerPage = 16;
  let maxLines = maxLinesPerPage;
  let currentPage = "";

  paragraphs.forEach((paragraph) => {
    const lines = Math.max(1, Math.ceil((paragraph.length || 1) / charsPerLine));
    if (currentLines + lines > maxLines && currentPage !== "") {
      pages.push(currentPage);
      currentPage = `${paragraph}\n`;
      currentLines = lines;
      maxLines = maxLinesPerPage;
      return;
    }
    currentPage += `${paragraph}\n`;
    currentLines += lines;
  });
  if (currentPage) pages.push(currentPage);
  return pages.length ? pages : [""];
};

const TemplateBulkDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const previewViewportRef = useRef(null);

  const [templates, setTemplates] = useState([]);
  const [commonFields, setCommonFields] = useState([]);
  const [specificFieldsByTemplate, setSpecificFieldsByTemplate] = useState({});
  const [formData, setFormData] = useState({});
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState({}); // { templateId: text }
  const [error, setError] = useState(null);
  const [step, setStep] = useState("form");
  const [activeSlide, setActiveSlide] = useState(0);
  const [previewWidth, setPreviewWidth] = useState(PAGE_WIDTH);

  useLayoutEffect(() => {
    const updatePreviewWidth = () => {
      const viewport = previewViewportRef.current;
      const raw = viewport ? viewport.clientWidth : window.innerWidth - 32;
      const nextWidth = Math.min(raw, PAGE_WIDTH);
      setPreviewWidth(nextWidth > 0 ? nextWidth : Math.min(window.innerWidth - 32, PAGE_WIDTH));
    };
    updatePreviewWidth();
    window.addEventListener("resize", updatePreviewWidth);
    return () => window.removeEventListener("resize", updatePreviewWidth);
  }, [step, activeSlide]);

  useEffect(() => {
    const idsParam = searchParams.get("ids");
    if (!idsParam) {
      navigate("/templates");
      return;
    }
    const ids = idsParam.split(",");

    const loadTemplates = async () => {
      try {
        const tmpls = await Promise.all(ids.map(id => templateAPI.getOne(id)));
        setTemplates(tmpls);

        const allFieldsData = await Promise.all(tmpls.map(t => documentAPI.getFields(t.title)));
        
        const fieldCounts = {};
        const fieldDetails = {};
        
        allFieldsData.forEach((data, index) => {
          const tmplId = tmpls[index]._id;
          data.fields.forEach(f => {
            if (!fieldCounts[f.name]) {
              fieldCounts[f.name] = 0;
              fieldDetails[f.name] = f;
            }
            fieldCounts[f.name]++;
          });
        });

        const common = [];
        const specific = {};
        tmpls.forEach(t => specific[t._id] = []);

        allFieldsData.forEach((data, index) => {
          const tmpl = tmpls[index];
          data.fields.forEach(f => {
            if (fieldCounts[f.name] > 1) {
              if (!common.find(cf => cf.name === f.name)) {
                common.push(f);
              }
            } else {
              specific[tmpl._id].push(f);
            }
          });
        });

        setCommonFields(common);
        setSpecificFieldsByTemplate(specific);

        const initial = {};
        common.forEach(f => initial[f.name] = "");
        Object.values(specific).forEach(arr => arr.forEach(f => initial[f.name] = ""));
        setFormData(initial);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [searchParams, navigate]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setGeneratedDocs({});
    setStep("preview");
    setActiveSlide(0);

    try {
      const docs = {};
      // Execute sequentially to simulate typing for each, or just await Promise.all for raw text.
      // Since it streams, concurrent streaming to state might be complex. Let's do it concurrently but wait for completion.
      // Wait, documentAPI.generateStream takes a callback.
      const promises = templates.map(async (tmpl) => {
        // Construct template-specific form data
        const templateFormData = {};
        commonFields.forEach(f => templateFormData[f.name] = formData[f.name]);
        specificFieldsByTemplate[tmpl._id].forEach(f => templateFormData[f.name] = formData[f.name]);

        const fullText = await documentAPI.generateStream(tmpl.title, templateFormData, language, (chunk, text) => {
          setGeneratedDocs(prev => ({ ...prev, [tmpl._id]: text }));
        });
        docs[tmpl._id] = fullText;
      });

      await Promise.all(promises);
      setGeneratedDocs(docs);
    } catch (err) {
      setError(err.message || "Failed to generate documents");
      if (Object.keys(generatedDocs).length === 0) setStep("form");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = (templateId) => {
    const printContents = generatedDocs[templateId];
    if (!printContents) return;
    const tmpl = templates.find(t => t._id === templateId);
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const win = window.open("", "_blank");

    win.document.write(`
      <html>
      <head>
        <title>${tmpl.title} - Legal Shathi</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .page { width: 210mm; height: 297mm; position: relative; page-break-after: always; overflow: hidden; }
          .stamp-bg { position: absolute; inset: 0; background-image: url('${baseUrl}/stamp-paper.png'); background-size: 100% 100%; z-index: 0; }
          .content { position: relative; z-index: 1; padding: 0 ${PRINT_SIDE_PADDING} 30mm ${PRINT_SIDE_PADDING}; font-family: 'Times New Roman', Georgia, serif; font-size: 14px; line-height: 1.65; color: #1a1a1a; white-space: pre-wrap; word-wrap: break-word; word-break: break-word; overflow-wrap: anywhere; text-align: justify; }
        </style>
      </head>
      <body>
        ${paginateText(printContents).map((pageText, idx) => `
          <div class="page">
            <div class="stamp-bg"></div>
            <div class="content" style="padding-top: ${idx === 0 ? FIRST_PAGE_PRINT_TOP : FOLLOWING_PAGE_PRINT_TOP}">
              ${pageText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </div>
          </div>
        `).join("")}
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  const handleDownload = async (templateId) => {
    const printContents = generatedDocs[templateId];
    if (!printContents || !printRef.current) return;
    const tmpl = templates.find(t => t._id === templateId);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageNodes = Array.from(printRef.current.children);

    for (const [idx, pageNode] of pageNodes.entries()) {
      const canvas = await html2canvas(pageNode, {
        backgroundColor: "#ffffff",
        scale: Math.min(3, window.devicePixelRatio || 2),
        useCORS: true,
      });
      const imageData = canvas.toDataURL("image/png", 1);
      if (idx > 0) pdf.addPage();
      pdf.addImage(imageData, "PNG", 0, 0, 210, 297);
    }

    pdf.save(`${tmpl.title.replace(/\s+/g, "_")}_Legal_Shathi.pdf`);
  };

  const renderField = (field) => {
    const isTextArea = field.name.includes("scope") || field.name.includes("beneficiaries") || field.name.includes("assets") || field.name.includes("assetDivision") || field.name.includes("settlementDetails");
    
    return (
      <div key={field.name} className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {field.label}
          {field.required && <span className="ml-1 text-destructive">*</span>}
        </label>
        {isTextArea ? (
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
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && templates.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive">{error}</p>
        <button onClick={() => navigate("/templates")} className="text-primary hover:underline">
          Go back to Templates
        </button>
      </div>
    );
  }

  const activeTemplate = templates[activeSlide];
  const activeDocContent = generatedDocs[activeTemplate?._id] || "";
  const pages = paginateText(activeDocContent);
  const previewScale = previewWidth / PAGE_WIDTH;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => (step === "preview" ? setStep("form") : navigate("/templates"))}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <Files className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <h1 className="max-w-[200px] truncate text-sm font-semibold text-foreground sm:max-w-none">
                  Bulk Generation ({templates.length} documents)
                </h1>
                <span className="text-xs text-muted-foreground">
                  {step === "form" ? "Unified Details Form" : generating ? "Generating all..." : "Carousel Preview"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {step === "form" ? (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="mb-6 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold text-foreground">Fill out details once</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We've combined the required fields for your selected documents. Common details are asked once.
            </p>
          </div>

          <div className="mb-6">
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Languages className="h-4 w-4 text-primary" />
              Document Language (Applies to all)
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
            {commonFields.length > 0 && (
              <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <h3 className="mb-4 text-sm font-semibold text-primary flex items-center gap-2">
                  <CheckSquare className="h-4 w-4"/> Common Information
                </h3>
                <div className="space-y-4">
                  {commonFields.map(renderField)}
                </div>
              </div>
            )}

            {templates.map((tmpl) => {
              const specificFields = specificFieldsByTemplate[tmpl._id];
              if (!specificFields || specificFields.length === 0) return null;
              
              return (
                <div key={tmpl._id} className="mb-6 rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground"/> Specific to {tmpl.title}
                  </h3>
                  <div className="space-y-4">
                    {specificFields.map(renderField)}
                  </div>
                </div>
              );
            })}

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
              Generate {templates.length} Documents
            </button>
          </form>
        </div>
      ) : (
        <div className="flex min-h-[calc(100dvh-56px)] flex-col">
          {/* Carousel Header / Controls */}
          <div className="flex flex-col gap-4 border-b border-border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                disabled={activeSlide === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="font-semibold text-foreground">{activeTemplate?.title}</p>
                <p className="text-xs text-muted-foreground">Document {activeSlide + 1} of {templates.length}</p>
              </div>
              <button
                onClick={() => setActiveSlide(prev => Math.min(templates.length - 1, prev + 1))}
                disabled={activeSlide === templates.length - 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {!generating && activeDocContent && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(activeTemplate._id)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Current
                </button>
                <button
                  onClick={() => handleDownload(activeTemplate._id)}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </button>
              </div>
            )}
          </div>

          {/* Carousel Content */}
          <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-4 sm:py-6" style={{ overflowX: "hidden" }}>
            <div style={{ maxWidth: PAGE_WIDTH, margin: "0 auto" }}>
              <div ref={previewViewportRef} style={{ width: "100%", padding: "12px 0 48px", overflowX: "hidden" }}>
                <div
                  ref={printRef}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                    alignItems: "center",
                  }}
                >
                  {pages.map((pageText, idx) => (
                    <div
                      key={`${activeSlide}-${idx}`}
                      className="relative overflow-hidden bg-white shadow-2xl shadow-black/20 transition-all animate-in fade-in zoom-in-95 duration-300"
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
                            fontSize: 14,
                            lineHeight: 1.75,
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
                          {idx === 0 && generating && !activeDocContent ? (
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
                              <span style={{ fontSize: 14 }}>Drafting {activeTemplate?.title}...</span>
                            </div>
                          ) : (
                            <>
                              {pageText}
                              {generating && idx === pages.length - 1 && !docsComplete() && (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function docsComplete() {
    return Object.keys(generatedDocs).length === templates.length && !generating;
  }
};

export default TemplateBulkDetail;
