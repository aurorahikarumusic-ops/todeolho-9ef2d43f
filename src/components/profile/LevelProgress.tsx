import { getDadTitle } from "@/lib/constants";

interface LevelProgressProps {
  points: number;
}

export default function LevelProgress({ points }: LevelProgressProps) {
  const dadTitle = getDadTitle(points);

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{
      background: "linear-gradient(135deg, hsl(var(--dad-accent) / 0.06), hsl(var(--card)))",
      border: "1px solid hsl(var(--dad-border) / 0.4)",
      boxShadow: "0 8px 32px hsl(var(--dad-accent) / 0.08)",
    }}>
      <div className="p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-bold text-sm">{dadTitle.emoji} {dadTitle.title}</span>
          <span className="text-xs font-body text-muted-foreground">{points} pts</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
          <div className="h-full rounded-full transition-all duration-1000" style={{
            width: `${Math.min(100, (points % 200) / 2)}%`,
            background: "linear-gradient(90deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))",
          }} />
        </div>
        <p className="text-[10px] font-body italic mt-2 text-muted-foreground">
          {points < 200 ? "Próximo: 'Pai Tentando' — 201 pts"
            : points < 500 ? "Próximo: 'Pai Promissor' — 501 pts"
            : points < 900 ? "Próximo: 'Pai de Verdade' — 901 pts"
            : points < 1400 ? "Próximo: 'Pai Lendário' — 1401 pts"
            : "Você é lendário. Isso não deveria existir."}
        </p>
      </div>
    </div>
  );
}
