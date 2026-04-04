import { useEffect, useState, useRef } from "react";

interface DadGaugeProps {
  percentage: number;
}

const LEVELS = [
  { max: 20, title: "Pai Fantasma", subtitle: "Você existe em fotos. Só em fotos.", emoji: "👻", color: "#ef4444" },
  { max: 40, title: "Pai Decorativo", subtitle: "Presente fisicamente. Ausente em tudo mais.", emoji: "🪑", color: "#f97316" },
  { max: 60, title: "Pai Tentando", subtitle: "Esforço visível. Resultado questionável.", emoji: "🤔", color: "#eab308" },
  { max: 80, title: "Pai Promissor", subtitle: "Tá melhorando. Não conta pra ninguém.", emoji: "💪", color: "#22c55e" },
  { max: 99, title: "Pai de Verdade", subtitle: "Quase lá. Quase.", emoji: "⭐", color: "#14b8a6" },
  { max: 100, title: "Pai Lendário", subtitle: "Isso não existe. Mas parabéns.", emoji: "🏆", color: "#8b5cf6" },
];

function getLevel(pct: number) {
  return LEVELS.find((l) => pct <= l.max) || LEVELS[LEVELS.length - 1];
}

export default function DadGauge({ percentage }: DadGaugeProps) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [tapped, setTapped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const clamped = Math.min(100, Math.max(0, percentage));
  const level = getLevel(clamped);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedPct(clamped);
      setTimeout(() => setShowEmoji(true), 800);
    }, 300);
    return () => clearTimeout(timeout);
  }, [clamped]);

  const handleTap = () => {
    setTapped(true);
    setTimeout(() => setTapped(false), 600);
  };

  // Semicircle gauge math
  const angle = -90 + (animatedPct / 100) * 180;
  const needleRad = (angle * Math.PI) / 180;
  const needleLen = 68;
  const cx = 120, cy = 110;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  // Tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const tickAngle = -90 + i * 18;
    const rad = (tickAngle * Math.PI) / 180;
    const innerR = 78;
    const outerR = i % 5 === 0 ? 92 : 86;
    return {
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
      major: i % 5 === 0,
    };
  });

  // Zone labels
  const zones = [
    { label: "😴", angle: -72 },
    { label: "😬", angle: -36 },
    { label: "🤷", angle: 0 },
    { label: "😎", angle: 36 },
    { label: "🔥", angle: 72 },
  ];

  return (
    <div
      ref={containerRef}
      onClick={handleTap}
      className="relative bg-gradient-to-br from-card via-card to-muted/30 rounded-3xl p-5 shadow-lg text-center cursor-pointer select-none overflow-hidden group"
      style={{
        perspective: "800px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* 3D floating background shapes */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-xl"
        style={{
          background: `radial-gradient(circle, ${level.color}, transparent)`,
          transition: "background 1s ease",
        }}
      />
      <div
        className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-15 blur-lg"
        style={{
          background: `radial-gradient(circle, ${level.color}, transparent)`,
          transition: "background 1s ease",
        }}
      />

      {/* Title with 3D effect */}
      <p
        className="font-display text-sm text-muted-foreground mb-3 tracking-wider uppercase"
        style={{
          textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          transform: "translateZ(20px)",
        }}
      >
        ⚡ Termômetro do Pai
      </p>

      {/* 3D Gauge Container */}
      <div
        className="relative mx-auto transition-transform duration-300"
        style={{
          width: 240,
          height: 140,
          transform: tapped
            ? "rotateX(10deg) scale(1.05)"
            : "rotateX(5deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <svg viewBox="0 0 240 140" className="w-full h-full" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}>
          <defs>
            <linearGradient id="gaugeGrad3d" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="gaugeBg3d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow3d">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="needleShadow">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.3" />
            </filter>
            {/* 3D metallic effect for center */}
            <radialGradient id="centerMetal" cx="40%" cy="35%">
              <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.9" />
              <stop offset="50%" stopColor="hsl(var(--foreground))" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Outer shadow ring for 3D depth */}
          <path
            d="M 22 110 A 98 98 0 0 1 218 110"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Background arc - 3D look */}
          <path
            d="M 25 110 A 95 95 0 0 1 215 110"
            fill="none"
            stroke="url(#gaugeBg3d)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Colored arc with glow */}
          <path
            d="M 25 110 A 95 95 0 0 1 215 110"
            fill="none"
            stroke="url(#gaugeGrad3d)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${(animatedPct / 100) * 298} 298`}
            filter="url(#glow3d)"
            className="transition-all duration-[1200ms] ease-out"
          />

          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1} y1={tick.y1}
              x2={tick.x2} y2={tick.y2}
              stroke="hsl(var(--foreground))"
              strokeWidth={tick.major ? "2" : "1"}
              opacity={tick.major ? "0.5" : "0.25"}
              strokeLinecap="round"
            />
          ))}

          {/* Zone emoji labels */}
          {zones.map((zone, i) => {
            const rad = (zone.angle * Math.PI) / 180;
            const labelR = 62;
            const lx = cx + labelR * Math.cos(rad);
            const ly = cy + labelR * Math.sin(rad);
            return (
              <text
                key={i}
                x={lx} y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                opacity="0.7"
              >
                {zone.label}
              </text>
            );
          })}

          {/* Needle with 3D shadow */}
          <g filter="url(#needleShadow)" className="transition-all duration-[1200ms] ease-out">
            {/* Needle body - tapered */}
            <polygon
              points={`${cx - 3},${cy + 2} ${cx + 3},${cy + 2} ${nx},${ny}`}
              fill={level.color}
              opacity="0.9"
              className="transition-all duration-[1200ms] ease-out"
            />
            {/* Needle tip */}
            <circle
              cx={nx} cy={ny} r="3"
              fill={level.color}
              className="transition-all duration-[1200ms] ease-out"
            />
          </g>

          {/* Center hub - metallic 3D look */}
          <circle cx={cx} cy={cy} r="10" fill="url(#centerMetal)" />
          <circle cx={cx} cy={cy} r="6" fill="hsl(var(--card))" />
          <circle cx={cx} cy={cy} r="3" fill="hsl(var(--foreground))" opacity="0.6" />
        </svg>

      </div>

      {/* Percentage display below gauge */}
      <div className="mt-1 flex justify-center">
        <span
          className="font-display text-3xl font-black"
          style={{
            background: `linear-gradient(135deg, ${level.color}, hsl(var(--foreground)))`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transition: "all 0.5s ease",
          }}
        >
          {animatedPct}%
        </span>
      </div>

      {/* Level info with animated emoji */}
      <div className="mt-3 relative">
        <div
          className={`transition-all duration-500 ${showEmoji ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span
            className={`text-4xl inline-block transition-transform duration-300 ${tapped ? "scale-150 rotate-12" : ""}`}
            style={{
              filter: `drop-shadow(0 2px 8px ${level.color}40)`,
            }}
          >
            {level.emoji}
          </span>
        </div>
        <p
          className="font-display text-lg font-bold mt-1"
          style={{
            background: `linear-gradient(135deg, ${level.color}, hsl(var(--foreground)))`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {level.title}
        </p>
        <p className="font-body text-xs italic text-muted-foreground mt-0.5">
          "{level.subtitle}"
        </p>
      </div>

      {/* Tap hint */}
      <p className="text-[9px] text-muted-foreground/50 mt-2 font-body animate-pulse">
        👆 Toque pra ver a mágica (spoiler: não tem)
      </p>
    </div>
  );
}
