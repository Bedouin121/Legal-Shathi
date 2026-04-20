import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import CategorySidebar from "@/components/CategorySidebar";
import FilterTabs from "@/components/FilterTabs";
import TemplateCard from "@/components/TemplateCard";
import TemplatePagination from "@/components/TemplatePagination";
import Footer from "@/components/Footer";
import { templateAPI, favoriteAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const ITEMS_PER_PAGE = 8;

const Templates = () => {
  const { user, updateFavorites } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Templates");
  const [activeTab, setActiveTab] = useState("Latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: ITEMS_PER_PAGE };
        if (activeCategory !== "All Templates") params.category = activeCategory;
        if (searchQuery.trim()) params.search = searchQuery;
        if (activeTab !== "Latest") params.tab = activeTab;
        const data = await templateAPI.getAll(params);
        setTemplates(data.templates);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [searchQuery, activeCategory, activeTab, currentPage]);

  useEffect(() => {
    if (user?.favorites) {
      setFavorites(new Set(user.favorites.map((f) => (typeof f === "string" ? f : f._id))));
    }
  }, [user]);

  const toggleFavorite = async (id) => {
    if (!user) return;
    const isFav = favorites.has(id);
    setFavorites((prev) => { const n = new Set(prev); isFav ? n.delete(id) : n.add(id); return n; });
    try {
      const res = isFav ? await favoriteAPI.remove(id) : await favoriteAPI.add(id);
      updateFavorites(res.favorites);
    } catch {
      setFavorites((prev) => { const n = new Set(prev); isFav ? n.add(id) : n.delete(id); return n; });
    }
  };

  const handleCategoryChange = (cat) => { setActiveCategory(cat); setCurrentPage(1); };
  const handleTabChange = (tab) => { setActiveTab(tab); setCurrentPage(1); };
  const handleSearchChange = (q) => { setSearchQuery(q); setCurrentPage(1); };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <div className="flex flex-1" style={{ paddingTop: 64 }}>
        <CategorySidebar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

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

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Legal Templates</h1>
              <p className="mt-1 text-sm text-muted-foreground">{total} templates available</p>
            </div>
            <FilterTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-card" />
              ))}
            </div>
          ) : templates.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  isFavorited={favorites.has(template._id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="font-display text-lg text-muted-foreground">No templates found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}

          <div className="mt-8">
            <TemplatePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Templates;
