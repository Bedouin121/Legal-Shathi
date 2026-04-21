import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, Filter, Loader2, AlertCircle,
  MessageSquare, FileText, Star, StarOff, LogIn, UserPlus, ImagePlus,
} from "lucide-react";
import { activityAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const TYPE_CONFIG = {
  login:                    { label: "Signed In",               icon: LogIn,       color: "#6366f1" },
  register:                 { label: "Created Account",         icon: UserPlus,    color: "#22c55e" },
  document_generated:       { label: "Generated Document",      icon: FileText,    color: "#3b82f6" },
  chat_sent:                { label: "Sent Chat Message",       icon: MessageSquare, color: "#f59e0b" },
  template_viewed:          { label: "Viewed Template",         icon: FileText,    color: "#8b5cf6" },
  favorite_added:           { label: "Added to Favorites",      icon: Star,        color: "#f59e0b" },
  favorite_removed:         { label: "Removed from Favorites",  icon: StarOff,     color: "#ef4444" },
  profile_picture_uploaded: { label: "Updated Profile Picture", icon: ImagePlus,   color: "#10b981" },
};

const ALL_TYPES = Object.keys(TYPE_CONFIG);

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" });
};

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" });
};

const getDateKey = (iso) => new Date(iso).toDateString();

const buildDescription = (log) => {
  const m = log.metadata || {};
  switch (log.type) {
    case "document_generated":
      return `"${m.templateTitle || "Document"}" in ${m.language || "english"}`;
    case "chat_sent":
      return m.preview ? `"${m.preview}${m.preview.length >= 60 ? "…" : ""}"` : "Legal question";
    case "favorite_added":
    case "favorite_removed":
      return m.templateId ? `Template ID: ${m.templateId}` : "";
    case "register":
      return m.name ? `Welcome, ${m.name}!` : "";
    default:
      return "";
  }
};

