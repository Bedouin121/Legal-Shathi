import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import CategorySidebar from "@/components/CategorySidebar";
import FilterTabs from "@/components/FilterTabs";
import TemplateCard from "@/components/TemplateCard";
import TemplatePagination from "@/components/TemplatePagination";
import Footer from "@/components/Footer";
import { templates } from "@/data/templates";

const ITEMS_PER_PAGE = 8;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Templates");
  const [activeTab, setActiveTab] = useState("Latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Category filter
    if (activeCategory !== "All Templates") {
      result = result.filter((t) => t.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // Tab filter
    if (activeTab === "Popular") {
      result = result.filter((t) => t.isPopular);
    } else if (activeTab === "Free") {
      result = result.filter((t) => t.isFree);
    } else {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [searchQuery, activeCategory, activeTab]);

  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  const handleSearchChange = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <div className="flex flex-1">
        <CategorySidebar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <main className="flex-1 p-6">
          {/* Mobile search */}
          <div className="relative mb-6 md:hidden">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-10 border-border bg-secondary pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Legal Templates
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredTemplates.length} templates available
              </p>
            </div>
            <FilterTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          {/* Grid */}
          {paginatedTemplates.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isFavorited={favorites.has(template.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="font-display text-lg text-muted-foreground">
                No templates found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8">
            <TemplatePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
