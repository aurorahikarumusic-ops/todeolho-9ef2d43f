interface PresenceStreakProps {
  streakDays: number;
  /** Array of 7 booleans, most recent last. true = active that day */
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

export default function PresenceStreak({ streakDays, weekActivity }: PresenceStreakProps) {
  const msg = getStreakMessage(streakDays);
  const days = ["S", "T", "Q", "Q", "S", "S", "D"];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔥</span>
        <span className="font-display text-lg font-bold">{streakDays} dias</span>
        <span className="font-body text-xs text-muted-foreground ml-1">de sequência</span>
      </div>
      <div className="flex items-center justify-between gap-1 mb-3">
        {weekActivity.map((active, i) => {
          const isToday = i === weekActivity.length - 1;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-body text-muted-foreground">{days[i]}</span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isToday
                    ? "bg-secondary text-secondary-foreground ring-2 ring-secondary/30"
                    : active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {active ? "✓" : "·"}
              </div>
            </div>
          );
        })}
      </div>
      <p className="font-body text-xs italic text-muted-foreground">{msg}</p>
    </div>
  );
}
