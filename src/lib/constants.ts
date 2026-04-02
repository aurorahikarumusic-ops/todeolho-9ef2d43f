export const DAD_TITLES = [
  { min: 0, max: 200, title: "Pai Iniciante", emoji: "👶" },
  { min: 201, max: 500, title: "Pai Tentando", emoji: "🤔" },
  { min: 501, max: 900, title: "Pai Promissor", emoji: "💪" },
  { min: 901, max: 1400, title: "Pai de Verdade", emoji: "⭐" },
  { min: 1401, max: Infinity, title: "Pai Lendário", emoji: "🏆" },
] as const;

export const RANKING_DESCRIPTIONS = [
  "O Pai do Ano. Suspeito, mas tá valendo.",
  "Segundo lugar. Chegou aqui por acidente, mas chegou.",
  "Terceiro. Não ganhou, mas tá no pódio.",
  "Esqueceu o lanche. De novo.",
  "Perguntou o nome da professora ontem. A filha tem 7 anos.",
] as const;

export const IRONIC_GREETINGS = {
  morning: [
    "Bom dia! Seu filho tem consulta hoje. Não, você não sabia.",
    "Bom dia, pai. A mãe já saiu. As crianças estão vivas. Bom trabalho.",
    "Bom dia! Reunião na escola hoje. Não é sobre você. Dessa vez.",
  ],
  afternoon: [
    "Boa tarde! Lembrou de buscar as crianças? Não? Pensei.",
    "Boa tarde! A mãe mandou lembrar: as crianças continuam existindo.",
    "Boa tarde. Alguém esqueceu o lanche de novo. Adivinha quem.",
  ],
  evening: [
    "Boa noite! Leu história pro seu filho? Netflix ganha sempre, né?",
    "Boa noite! Seus filhos tão dormindo. Sim, eles ainda moram aqui.",
    "Boa noite, pai. A mãe fez tudo. De novo. Amanhã é outro dia.",
  ],
  inactive: [
    "Você não abre o app há {days} dias. Seu filho continua existindo.",
    "Sumiu de novo? As crianças perguntaram por você. Mentira, nem perceberam.",
    "Voltou! A mãe já tinha desistido. Brincadeira. Mais ou menos.",
  ],
} as const;

export const DAILY_TIPS = [
  "Pergunta pro seu filho como foi o dia. Sem celular na mão.",
  "Seus filhos têm professores. Tenta lembrar o nome de pelo menos um.",
  "A mãe merece folga. Hoje. Não amanhã — hoje.",
  "Leva as crianças pro parque. Sem celular. Experimenta.",
  "Faz o lanche da escola. Google ajuda. A mãe também, mas tente sozinho.",
] as const;

export const TASK_CATEGORIES = {
  school: { label: "Escola", emoji: "📚" },
  health: { label: "Saúde", emoji: "🏥" },
  home: { label: "Casa", emoji: "🏠" },
  finances: { label: "Finanças", emoji: "💰" },
  fun: { label: "Diversão", emoji: "🎮" },
} as const;

export function getDadTitle(points: number) {
  return DAD_TITLES.find(t => points >= t.min && points <= t.max) || DAD_TITLES[0];
}

export function getTimeGreeting(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function getRandomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}