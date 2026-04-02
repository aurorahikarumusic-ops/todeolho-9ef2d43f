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
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">👀</div>
          <p className="font-display text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
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
        <Route path="/role" element={<RoleSelection />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/tarefas" element={<Tarefas />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/perfil" element={<Perfil />} />
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
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