const ActivityTimeline = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async (pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pg, limit: 20 };
      if (filterType) params.type = filterType;
      if (filterFrom) params.from = filterFrom;
      if (filterTo) params.to = filterTo;
      const data = await activityAPI.get(params);
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(pg);
    } catch (err) {
      setError(err.message || "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterFrom, filterTo]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchLogs(1);
  }, [user, fetchLogs]);

  const handleExport = (format) => {
    const params = { format };
    if (filterType) params.type = filterType;
    if (filterFrom) params.from = filterFrom;
    if (filterTo) params.to = filterTo;
    const token = localStorage.getItem("token");
    const url = activityAPI.exportUrl(params);
    // Trigger download with auth header via a fetch + blob
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `activity.${format}`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  };

  // Group logs by date
  const grouped = logs.reduce((acc, log) => {
    const key = getDateKey(log.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ls-text)" }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "var(--ls-card)", borderBottom: "1px solid var(--ls-border)",
        backdropFilter: "blur(20px)",
        padding: "0 clamp(16px,4vw,48px)", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/")}
            style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--ls-border)",
              background: "transparent", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: "var(--ls-text2)" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1rem", margin: 0 }}>
              Activity Timeline
            </h1>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".75rem",
              color: "var(--ls-text2)", margin: 0 }}>
              {total} total events
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowFilters((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              borderRadius: 10, border: "1px solid var(--ls-border)",
              background: showFilters ? "var(--g50)" : "transparent",
              color: showFilters ? "var(--green)" : "var(--ls-text2)",
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
              fontSize: ".8rem", cursor: "pointer" }}
          >
            <Filter size={14} /> Filters
          </button>
          <div style={{ position: "relative" }}>
            <button
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                borderRadius: 10, border: "1px solid var(--ls-border)",
                background: "transparent", color: "var(--ls-text2)",
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
                fontSize: ".8rem", cursor: "pointer" }}
              onClick={() => document.getElementById("export-menu").classList.toggle("hidden")}
            >
              <Download size={14} /> Export
            </button>
            <div id="export-menu" className="hidden" style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)",
              background: "var(--ls-card)", border: "1px solid var(--ls-border)",
              borderRadius: 12, overflow: "hidden", zIndex: 10, minWidth: 120,
              boxShadow: "0 8px 24px rgba(0,0,0,.12)",
            }}>
              {["csv", "json"].map((fmt) => (
                <button key={fmt} onClick={() => { handleExport(fmt); document.getElementById("export-menu").classList.add("hidden"); }}
                  style={{ display: "block", width: "100%", padding: "10px 16px", border: "none",
                    background: "transparent", textAlign: "left", cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
                    fontSize: ".85rem", color: "var(--ls-text)",
                    textTransform: "uppercase" }}
                  onMouseEnter={e => e.target.style.background = "var(--g50)"}
                  onMouseLeave={e => e.target.style.background = "transparent"}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px clamp(16px,4vw,32px) 60px" }}>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{ background: "var(--ls-card)", border: "1px solid var(--ls-border)",
            borderRadius: 16, padding: 20, marginBottom: 24,
            display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 180px" }}>
              <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans',sans-serif",
                fontWeight: 700, fontSize: ".78rem", color: "var(--ls-text2)", marginBottom: 6 }}>
                Activity Type
              </label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10,
                  border: "1px solid var(--ls-border)", background: "var(--bg)",
                  color: "var(--ls-text)", fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontWeight: 600, fontSize: ".85rem", cursor: "pointer" }}>
                <option value="">All types</option>
                {ALL_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans',sans-serif",
                fontWeight: 700, fontSize: ".78rem", color: "var(--ls-text2)", marginBottom: 6 }}>
                From
              </label>
              <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10,
                  border: "1px solid var(--ls-border)", background: "var(--bg)",
                  color: "var(--ls-text)", fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontSize: ".85rem" }} />
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans',sans-serif",
                fontWeight: 700, fontSize: ".78rem", color: "var(--ls-text2)", marginBottom: 6 }}>
                To
              </label>
              <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10,
                  border: "1px solid var(--ls-border)", background: "var(--bg)",
                  color: "var(--ls-text)", fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontSize: ".85rem" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => fetchLogs(1)}
                style={{ padding: "9px 18px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg,#22c55e,#15803d)", color: "#fff",
                  fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
                  fontSize: ".85rem", cursor: "pointer" }}>
                Apply
              </button>
              <button onClick={() => { setFilterType(""); setFilterFrom(""); setFilterTo(""); }}
                style={{ padding: "9px 14px", borderRadius: 10,
                  border: "1px solid var(--ls-border)", background: "transparent",
                  color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontWeight: 700, fontSize: ".85rem", cursor: "pointer" }}>
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "var(--green)" }} />
          </div>
        ) : error ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 24px",
            borderRadius: 14, border: "1px solid rgba(239,68,68,.2)",
            background: "rgba(239,68,68,.08)", color: "#ef4444",
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".9rem" }}>
            <AlertCircle size={18} /> {error}
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ls-text2)",
            fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>No activity yet</p>
            <p style={{ fontSize: ".875rem", marginTop: 6 }}>
              Start using the app — your actions will appear here.
            </p>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([dateKey, entries]) => (
              <div key={dateKey} style={{ marginBottom: 32 }}>
                {/* Date header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800,
                    fontSize: ".8rem", color: "var(--ls-text2)", whiteSpace: "nowrap" }}>
                    {formatDate(entries[0].createdAt)}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "var(--ls-border)" }} />
                </div>

                {/* Entries */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {entries.map((log) => {
                    const cfg = TYPE_CONFIG[log.type] || { label: log.type, icon: FileText, color: "#6b7280" };
                    const Icon = cfg.icon;
                    const desc = buildDescription(log);
                    return (
                      <div key={log._id} style={{
                        display: "flex", alignItems: "flex-start", gap: 14,
                        background: "var(--ls-card)", border: "1px solid var(--ls-border)",
                        borderRadius: 14, padding: "14px 16px",
                        transition: "box-shadow .2s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: `${cfg.color}18`,
                          display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={17} style={{ color: cfg.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif",
                            fontWeight: 700, fontSize: ".9rem", color: "var(--ls-text)" }}>
                            {cfg.label}
                          </div>
                          {desc && (
                            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif",
                              fontSize: ".8rem", color: "var(--ls-text2)", marginTop: 2,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {desc}
                            </div>
                          )}
                        </div>
                        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif",
                          fontSize: ".75rem", color: "var(--ls-text2)", flexShrink: 0, paddingTop: 2 }}>
                          {formatTime(log.createdAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
                <button onClick={() => fetchLogs(page - 1)} disabled={page === 1}
                  style={{ padding: "8px 16px", borderRadius: 10,
                    border: "1px solid var(--ls-border)", background: "transparent",
                    color: "var(--ls-text)", fontFamily: "'Plus Jakarta Sans',sans-serif",
                    fontWeight: 700, fontSize: ".85rem", cursor: page === 1 ? "not-allowed" : "pointer",
                    opacity: page === 1 ? 0.4 : 1 }}>
                  ← Prev
                </button>
                <span style={{ padding: "8px 16px", fontFamily: "'Plus Jakarta Sans',sans-serif",
                  fontSize: ".85rem", color: "var(--ls-text2)" }}>
                  {page} / {totalPages}
                </span>
                <button onClick={() => fetchLogs(page + 1)} disabled={page === totalPages}
                  style={{ padding: "8px 16px", borderRadius: 10,
                    border: "1px solid var(--ls-border)", background: "transparent",
                    color: "var(--ls-text)", fontFamily: "'Plus Jakarta Sans',sans-serif",
                    fontWeight: 700, fontSize: ".85rem",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    opacity: page === totalPages ? 0.4 : 1 }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
