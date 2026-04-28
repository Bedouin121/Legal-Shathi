import { useMemo, useState } from "react";
import { ArrowLeft, FileText, Loader2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { documentAPI } from "@/services/api";

const DOC_TYPES = [
  { value: "auto", label: "Auto-detect" },
  { value: "nda", label: "NDA / Confidentiality" },
  { value: "employment", label: "Employment" },
  { value: "service_agreement", label: "Service Agreement" },
  { value: "lease", label: "Lease / Rent Agreement" },
  { value: "purchase_sale", label: "Purchase / Sale" },
];

const riskStyles = {
  low: { bg: "rgba(34,197,94,.12)", border: "rgba(34,197,94,.25)", color: "#16a34a" },
  medium: { bg: "rgba(245,158,11,.12)", border: "rgba(245,158,11,.25)", color: "#b45309" },
  high: { bg: "rgba(249,115,22,.12)", border: "rgba(249,115,22,.25)", color: "#c2410c" },
  critical: { bg: "rgba(239,68,68,.12)", border: "rgba(239,68,68,.25)", color: "#dc2626" },
};

const Card = ({ children, style }) => (
  <div
    style={{
      background: "var(--ls-card)",
      border: "1px solid var(--ls-border)",
      borderRadius: "var(--r)",
      boxShadow: "var(--shadow-sm)",
      padding: 22,
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "linear-gradient(135deg,#22c55e,#15803d)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 18px var(--green-glow)",
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: 20, height: 20, color: "#fff" }} />
      </div>
      <div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: "1.25rem" }}>{title}</div>
        {subtitle ? (
          <div style={{ marginTop: 2, fontSize: ".85rem", color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  </div>
);

const Pill = ({ children, tone = "low" }) => {
  const s = riskStyles[tone] || riskStyles.low;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 999,
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        fontWeight: 800,
        fontSize: ".8rem",
        letterSpacing: ".01em",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

const DocumentAnalysis = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const canAnalyze = useMemo(() => Boolean(file) && !loading, [file, loading]);

  const onAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await documentAPI.analyze(file, documentType);
      setResult(data);
    } catch (e) {
      setError(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const onPick = (f) => {
    setError("");
    setResult(null);
    setFile(f || null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ls-text)", overflowX: "hidden", paddingTop: 64 }}>
      <Navbar />

      <section style={{ padding: "72px clamp(16px,5vw,80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(22,163,74,.18)",
              background: "var(--ls-card)",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: ".85rem",
              color: "var(--ls-text)",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back
          </button>

          <div style={{ height: 18 }} />

          <Card>
            <SectionTitle
              icon={ShieldAlert}
              title="AI Document Analysis"
              subtitle="Upload a PDF/DOCX. We'll flag missing clauses, risky terms, and provide a color‑coded risk score."
            />

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 16, alignItems: "end" }} className="grid md:grid-cols-2">
              <div>
                <label style={{ display: "block", fontWeight: 800, fontSize: ".85rem", marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Document (PDF or DOCX)
                </label>
                <div
                  style={{
                    border: "1px dashed rgba(22,163,74,.35)",
                    borderRadius: 16,
                    padding: 14,
                    background: "rgba(34,197,94,.05)",
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => onPick(e.target.files?.[0])}
                    style={{ width: "100%" }}
                  />
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, color: "var(--ls-text2)", fontSize: ".82rem" }}>
                    <FileText style={{ width: 16, height: 16 }} />
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      {file ? `${file.name} (${Math.round(file.size / 1024)} KB)` : "No file selected"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 800, fontSize: ".85rem", marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Document type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 12px",
                    borderRadius: 14,
                    border: "1px solid rgba(0,0,0,.10)",
                    background: "var(--ls-card)",
                    color: "var(--ls-text)",
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    outline: "none",
                  }}
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={onAnalyze}
                  disabled={!canAnalyze}
                  style={{
                    marginTop: 12,
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "none",
                    background: canAnalyze ? "linear-gradient(135deg,#22c55e,#15803d)" : "rgba(34,197,94,.30)",
                    color: "#fff",
                    fontWeight: 900,
                    cursor: canAnalyze ? "pointer" : "not-allowed",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    boxShadow: canAnalyze ? "0 8px 28px var(--green-glow)" : "none",
                  }}
                >
                  {loading ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                      <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} /> Analyzing…
                    </span>
                  ) : (
                    "Analyze Document"
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <div style={{ marginTop: 16, padding: 12, borderRadius: 14, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.08)", color: "#b91c1c", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {error}
              </div>
            ) : null}
          </Card>

          {result ? (
            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "1.25rem" }}>
                      Risk score: {result.riskScore}/100
                    </div>
                    <div style={{ marginTop: 4, color: "var(--ls-text2)", fontSize: ".85rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      Detected type: <b>{String(result.detectedType || "unknown")}</b> {result.aiUsed ? "(AI)" : "(rules)"}
                      {result.wasTruncated ? " • Note: long document truncated for analysis" : ""}
                    </div>
                  </div>
                  <Pill tone={result.riskLevel || "low"}>Risk: {String(result.riskLevel || "low").toUpperCase()}</Pill>
                </div>
              </Card>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="grid md:grid-cols-2">
                <Card>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "1.1rem", marginBottom: 10 }}>
                    Missing clauses ({result.missingClauses?.length || 0})
                  </div>
                  {result.missingClauses?.length ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      {result.missingClauses.slice(0, 10).map((c, idx) => (
                        <div key={`${c.clause}-${idx}`} style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(0,0,0,.08)", background: "rgba(255,255,255,.65)" }}>
                          <div style={{ fontWeight: 900, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{c.clause}</div>
                          <div style={{ marginTop: 6, color: "var(--ls-text2)", fontSize: ".82rem", lineHeight: 1.55, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                            {c.reason}
                          </div>
                          <div style={{ marginTop: 8, fontSize: ".82rem", lineHeight: 1.55, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                            <b>Suggestion:</b> {c.suggestion}
                          </div>
                        </div>
                      ))}
                      {result.missingClauses.length > 10 ? (
                        <div style={{ color: "var(--ls-text2)", fontSize: ".82rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                          Showing first 10 items.
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div style={{ color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      No obvious missing clauses detected.
                    </div>
                  )}
                </Card>

                <Card>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "1.1rem", marginBottom: 10 }}>
                    Risky terms ({result.riskyTerms?.length || 0})
                  </div>
                  {result.riskyTerms?.length ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      {result.riskyTerms.slice(0, 10).map((t, idx) => (
                        <div key={`${t.term}-${idx}`} style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(0,0,0,.08)", background: "rgba(255,255,255,.65)" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ fontWeight: 900, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.term}</div>
                            <Pill tone={t.severity === "high" ? "high" : t.severity === "medium" ? "medium" : "low"}>
                              {String(t.severity || "low").toUpperCase()}
                            </Pill>
                          </div>
                          {t.excerpt ? (
                            <pre
                              style={{
                                marginTop: 10,
                                padding: 10,
                                borderRadius: 12,
                                border: "1px solid rgba(0,0,0,.07)",
                                background: "rgba(0,0,0,.03)",
                                whiteSpace: "pre-wrap",
                                fontSize: ".78rem",
                                lineHeight: 1.55,
                                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                                color: "var(--ls-text)",
                              }}
                            >
                              {t.excerpt}
                            </pre>
                          ) : null}
                          <div style={{ marginTop: 10, color: "var(--ls-text2)", fontSize: ".82rem", lineHeight: 1.55, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                            {t.whyRisky}
                          </div>
                          <div style={{ marginTop: 8, fontSize: ".82rem", lineHeight: 1.55, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                            <b>Suggestion:</b> {t.suggestion}
                          </div>
                        </div>
                      ))}
                      {result.riskyTerms.length > 10 ? (
                        <div style={{ color: "var(--ls-text2)", fontSize: ".82rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                          Showing first 10 items.
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div style={{ color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      No risky wording detected by the current checks.
                    </div>
                  )}
                </Card>
              </div>

              <Card>
                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: "1.1rem", marginBottom: 10 }}>
                  Suggestions
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {(result.suggestions || []).slice(0, 12).map((s, i) => (
                    <li key={i} style={{ lineHeight: 1.6 }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DocumentAnalysis;
