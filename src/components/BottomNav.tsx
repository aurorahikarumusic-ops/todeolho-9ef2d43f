import { useLocation, useNavigate } from "react-router-dom";
import { Home, CalendarDays, CheckSquare, Trophy, User, FileText, Gem, Gavel, Megaphone } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

function triggerHaptic() {
  if ("vibrate" in navigator) {
    navigator.vibrate(10);
  }
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  const isMom = profile?.role === "mae";
  const isAvo = profile?.role === "avo";

  const NAV_ITEMS = isAvo
    ? [
        { path: "/app", icon: Home, label: "Home" },
        { path: "/palpites", icon: Megaphone, label: "Mural", neon: true },
        { path: "/ranking", icon: Trophy, label: "Ranking" },
        { path: "/perfil", icon: User, label: "Perfil" },
      ]
    : isMom
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

  const accentColor = isAvo ? "text-avo" : isMom ? "text-mom" : "text-primary";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="max-w-lg mx-auto flex">
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
              className={`flex-1 flex flex-col items-center py-3 transition-colors active:scale-95 ${
                isNeon
                  ? active
                    ? "text-primary"
                    : "text-primary/70 hover:text-primary"
                  : active
                    ? accentColor
                    : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div>
                <Icon className={`w-5 h-5 relative ${active ? "stroke-[2.5]" : ""}`} />
              </div>
              <span className="text-[10px] font-body font-semibold mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
