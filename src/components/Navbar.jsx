import { useState, useEffect } from "react";
import { Scale } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProfileDropdown from "@/components/ProfileDropdown";
import BottomNav from "@/components/BottomNav";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("ls-dark") === "1");

  const isLanding = location.pathname === "/";

  useEffect(() => {
    const html = document.documentElement;
    if (dark) {
      html.dataset.theme = "dark";
      html.classList.add("dark");
    } else {
      html.dataset.theme = "light";
      html.classList.remove("dark");
    }
    localStorage.setItem("ls-dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const navLinks = [
    { label: "Features", path: "/features" },
    { label: "Legal Resources", path: "/legal-resources" },
    { label: "Templates", path: "/templates" },
    { label: "Ai Analysis", path: "/document-analysis" },
    { label: "AI Chat", path: "/chat" },
    { label: "Lawyer Consult", path: "/lawyer-chat" },
    { label: "Citizen Help", path: "/citizen-protection" },
    { label: "E-Signature", path: "/esignature" },
    { label: "Analytics", path: "/analytics-dashboard" },
  ];

  return (
    <>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          height: 64,
          padding: "0 clamp(16px,4vw,48px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: dark ? "rgba(10,26,15,.85)" : "rgba(247,250,248,.82)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(0,0,0,.06)",
          transition: "background .4s, box-shadow .3s",
          boxShadow: scrolled ? "0 2px 20px rgba(22,163,74,.08)" : "none",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigate("/"); }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            textDecoration: "none",
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.35rem", fontWeight: 700,
            color: "var(--ls-text)",
          }}
        >
          <div
            style={{
              width: 38, height: 38, borderRadius: 11,
              background: "linear-gradient(135deg,#22c55e,#15803d)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px var(--green-glow)",
              transition: "transform .3s, box-shadow .3s",
              flexShrink: 0,
            }}
            className="logo-mark"
          >
            <Scale style={{ color: "#fff", width: 22, height: 22 }} />
          </div>
          Legal Shathi
        </a>

        {/* Desktop nav links — hidden on mobile, flex on md+ via Tailwind */}
        <ul style={{ listStyle: "none", alignItems: "center", gap: 2, margin: 0, padding: 0 }}
          className="hidden md:flex">
          {navLinks.map((l) => (
            <li key={l.label}>
              <button
                onClick={() => scrollTo(l.path)}
                style={{
                  padding: "8px 14px", borderRadius: 10, border: "none", background: "transparent",
                  fontSize: ".875rem", fontWeight: 600, color: "var(--ls-text2)",
                  cursor: "pointer", transition: "all .2s", fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
                onMouseEnter={e => { e.target.style.color = "var(--green)"; e.target.style.background = "var(--g50)"; }}
                onMouseLeave={e => { e.target.style.color = "var(--ls-text2)"; e.target.style.background = "transparent"; }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Theme toggle */}
          <button
            onClick={() => setDark(!dark)}
            style={{
              width: 40, height: 40, borderRadius: 11,
              border: "1px solid rgba(0,0,0,.08)",
              background: "var(--ls-card)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", color: "var(--ls-text)",
              transition: "all .25s",
            }}
            aria-label="Toggle theme"
          >
            {dark ? "☀️" : "🌙"}
          </button>

          {/* Profile / sign in */}
          {user ? (
            <ProfileDropdown />
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "9px 18px", borderRadius: 12, border: "1.5px solid rgba(22,163,74,.2)",
                  background: "var(--ls-card)", cursor: "pointer",
                  fontSize: ".875rem", fontWeight: 700, color: "var(--ls-text)",
                  fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .2s",
                }}
                className="hidden sm:block"
                onMouseEnter={e => { e.target.style.borderColor = "var(--green)"; e.target.style.color = "var(--green)"; }}
                onMouseLeave={e => { e.target.style.borderColor = "rgba(22,163,74,.2)"; e.target.style.color = "var(--ls-text)"; }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="btn-shimmer hidden sm:flex"
                style={{
                  padding: "9px 18px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#22c55e,#15803d)",
                  cursor: "pointer", fontSize: ".875rem", fontWeight: 700, color: "#fff",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  boxShadow: "0 4px 16px var(--green-glow)",
                  transition: "transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px var(--green-glow)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px var(--green-glow)"; }}
              >
                Get Started →
              </button>
            </>
          )}

          {/* Hamburger */}
          <button
            className="flex md:hidden flex-col gap-[5px] cursor-pointer p-2 bg-transparent border-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span style={{ width: 22, height: 2.5, background: "var(--ls-text)", borderRadius: 2, display: "block", transition: ".3s", transform: menuOpen ? "translateY(7.5px) rotate(45deg)" : "" }} />
            <span style={{ width: 22, height: 2.5, background: "var(--ls-text)", borderRadius: 2, display: "block", transition: ".3s", opacity: menuOpen ? 0 : 1, transform: menuOpen ? "scaleX(0)" : "" }} />
            <span style={{ width: 22, height: 2.5, background: "var(--ls-text)", borderRadius: 2, display: "block", transition: ".3s", transform: menuOpen ? "translateY(-7.5px) rotate(-45deg)" : "" }} />
          </button>
        </div>
      </nav>

      {/* Mobile nav overlay */}
      {menuOpen && (
        <div
          style={{
            position: "fixed", top: 64, left: 0, right: 0, bottom: 0,
            background: dark ? "var(--bg2)" : "#fff",
            zIndex: 90,
            display: "flex", flexDirection: "column",
            padding: "24px 20px", gap: 6,
            animation: "fadeUp .3s ease",
          }}
        >
          {navLinks.map((l) => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.path)}
              style={{
                padding: "14px 18px", borderRadius: 12, border: "none",
                background: "transparent", textAlign: "left",
                color: "var(--ls-text)", fontWeight: 600, fontSize: "1.05rem",
                cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
                transition: "all .2s",
              }}
              onMouseEnter={e => { e.target.style.background = "var(--g50)"; e.target.style.color = "var(--green)"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "var(--ls-text)"; }}
            >
              {l.label}
            </button>
          ))}
          <div style={{ height: 1, background: "rgba(0,0,0,.06)", margin: "8px 0" }} />
          {!user && (
            <>
              <button onClick={() => { setMenuOpen(false); navigate("/login"); }}
                style={{
                  padding: "14px 18px", borderRadius: 12, border: "none", background: "transparent",
                  textAlign: "left", color: "var(--ls-text)", fontWeight: 600, fontSize: "1.05rem",
                  cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif"
                }}>
                Sign In
              </button>
              <button onClick={() => { setMenuOpen(false); navigate("/register"); }}
                style={{
                  padding: "14px 18px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg,#22c55e,#15803d)",
                  color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans',sans-serif", marginTop: 8
                }}>
                Get Started →
              </button>
            </>
          )}
        </div>
      )}

      {/* Mobile bottom nav — rendered here so every page using <Navbar> gets it */}
      <BottomNav />
    </>
  );
};

export default Navbar;
