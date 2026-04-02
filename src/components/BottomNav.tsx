import { useLocation, useNavigate } from "react-router-dom";
import { Home, CalendarDays, CheckSquare, Trophy, User } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/agenda", icon: CalendarDays, label: "Agenda" },
  { path: "/tarefas", icon: CheckSquare, label: "Tarefas" },
  { path: "/ranking", icon: Trophy, label: "Ranking" },
  { path: "/perfil", icon: User, label: "Perfil" },
] as const;

function triggerHaptic() {
  if ("vibrate" in navigator) {
    navigator.vibrate(10);
  }
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => {
                triggerHaptic();
                navigate(path);
              }}
              className={`flex-1 flex flex-col items-center py-3 transition-colors active:scale-95 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-body font-semibold mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
