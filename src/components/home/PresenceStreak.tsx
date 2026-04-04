import { useState } from "react";

interface PresenceStreakProps {
  streakDays: number;
  weekActivity: boolean[];
}

const MILESTONES: Record<number, string> = {
  1: "Dia 1. Todo mundo começa assim.",
  3: "3 dias seguidos. Isso é novo.",
  7: "Uma semana inteira. Guardamos pra história.",
  14: "Duas semanas. A mãe notou. Não disse nada, mas notou.",
  30: "30 dias. Você mudou? Talvez. Não exagera.",
};

function getStreakMessage(days: number): string {
  if (days >= 30) return MILESTONES[30];
  if (days >= 14) return MILESTONES[14];
  if (days >= 7) return MILESTONES[7];
  if (days >= 3) return MILESTONES[3];
  if (days >= 1) return MILESTONES[1];
  return "Zero dias. Vamos lá.";
}

const FIRE_SIZES = ["text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl"];

function getFireIntensity(days: number) {
  if (days >= 30) return 4;
  if (days >= 14) return 3;
  if (days >= 7) return 2;
  if (days >= 3) return 1;
  return 0;
}

export default function PresenceStreak({ streakDays, weekActivity }: PresenceStreakProps) {
  const [tapped, setTapped] = useState(false);
  const msg = getStreakMessage(streakDays);
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const fireLevel = getFireIntensity(streakDays);

  const handleTap = () => {
    setTapped(true);
    setTimeout(() => setTapped(false), 700);
  };

  return (
    <div
      onClick={handleTap}
      className="relative bg-gradient-to-br from-card via-card to-muted/20 rounded-3xl p-5 shadow-lg overflow-hidden cursor-pointer select-none"
      style={{ perspective: "600px" }}
    >
      {/* Background glow */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl transition-all duration-700"
        style={{
          background: streakDays >= 7
            ? "radial-gradient(circle, rgba(249,115,22,0.25), transparent)"
            : streakDays >= 3
            ? "radial-gradient(circle, rgba(234,179,8,0.2), transparent)"
            : "radial-gradient(circle, rgba(148,163,184,0.15), transparent)",
        }}
      />

      {/* Header with 3D fire */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div
          className={`relative transition-transform duration-300 ${tapped ? "scale-125 -rotate-6" : ""}`}
          style={{
            transform: tapped ? "translateZ(30px) scale(1.25) rotate(-6deg)" : "translateZ(10px)",
            filter: streakDays >= 3 ? `drop-shadow(0 0 ${4 + fireLevel * 3}px rgba(249,115,22,0.5))` : "none",
          }}
        >
          <span className={`${FIRE_SIZES[fireLevel]} inline-block`}>
            {streakDays >= 7 ? "🔥" : streakDays >= 3 ? "🔥" : streakDays >= 1 ? "✨" : "💤"}
          </span>
          {streakDays >= 14 && (
            <span className="absolute -top-1 -right-2 text-sm animate-pulse">⚡</span>
          )}
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-display text-3xl font-black"
              style={{
                background: streakDays >= 7
                  ? "linear-gradient(135deg, #f97316, #ef4444)"
                  : streakDays >= 3
                  ? "linear-gradient(135deg, #eab308, #f97316)"
                  : "linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--muted-foreground)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {streakDays}
            </span>
            <span className="font-display text-sm font-bold text-muted-foreground">dias</span>
          </div>
          <span className="font-body text-[10px] text-muted-foreground/70 uppercase tracking-widest">
            de sequência
          </span>
        </div>
      </div>

      {/* 3D Week blocks */}
      <div className="flex items-end justify-between gap-1.5 mb-4 px-1">
        {weekActivity.map((active, i) => {
          const isToday = i === weekActivity.length - 1;
          const height = active ? 48 + (i * 4) : 28;
          const delay = i * 80;

          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className="w-full rounded-xl relative overflow-hidden transition-all duration-500"
                style={{
                  height: `${height}px`,
                  transitionDelay: `${delay}ms`,
                  transform: isToday && tapped ? "translateY(-4px) scale(1.05)" : "translateY(0)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* 3D block face */}
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: active
                      ? isToday
                        ? "linear-gradient(180deg, #f97316, #ea580c)"
                        : "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))"
                      : "linear-gradient(180deg, hsl(var(--muted)), hsl(var(--muted) / 0.5))",
                    boxShadow: active
                      ? isToday
                        ? "0 4px 12px rgba(249,115,22,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                        : "0 3px 8px hsl(var(--primary) / 0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
                      : "0 2px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                />
                {/* 3D top face illusion */}
                <div
                  className="absolute top-0 left-0 right-0 h-2 rounded-t-xl"
                  style={{
                    background: active
                      ? isToday
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(255,255,255,0.15)"
                      : "rgba(255,255,255,0.08)",
                  }}
                />
                {/* Check/icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {active ? (
                    <span className="text-white font-bold text-xs drop-shadow-sm">
                      {isToday ? "🔥" : "✓"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40 text-[10px]">·</span>
                  )}
                </div>
              </div>
              <span
                className={`text-[9px] font-display font-medium tracking-wide ${
                  isToday ? "text-orange-500 font-bold" : active ? "text-foreground/70" : "text-muted-foreground/50"
                }`}
              >
                {days[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar to next milestone */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] font-display text-muted-foreground/60 uppercase tracking-wider">
            Próximo marco
          </span>
          <span className="text-[9px] font-display text-muted-foreground/60">
            {streakDays >= 30 ? "🏆 Lendário" : streakDays >= 14 ? "30 dias" : streakDays >= 7 ? "14 dias" : streakDays >= 3 ? "7 dias" : "3 dias"}
          </span>
        </div>
        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min(100, (() => {
                if (streakDays >= 30) return 100;
                if (streakDays >= 14) return ((streakDays - 14) / 16) * 100;
                if (streakDays >= 7) return ((streakDays - 7) / 7) * 100;
                if (streakDays >= 3) return ((streakDays - 3) / 4) * 100;
                return (streakDays / 3) * 100;
              })())}%`,
              background: streakDays >= 7
                ? "linear-gradient(90deg, #f97316, #ef4444)"
                : streakDays >= 3
                ? "linear-gradient(90deg, #eab308, #f97316)"
                : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)))",
            }}
          />
        </div>
      </div>

      {/* Message */}
      <p className="font-body text-xs italic text-muted-foreground relative z-10">
        "{msg}"
      </p>

      {/* Tap hint */}
      <p className="text-[8px] text-muted-foreground/40 mt-2 font-body text-center animate-pulse">
        👆 Toque pra acender a chama
      </p>
    </div>
  );
}
