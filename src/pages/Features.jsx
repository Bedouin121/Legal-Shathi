import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FEATURES = [
  { icon: "⚖️", title: "Bangladesh Law Database", desc: "Access 500+ acts, ordinances, and regulations — fully searchable in Bengali and English.", chip: "chip-g" },
  { icon: "🤖", title: "AI Legal Assistant", desc: "Ask complex legal questions and get clear, cited answers powered by GPT-4o.", chip: "chip-b" },
  { icon: "📄", title: "Smart Document Generator", desc: "Generate court-ready documents from 48+ templates with AI auto-fill.", chip: "chip-a" },
  { icon: "✍️", title: "Digital E-Signature", desc: "Legally sign and witness documents online — fully compliant with BD regulations.", chip: "chip-p" },
  { icon: "📊", title: "Analytics Dashboard", desc: "Track document usage, popular templates, and platform-wide trends at a glance.", chip: "chip-t" },
  { icon: "🔐", title: "Secure & Private", desc: "Bank-grade encryption, JWT authentication, and zero third-party data sharing.", chip: "chip-r" },
];

const HOW_STEPS = [
  { n: "01", title: "Create Your Account", desc: "Sign up and build your profile. Your data stays completely private." },
  { n: "02", title: "Pick a Template or Ask AI", desc: "Browse 48+ legal templates or type any question in Bengali or English." },
  { n: "03", title: "Generate & Customize", desc: "AI fills in the details. Review, edit, and perfect your document." },
  { n: "04", title: "Sign & Share", desc: "Apply your digital signature and share or download as PDF." },
];

const S = {
  chip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px",
    borderRadius: 99, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".02em",
    fontFamily: "'Plus Jakarta Sans',sans-serif" },
  card: { background: "var(--ls-card)", border: "1px solid var(--ls-border)", borderRadius: "var(--r)",
    padding: 28, boxShadow: "var(--shadow-sm)", transition: "box-shadow .25s, transform .25s" },
};

function FeatCard({ feat }) {
  return (
    <div style={{ ...S.card, position: "relative", overflow: "hidden" }}
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

const Features = () => {
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
      
      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section style={{ padding: "96px clamp(16px,5vw,80px)" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }} className="feat-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`sr sr-d${Math.min(i + 1, 4)}`}>
                <FeatCard feat={f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section style={{ background: "var(--bg2)", padding: "96px clamp(16px,5vw,80px)", borderTop: "1px solid var(--ls-border)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="sr" style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="chip-b" style={S.chip}>How It Works</span>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, margin: "16px 0 12px" }}>
              From Question to Signed Document in Minutes
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }} className="steps-grid">
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
      
      <Footer />
    </div>
  );
};

export default Features;
