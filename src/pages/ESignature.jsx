import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const S = {
  chip: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px",
    borderRadius: 99, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".02em",
    fontFamily: "'Plus Jakarta Sans',sans-serif" },
  card: { background: "var(--ls-card)", border: "1px solid var(--ls-border)", borderRadius: "var(--r)",
    padding: 28, boxShadow: "var(--shadow-sm)", transition: "box-shadow .25s, transform .25s" },
};

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

const ESignature = () => {
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
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 56, alignItems: "center" }}>
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
            <button onClick={addRipple}
              className="btn-shimmer"
              style={{ position: "relative", overflow: "hidden", padding: "12px 24px",
                borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#22c55e,#15803d)",
                color: "#fff", fontWeight: 700, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                boxShadow: "0 4px 16px var(--green-glow)" }}>
              Upload Document to Sign →
            </button>
          </div>

          <div className="sr sr-left" style={{ background: "var(--ls-card)", borderRadius: 20,
            border: "1px solid var(--ls-border)", padding: 28, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: 20,
              fontFamily: "'Plus Jakarta Sans',sans-serif" }}>✍️ Digital Signature Canvas</div>
            <div style={{ background: "var(--bg3)", borderRadius: 12, height: 160,
              border: "2px dashed var(--ls-border)", display: "flex", alignItems: "center",
              justifyContent: "center", marginBottom: 20, color: "var(--ls-text3)",
              fontSize: ".85rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Draw your signature here
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
              Apply Signature
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ESignature;
