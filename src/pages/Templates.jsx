import { useState, useEffect } from "react";
import { Search, Globe, BookOpen, Star, Scale, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import CategorySidebar from "@/components/CategorySidebar";
import TemplateCard from "@/components/TemplateCard";
import TemplatePagination from "@/components/TemplatePagination";
import Footer from "@/components/Footer";
import { templateAPI, favoriteAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 8;

const FILTER_TABS = [
  { id: "Latest",  label: "Latest",   icon: BookOpen },
  { id: "Popular", label: "Popular",  icon: Star },
  { id: "Free",    label: "Free",     icon: null },
  { id: "Bengali", label: "বাংলা",    icon: Globe },
  { id: "English", label: "English",  icon: Globe },
];

const Templates = () => {
  const { user, updateFavorites } = useAuth();
  const [searchQuery, setSearchQuery]     = useState("");
  const [activeCategory, setActiveCategory] = useState("All Templates");
  const [activeTab, setActiveTab]         = useState("Latest");
  const [currentPage, setCurrentPage]     = useState(1);
  const [templates, setTemplates]         = useState([]);
  const [totalPages, setTotalPages]       = useState(1);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [favorites, setFavorites]         = useState(new Set());

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
  const handleTabChange      = (tab) => { setActiveTab(tab);      setCurrentPage(1); };
  const handleSearchChange   = (q)   => { setSearchQuery(q);      setCurrentPage(1); };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <div className="flex flex-1" style={{ paddingTop: 64 }}>
        <CategorySidebar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

        <main className="flex-1 p-4 sm:p-6">
          {/* Mobile search */}
          <div className="relative mb-5 md:hidden">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-10 border-border bg-secondary pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Header */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Legal Templates</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {loading ? "Loading…" : `${total} template${total !== 1 ? "s" : ""} available`}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all",
                    activeTab === id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter indicator */}
          {(activeCategory !== "All Templates" || activeTab !== "Latest" || searchQuery) && (
            <div className="mb-4 flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
              <span>Filtering by:</span>
              {activeCategory !== "All Templates" && (
                <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 border border-primary/20">
                  📁 {activeCategory}
                </span>
              )}
              {activeTab !== "Latest" && (
                <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 border border-primary/20">
                  {activeTab === "Bengali" ? "🇧🇩 Bengali" : activeTab === "English" ? "🇬🇧 English" : `⭐ ${activeTab}`}
                </span>
              )}
              {searchQuery && (
                <span className="bg-amber-500/10 text-amber-600 rounded-full px-2.5 py-0.5 border border-amber-500/20">
                  🔍 "{searchQuery}"
                </span>
              )}
              <button
                onClick={() => { handleCategoryChange("All Templates"); handleTabChange("Latest"); handleSearchChange(""); }}
                className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear all ×
              </button>
            </div>
          )}

          {/* Find Lawyer CTA Banner */}
          <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-900 p-6 sm:p-8 text-white shadow-lg border border-emerald-700/50">
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2 text-emerald-300">
                  <Scale className="h-5 w-5" />
                  <span className="text-xs font-semibold tracking-wider uppercase">Professional Legal Services</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Need a custom legal document?</h2>
                <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                  While our AI templates cover standard needs, complex legal matters require an expert touch. Connect with top-rated, verified lawyers across Bangladesh for personalized drafting and consultation.
                </p>
              </div>
              <Link 
                to="/find-lawyer" 
                className="shrink-0 group inline-flex items-center justify-center gap-2 bg-white text-emerald-900 font-semibold px-6 py-3.5 rounded-xl hover:bg-emerald-50 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-xl active:scale-95"
              >
                Find a Lawyer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
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
              <div className="text-5xl mb-4">📄</div>
              <p className="font-display text-lg text-muted-foreground">No templates found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
              <button
                onClick={() => { handleCategoryChange("All Templates"); handleTabChange("Latest"); handleSearchChange(""); }}
                className="mt-4 text-xs text-primary hover:underline"
              >
                Clear all filters
              </button>
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
