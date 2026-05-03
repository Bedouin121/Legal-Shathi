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
<<<<<<< Updated upstream
import DocumentSign from "./pages/DocumentSign";
import NotFound from "./pages/NotFound";
import TemplateDetail from "./pages/TemplateDetail";
=======
import SignDocumentPage from "./pages/SignDocumentPage";
import SignDocumentSecondPage from "./pages/SignDocumentSecondPage";
import NotFound from "./pages/NotFound";
import Templates from "./pages/Templates";
import TemplateDetail from "./pages/TemplateDetail";
import Features from "./pages/Features";
import LegalResources from "./pages/LegalResources";
import ESignature from "./pages/ESignature";
>>>>>>> Stashed changes
import AiChatbot from "./components/AiChatbot";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

const queryClient = new QueryClient();

const FloatingChatbot = () => {
  const location = useLocation();
  const hidePaths = ["/chat", "/login", "/register", "/verify-otp", "/template/sign"];
  if (hidePaths.includes(location.pathname) || location.pathname.startsWith("/template/")) return null;
  return <AiChatbot />;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirects authenticated users away from auth pages)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => (
  <>
    <FloatingChatbot />
    <Routes>
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
<<<<<<< Updated upstream
      <Route path="/template/sign" element={<DocumentSign />} />
=======
      <Route path="/features" element={<ProtectedRoute><Features /></ProtectedRoute>} />
      <Route path="/legal-resources" element={<ProtectedRoute><LegalResources /></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
      <Route path="/esignature" element={<ProtectedRoute><ESignature /></ProtectedRoute>} />
      <Route path="/sign/:documentId/:token" element={<SignDocumentPage />} />
      <Route path="/sign-second/:documentId/:token" element={<SignDocumentSecondPage />} />
>>>>>>> Stashed changes
      <Route path="/template/:id" element={<ProtectedRoute><TemplateDetail /></ProtectedRoute>} />
      <Route path="/analytics-dashboard" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
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
