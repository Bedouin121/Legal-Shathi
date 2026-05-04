import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LAW_CATEGORIES, lawSections } from "@/data/laws";
import { judgments, JUDGMENT_TOPICS } from "@/data/judgments";
import { judgmentAPI } from "@/services/api";

const LAW_MODULES = [
  { icon: "📜", title: "Constitutional Law", tag: "chip-g" },
  { icon: "👔", title: "Labour & Employment", tag: "chip-b" },
  { icon: "🏠", title: "Property & Land", tag: "chip-a" },
  { icon: "💼", title: "Commercial Law", tag: "chip-p" },
  { icon: "👨‍👩‍👧", title: "Family Law", tag: "chip-t" },
  { icon: "⚖️", title: "Criminal Procedure", tag: "chip-r" },
];

const S = {
  chip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px",
    borderRadius: 99, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".02em",
    fontFamily: "'Plus Jakarta Sans',sans-serif" },
  card: { background: "var(--ls-card)", border: "1px solid var(--ls-border)", borderRadius: "var(--r)",
    padding: 28, boxShadow: "var(--shadow-sm)", transition: "box-shadow .25s, transform .25s" },
};

const BOOKMARK_KEY = "legal-shathi.bookmarks.v1";

const norm = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\s+/g, " ")
    .trim();

