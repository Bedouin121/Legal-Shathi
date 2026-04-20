import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const cols = [
    {
      title: "Platform",
      links: ["Templates", "Law Database", "AI Chatbot", "E-Signature", "Dashboard"],
      hrefs: ["/#templates-section", "/#modules", "/chat", "/#esig", "/analytics-dashboard"],
    },
    {
      title: "Resources",
      links: ["Documentation", "API Reference", "Case Judgments", "Blog"],
      hrefs: ["#", "#", "#", "#"],
    },
    {
      title: "Company",
      links: ["About Us", "Team — Group 9", "Privacy Policy", "Terms of Service"],
      hrefs: ["#", "#", "#", "#"],
    },
  ];

  return (
    <footer style={{ background: "var(--bg2)", borderTop: "1px solid rgba(0,0,0,.06)", padding: "56px clamp(16px,5vw,80px) 32px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}
             className="footer-cols">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
              fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--ls-text)" }}>
              <div style={{ width:34,height:34,borderRadius:10,
                background:"linear-gradient(135deg,#22c55e,#15803d)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:".85rem",fontWeight:800,color:"#fff",
                boxShadow:"0 4px 14px var(--green-glow)" }}>
                LS
              </div>
              Legal Shathi
            </div>
            <p style={{ fontSize: ".86rem", color: "var(--ls-text2)", lineHeight: 1.7, maxWidth: 280 }}>
              Your AI-powered legal companion for Bangladesh. Making legal resources accessible in Bengali & English.
            </p>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontSize: ".84rem", fontWeight: 800, color: "var(--ls-text)", marginBottom: 18, letterSpacing: ".02em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((link, i) => (
                  <li key={link}>
                    <a
                      href={col.hrefs[i]}
                      onClick={(e) => {
                        if (col.hrefs[i] === "/chat") { e.preventDefault(); navigate("/chat"); }
                        else if (col.hrefs[i] === "/analytics-dashboard") { e.preventDefault(); navigate("/analytics-dashboard"); }
                      }}
                      style={{ fontSize: ".82rem", color: "var(--ls-text2)", textDecoration: "none",
                        transition: "color .2s, padding-left .2s", display: "block", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                      onMouseEnter={e => { e.target.style.color = "var(--green)"; e.target.style.paddingLeft = "4px"; }}
                      onMouseLeave={e => { e.target.style.color = "var(--ls-text2)"; e.target.style.paddingLeft = "0"; }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 28, borderTop: "1px solid rgba(0,0,0,.06)", display: "flex",
          justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
          fontSize: ".78rem", color: "var(--ls-text3)" }}>
          <span>© 2026 Legal Shathi · CSE471 Group 9 · BRAC University · Fall 2025</span>
          <span>Built with ⚖️ + 🤖 for Bangladesh</span>
        </div>
      </div>

      <style>{`
        @media(max-width:1024px){.footer-cols{grid-template-columns:1fr 1fr!important}}
        @media(max-width:640px){.footer-cols{grid-template-columns:1fr!important}}
      `}</style>
    </footer>
  );
};

export default Footer;
