import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, Activity, Utensils, Users, BookOpen, Settings, LogOut, Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
                <span className="font-bold text-xl text-[#444444]">Flora 40+</span>
                <span className="text-[10px] text-[#2A8C7E] font-medium uppercase tracking-widest">Equilíbrio Interior</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-4 gap-2">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true },
                { icon: Activity, label: "Rastreador" },
                { icon: Utensils, label: "Plano Alimentar" },
                { icon: BookOpen, label: "Receitas" },
                { icon: Users, label: "Comunidade" },
              ].map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    className={`p-6 rounded-xl transition-all ${item.active ? 'bg-[#A3D9D3] text-[#2A8C7E]' : 'text-[#444444] hover:bg-[#A3D9D3]/20'}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-lg">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 border-t border-[#E8C7C8]/30">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-[#444444] p-4">
                  <Settings className="w-5 h-5" />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-red-500 p-4">
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
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
              <button className="relative p-2 text-[#444444] hover:bg-[#A3D9D3]/20 rounded-full transition-all">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-[#444444]">Maria Silva</p>
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
