import { useLocation, useNavigate } from "react-router-dom";
import { Home, CalendarDays, CheckSquare, Trophy, User, FileText, Eye, Gem, Gavel } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useDeviceType } from "@/hooks/useDeviceType";
import BottomNav from "./BottomNav";

function triggerHaptic() {
  if ("vibrate" in navigator) navigator.vibrate(10);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const device = useDeviceType();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const isMom = profile?.role === "mae";

  const NAV_ITEMS = isMom
    ? [
        { path: "/app", icon: Home, label: "Home" },
        { path: "/agenda", icon: CalendarDays, label: "Agenda" },
        { path: "/mural", icon: Gem, label: "Pérolas", neon: true },
        { path: "/tarefas", icon: CheckSquare, label: "Tarefas" },
        { path: "/avaliacao", icon: FileText, label: "Avaliar" },
      ]
    : [
        { path: "/app", icon: Home, label: "Home" },
        { path: "/agenda", icon: CalendarDays, label: "Agenda" },
        { path: "/mural", icon: Gavel, label: "Réus", neon: true },
        { path: "/tarefas", icon: CheckSquare, label: "Tarefas" },
        { path: "/ranking", icon: Trophy, label: "Ranking" },
      ];

  const accentColor = "text-primary";

  // Mobile: bottom nav only
  if (device === "mobile") {
    return (
      <>
        {children}
        <BottomNav />
      </>
    );
  }

  // Tablet / Desktop: sidebar + content
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 w-20 lg:w-56 bg-card border-r border-border flex flex-col items-center lg:items-stretch py-6 px-2 lg:px-4 gap-1 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start px-2">
          <Eye className="w-7 h-7 text-primary" />
          <span className="hidden lg:inline font-display text-lg font-bold">
            Estou de <span className="text-secondary">Olho</span>
          </span>
        </div>

        {NAV_ITEMS.map(({ path, icon: Icon, label, neon }: any) => {
          const active = location.pathname === path;
          const isNeon = !!neon;
          return (
            <button
              key={path}
              onClick={() => {
                triggerHaptic();
                navigate(path);
              }}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm font-body font-semibold justify-center lg:justify-start ${
                isNeon
                  ? active
                    ? "text-primary bg-primary/10"
                    : "text-primary/70 hover:text-primary hover:bg-primary/5"
                  : active
                    ? `${accentColor} bg-muted`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "stroke-[2.5]" : ""}`} />
              <span className="hidden lg:inline">{label}</span>
            </button>
          );
        })}
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-20 lg:ml-56">
        {children}
      </main>
    </div>
  );
}
