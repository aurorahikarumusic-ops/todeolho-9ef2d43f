import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, Activity, Utensils, Users, BookOpen, Settings, LogOut, Search, Bell, Home, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const menuItems = [
    { icon: Home, label: "Home", path: "/app/dashboard" },
    { icon: Activity, label: "Rastreador", path: "/app/rastreador" },
    { icon: Utensils, label: "Plano", path: "/app/plano-alimentar" },
    { icon: BookOpen, label: "Receitas", path: "/app/receitas" },
    { icon: Users, label: "Nós", path: "/app/comunidade" },
  ];

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Animated background particles effect */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#A3D9D3]/10 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-[#E8C7C8]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Mobile Header - Glassmorphism */}
        <header className="h-16 glass-morphism sticky top-0 z-50 px-4 flex items-center justify-between mx-4 my-2 rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30 shadow-sm">
              <span className="text-white font-bold text-lg italic">f</span>
            </div>
            <span className="font-display font-bold text-lg text-white">Flora 40+</span>
          </div>
          <div className="flex items-center gap-3">
             <Bell className="w-5 h-5 text-white/80" />
             <Avatar className="h-8 w-8 border border-white/30 shadow-sm">
                <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" />
                <AvatarFallback className="bg-white/10 text-white">MS</AvatarFallback>
             </Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-4 pb-28 relative z-10">
          {children}
        </main>

        {/* Bottom Navigation - Glassmorphism */}
        <nav className="fixed bottom-4 left-4 right-4 glass-morphism rounded-[2.5rem] px-2 py-2 z-50">
          <div className="flex justify-between items-center max-w-md mx-auto h-16">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.label} 
                  to={item.path}
                  className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-500 ${isActive ? 'text-white scale-110' : 'text-white/40'}`}
                >
                  <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}`}>
                    <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#F8F5F1]">
        <Sidebar className="border-r border-[#E8C7C8]/30">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2A8C7E] rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg italic">f</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-xl text-[#333333]">Flora 40+</span>
                <span className="text-[10px] text-[#2A8C7E] font-medium uppercase tracking-widest">Equilíbrio Interior</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-4 gap-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    asChild
                    className={`p-6 rounded-xl transition-all ${location.pathname === item.path ? 'bg-[#A3D9D3] text-[#2A8C7E]' : 'text-[#333333] hover:bg-[#A3D9D3]/20'}`}
                  >
                    <Link to={item.path}>
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-lg">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 border-t border-[#E8C7C8]/30">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-[#333333] p-4">
                  <Settings className="w-5 h-5" />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-red-500 p-4" asChild>
                  <Link to="/auth">
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-20 bg-white/50 backdrop-blur-md border-b border-[#E8C7C8]/20 px-8 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-[#E8C7C8]/30 w-96">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar receitas, sintomas ou dicas..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-full"
              />
            </div>
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-[#333333] hover:bg-[#A3D9D3]/20 rounded-full transition-all">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-[#333333]">Maria Silva</p>
                  <p className="text-xs text-[#2A8C7E] font-medium">Fase: Menopausa</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-[#A3D9D3]">
                  <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" />
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <div className="p-8 overflow-y-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
