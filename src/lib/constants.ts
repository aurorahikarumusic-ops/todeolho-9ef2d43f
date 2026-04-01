export const DAD_TITLES = [
  { min: 0, max: 200, title: "Pai Iniciante", emoji: "👶" },
  { min: 201, max: 500, title: "Pai Tentando", emoji: "🤔" },
  { min: 501, max: 900, title: "Pai Promissor", emoji: "💪" },
  { min: 901, max: 1400, title: "Pai de Verdade", emoji: "⭐" },
  { min: 1401, max: Infinity, title: "Pai Lendário", emoji: "🏆" },
] as const;

export const RANKING_DESCRIPTIONS = [
  "O Pai do Ano. Suspeito, mas ok.",
  "Chegou no 2° por acidente, mas chegou.",
  "Não ganhou, mas tentou (mais ou menos).",
  "Esqueceu o lanche. De novo.",
  "Perguntou o nome da professora ontem. A filha tem 7 anos.",
] as const;

export const IRONIC_GREETINGS = {
  morning: [
    "Bom dia! Seu filho tem consulta hoje. Não, você não sabia. Mas tudo bem.",
    "Bom dia, pai. A mãe já saiu. As crianças estão vivas. Bom trabalho.",
    "Bom dia! Hoje é dia de reunião na escola. Não, não é sobre você. Dessa vez.",
  ],
  afternoon: [
    "Boa tarde! Lembrou de buscar as crianças? Não? Tá bom.",
    "Boa tarde! A mãe mandou lembrar: as crianças ainda existem.",
    "Boa tarde, pai. Alguém esqueceu o lanche de novo. Adivinha quem.",
  ],
  evening: [
    "Boa noite! Você leu a história pro seu filho? Não? Netflix tá mais fácil, né?",
    "Boa noite! Seus filhos estão dormindo. Sim, eles ainda moram aqui.",
    "Boa noite, pai. A mãe fez tudo. De novo. Mas amanhã é um novo dia.",
  ],
  inactive: [
    "Você não abre o app há {days} dias. Seu filho ainda existe.",
    "Ei, sumiu de novo? As crianças perguntaram por você. Mentira, nem perceberam.",
    "Voltou! A mãe já tinha desistido de você. Brincadeira. Mais ou menos.",
  ],
} as const;

export const DAILY_TIPS = [
  "Dica do dia: Pergunte ao seu filho como foi o dia dele. Sem olhar o celular.",
  "Dica do dia: Sabia que seus filhos têm professores? Tenta lembrar o nome de um.",
  "Dica do dia: A mãe merece uma folga. Sim, hoje. Não, amanhã não conta.",
  "Dica do dia: Leve as crianças pro parque. Sem celular. Sim, é possível.",
  "Dica do dia: Faça o lanche da escola. Google ajuda. A mãe também, mas tente sozinho.",
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
