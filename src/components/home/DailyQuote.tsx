import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const QUOTES = [
  "Hoje é um bom dia pra perguntar o nome do professor do seu filho. Só pra variar.",
  "Você lembrou do aniversário da sua mãe. Do filho? Ainda estamos verificando.",
  "Presença não é só estar no mesmo cômodo. Mas começa por aí.",
  "A mãe já resolveu. Mas a intenção sua era boa, né?",
  "Seu filho vai lembrar de você pelo que você fez, não pelo que você planejou fazer.",
  "Hoje tem consulta? Reunião? Lanche especial? Vai lá conferir. Agora.",
  "3 segundos pra mandar um áudio pro seu filho. Você tem 3 segundos.",
  "A mãe não quer ajuda. Ela quer que você saiba sem precisar pedir.",
  "Pai presente não é pai perfeito. Mas é pai que aparece.",
  "Você abriu o app. Isso já é mais que ontem.",
  "Seu filho cresce com ou sem você. A escolha é sua.",
  "Toda semana tem algo importante. Você conhece algum?",
  "A escola tem nome. O professor tem nome. Seu filho sabe os dois. E você?",
  "Hoje: 1 tarefa. Só 1. Você consegue.",
  "O ranking não vai se resolver sozinho. Mas você talvez sim.",
];

function getDailyIndex(): number {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return seed % QUOTES.length;
}

export default function DailyQuote() {
  const quote = QUOTES[getDailyIndex()];
  const today = format(new Date(), "dd 'de' MMMM", { locale: ptBR });

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
