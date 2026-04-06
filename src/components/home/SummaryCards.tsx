import { CheckSquare, CalendarDays, Trophy, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SummaryCardsProps {
  tasksCompleted: number;
  tasksTotal: number;
  nextEvent: { title: string; date: Date } | null;
  rankingPosition: number | null;
  momRating: number | null;
}

const CARD_COLORS = [
  { bg: "#D8F3DC", border: "#2D6A4F", shadow: "#1B4332" },
  { bg: "#D6EAFF", border: "#2B7ACA", shadow: "#1A4B7B" },
  { bg: "#FFEAAE", border: "#D4A10A", shadow: "#B8890A" },
  { bg: "#FFD6D6", border: "#C0392B", shadow: "#922B21" },
];

export default function SummaryCards({
  tasksCompleted,
  tasksTotal,
  nextEvent,
  rankingPosition,
  momRating,
}: SummaryCardsProps) {
  const taskPct = tasksTotal > 0 ? tasksCompleted / tasksTotal : 0;
  const taskMsg =
    taskPct >= 1 ? "Perfeito. Suspeito." : taskPct >= 0.5 ? "Metade feita. Metade não." : "Tá devendo.";

  const isToday = nextEvent && isSameDay(nextEvent.date, new Date());
  const isTomorrow = nextEvent && isSameDay(nextEvent.date, addDays(new Date(), 1));
  const eventMsg = !nextEvent
    ? "Nada agendado. A mãe já atualizou?"
    : isToday ? "É hoje. Você sabia?"
    : isTomorrow ? "Amanhã. Não esquece."
    : format(nextEvent.date, "dd MMM", { locale: ptBR });

  const rankMsg =
    rankingPosition && rankingPosition <= 3 ? "No pódio. Aproveita."
    : rankingPosition && rankingPosition >= 10 ? "Último. Corre."
    : "Dá pra subir. Dá.";

  const ratingMsg =
    momRating === null ? "A mãe ainda não avaliou."
    : momRating >= 5 ? "Ela aprovou. Raro."
    : momRating >= 3 ? "Mediano."
    : "Ela foi gentil.";

  const cards = [
    { icon: <CheckSquare className="w-5 h-5" />, label: "Tarefas", value: `${tasksCompleted}/${tasksTotal}`, comment: taskMsg, ...CARD_COLORS[0], stars: null as number | null },
    { icon: <CalendarDays className="w-5 h-5" />, label: "Próximo evento", value: nextEvent?.title || "—", comment: eventMsg, ...CARD_COLORS[1], stars: null as number | null },
    { icon: <Trophy className="w-5 h-5" />, label: "Ranking", value: rankingPosition ? `#${rankingPosition}` : "—", comment: rankMsg, ...CARD_COLORS[2], stars: null as number | null },
    { icon: <Star className="w-5 h-5" />, label: "Nota da Mãe", value: momRating !== null ? `${momRating}★` : "Pendente", comment: ratingMsg, ...CARD_COLORS[3], stars: momRating },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 relative overflow-hidden transition-all duration-300 hover:translate-x-[-3px] hover:translate-y-[-3px] cursor-default"
          style={{
            background: card.bg,
            border: `3px solid ${card.border}`,
            boxShadow: `6px 6px 0 ${card.shadow}`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5" style={{ color: card.border }}>
            {card.icon}
            <span className="text-[11px] font-display font-bold uppercase tracking-wider">{card.label}</span>
          </div>
          <p className="font-display text-xl font-black truncate" style={{ color: card.shadow }}>
            {card.value}
          </p>
          {card.stars !== undefined && card.stars !== null && (
            <div className="flex gap-0.5 my-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3 h-3" style={{
                  color: s <= card.stars! ? "#D4A10A" : "#d1d5db",
                  fill: s <= card.stars! ? "#D4A10A" : "none",
                }} />
              ))}
            </div>
          )}
          <p className="text-[10px] font-body italic mt-1" style={{ color: card.shadow }}>
            {card.comment}
          </p>
        </div>
      ))}
    </div>
  );
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
