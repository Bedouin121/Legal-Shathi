import { cn } from "@/lib/utils";

const tabs = ["Latest", "Popular", "Free"];

const FilterTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-all",
            activeTab === tab
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
