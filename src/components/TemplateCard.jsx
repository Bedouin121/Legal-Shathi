import { Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const categoryColors = {
  Property: "bg-category-property/20 text-category-property",
  Personal: "bg-category-personal/20 text-category-personal",
  Business: "bg-category-business/20 text-category-business",
  Family: "bg-category-family/20 text-category-family",
  Employment: "bg-category-employment/20 text-category-employment",
};

const TemplateCard = ({ template, isFavorited, onToggleFavorite }) => {
  const colorClass = categoryColors[template.category];
  const templateId = template._id || template.id;
  const navigate = useNavigate();

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 animate-fade-in">
      {/* Top row */}
      <div className="mb-3 flex items-start justify-between">
        <Badge
          variant="outline"
          className={cn("border-0 text-xs font-medium", colorClass)}
        >
          {template.category}
        </Badge>
        <button
          onClick={() => onToggleFavorite(templateId)}
          className="text-muted-foreground transition-colors hover:text-destructive"
        >
          <Heart
            className={cn("h-4 w-4", isFavorited && "fill-destructive text-destructive")}
          />
        </button>
      </div>

      {/* Title */}
      <h3 className="mb-2 font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
        {template.title}
      </h3>

      {/* Description */}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {template.description}
      </p>

      {/* Language badges */}
      <div className="mb-4 flex gap-2">
        {template.languages.map((lang) => (
          <span
            key={lang}
            className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
          >
            {lang}
          </span>
        ))}
        {template.isFree && (
          <span className="rounded-md bg-category-employment/20 px-2 py-0.5 text-xs font-medium text-category-employment">
            Free
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
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TemplateCard;
