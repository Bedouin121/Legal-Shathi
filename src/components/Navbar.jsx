import { Search, Bell, Heart, Scale, Sparkles, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Navbar = ({ searchQuery, onSearchChange }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Legal Shathi
          </span>
        </div>

        {/* Search */}
        <div className="hidden max-w-md flex-1 px-8 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 border-border bg-secondary pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* AI Chat Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chat")}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Ask AI Shathi
          </Button>

          {user ? (
            <>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/")}>
                <Heart className="h-5 w-5" />
              </Button>
              <div className="relative group">
                <Avatar className="h-9 w-9 cursor-pointer border-2 border-border">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {/* Dropdown */}
                <div className="absolute right-0 top-12 hidden group-hover:flex flex-col w-48 rounded-xl border border-border bg-card shadow-xl p-2 z-50">
                  <p className="px-3 py-2 text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="px-3 pb-2 text-xs text-muted-foreground truncate">{user.email}</p>
                  <hr className="border-border my-1" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
