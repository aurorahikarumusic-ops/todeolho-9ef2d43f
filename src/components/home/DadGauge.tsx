import { useEffect, useState, useRef, useCallback } from "react";

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

const SUSPENSE_PHRASES = [
  { text: "Acessando banco de dados da mãe...", emoji: "🔍" },
  { text: "Consultando a sogra... ela já deu o veredito.", emoji: "👵" },
  { text: "Analisando evidências... não são boas.", emoji: "📋" },
  { text: "Verificando se você trocou alguma fralda...", emoji: "🍼" },
  { text: "A mãe mandou uma nota. Sentamos.", emoji: "💀" },
  { text: "Calculando nível de paternidade...", emoji: "⚙️" },
  { text: "Processando desculpas esfarrapadas...", emoji: "🤥" },
  { text: "Conferindo se o pai lembrou do aniversário...", emoji: "🎂" },
  { text: "Resultado quase pronto. Respire.", emoji: "😮‍💨" },
  { text: "Preparando o veredito final...", emoji: "⚖️" },
];

function getLevel(pct: number) {
  return LEVELS.find((l) => pct <= l.max) || LEVELS[LEVELS.length - 1];
}

// Shuffle and pick N phrases
function pickPhrases(n: number) {
  const shuffled = [...SUSPENSE_PHRASES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default function DadGauge({ percentage }: DadGaugeProps) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [suspensePhase, setSuspensePhase] = useState(-1); // -1 = not started
  const [phrases] = useState(() => pickPhrases(5));
  const [showGauge, setShowGauge] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const clamped = Math.min(100, Math.max(0, percentage));
  const level = getLevel(clamped);

  // Suspense sequence after tap to reveal
  const startReveal = useCallback(() => {
    if (revealed) return;
    setRevealed(true);
    setSuspensePhase(0);
  }, [revealed]);

  useEffect(() => {
    if (suspensePhase < 0 || suspensePhase >= phrases.length) return;
    const delay = suspensePhase === phrases.length - 1 ? 1200 : 700 + Math.random() * 400;
    const timer = setTimeout(() => {
      if (suspensePhase < phrases.length - 1) {
        setSuspensePhase((p) => p + 1);
      } else {
        // Done — show gauge
        setShowGauge(true);
        setTimeout(() => {
          setAnimatedPct(clamped);
          setTimeout(() => setShowEmoji(true), 800);
        }, 400);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [suspensePhase, phrases.length, clamped]);

  const handleTap = () => {
    if (!revealed) {
      startReveal();
      return;
    }
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

  // ---- PRE-REVEAL STATE: teaser card ----
  if (!revealed) {
    return (
      <div
        onClick={handleTap}
        className="relative bg-gradient-to-br from-card via-card to-muted/30 rounded-3xl p-6 shadow-lg text-center cursor-pointer select-none overflow-hidden group active:scale-[0.98] transition-transform"
      >
        {/* Pulsing background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse rounded-3xl" />
        
        <p className="font-display text-sm text-muted-foreground mb-4 tracking-wider uppercase">
          ⚡ Termômetro do Pai
        </p>

        {/* Mystery gauge icon */}
        <div className="relative mx-auto w-32 h-32 mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center animate-pulse">
            <span className="text-5xl animate-bounce" style={{ animationDuration: "2s" }}>🤔</span>
          </div>
          {/* Rotating question marks */}
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="absolute text-lg text-muted-foreground/40 font-bold"
              style={{
                top: `${50 + 45 * Math.sin((i * Math.PI) / 2)}%`,
                left: `${50 + 45 * Math.cos((i * Math.PI) / 2)}%`,
                transform: "translate(-50%, -50%)",
                animation: `spin 4s linear infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              ?
            </span>
          ))}
        </div>

        <p className="font-display text-lg font-bold text-foreground mb-1">
          Qual será o veredito?
        </p>
        <p className="font-body text-xs text-muted-foreground mb-3">
          A mãe já avaliou. A sogra já opinou. Você tem coragem?
        </p>

        {/* CTA button */}
        <div className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-display text-sm font-bold px-5 py-2.5 rounded-full transition-all group-hover:scale-105">
          <span>👆</span>
          <span>Toque pra descobrir</span>
          <span className="animate-bounce">👀</span>
        </div>

        <p className="text-[9px] text-muted-foreground/40 mt-3 font-body">
          (spoiler: você provavelmente não vai gostar)
        </p>
      </div>
    );
  }

  // ---- SUSPENSE PHASE: phrases cycling ----
  if (!showGauge) {
    const currentPhrase = phrases[suspensePhase] || phrases[phrases.length - 1];
    const progress = ((suspensePhase + 1) / phrases.length) * 100;

    return (
      <div className="relative bg-gradient-to-br from-card via-card to-muted/30 rounded-3xl p-6 shadow-lg text-center select-none overflow-hidden min-h-[280px] flex flex-col items-center justify-center">
        {/* Scanning line effect */}
        <div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40"
          style={{
            top: `${30 + (suspensePhase * 10)}%`,
            transition: "top 0.5s ease",
          }}
        />

        {/* Background particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animation: `pulse 2s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}

        <p className="font-display text-xs text-muted-foreground mb-6 tracking-wider uppercase">
          ⚡ Analisando...
        </p>

        {/* Current phrase with typewriter feel */}
        <div className="relative mb-6">
          <span
            key={suspensePhase}
            className="text-3xl mb-3 inline-block animate-bounce"
            style={{ animationDuration: "0.6s" }}
          >
            {currentPhrase.emoji}
          </span>
          <p
            key={`text-${suspensePhase}`}
            className="font-display text-base font-bold text-foreground mt-2 animate-fade-in"
          >
            {currentPhrase.text}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-muted/50 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-secondary via-primary to-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Phase dots */}
        <div className="flex gap-1.5">
          {phrases.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= suspensePhase
                  ? "bg-primary scale-100"
                  : "bg-muted/40 scale-75"
              }`}
            />
          ))}
        </div>

        <p className="text-[9px] text-muted-foreground/40 mt-4 font-body italic">
          {suspensePhase < 2
            ? "Isso vai demorar... igual você pra trocar fralda."
            : suspensePhase < 4
            ? "Quase lá. A tensão é proposital."
            : "Último check... respira fundo."}
        </p>
      </div>
    );
  }

  // ---- REVEALED GAUGE ----
  return (
    <div
      ref={containerRef}
      onClick={handleTap}
      className="relative bg-gradient-to-br from-card via-card to-muted/30 rounded-3xl p-5 shadow-lg text-center cursor-pointer select-none overflow-hidden group animate-scale-in"
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
            <radialGradient id="centerMetal" cx="40%" cy="35%">
              <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.9" />
              <stop offset="50%" stopColor="hsl(var(--foreground))" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Outer shadow ring */}
          <path
            d="M 22 110 A 98 98 0 0 1 218 110"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Background arc */}
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
            <polygon
              points={`${cx - 3},${cy + 2} ${cx + 3},${cy + 2} ${nx},${ny}`}
              fill={level.color}
              opacity="0.9"
              className="transition-all duration-[1200ms] ease-out"
            />
            <circle
              cx={nx} cy={ny} r="3"
              fill={level.color}
              className="transition-all duration-[1200ms] ease-out"
            />
          </g>

          {/* Center hub */}
          <circle cx={cx} cy={cy} r="10" fill="url(#centerMetal)" />
          <circle cx={cx} cy={cy} r="6" fill="hsl(var(--card))" />
          <circle cx={cx} cy={cy} r="3" fill="hsl(var(--foreground))" opacity="0.6" />
        </svg>
      </div>

      {/* Percentage display */}
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

      {/* Level info */}
      <div className="mt-3 relative">
        <div
          className={`transition-all duration-500 ${showEmoji ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span
            className={`text-4xl inline-block transition-transform duration-300 ${tapped ? "scale-150 rotate-12" : ""}`}
            style={{ filter: `drop-shadow(0 2px 8px ${level.color}40)` }}
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
