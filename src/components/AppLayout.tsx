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
      <div className="min-h-screen bg-[#F8F5F1] flex flex-col">
        {/* Mobile Header */}
        <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-[#E8C7C8]/20 px-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2A8C7E] rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg italic">f</span>
            </div>
            <span className="font-bold text-lg text-[#333333]">Flora 40+</span>
          </div>
          <div className="flex items-center gap-3">
             <Bell className="w-5 h-5 text-[#333333]" />
             <Avatar className="h-8 w-8 border border-[#A3D9D3]">
                <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" />
                <AvatarFallback>MS</AvatarFallback>
             </Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#E8C7C8]/30 px-2 pb-6 pt-2 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center max-w-md mx-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.label} 
                  to={item.path}
                  className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-300 ${isActive ? 'text-[#2A8C7E]' : 'text-gray-400'}`}
                >
                  <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-[#A3D9D3]/30 scale-110' : ''}`}>
                    <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {item.label}
                  </span>
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
