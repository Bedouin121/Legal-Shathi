import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

function useCounters(active) {
  const [counts, setCounts] = useState({ users: 0, templates: 0, queries: 0, accuracy: 0 });
  const targets = { users: 1200, templates: 48, queries: 25000, accuracy: 97 };
  useEffect(() => {
    if (!active) return;
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCounts({
        users: Math.round(targets.users * ease),
        templates: Math.round(targets.templates * ease),
        queries: Math.round(targets.queries * ease),
        accuracy: Math.round(targets.accuracy * ease),
      });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active]);
  return counts;
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
  const [activeModule, setActiveModule] = useState(0);
  const [chatIdx, setChatIdx] = useState(0);
  const [chatTyping, setChatTyping] = useState(false);
  const counts = useCounters(statsActive);

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
            <div className="sr" style={{ display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--g50)", border: "1px solid var(--g200)",
              borderRadius: 99, padding: "6px 14px", marginBottom: 24,
              fontSize: ".8rem", fontWeight: 700, color: "var(--green)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              <div className="pulse-dot" />
              AI-Powered Legal Platform for Bangladesh
            </div>

            <h1 className="sr sr-d1" style={{ fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(2.4rem,5vw,3.6rem)", fontWeight: 900, lineHeight: 1.1,
              color: "var(--ls-text)", marginBottom: 20 }}>
              Your Legal{" "}
              <span className="gradient-text">Companion</span>
              <br />for Bangladesh
            </h1>

            <p className="sr sr-d2" style={{ fontSize: "clamp(.95rem,1.5vw,1.1rem)", color: "var(--ls-text2)",
              lineHeight: 1.75, maxWidth: 480, marginBottom: 36, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Access 500+ laws in Bengali & English, generate court-ready documents with AI, and sign them digitally — all in one platform built for Bangladeshi citizens.
            </p>

            <div className="sr sr-d3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
                Get Started Free →
              </button>
              <button
                onClick={(e) => { addRipple(e); navigate("/chat"); }}
                style={{ position: "relative", overflow: "hidden", padding: "14px 28px",
                  borderRadius: 14, border: "1.5px solid var(--ls-border)",
                  background: "var(--ls-card)", color: "var(--ls-text)",
                  fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  boxShadow: "var(--shadow-sm)", transition: "all .25s",
                  display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--green)"; e.currentTarget.style.color = "var(--green)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--ls-border)"; e.currentTarget.style.color = "var(--ls-text)"; }}>
                🤖 Try AI Chat
              </button>
            </div>

            <div className="sr sr-d4" style={{ display: "flex", gap: 24, marginTop: 40, flexWrap: "wrap" }}>
              {[["1,200+","Active Users"],["48","Legal Templates"],["97%","AI Accuracy"]].map(([n,l]) => (
                <div key={l} style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--green)" }}>{n}</div>
                  <div style={{ fontSize: ".78rem", color: "var(--ls-text3)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
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
              [counts.users.toLocaleString() + "+", "Active Users", "👤"],
              [counts.templates + "+", "Legal Templates", "📄"],
              [counts.queries.toLocaleString() + "+", "AI Queries Answered", "🤖"],
              [counts.accuracy + "%", "Document Accuracy", "✅"],
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

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section id="features" style={{ padding: "96px clamp(16px,5vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="sr" style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="chip-g" style={S.chip}>Platform Features</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, margin: "16px 0 12px" }}>
              Everything You Need, Built for Bangladesh
            </h2>
            <p style={{ color: "var(--ls-text2)", maxWidth: 520, margin: "0 auto", fontSize: ".95rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Legal Shathi combines AI, law databases, and document tools in one seamless platform.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} className="feat-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`sr sr-d${Math.min(i + 1, 4)}`}>
                <FeatCard feat={f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section style={{ background: "var(--bg2)", padding: "96px clamp(16px,5vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="sr" style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="chip-b" style={S.chip}>How It Works</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, margin: "16px 0 12px" }}>
              From Question to Signed Document in Minutes
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32 }} className="steps-grid">
            {HOW_STEPS.map((s, i) => (
              <div key={s.n} className={`sr sr-d${i + 1}`} style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
                  background: "linear-gradient(135deg,#22c55e,#15803d)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 800, color: "#fff",
                  boxShadow: "0 6px 20px var(--green-glow)" }}>
                  {s.n}
                </div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 700,
                  marginBottom: 8, color: "var(--ls-text)" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: ".84rem", color: "var(--ls-text2)", lineHeight: 1.6,
                  fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ MODULES ══════════════════════ */}
      <section id="modules" style={{ padding: "96px clamp(16px,5vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="sr" style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="chip-p" style={S.chip}>Core Modules</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, margin: "16px 0 0" }}>
              Three Powerful Tools in One
            </h2>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 40, background: "var(--bg2)",
            borderRadius: 16, padding: 6, border: "1px solid var(--ls-border)", width: "fit-content", margin: "0 auto 40px" }}>
            {MODULE_TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveModule(i)}
                style={{ padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: ".875rem",
                  transition: "all .25s",
                  background: activeModule === i ? "linear-gradient(135deg,#22c55e,#15803d)" : "transparent",
                  color: activeModule === i ? "#fff" : "var(--ls-text2)",
                  boxShadow: activeModule === i ? "0 4px 16px var(--green-glow)" : "none" }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Panel 0: Legal Resources */}
          {activeModule === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="mod-grid">
              {LAW_MODULES.map((m) => (
                <div key={m.title} style={{ ...S.card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}>
                  <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{m.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{m.title}</div>
                    <span className={m.tag} style={S.chip}>{m.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Panel 1: AI Documents */}
          {activeModule === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }} className="doc-grid">
              <div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: 16 }}>
                  AI-Powered Document Generation
                </h3>
                <p style={{ fontSize: ".9rem", color: "var(--ls-text2)", lineHeight: 1.7, marginBottom: 24, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Select a template, fill in your details, and our AI generates a professionally worded, court-ready document in seconds. Available in both Bengali and English.
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {["AI auto-fills legal clauses","Bengali & English output","PDF download ready","48+ document types"].map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 10,
                      fontSize: ".88rem", color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      <span style={{ color: "var(--green)", fontWeight: 800 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={(e) => { addRipple(e); navigate("/templates"); }}
                  className="btn-shimmer"
                  style={{ position: "relative", overflow: "hidden", marginTop: 28,
                    padding: "12px 24px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg,#22c55e,#15803d)",
                    color: "#fff", fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    boxShadow: "0 4px 16px var(--green-glow)" }}>
                  Browse Templates →
                </button>
              </div>
              <div style={{ background: "var(--bg3)", borderRadius: 18, padding: 28,
                border: "1px solid var(--ls-border)" }}>
                <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: 16,
                  fontFamily: "'Plus Jakarta Sans',sans-serif", color: "var(--ls-text)" }}>
                  📋 Document Preview
                </div>
                {["Rental Agreement","Employment Contract","Affidavit","Power of Attorney"].map((doc, i) => (
                  <div key={doc} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: i < 3 ? "1px solid var(--ls-border)" : "none" }}>
                    <span style={{ fontSize: ".85rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>📄 {doc}</span>
                    <span className="chip-g" style={{ ...S.chip, fontSize: ".7rem" }}>AI Ready</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Panel 2: Analytics */}
          {activeModule === 2 && (
            <div style={{ ...S.card, padding: 32 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: 24 }}>
                Platform Analytics Overview
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 32 }} className="analytics-mini-grid">
                {[["📄","1,200","Users"],["⚖️","48","Templates"],["💬","25K","Queries"],["✅","97%","Accuracy"]].map(([ic,val,lbl]) => (
                  <div key={lbl} style={{ background: "var(--bg3)", borderRadius: 14, padding: 20, textAlign: "center",
                    border: "1px solid var(--ls-border)" }}>
                    <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{ic}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", fontWeight: 800, color: "var(--green)" }}>{val}</div>
                    <div style={{ fontSize: ".78rem", color: "var(--ls-text3)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{lbl}</div>
                  </div>
                ))}
              </div>
              {/* Simple bar chart */}
              <div>
                <div style={{ fontSize: ".84rem", fontWeight: 700, marginBottom: 14, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Popular Template Categories
                </div>
                {[["Employment","85%"],["Property","72%"],["Commercial","60%"],["Family","48%"],["Criminal","35%"]].map(([cat,pct]) => (
                  <div key={cat} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem",
                      marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "var(--ls-text2)" }}>
                      <span>{cat}</span><span style={{ fontWeight: 700, color: "var(--green)" }}>{pct}</span>
                    </div>
                    <div style={{ height: 7, background: "var(--g100)", borderRadius: 99, overflow: "hidden" }}>
                      <div className="pop-fill-bar" style={{ height: "100%", width: pct,
                        background: "linear-gradient(90deg,#22c55e,#15803d)", borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/analytics-dashboard")}
                style={{ marginTop: 24, padding: "10px 20px", borderRadius: 12, border: "1.5px solid var(--ls-border)",
                  background: "transparent", color: "var(--ls-text)", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".875rem" }}>
                View Full Dashboard →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════ AI CHATBOT ══════════════════════ */}
      <section id="chatbot-section" style={{ background: "var(--bg2)", padding: "96px clamp(16px,5vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="chat-demo-grid">
          <div className="sr sr-left">
            <span className="chip-g" style={S.chip}>AI Legal Assistant</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, margin: "16px 0 12px" }}>
              Ask Anything. Get Cited Answers.
            </h2>
            <p style={{ fontSize: ".9rem", color: "var(--ls-text2)", lineHeight: 1.7, marginBottom: 28, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Our AI is trained on Bangladesh's full legal corpus — Labour Act, Contract Act, Criminal Procedure Code, and more. Ask in Bengali or English.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {["Understands Bengali + English questions","Cites specific sections and acts","Available 24/7, no lawyer needed","Free for all registered users"].map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "center",
                  fontSize: ".88rem", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "var(--ls-text2)" }}>
                  <span style={{ color: "var(--green)", fontWeight: 800 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button onClick={(e) => { addRipple(e); navigate("/chat"); }}
              className="btn-shimmer"
              style={{ position: "relative", overflow: "hidden", padding: "12px 24px",
                borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#22c55e,#15803d)",
                color: "#fff", fontWeight: 700, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                boxShadow: "0 4px 16px var(--green-glow)" }}>
              Start Chatting Free →
            </button>
          </div>

          {/* Live chat demo */}
          <div className="sr sr-right" style={{ background: "var(--ls-card)", borderRadius: 20,
            border: "1px solid var(--ls-border)", overflow: "hidden",
            boxShadow: "var(--shadow-lg)" }}>
            <div style={{ background: "var(--bg3)", borderBottom: "1px solid var(--ls-border)",
              padding: "12px 18px", display: "flex", alignItems: "center", gap: 10,
              fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg,#22c55e,#15803d)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: ".8rem", fontWeight: 800, color: "#fff" }}>
                LS
              </div>
              <div>
                <div style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--ls-text)" }}>Legal Shathi AI</div>
                <div style={{ fontSize: ".72rem", color: "var(--green)" }}>● Online</div>
              </div>
            </div>

            <div style={{ padding: "20px 18px", minHeight: 200 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                <div style={{ background: "linear-gradient(135deg,#22c55e,#15803d)", color: "#fff",
                  borderRadius: "16px 16px 4px 16px", padding: "10px 14px",
                  fontSize: ".8rem", maxWidth: "80%", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {CHAT_QA[chatIdx].q}
                </div>
              </div>
              {chatTyping ? (
                <div style={{ display: "flex", gap: 4, padding: "12px 14px",
                  background: "var(--bg3)", borderRadius: "4px 16px 16px 16px", width: "fit-content" }}>
                  {[0,1,2].map(i => <span key={i} className="typing-dot" style={{ width:7,height:7,borderRadius:"50%",background:"var(--ls-text3)",display:"block" }} />)}
                </div>
              ) : (
                <div style={{ background: "var(--bg3)", borderRadius: "4px 16px 16px 16px",
                  padding: "10px 14px", fontSize: ".8rem", lineHeight: 1.6,
                  color: "var(--ls-text)", maxWidth: "90%", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {CHAT_QA[chatIdx].a}
                </div>
              )}
            </div>

            <div style={{ padding: "0 18px 18px", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Labour rights","Property transfer","Contract law"].map((q) => (
                <button key={q} onClick={askChat}
                  style={{ padding: "5px 12px", borderRadius: 99, border: "1px solid var(--ls-border)",
                    background: "var(--bg3)", fontSize: ".75rem", fontWeight: 600, cursor: "pointer",
                    color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif",
                    transition: "all .2s" }}
                  onMouseEnter={e => { e.target.style.borderColor = "var(--green)"; e.target.style.color = "var(--green)"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "var(--ls-border)"; e.target.style.color = "var(--ls-text2)"; }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ TEMPLATES ══════════════════════ */}
      <section id="templates-section" style={{ padding: "96px clamp(16px,5vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="sr" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="chip-a" style={S.chip}>Document Templates</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, margin: "12px 0 0" }}>
                Ready-Made Legal Documents
              </h2>
            </div>
            <button onClick={() => navigate("/templates")}
              style={{ padding: "10px 20px", borderRadius: 12, border: "1.5px solid var(--ls-border)",
                background: "transparent", color: "var(--ls-text)", fontWeight: 600, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".875rem", flexShrink: 0 }}
              onMouseEnter={e => { e.target.style.borderColor = "var(--green)"; e.target.style.color = "var(--green)"; }}
              onMouseLeave={e => { e.target.style.borderColor = "var(--ls-border)"; e.target.style.color = "var(--ls-text)"; }}>
              View All Templates →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="templates-grid">
            {(templates.length > 0 ? templates : Array(8).fill(null)).map((t, i) => (
              t ? (
                <div key={t._id} className={`sr sr-d${Math.min(i + 1, 4)}`}
                  style={{ ...S.card, cursor: "pointer" }}
                  onClick={() => navigate(`/template/${t._id}`)}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>
                    {TEMPLATE_ICONS[t.category] || TEMPLATE_ICONS.Default}
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", fontWeight: 700, marginBottom: 6, color: "var(--ls-text)" }}>{t.title}</h3>
                  <p style={{ fontSize: ".8rem", color: "var(--ls-text2)", lineHeight: 1.55, marginBottom: 14, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    {t.description?.slice(0, 80)}…
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="chip-g" style={S.chip}>{t.category || "Legal"}</span>
                    <button onClick={(e) => { e.stopPropagation(); toggleFav(t._id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem",
                        transition: "transform .2s" }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.3)"}
                      onMouseLeave={e => e.currentTarget.style.transform = ""}>
                      {favorites.has(t._id) ? "❤️" : "🤍"}
                    </button>
                  </div>
                </div>
              ) : (
                <div key={i} style={{ height: 180, borderRadius: "var(--r)", background: "var(--bg3)",
                  animation: "pulse 1.5s ease-in-out infinite", border: "1px solid var(--ls-border)" }} />
              )
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ E-SIGNATURE ══════════════════════ */}
      <section id="esig" style={{ background: "var(--bg2)", padding: "96px clamp(16px,5vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="esig-grid">
          <div className="sr sr-right" style={{ order: 1 }}>
            <span className="chip-p" style={S.chip}>E-Signature</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, margin: "16px 0 12px" }}>
              Sign Documents Digitally — Legally Valid in Bangladesh
            </h2>
            <p style={{ fontSize: ".9rem", color: "var(--ls-text2)", lineHeight: 1.7, marginBottom: 28, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Our e-signature system is compliant with Bangladesh's ICT Act 2006. Sign, witness, and timestamp your legal documents in minutes.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {["Draw or type your signature","Witness signature support","Timestamped audit trail","Download signed PDF"].map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "center",
                  fontSize: ".88rem", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "var(--ls-text2)" }}>
                  <span style={{ color: "var(--green)", fontWeight: 800 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button onClick={(e) => { addRipple(e); navigate("/esignature"); }}
              className="btn-shimmer"
              style={{ position: "relative", overflow: "hidden", padding: "12px 24px",
                borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#22c55e,#15803d)",
                color: "#fff", fontWeight: 700, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                boxShadow: "0 4px 16px var(--green-glow)" }}>
              Try E-Signature →
            </button>
          </div>

          {/* Signature mockup */}
          <div className="sr sr-left" style={{ background: "var(--ls-card)", borderRadius: 20,
            border: "1px solid var(--ls-border)", padding: 28, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: 20,
              fontFamily: "'Plus Jakarta Sans',sans-serif" }}>✍️ Digital Signature</div>
            <div style={{ background: "var(--bg3)", borderRadius: 12, height: 100,
              border: "2px dashed var(--ls-border)", display: "flex", alignItems: "center",
              justifyContent: "center", marginBottom: 20, color: "var(--ls-text3)",
              fontSize: ".85rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Signature Canvas
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["Draw","Type","Upload"].map((m, i) => (
                <button key={m}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "1px solid var(--ls-border)",
                    background: i === 0 ? "var(--g50)" : "transparent",
                    color: i === 0 ? "var(--green)" : "var(--ls-text2)",
                    fontWeight: i === 0 ? 700 : 500, fontSize: ".8rem", cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {m}
                </button>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--ls-border)", paddingTop: 16 }}>
              {["Signatory: ____________","Witness: ____________","Date: " + new Date().toLocaleDateString("en-BD")].map((l) => (
                <div key={l} style={{ fontSize: ".8rem", color: "var(--ls-text2)", marginBottom: 8,
                  fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{l}</div>
              ))}
            </div>
            <button style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg,#22c55e,#15803d)", color: "#fff",
              fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
              marginTop: 12, boxShadow: "0 4px 12px var(--green-glow)" }}>
              Apply Signature & Download PDF
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
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
              Join 1,200+ Bangladeshis who use Legal Shathi for their legal needs. Free forever for basic access.
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
                Create Free Account →
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

      {/* ══════════════════════ MOBILE BOTTOM NAV ══════════════════════ */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {[
          { icon: "🏠", label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
          { icon: "⚖️", label: "Laws", action: () => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" }) },
          { icon: "🤖", label: "AI Chat", action: () => navigate("/chat") },
          { icon: "📄", label: "Templates", action: () => navigate("/templates") },
          { icon: "👤", label: "Account", action: () => navigate(user ? "/profile" : "/login") },
        ].map(({ icon, label, action }) => (
          <button key={label} onClick={action}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              border: "none", background: "transparent", cursor: "pointer", padding: "6px 0",
              color: "var(--ls-text2)", fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontSize: ".65rem", fontWeight: 600, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--green)"; e.currentTarget.children[0].style.transform = "translateY(-2px) scale(1.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--ls-text2)"; e.currentTarget.children[0].style.transform = ""; }}>
            <span style={{ fontSize: "1.3rem", transition: "transform .2s" }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

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
