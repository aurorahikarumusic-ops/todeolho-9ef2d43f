import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const QUOTES = [
  "Pergunta pro seu filho como foi o dia dele. Sem olhar o celular. Sim, dá pra fazer.",
  "Você lembrou do aniversário da sua mãe. Do seu filho? Ainda estamos verificando.",
  "Presença não é só estar no cômodo. Mas começa por aí.",
  "A mãe já resolveu. Mas a intenção era boa, né?",
  "Seu filho vai lembrar do que você fez, não do que você planejou fazer.",
  "Tem consulta hoje? Reunião? Lanche especial? Confere agora.",
  "3 segundos pra mandar um áudio pro seu filho. Você tem 3 segundos.",
  "A mãe não quer ajuda. Quer que você saiba sem precisar pedir.",
  "Pai presente não é pai perfeito. É pai que aparece.",
  "Você abriu o app. Isso já é mais que ontem.",
  "Seu filho cresce com ou sem você. A escolha é sua.",
  "Todo dia tem algo que você deveria saber. Abriu a agenda?",
  "A escola tem nome. O professor tem nome. Seu filho sabe os dois. E você?",
  "Hoje: 1 tarefa. Só 1. Dá conta.",
  "O ranking não vai se resolver sozinho. Você talvez sim.",
  "Chega em casa e larga o celular por 10 minutos. Experimenta.",
  "Conta uma história antes de dormir. Vale inventar.",
  "Descobre o nome do melhor amigo do seu filho. Sem perguntar pra mãe.",
  "Sabe o que tem pra jantar? Não? Tá na hora de aprender.",
  "Mandou mensagem pra mãe hoje? Não vale emoji sozinho.",
];

function getDailyIndex(): number {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return seed % QUOTES.length;
}

export default function DailyQuote() {
  const quote = QUOTES[getDailyIndex()];
  const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border-l-4 border-secondary relative">
      <span className="inline-block bg-primary/10 text-primary text-[11px] font-body font-semibold px-2 py-0.5 rounded-full mb-2">
        💬 Frase do dia
      </span>
      <p className="font-body text-sm italic text-foreground leading-relaxed">
        "{quote}"
      </p>
      <div className="flex items-center justify-end gap-1 mt-2 text-muted-foreground">
        <CalendarDays className="w-3 h-3" />
        <span className="text-[10px] font-body">{today}</span>
      </div>
    </div>
  );
}