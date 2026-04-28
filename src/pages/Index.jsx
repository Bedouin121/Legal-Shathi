import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, FileText, PhoneCall, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { templateAPI, favoriteAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

/* ─── helpers ─── */
function addRipple(e) {
  const btn = e.currentTarget;
  const circle = document.createElement("span");
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  circle.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
  circle.className = "ripple-span";
  btn.appendChild(circle);
  setTimeout(() => circle.remove(), 700);
}

/* ─── hooks ─── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sr,.sr-left,.sr-right");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

function useScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById("ls-progress");
    if (!bar) return;
    const onScroll = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = `${Math.min(pct, 100)}%`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}



/* ─── constants ─── */
const FEATURES = [
  { icon: "⚖️", title: "Bangladesh Law Database", desc: "Access 500+ acts, ordinances, and regulations — fully searchable in Bengali and English.", chip: "chip-g" },
  { icon: "🤖", title: "AI Legal Assistant", desc: "Ask complex legal questions and get clear, cited answers powered by GPT-4o.", chip: "chip-b" },
  { icon: "📄", title: "Smart Document Generator", desc: "Generate court-ready documents from 48+ templates with AI auto-fill.", chip: "chip-a" },
  { icon: "✍️", title: "Digital E-Signature", desc: "Legally sign and witness documents online — fully compliant with BD regulations.", chip: "chip-p" },
  { icon: "📊", title: "Analytics Dashboard", desc: "Track document usage, popular templates, and platform-wide trends at a glance.", chip: "chip-t" },
  { icon: "🔐", title: "Secure & Private", desc: "Bank-grade encryption, JWT authentication, and zero third-party data sharing.", chip: "chip-r" },
];

const HOW_STEPS = [
  { n: "01", title: "Create Your Account", desc: "Sign up free — no credit card required. Your data stays private." },
  { n: "02", title: "Pick a Template or Ask AI", desc: "Browse 48+ legal templates or type any question in Bengali or English." },
  { n: "03", title: "Generate & Customize", desc: "AI fills in the details. Review, edit, and perfect your document." },
  { n: "04", title: "Sign & Share", desc: "Apply your digital signature and share or download as PDF." },
];

const LAW_MODULES = [
  { icon: "📜", title: "Constitutional Law", count: "45 acts", tag: "chip-g" },
  { icon: "👔", title: "Labour & Employment", count: "28 acts", tag: "chip-b" },
  { icon: "🏠", title: "Property & Land", count: "36 acts", tag: "chip-a" },
  { icon: "💼", title: "Commercial Law", count: "52 acts", tag: "chip-p" },
  { icon: "👨‍👩‍👧", title: "Family Law", count: "19 acts", tag: "chip-t" },
  { icon: "⚖️", title: "Criminal Procedure", count: "31 acts", tag: "chip-r" },
];

const CHAT_QA = [
  { q: "What is the notice period for wrongful termination?", a: "Under Bangladesh Labour Act 2006, the notice period is 120 days for permanent workers. The employer must provide written notice or payment in lieu." },
  { q: "How do I register a property transfer?", a: "You need to execute a deed of conveyance before a Sub-Registrar under the Registration Act 1908. The deed must be stamped under Stamp Act 1899 and both parties must be present." },
];

const TEMPLATE_ICONS = {
  "Employment": "👔", "Property": "🏠", "Family": "👨‍👩‍👧", "Commercial": "💼",
  "Criminal": "⚖️", "Civil": "📋", "Corporate": "🏢", "Default": "📄",
};

const CITIZEN_TOOLS = [
  { icon: Camera, title: "Incident Log", desc: "Capture time, place, people, media, and witness details before facts get lost." },
  { icon: PhoneCall, title: "Trusted Contact Alert", desc: "Prepare a quick location and incident summary for family or a lawyer." },
  { icon: FileText, title: "Complaint Drafts", desc: "Turn evidence into a structured complaint or legal aid request." },
];

const S = {
  section: { padding: "96px clamp(16px,5vw,80px)", maxWidth: 1180, margin: "0 auto" },
  chip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px",
    borderRadius: 99, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".02em",
    fontFamily: "'Plus Jakarta Sans',sans-serif" },
  card: { background: "var(--ls-card)", border: "1px solid var(--ls-border)", borderRadius: "var(--r)",
    padding: 28, boxShadow: "var(--shadow-sm)", transition: "box-shadow .25s, transform .25s" },
};

