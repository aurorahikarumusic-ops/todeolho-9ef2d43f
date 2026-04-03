export const MOM_GREETINGS = [
  "Você lembrou de tudo hoje. Como sempre.",
  "A família funciona porque você funciona.",
  "Mais um dia que o {dadName} vai saber o que rola em casa.",
  "{taskCount} tarefas criadas esse mês. Você é a CEO aqui.",
  "Ele subiu no ranking. Parte do mérito é seu.",
] as const;

export const MOM_BADGES = [
  { key: "ceo_familia", emoji: "📋", name: "CEO da Família", desc: "Criou 20+ tarefas em 1 mês" },
  { key: "zero_resgates", emoji: "🏆", name: "Zero Resgates", desc: "1 mês sem resgatar o pai" },
  { key: "avaliadora_fiel", emoji: "⭐", name: "Avaliadora Fiel", desc: "Avaliou toda semana por 1 mês" },
  { key: "delegacao_perfeita", emoji: "🎯", name: "Delegação Perfeita", desc: "Pai completou 100% das tarefas na semana" },
  { key: "feedback_expert", emoji: "💬", name: "Feedback Expert", desc: "Comentou em 10 reprovações" },
  { key: "agenda_cheia", emoji: "🗓️", name: "Agenda Cheia", desc: "Adicionou 15+ eventos em 1 mês" },
] as const;

export const RATING_LABELS: Record<number, string> = {
  1: "Semana difícil. Pra todos.",
  2: "Ele tentou. Mais ou menos.",
  3: "Mediano. Ele sabe o que isso significa.",
  4: "Boa semana. Quase lá.",
  5: "Perfeito. Guarda isso pra história.",
};

export function getMomGreeting(dadName: string, taskCount: number): string {
  const idx = Math.floor(Math.random() * MOM_GREETINGS.length);
  return MOM_GREETINGS[idx]
    .replace("{dadName}", dadName)
    .replace("{taskCount}", String(taskCount));
}
