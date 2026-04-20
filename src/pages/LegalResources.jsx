import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LAW_MODULES = [
  { icon: "📜", title: "Constitutional Law", count: "45 acts", tag: "chip-g" },
  { icon: "👔", title: "Labour & Employment", count: "28 acts", tag: "chip-b" },
  { icon: "🏠", title: "Property & Land", count: "36 acts", tag: "chip-a" },
  { icon: "💼", title: "Commercial Law", count: "52 acts", tag: "chip-p" },
  { icon: "👨‍👩‍👧", title: "Family Law", count: "19 acts", tag: "chip-t" },
  { icon: "⚖️", title: "Criminal Procedure", count: "31 acts", tag: "chip-r" },
];

const S = {
  chip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px",
    borderRadius: 99, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".02em",
    fontFamily: "'Plus Jakarta Sans',sans-serif" },
  card: { background: "var(--ls-card)", border: "1px solid var(--ls-border)", borderRadius: "var(--r)",
    padding: 28, boxShadow: "var(--shadow-sm)", transition: "box-shadow .25s, transform .25s" },
};

const LegalResources = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const els = document.querySelectorAll(".sr");
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ls-text)", overflowX: "hidden", paddingTop: 64 }}>
      <Navbar />
      
      <section style={{ padding: "96px clamp(16px,5vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="sr" style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="chip-p" style={S.chip}>Legal Resources</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, margin: "16px 0 12px" }}>
              Explore Bangladesh Law Database
            </h2>
            <p style={{ color: "var(--ls-text2)", maxWidth: 520, margin: "0 auto", fontSize: ".95rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Browse through hundreds of acts, ordinances, and case laws carefully categorized for easy access.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }} className="mod-grid">
            {LAW_MODULES.map((m, i) => (
              <div key={m.title} className={`sr sr-d${Math.min(i + 1, 4)}`} style={{ ...S.card, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = ""; }}>
                <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "var(--ls-text)" }}>{m.title}</div>
                  <span className={m.tag} style={S.chip}>{m.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LegalResources;