/* ─── sub-components ─── */
function HeroChatPreview() {
  const [qaIdx, setQaIdx] = useState(0);
  const [typing, setTyping] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 600);
    return () => clearTimeout(t);
  }, []);

  const ask = () => {
    setTyping(true);
    setShown(false);
    setTimeout(() => { setShown(true); setTyping(false); setQaIdx((i) => (i + 1) % CHAT_QA.length); }, 1800);
  };

  const qa = CHAT_QA[qaIdx];
  return (
    <div style={{ background: "var(--ls-card)", border: "1px solid var(--ls-border)", borderRadius: 20,
      boxShadow: "var(--shadow-lg)", overflow: "hidden", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
      className="float-y">
      {/* Title bar */}
      <div style={{ background: "var(--bg3)", borderBottom: "1px solid var(--ls-border)",
        padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
        <span style={{ marginLeft: 6, fontSize: ".78rem", fontWeight: 600, color: "var(--ls-text2)" }}>Legal Shathi AI</span>
        <div className="pulse-dot" style={{ marginLeft: "auto" }} />
      </div>

      <div style={{ padding: "20px 18px", minHeight: 220 }}>
        {/* User bubble */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <div style={{ background: "linear-gradient(135deg,#22c55e,#15803d)", color: "#fff",
            borderRadius: "16px 16px 4px 16px", padding: "10px 14px",
            fontSize: ".82rem", maxWidth: "80%", animation: "msgSlideR .3s ease" }}>
            {qa.q}
          </div>
        </div>

        {/* AI bubble */}
        {typing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "12px 14px",
            background: "var(--bg3)", borderRadius: "4px 16px 16px 16px",
            width: "fit-content", maxWidth: "80%" }}>
            {[0,1,2].map(i => <span key={i} className="typing-dot" style={{ width:7,height:7,borderRadius:"50%",background:"var(--ls-text3)",display:"block" }} />)}
          </div>
        ) : shown && (
          <div style={{ background: "var(--bg3)", color: "var(--ls-text)",
            borderRadius: "4px 16px 16px 16px", padding: "10px 14px",
            fontSize: ".82rem", lineHeight: 1.6, maxWidth: "90%",
            animation: "msgSlideL .35s ease" }}>
            {qa.a}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ borderTop: "1px solid var(--ls-border)", padding: "12px 18px",
        display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 10, padding: "9px 14px",
          fontSize: ".8rem", color: "var(--ls-text3)" }}>
          Ask a legal question…
        </div>
        <button onClick={ask}
          style={{ width: 36, height: 36, borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#22c55e,#15803d)",
            color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: ".9rem" }}>
          →
        </button>
      </div>
    </div>
  );
}

function FeatCard({ feat }) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  }, []);
  return (
    <div ref={ref} onMouseMove={handleMove}
      style={{ ...S.card, position: "relative", overflow: "hidden",
        background: "radial-gradient(circle at var(--mx,50%) var(--my,50%), var(--g50) 0%, var(--ls-card) 60%)" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}>
      <div style={{ fontSize: "2rem", marginBottom: 12 }}>{feat.icon}</div>
      <span className={`${feat.chip}`} style={S.chip}>{feat.title}</span>
      <p style={{ marginTop: 10, fontSize: ".86rem", color: "var(--ls-text2)", lineHeight: 1.65, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        {feat.desc}
      </p>
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="back-to-top-btn"
      style={{ position: "fixed", bottom: 80, right: 20, zIndex: 80,
        width: 44, height: 44, borderRadius: "50%", border: "none",
        background: "linear-gradient(135deg,#22c55e,#15803d)",
        color: "#fff", fontSize: "1.1rem", cursor: "pointer",
        boxShadow: "0 4px 16px var(--green-glow)", transition: "transform .25s",
        display: "flex", alignItems: "center", justifyContent: "center" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
      onMouseLeave={e => e.currentTarget.style.transform = ""}>
      ↑
    </button>
  );
}

/* ─── main page ─── */
const Index = () => {
  const navigate = useNavigate();
  const { user, updateFavorites } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [statsActive, setStatsActive] = useState(false);


  useScrollReveal();
  useScrollProgress();

  /* stats counter trigger */
  useEffect(() => {
    const el = document.getElementById("stats-section");
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsActive(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* load templates */
  useEffect(() => {
    templateAPI.getAll({ limit: 8 }).then((d) => setTemplates(d.templates || [])).catch(() => {});
  }, []);

  /* load favorites */
  useEffect(() => {
    if (user?.favorites) {
      setFavorites(new Set(user.favorites.map((f) => (typeof f === "string" ? f : f._id))));
    }
  }, [user]);

  const toggleFav = async (id) => {
    if (!user) { navigate("/login"); return; }
    const isFav = favorites.has(id);
    setFavorites((prev) => { const n = new Set(prev); isFav ? n.delete(id) : n.add(id); return n; });
    try {
      const res = isFav ? await favoriteAPI.remove(id) : await favoriteAPI.add(id);
      updateFavorites(res.favorites);
    } catch {
      setFavorites((prev) => { const n = new Set(prev); isFav ? n.add(id) : n.delete(id); return n; });
    }
  };

  const askChat = () => {
    setChatTyping(true);
    setTimeout(() => { setChatTyping(false); setChatIdx((i) => (i + 1) % CHAT_QA.length); }, 1600);
  };

  const MODULE_TABS = ["Legal Resources", "AI Documents", "Analytics"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ls-text)", overflowX: "hidden" }}>
      {/* Scroll progress */}
      <div id="ls-progress" style={{ width: "0%" }} />

      {/* Ambient background */}
      <div className="ambient">
        <div className="ambient-blob" />
        <div className="ambient-blob" />
        <div className="ambient-blob" />
      </div>

      <Navbar />

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section style={{ padding: "120px clamp(16px,5vw,80px) 80px", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="hero-grid">
          {/* Left */}
          <div>
            <div className="sr sr-d1" style={{ display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--g50)", border: "1px solid var(--g200)",
              borderRadius: 99, padding: "6px 14px", marginBottom: 24,
              fontSize: ".8rem", fontWeight: 700, color: "var(--green)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              <div className="pulse-dot" />
              AI-Powered Legal Platform · Bangladesh
            </div>

            <h1 className="sr sr-d1" style={{ fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(2.4rem,5vw,3.6rem)", fontWeight: 900, lineHeight: 1.1,
              color: "var(--ls-text)", marginBottom: 20 }}>
              Your <em style={{ color: "var(--green)", fontStyle: "italic" }}>Legal</em>
              <br /><em style={{ color: "var(--green)", fontStyle: "italic" }}>Companion</em>
              <br />Powered by <strong style={{ color: "var(--ls-text)" }}>AI</strong>
            </h1>

            <p className="sr sr-d2" style={{ fontSize: "clamp(.95rem,1.5vw,1.1rem)", color: "var(--ls-text2)",
              lineHeight: 1.75, maxWidth: 480, marginBottom: 36, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Access Bangladesh law, generate AI legal documents, analyze contracts, and get instant legal advice — in Bengali & English.
            </p>

            <div className="sr sr-d3" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              <button
                onClick={(e) => { addRipple(e); navigate("/find-lawyer"); }}
                className="btn-shimmer"
                style={{ position: "relative", overflow: "hidden", padding: "14px 28px",
                   borderRadius: 14, border: "2px solid var(--green)",
                   background: "transparent",
                   color: "var(--green)", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                   fontFamily: "'Plus Jakarta Sans',sans-serif",
                   transition: "transform .25s cubic-bezier(.34,1.56,.64,1), background .25s",
                   display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.background = "var(--green-glow)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.background = "transparent"; }}>
                Find My Lawyer
              </button>
              <button
                onClick={(e) => { addRipple(e); navigate("/register"); }}
                className="btn-shimmer"
                style={{ position: "relative", overflow: "hidden", padding: "14px 28px",
                   borderRadius: 14, border: "none",
                   background: "linear-gradient(135deg,#22c55e,#15803d)",
                   color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                   fontFamily: "'Plus Jakarta Sans',sans-serif",
                   boxShadow: "0 6px 24px var(--green-glow)",
                   transition: "transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s",
                   display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 36px var(--green-glow)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 6px 24px var(--green-glow)"; }}>
                Explore Platform →
              </button>
            </div>

            <div className="sr sr-d4" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex" }}>
                {["#22c55e","#f59e0b","#6366f1","#0ea5e9"].map((c,i)=>(
                  <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", background: c, border: "2px solid var(--bg)", marginLeft: i>0 ? -10 : 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: ".8rem", fontWeight: 700 }}>
                    {"KRSA"[i]}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: ".85rem", color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                <strong style={{ color: "var(--ls-text)" }}>1,200+</strong> users trust Legal Shathi
              </div>
            </div>
          </div>

          {/* Right — chat preview */}
          <div className="sr hero-right" style={{ transitionDelay: ".2s" }}>
            <HeroChatPreview />
          </div>
        </div>
      </section>

      {/* ══════════════════════ STATS ══════════════════════ */}
      <section id="stats-section" style={{ background: "var(--bg2)", borderTop: "1px solid rgba(0,0,0,.05)", borderBottom: "1px solid rgba(0,0,0,.05)" }}>
        <div style={{ ...S.section, padding: "56px clamp(16px,5vw,80px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32, textAlign: "center" }} className="stats-grid">
            {[
              ["48+", "Legal Templates", "📄"],
              ["24/7", "AI Legal Help", "🤖"],
              ["Easy", "Format Export", "📤"],
              ["100%", "Secure Data", "🔒"],
            ].map(([val, lbl, icon]) => (
              <div key={lbl} className="sr">
                <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 800, color: "var(--green)" }}>{val}</div>
                <div style={{ fontSize: ".84rem", color: "var(--ls-text2)", marginTop: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section style={{ padding: "92px clamp(16px,5vw,80px)", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            className="citizen-home sr"
            style={{
              display: "grid",
              gridTemplateColumns: ".9fr 1.1fr",
              gap: 28,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                border: "1px solid var(--ls-border)",
                background: "linear-gradient(180deg,var(--ls-card),var(--bg3))",
                borderRadius: 20,
                padding: "32px clamp(20px,3vw,34px)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ffe4e6", color: "#be123c", borderRadius: 999, padding: "6px 12px", fontSize: ".75rem", fontWeight: 800 }}>
                <ShieldAlert size={15} />
                Citizen protection
              </div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3vw,2.45rem)", fontWeight: 900, lineHeight: 1.15, margin: "18px 0 12px" }}>
                Help citizens document harassment and get legal support.
              </h2>
              <p style={{ color: "var(--ls-text2)", lineHeight: 1.7, fontSize: ".95rem", marginBottom: 24 }}>
                A focused toolkit for police-stop incidents: evidence capture, trusted contact alerts, rights prompts, and complaint draft preparation.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={(e) => { addRipple(e); navigate("/citizen-protection"); }}
                  className="btn-shimmer"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 20px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg,#16a34a,#0f766e)",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    boxShadow: "0 8px 24px rgba(22,163,74,.22)",
                  }}
                >
                  Open Safety Tools
                </button>
                <button
                  onClick={() => navigate("/find-lawyer")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 20px",
                    borderRadius: 12,
                    border: "1px solid var(--ls-border)",
                    background: "var(--ls-card)",
                    color: "var(--ls-text)",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                >
                  Find Lawyer
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }} className="citizen-tool-grid">
              {CITIZEN_TOOLS.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className={`sr sr-d${i + 1}`}
                  style={{
                    background: "var(--ls-card)",
                    border: "1px solid var(--ls-border)",
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: "var(--shadow-sm)",
                    minHeight: 210,
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "var(--g100)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: "1rem", marginBottom: 10, fontWeight: 900 }}>{title}</h3>
                  <p style={{ color: "var(--ls-text2)", lineHeight: 1.62, fontSize: ".84rem" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "96px clamp(16px,5vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="sr" style={{ background: "linear-gradient(135deg,#15803d,#166534)",
            borderRadius: 24, padding: "72px 48px", textAlign: "center",
            boxShadow: "0 24px 80px rgba(22,163,74,.25)", position: "relative", overflow: "hidden" }}>
            {/* decorative glow */}
            <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%",
              background: "radial-gradient(circle,rgba(255,255,255,.08),transparent 70%)",
              top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />

            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,4vw,3rem)",
              fontWeight: 900, color: "#fff", marginBottom: 16, position: "relative" }}>
              Start Your Legal Journey Today
            </h2>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,.8)", maxWidth: 480, margin: "0 auto 36px",
              lineHeight: 1.7, fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative" }}>
              Your one-stop solution for reliable, automated legal documents. Start creating, editing, and signing today.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              <button onClick={(e) => { addRipple(e); navigate("/register"); }}
                className="btn-shimmer"
                style={{ position: "relative", overflow: "hidden", padding: "14px 32px",
                  borderRadius: 14, border: "none", background: "#fff",
                  color: "#15803d", fontWeight: 800, fontSize: "1rem", cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  boxShadow: "0 6px 24px rgba(0,0,0,.15)",
                  transition: "transform .25s cubic-bezier(.34,1.56,.64,1)" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseLeave={e => e.currentTarget.style.transform = ""}>
                Create Account →
              </button>
              <button onClick={() => navigate("/chat")}
                style={{ padding: "14px 32px", borderRadius: 14, border: "2px solid rgba(255,255,255,.3)",
                  background: "transparent", color: "#fff", fontWeight: 700, fontSize: "1rem",
                  cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
                  transition: "all .25s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                Try AI Chat First
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <BackToTop />

      {/* Responsive overrides */}
      <style>{`
        @media(max-width:1024px){
          .hero-grid{grid-template-columns:1fr!important}
          .hero-right{display:none!important}
          .feat-grid{grid-template-columns:1fr 1fr!important}
          .steps-grid{grid-template-columns:1fr 1fr!important}
          .chat-demo-grid{grid-template-columns:1fr!important}
          .esig-grid{grid-template-columns:1fr!important}
          .doc-grid{grid-template-columns:1fr!important}
          .mod-grid{grid-template-columns:1fr 1fr!important}
          .templates-grid{grid-template-columns:1fr 1fr!important}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .citizen-home{grid-template-columns:1fr!important}
          .citizen-tool-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:640px){
          .feat-grid,.steps-grid,.mod-grid,.templates-grid,.stats-grid{grid-template-columns:1fr!important}
          .analytics-mini-grid{grid-template-columns:1fr 1fr!important}
        }
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      `}</style>
    </div>
  );
};

export default Index;
