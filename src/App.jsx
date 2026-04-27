import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
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

const queryClient = new QueryClient();

const FloatingChatbot = () => {
  const location = useLocation();
  const hidePaths = ["/chat", "/login", "/register"];
  if (hidePaths.includes(location.pathname) || location.pathname.startsWith("/template/")) return null;
  return <AiChatbot />;
};

const AppRoutes = () => (
  <>
    <FloatingChatbot />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/features" element={<Features />} />
      <Route path="/legal-resources" element={<LegalResources />} />
      <Route path="/esignature" element={<ESignature />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/template/:id" element={<TemplateDetail />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/analyze" element={<DocumentAnalysis />} />
      <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
      <Route path="/activity" element={<ActivityTimeline />} />
      <Route path="/find-lawyer" element={<FindLawyer />} />
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