const escapeHtml = (unsafe) =>
  (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const highlightHtml = (text, query) => {
  const t = escapeHtml(text);
  const q = norm(query);
  if (!q) return t;
  // simple, safe highlight (case-insensitive on normalized query)
  // we apply on original escaped string using a forgiving regex
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return t.replace(re, `<mark style="background: rgba(34,197,94,.22); padding: 0 2px; border-radius: 4px;">$1</mark>`);
};

const LegalResources = () => {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(lawSections[0]?.id || null);
  const [detailQuery, setDetailQuery] = useState("");
  const [lang, setLang] = useState("both"); // en | bn | both
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [judgmentQuery, setJudgmentQuery] = useState("");
  const [judgmentYearFilter, setJudgmentYearFilter] = useState("All");
  const [judgmentTopicFilter, setJudgmentTopicFilter] = useState("All");
  const [selectedJudgmentId, setSelectedJudgmentId] = useState(judgments[0]?.id || null);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [activeTab, setActiveTab] = useState("laws");
  const categoryCounts = useMemo(() => {
    const counts = Object.create(null);
    for (const c of LAW_CATEGORIES) counts[c] = 0;
    for (const s of lawSections) {
      if (s?.category) counts[s.category] = (counts[s.category] || 0) + 1;
    }
    return counts;
  }, []);
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const raw = localStorage.getItem(BOOKMARK_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".sr");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Array.from(bookmarks)));
    } catch {}
  }, [bookmarks]);

  const toggleBookmark = (id) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = norm(query);
    const list = lawSections
      .filter((x) => category === "All" || x.category === category)
      .filter((x) => !onlyBookmarked || bookmarks.has(x.id))
      .filter((x) => {
        if (!q) return true;
        const hay = norm(
          [
            x.code,
            x.category,
            x.titleEn,
            x.titleBn,
            x.summaryEn,
            x.summaryBn,
            x.contentEn,
            x.contentBn,
            ...(x.keywords || []),
          ].join(" ")
        );
        return hay.includes(q);
      });

    return list;
  }, [category, query, onlyBookmarked, bookmarks]);

  const selected = useMemo(() => filtered.find((x) => x.id === selectedId) || lawSections.find((x) => x.id === selectedId) || filtered[0] || lawSections[0] || null, [filtered, selectedId]);

  const judgmentYears = useMemo(
    () => ["All", ...Array.from(new Set(judgments.map((j) => j.year))).sort((a, b) => b - a)],
    []
  );

  const filteredJudgments = useMemo(() => {
    const q = norm(judgmentQuery);
    return judgments
      .filter((j) => judgmentYearFilter === "All" || j.year.toString() === judgmentYearFilter)
      .filter((j) => judgmentTopicFilter === "All" || j.topic === judgmentTopicFilter)
      .filter((j) => {
        if (!q) return true;
        const hay = norm([j.title, j.citation, j.summaryEn, j.summaryBn, j.details, j.topic].join(" "));
        return hay.includes(q);
      });
  }, [judgmentQuery, judgmentYearFilter, judgmentTopicFilter]);

  const selectedJudgment = useMemo(
    () => filteredJudgments.find((x) => x.id === selectedJudgmentId) || judgments.find((x) => x.id === selectedJudgmentId) || filteredJudgments[0] || judgments[0] || null,
    [filteredJudgments, selectedJudgmentId]
  );

  useEffect(() => {
    if (!selected) return;
    // if the selected item is no longer visible (due to filters), select first visible
    const stillVisible = filtered.some((x) => x.id === selected.id);
    if (!stillVisible && filtered[0]) setSelectedId(filtered[0].id);
  }, [filtered, selected]);

  useEffect(() => {
    if (!selectedJudgment) return;
    const stillVisible = filteredJudgments.some((x) => x.id === selectedJudgment.id);
    if (!stillVisible) setSelectedJudgmentId(filteredJudgments[0]?.id || judgments[0]?.id || null);
  }, [filteredJudgments, selectedJudgment]);

  const requestJudgmentSummary = async () => {
    if (!selectedJudgment) return;

    setSummaryLoading(true);
    setSummaryError("");
    setSummary("");

    try {
      const data = await judgmentAPI.summarize(selectedJudgment);
      setSummary(data.reply || data?.message || "No summary returned.");
    } catch (error) {
      setSummaryError(error.message || "Unable to generate summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ls-text)", overflowX: "hidden", paddingTop: 64 }}>
      <Navbar />
      
      <section style={{ padding: "96px clamp(16px,5vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="sr" style={{ textAlign: "center", marginBottom: 32 }}>
            <span className="chip-p" style={S.chip}>Legal Resources</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, margin: "16px 0 12px" }}>
              Explore Bangladesh Law Database
            </h2>
            <p style={{ color: "var(--ls-text2)", maxWidth: 520, margin: "0 auto", fontSize: ".95rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Search across 50+ law sections (English + বাংলা), bookmark important sections, and click to read details.
            </p>
          </div>

          <div className="sr" style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("laws")}
              style={{
                padding: "12px 24px",
                borderRadius: 99,
                border: "none",
                background: activeTab === "laws" ? "linear-gradient(135deg,#22c55e,#15803d)" : "var(--ls-card)",
                color: activeTab === "laws" ? "#fff" : "var(--ls-text)",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                boxShadow: activeTab === "laws" ? "0 4px 14px var(--green-glow)" : "var(--shadow-sm)",
                transition: "all .3s"
              }}
            >
              Bangladesh Laws
            </button>
            <button
              onClick={() => setActiveTab("judgments")}
              style={{
                padding: "12px 24px",
                borderRadius: 99,
                border: "none",
                background: activeTab === "judgments" ? "linear-gradient(135deg,#22c55e,#15803d)" : "var(--ls-card)",
                color: activeTab === "judgments" ? "#fff" : "var(--ls-text)",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                boxShadow: activeTab === "judgments" ? "0 4px 14px var(--green-glow)" : "var(--shadow-sm)",
                transition: "all .3s"
              }}
            >
              Supreme Court Judgments
            </button>
          </div>

          {activeTab === "laws" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }} className="mod-grid">
            {LAW_MODULES.map((m, i) => (
              <div
                key={m.title}
                className={`sr sr-d${Math.min(i + 1, 4)}`}
                style={{
                  ...S.card,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  outline: category === m.title ? "2px solid rgba(34,197,94,.35)" : "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}>
                <button
                  type="button"
                  onClick={() => setCategory((prev) => (prev === m.title ? "All" : m.title))}
                  style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, width: "100%" }}
                  aria-label={`Filter by ${m.title}`}
                >
                <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "var(--ls-text)" }}>{m.title}</div>
                  <span className={m.tag} style={S.chip}>{categoryCounts[m.title] ?? 0} acts</span>
                </div>
                </button>
              </div>
            ))}
          </div>

          {/* Search + Reader */}
          <div className="sr" style={{ marginTop: 28 }}>
            <div
              style={{
                ...S.card,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flex: "1 1 520px" }}>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search laws (English / বাংলা) — e.g. bail, জামিন, contract, চুক্তি…"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: "1px solid var(--ls-border)",
                      background: "var(--ls-card)",
                      color: "var(--ls-text)",
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setOnlyBookmarked((v) => !v)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--ls-border)",
                      background: onlyBookmarked ? "rgba(34,197,94,.12)" : "transparent",
                      color: "var(--ls-text)",
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {onlyBookmarked ? "Bookmarked ✓" : "Bookmarked"}
                  </button>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid var(--ls-border)",
                      background: "transparent",
                      color: "var(--ls-text)",
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <option value="All">All categories</option>
                    {LAW_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) 1fr", gap: 14, marginTop: 14, alignItems: "stretch" }}>
                {/* List */}
                <div
                  style={{
                    border: "1px solid var(--ls-border)",
                    borderRadius: 16,
                    background: "rgba(255,255,255,.03)",
                    overflow: "hidden",
                    minHeight: 420,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid var(--ls-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".9rem" }}>
                      {filtered.length} sections
                    </div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".8rem", color: "var(--ls-text2)" }}>
                      Scroll • Click to read
                    </div>
                  </div>
                  <div style={{ padding: 10, overflowY: "auto", maxHeight: 560 }}>
                    {filtered.length === 0 ? (
                      <div style={{ padding: 12, color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                        No results. Try different keywords (EN/বাংলা) or clear filters.
                      </div>
                    ) : (
                      filtered.map((x) => {
                        const active = selected?.id === x.id;
                        const marked = bookmarks.has(x.id);
                        return (
                          <button
                            key={x.id}
                            type="button"
                            onClick={() => setSelectedId(x.id)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "10px 10px",
                              borderRadius: 14,
                              border: active ? "1px solid rgba(34,197,94,.45)" : "1px solid transparent",
                              background: active ? "rgba(34,197,94,.10)" : "transparent",
                              cursor: "pointer",
                              display: "flex",
                              gap: 10,
                              alignItems: "flex-start",
                              marginBottom: 8,
                            }}
                          >
                            <div style={{ minWidth: 44 }}>
                              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: ".72rem", color: "var(--ls-text2)" }}>
                                {x.code}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleBookmark(x.id);
                                }}
                                aria-label={marked ? "Remove bookmark" : "Add bookmark"}
                                style={{
                                  marginTop: 6,
                                  width: 34,
                                  height: 28,
                                  borderRadius: 10,
                                  border: "1px solid var(--ls-border)",
                                  background: marked ? "rgba(34,197,94,.16)" : "transparent",
                                  cursor: "pointer",
                                  fontSize: ".95rem",
                                }}
                              >
                                {marked ? "★" : "☆"}
                              </button>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: ".92rem", lineHeight: 1.25 }}>
                                {x.titleEn}
                              </div>
                              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".86rem", lineHeight: 1.25, marginTop: 4, color: "var(--ls-text2)" }}>
                                {x.titleBn}
                              </div>
                              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".82rem", marginTop: 6, color: "var(--ls-text2)" }}>
                                {x.summaryEn}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Reader */}
                <div
                  style={{
                    border: "1px solid var(--ls-border)",
                    borderRadius: 16,
                    background: "rgba(255,255,255,.03)",
                    overflow: "hidden",
                    minHeight: 420,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ padding: 12, borderBottom: "1px solid var(--ls-border)", display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: ".95rem" }}>
                        {selected ? selected.titleEn : "Select a law section"}
                      </div>
                      {selected && (
                        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".86rem", color: "var(--ls-text2)", marginTop: 2 }}>
                          {selected.titleBn} • {selected.category} • {selected.code}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        value={detailQuery}
                        onChange={(e) => setDetailQuery(e.target.value)}
                        placeholder="Search inside this law…"
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: "1px solid var(--ls-border)",
                          background: "transparent",
                          color: "var(--ls-text)",
                          fontFamily: "'Plus Jakarta Sans',sans-serif",
                          outline: "none",
                          width: 220,
                        }}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          { id: "both", label: "EN+BN" },
                          { id: "en", label: "EN" },
                          { id: "bn", label: "বাংলা" },
                        ].map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => setLang(o.id)}
                            style={{
                              padding: "10px 10px",
                              borderRadius: 12,
                              border: "1px solid var(--ls-border)",
                              background: lang === o.id ? "rgba(34,197,94,.12)" : "transparent",
                              color: "var(--ls-text)",
                              fontFamily: "'Plus Jakarta Sans',sans-serif",
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                      {selected && (
                        <button
                          type="button"
                          onClick={() => toggleBookmark(selected.id)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: "1px solid var(--ls-border)",
                            background: bookmarks.has(selected.id) ? "rgba(34,197,94,.16)" : "transparent",
                            color: "var(--ls-text)",
                            fontFamily: "'Plus Jakarta Sans',sans-serif",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          {bookmarks.has(selected.id) ? "★ Bookmarked" : "☆ Bookmark"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: 14, overflowY: "auto", maxHeight: 560 }}>
                    {!selected ? (
                      <div style={{ color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                        Pick a section from the list to read it here.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: 12 }}>
                        {(lang === "both" || lang === "en") && (
                          <div style={{ border: "1px solid var(--ls-border)", borderRadius: 14, padding: 14, background: "rgba(0,0,0,.08)" }}>
                            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, marginBottom: 8 }}>English</div>
                            <div
                              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.75, color: "var(--ls-text2)" }}
                              dangerouslySetInnerHTML={{ __html: highlightHtml(selected.contentEn, detailQuery) }}
                            />
                          </div>
                        )}
                        {(lang === "both" || lang === "bn") && (
                          <div style={{ border: "1px solid var(--ls-border)", borderRadius: 14, padding: 14, background: "rgba(0,0,0,.08)" }}>
                            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, marginBottom: 8 }}>বাংলা</div>
                            <div
                              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.9, color: "var(--ls-text2)" }}
                              dangerouslySetInnerHTML={{ __html: highlightHtml(selected.contentBn, detailQuery) }}
                            />
                          </div>
                        )}
                        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".82rem", color: "var(--ls-text2)" }}>
                          Note: These are simplified summaries for accessibility. For official wording, consult the published law text.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {activeTab === "judgments" && (
          <div className="sr" style={{ marginTop: 0 }}>
            <div
              style={{
                ...S.card,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.1rem" }}>
                    Supreme Court Judgment Search
                  </div>
                  <div style={{ color: "var(--ls-text2)", maxWidth: 620, fontSize: ".95rem", marginTop: 6 }}>
                    Search Bangladesh Supreme Court judgments by year or topic, then generate an AI summary in 4–5 bullet points.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 18 }}>
                <input
                  value={judgmentQuery}
                  onChange={(e) => setJudgmentQuery(e.target.value)}
                  placeholder="Search judgments by title, citation, topic, or keywords…"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid var(--ls-border)",
                    background: "var(--ls-card)",
                    color: "var(--ls-text)",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    outline: "none",
                  }}
                />
                <select
                  value={judgmentYearFilter}
                  onChange={(e) => setJudgmentYearFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid var(--ls-border)",
                    background: "transparent",
                    color: "var(--ls-text)",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    fontWeight: 700,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="All">All years</option>
                  {judgmentYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={judgmentTopicFilter}
                  onChange={(e) => setJudgmentTopicFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid var(--ls-border)",
                    background: "transparent",
                    color: "var(--ls-text)",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    fontWeight: 700,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="All">All topics</option>
                  {JUDGMENT_TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) 1fr", gap: 14, alignItems: "stretch" }}>
                <div
                  style={{
                    border: "1px solid var(--ls-border)",
                    borderRadius: 16,
                    background: "rgba(255,255,255,.03)",
                    overflow: "hidden",
                    minHeight: 420,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid var(--ls-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".9rem" }}>
                      {filteredJudgments.length} judgments
                    </div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".8rem", color: "var(--ls-text2)" }}>
                      Filter by year or topic
                    </div>
                  </div>
                  <div style={{ padding: 10, overflowY: "auto", maxHeight: 560 }}>
                    {filteredJudgments.length === 0 ? (
                      <div style={{ padding: 12, color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                        No matching judgments. Try a different keyword, year, or topic.
                      </div>
                    ) : (
                      filteredJudgments.map((j) => {
                        const active = selectedJudgment?.id === j.id;
                        return (
                          <button
                            key={j.id}
                            type="button"
                            onClick={() => setSelectedJudgmentId(j.id)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "12px 12px",
                              borderRadius: 14,
                              border: active ? "1px solid rgba(34,197,94,.45)" : "1px solid transparent",
                              background: active ? "rgba(34,197,94,.10)" : "transparent",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              marginBottom: 10,
                            }}
                          >
                            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: ".92rem" }}>
                              {j.title}
                            </div>
                            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".82rem", color: "var(--ls-text2)" }}>
                              {j.citation} • {j.year} • {j.topic}
                            </div>
                            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".82rem", color: "var(--ls-text2)" }}>
                              {j.summaryEn}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid var(--ls-border)",
                    borderRadius: 16,
                    background: "rgba(255,255,255,.03)",
                    overflow: "hidden",
                    minHeight: 420,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ padding: 12, borderBottom: "1px solid var(--ls-border)", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: ".95rem" }}>
                        {selectedJudgment ? selectedJudgment.title : "Select a judgment"}
                      </div>
                      {selectedJudgment && (
                        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".86rem", color: "var(--ls-text2)", marginTop: 2 }}>
                          {selectedJudgment.citation} • {selectedJudgment.year} • {selectedJudgment.topic}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={requestJudgmentSummary}
                      disabled={!selectedJudgment || summaryLoading}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid var(--ls-border)",
                        background: summaryLoading ? "rgba(34,197,94,.12)" : "rgba(34,197,94,.16)",
                        color: "var(--ls-text)",
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        fontWeight: 900,
                        cursor: summaryLoading ? "default" : "pointer",
                      }}
                    >
                      {summaryLoading ? "Generating summary..." : "Generate AI Summary"}
                    </button>
                  </div>
                  <div style={{ padding: 14, overflowY: "auto", maxHeight: 560, display: "grid", gap: 12 }}>
                    {!selectedJudgment ? (
                      <div style={{ color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                        Pick a case from the list to view details and request an AI judgment summary.
                      </div>
                    ) : (
                      <>
                        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".88rem", lineHeight: 1.7, color: "var(--ls-text2)" }}>
                          {selectedJudgment.details}
                        </div>
                        <div style={{ display: "grid", gap: 10 }}>
                          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900 }}>AI Summary</div>
                          {summaryError && (
                            <div style={{ color: "#f87171", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{summaryError}</div>
                          )}
                          {summary ? (
                            <div style={{ display: "grid", gap: 8 }}>
                              {summary.split(/\r?\n/).filter(Boolean).map((line, idx) => (
                                <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "var(--ls-text2)" }}>
                                  <span style={{ minWidth: 18, color: "var(--ls-text)" }}>•</span>
                                  <span>{line}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                              AI summary appears here after you click the button.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LegalResources;
