interface GreetingHeaderProps {
  displayName: string;
  lastActiveAt: string | null;
  hasPendingTasks: boolean;
  hasCompletedToday: boolean;
}

function getDaysSinceActive(lastActive: string | null): number {
  if (!lastActive) return 999;
  const diff = Date.now() - new Date(lastActive).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getGreeting(props: GreetingHeaderProps): string {
  const hour = new Date().getHours();
  const daysSince = getDaysSinceActive(props.lastActiveAt);
  const name = props.displayName?.split(" ")[0] || "pai";

  if (daysSince >= 7) {
    return `Sumiu por ${daysSince} dias. As crianças nem perceberam. Brincadeira. Perceberam sim.`;
  }
  if (daysSince >= 3) {
    return `${daysSince} dias sem abrir o app. Seu filho continua existindo. Confirmamos.`;
  }

  if (hour < 12) {
    if (props.hasCompletedToday) {
      return `Bom dia, ${name}! Fez tarefa cedo? Tô impressionado. Não estraga.`;
    }
    if (props.hasPendingTasks) {
      return `Bom dia! Tem tarefa pendente de ontem. Vai fingir que não viu?`;
    }
    return `Bom dia! Seu filho já saiu pra escola. Você sabia? Agora sabe.`;
  }

  if (hour < 18) {
    if (props.hasPendingTasks) {
      return `Boa tarde. Aquela tarefa de ontem continua lá. Ela não vai se resolver sozinha.`;
    }
    if (props.hasCompletedToday) {
      return `Boa tarde, ${name}! Mandou bem hoje. A mãe tá quase impressionada.`;
    }
    return `Boa tarde, ${name}! A mãe mandou lembrar: as crianças continuam existindo.`;
  }

  if (props.hasCompletedToday) {
    return `Boa noite! Hoje você foi um pai decente. Guarda esse sentimento.`;
  }
  return `Boa noite. O dia passou e o app ficou aqui esperando. Igual seu filho.`;
}

export default function GreetingHeader(props: GreetingHeaderProps) {
  const greeting = getGreeting(props);

  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(var(--arena-dark) / 0.95), hsl(220 25% 16%), hsl(var(--arena-dark)))",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2), 0 0 20px hsl(var(--arena-neon) / 0.06)",
        border: "1px solid hsl(var(--arena-neon) / 0.12)",
      }}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(var(--arena-neon)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--arena-neon)) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />
      {/* Top glow */}
      <div className="absolute top-0 left-6 right-6 h-px" style={{
        background: "linear-gradient(90deg, transparent, hsl(var(--arena-neon) / 0.4), transparent)",
      }} />
      <span className="absolute top-3 right-4 text-3xl opacity-10 select-none">👁️</span>
      <p className="font-display text-base leading-relaxed relative z-10" style={{ color: "hsl(220 15% 88%)" }}>
        {greeting}
      </p>
    </div>
  );
}
