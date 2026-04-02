import { useEffect, useState } from "react";

interface DadGaugeProps {
  percentage: number;
}

const LEVELS = [
  { max: 20, title: "Pai Fantasma", subtitle: "Você existe em fotos. Só em fotos.", emoji: "👻" },
  { max: 40, title: "Pai Decorativo", subtitle: "Presente fisicamente. Ausente em tudo mais.", emoji: "🪑" },
  { max: 60, title: "Pai Tentando", subtitle: "Esforço visível. Resultado questionável.", emoji: "🤔" },
  { max: 80, title: "Pai Promissor", subtitle: "Tá melhorando. Não conta pra ninguém.", emoji: "💪" },
  { max: 99, title: "Pai de Verdade", subtitle: "Quase lá. Quase.", emoji: "⭐" },
  { max: 100, title: "Pai Lendário", subtitle: "Isso não existe. Mas parabéns.", emoji: "🏆" },
];

function getLevel(pct: number) {
  return LEVELS.find((l) => pct <= l.max) || LEVELS[LEVELS.length - 1];
}

export default function DadGauge({ percentage }: DadGaugeProps) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const clamped = Math.min(100, Math.max(0, percentage));
  const level = getLevel(clamped);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedPct(clamped), 200);
    return () => clearTimeout(timeout);
  }, [clamped]);

  // Semicircle gauge: angle from -90 to 90 degrees (left to right)
  const angle = -90 + (animatedPct / 100) * 180;
  const needleRad = (angle * Math.PI) / 180;
  const needleLen = 70;
  const cx = 100, cy = 95;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm text-center">
      <p className="font-display text-sm text-muted-foreground mb-2">Termômetro do Pai</p>
      <div className="relative mx-auto" style={{ width: 200, height: 115 }}>
        <svg viewBox="0 0 200 115" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--secondary))" />
              <stop offset="50%" stopColor="hsl(43 100% 84%)" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d="M 15 95 A 85 85 0 0 1 185 95"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 15 95 A 85 85 0 0 1 185 95"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(animatedPct / 100) * 267} 267`}
            className="transition-all duration-1000 ease-out"
          />
          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke="hsl(var(--foreground))"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <circle cx={cx} cy={cy} r="5" fill="hsl(var(--foreground))" />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="font-display text-2xl font-bold">{clamped}%</span>
        </div>
      </div>
      <p className="font-display text-lg font-bold mt-1">
        {level.emoji} {level.title}
      </p>
      <p className="font-body text-xs italic text-muted-foreground mt-0.5">
        {level.subtitle}
      </p>
    </div>
  );
}
