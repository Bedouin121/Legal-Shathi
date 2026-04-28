import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Bot, FileText, Home, ShieldAlert, User } from "lucide-react";

const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FileText, label: "Templates", path: "/templates" },
  { icon: ShieldAlert, label: "Safety", path: "/citizen-protection" },
  { icon: Bot, label: "AI Chat", path: "/chat" },
  { icon: User, label: "Account", path: "__account__" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNav = (path) => {
    if (path === "__account__") {
      navigate(user ? "/activity" : "/login");
    } else {
      navigate(path);
    }
  };

  const getActivePath = (path) => {
    if (path === "__account__") return location.pathname === "/activity" || location.pathname === "/login";
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
        const active = getActivePath(path);
        return (
          <button
            key={label}
            onClick={() => handleNav(path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "6px 0",
              color: active ? "var(--green)" : "var(--ls-text2)",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontSize: ".65rem",
              fontWeight: 600,
              transition: "color .2s",
            }}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform .2s",
                transform: active ? "translateY(-2px) scale(1.15)" : "",
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.6 : 2.1} />
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
