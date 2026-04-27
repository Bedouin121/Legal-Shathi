import { Heart, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categoryColors = {
  Property:   "bg-category-property/20 text-category-property",
  Personal:   "bg-category-personal/20 text-category-personal",
  Business:   "bg-category-business/20 text-category-business",
  Family:     "bg-category-family/20 text-category-family",
  Employment: "bg-category-employment/20 text-category-employment",
};

const categoryEmoji = {
  Property:   "🏠",
  Personal:   "👤",
  Business:   "💼",
  Family:     "👨‍👩‍👧",
  Employment: "📋",
};

const langConfig = {
  EN: { label: "English", flag: "🇬🇧" },
  BN: { label: "বাংলা",  flag: "🇧🇩" },
};

const TemplateCard = ({ template, isFavorited, onToggleFavorite }) => {
  const colorClass  = categoryColors[template.category];
  const emoji       = categoryEmoji[template.category] || "📄";
  const templateId  = template._id || template.id;
  const navigate    = useNavigate();

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 animate-fade-in relative overflow-hidden">
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-primary/[0.03] to-transparent" />

      {/* Top row: category + favorite */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge
          variant="outline"
          className={cn("border-0 text-xs font-medium gap-1", colorClass)}
        >
          <span>{emoji}</span>
          {template.category}
        </Badge>
        <button
          onClick={() => onToggleFavorite(templateId)}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          className={cn(
            "transition-all flex items-center gap-1 text-xs rounded-full px-2 py-0.5",
            isFavorited
              ? "text-destructive bg-destructive/10"
              : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", isFavorited && "fill-destructive")} />
          {isFavorited ? "Saved" : "Save"}
        </button>
      </div>

      {/* Title */}
      <h3 className="mb-2 font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {template.title}
      </h3>

      {/* Description */}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {template.description}
      </p>

      {/* Badges row: language + free + popular */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(template.languages || []).map((lang) => {
          const cfg = langConfig[lang] || { label: lang, flag: "🌐" };
          return (
            <span
              key={lang}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium border",
                lang === "BN"
                  ? "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400"
                  : "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400"
              )}
            >
              {cfg.flag} {cfg.label}
            </span>
          );
        })}
        {template.isFree && (
          <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium">
            ✓ Free
          </span>
        )}
        {template.isPopular && (
          <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Popular
          </span>
        )}
      </div>

      {/* CTA */}
      <Button
        variant="ghost"
        className="w-full justify-between border border-border text-sm text-primary hover:bg-primary/10 hover:text-primary"
        onClick={() => navigate(`/template/${templateId}`)}
      >
        View Template
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
};

export default TemplateCard;
