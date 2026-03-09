import {
  FileText,
  Briefcase,
  User,
  Home,
  Users,
  Building2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const categoryIcons = {
  "All Templates": FileText,
  Business: Briefcase,
  Personal: User,
  Property: Home,
  Family: Users,
  Employment: Building2,
};

const categories = [
  "All Templates",
  "Business",
  "Personal",
  "Property",
  "Family",
  "Employment",
];

const CategorySidebar = ({ activeCategory, onCategoryChange }) => {
  const navigate = useNavigate();
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card/50 lg:block">
      <div className="flex h-full flex-col p-4">
        <h2 className="mb-4 px-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h2>
        <nav className="flex flex-col gap-1">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {cat}
              </button>
            );
          })}
        </nav>

        {/* AI Assistant CTA */}
        <div className="mt-auto rounded-xl border border-border bg-secondary/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-display text-sm font-semibold text-foreground">
              Need help?
            </span>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Consult our AI legal assistant for guidance on choosing the right template.
          </p>
          <Button size="sm" onClick={() => navigate("/chat")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Ask AI Shathi
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default CategorySidebar;
