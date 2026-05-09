import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import AuthPage from "./pages/AuthPage";
import Rastreador from "./pages/Rastreador";
import PlanoAlimentar from "./pages/PlanoAlimentar";
import Receitas from "./pages/Receitas";
import Comunidade from "./pages/Comunidade";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/app/*"
            element={
              <AppLayout>
                <Routes>
                  <Route path="dashboard" element={<Index />} />
                  <Route path="rastreador" element={<Rastreador />} />
                  <Route path="plano-alimentar" element={<PlanoAlimentar />} />
                  <Route path="receitas" element={<Receitas />} />
                  <Route path="comunidade" element={<Comunidade />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AppLayout>
            }
          />
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
