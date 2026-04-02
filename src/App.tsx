import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import AuthPage from "./pages/AuthPage";
import RoleSelection from "./pages/RoleSelection";
import Dashboard from "./pages/Dashboard";
import Ranking from "./pages/Ranking";
import ComingSoon from "./pages/ComingSoon";
import Agenda from "./pages/Agenda";
import Tarefas from "./pages/Tarefas";
import Perfil from "./pages/Perfil";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import DataDeletion from "./pages/DataDeletion";
import Support from "./pages/Support";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Onboarding from "./pages/Onboarding";
import SwUpdateToast from "./components/SwUpdateToast";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">👁️</div>
          <h1 className="font-display text-xl font-bold text-primary">Estou de Olho</h1>
          <p className="font-body text-sm text-muted-foreground italic">
            Calma, estamos conferindo se você esqueceu algo.
          </p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "200ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "400ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsOfUse />} />
        <Route path="/exclusao-dados" element={<DataDeletion />} />
        <Route path="/suporte" element={<Support />} />
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  // New user needs role selection - check if default role unchanged and no explicit selection
  if (profile && profile.role === "pai" && profile.points === 0 && profile.display_name === profile.display_name) {
    // Show role selection for new users (we'll use a simple heuristic - created in the last minute)
    const createdRecently = new Date(profile.created_at).getTime() > Date.now() - 60000;
    // Actually, let's just show the app - role selection can be done from profile later
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/role" element={<RoleSelection />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/tarefas" element={<Tarefas />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsOfUse />} />
        <Route path="/exclusao-dados" element={<DataDeletion />} />
        <Route path="/suporte" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SwUpdateToast />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
