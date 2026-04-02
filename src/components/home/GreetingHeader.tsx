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

  // Inactive for 3+ days
  if (daysSince >= 3) {
    return `Você sumiu por ${daysSince} dias. Seu filho ainda existe. A gente checou.`;
  }

  if (hour < 12) {
    // Morning
    if (props.hasCompletedToday) {
      return `Bom dia, ${name}! Você tá indo bem. Não estraga agora.`;
    }
    return "Bom dia! Seu filho já foi pra escola. Você sabia? Agora sabe.";
  }

  if (hour < 18) {
    // Afternoon
    if (props.hasPendingTasks) {
      return "Boa tarde. Aquela tarefa de ontem? Ainda não foi feita. Só lembrando.";
    }
    return `Boa tarde, ${name}! A mãe mandou lembrar: as crianças ainda existem.`;
  }

  // Night
  if (props.hasCompletedToday) {
    return "Boa noite! Hoje você foi um pai decente. Guarda esse sentimento pra amanhã.";
  }
  return "Boa noite. Você passou o dia inteiro sem fazer nada aqui. Amanhã é outro dia. Ou não.";
}

export default function GreetingHeader(props: GreetingHeaderProps) {
  const greeting = getGreeting(props);

  return (
    <div className="relative bg-primary rounded-2xl p-5 overflow-hidden shadow-sm">
      {/* Eye watermark */}
      <span className="absolute top-3 right-4 text-3xl opacity-15 select-none">👁️</span>
      <p className="font-display text-primary-foreground text-base leading-relaxed relative z-10">
        {greeting}
      </p>
    </div>
  );
}
