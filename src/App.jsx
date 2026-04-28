import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import DocumentSign from "./pages/DocumentSign";
import NotFound from "./pages/NotFound";
import TemplateDetail from "./pages/TemplateDetail";
import AiChatbot from "./components/AiChatbot";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Templates from "./pages/Templates";
import Features from "./pages/Features";
import LegalResources from "./pages/LegalResources";
import ESignature from "./pages/ESignature";
import DocumentAnalysis from "./pages/DocumentAnalysis";
import ActivityTimeline from "./pages/ActivityTimeline";
import FindLawyer from "./pages/FindLawyer";
import CitizenProtection from "./pages/CitizenProtection";
import TemplateBulkDetail from "./pages/TemplateBulkDetail";

const queryClient = new QueryClient();

const FloatingChatbot = () => {
  const location = useLocation();
  const hidePaths = ["/chat", "/login", "/register", "/verify-otp", "/bulk-template", "/template/sign"];
  if (hidePaths.includes(location.pathname) || location.pathname.startsWith("/template/")) return null;
  return <AiChatbot />;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <>
    <FloatingChatbot />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/features" element={<Features />} />
      <Route path="/legal-resources" element={<LegalResources />} />
      <Route path="/esignature" element={<ESignature />} />
      <Route path="/citizen-protection" element={<CitizenProtection />} />
      <Route path="/find-lawyer" element={<FindLawyer />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/template/:id" element={<TemplateDetail />} />
      <Route path="/template/sign" element={<DocumentSign />} />
      <Route path="/bulk-template" element={<TemplateBulkDetail />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/analyze" element={<DocumentAnalysis />} />
      <Route path="/document-analysis" element={<DocumentAnalysis />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/analytics-dashboard" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><ActivityTimeline /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
