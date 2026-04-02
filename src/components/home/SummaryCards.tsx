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

export default function SummaryCards({
  tasksCompleted,
  tasksTotal,
  nextEvent,
  rankingPosition,
  momRating,
}: SummaryCardsProps) {
  // Task card
  const taskPct = tasksTotal > 0 ? tasksCompleted / tasksTotal : 0;
  const taskColor = taskPct >= 1 ? "text-primary" : taskPct >= 0.5 ? "text-primary" : "text-secondary";
  const taskMsg =
    taskPct >= 1
      ? "Perfeito. Suspeito."
      : taskPct >= 0.5
      ? "Metade feita. Metade não."
      : "Tá devendo.";

  // Event card
  const isToday = nextEvent && isSameDay(nextEvent.date, new Date());
  const isTomorrow = nextEvent && isSameDay(nextEvent.date, addDays(new Date(), 1));
  const eventColor = isToday ? "text-secondary" : isTomorrow ? "text-accent-foreground" : "text-primary";
  const eventMsg = !nextEvent
    ? "Nada agendado. A mãe já atualizou a agenda?"
    : isToday
    ? "É hoje. Você sabia?"
    : isTomorrow
    ? "Amanhã. Não esquece."
    : format(nextEvent.date, "dd MMM", { locale: ptBR });

  // Ranking card
  const rankColor =
    rankingPosition && rankingPosition <= 3
      ? "text-primary"
      : rankingPosition && rankingPosition >= 10
      ? "text-secondary"
      : "text-muted-foreground";
  const rankMsg =
    rankingPosition && rankingPosition <= 3
      ? "No pódio. Aproveita."
      : rankingPosition && rankingPosition >= 10
      ? "Último. Mas é o último que aparece aqui."
      : "Dá pra subir. Dá.";

  // Mom rating
  const ratingMsg =
    momRating === null
      ? "A mãe ainda não avaliou. Boa sorte."
      : momRating >= 5
      ? "Ela aprovou. Raro."
      : momRating >= 3
      ? "Mediano. Você sabe o que isso significa."
      : "Ela foi gentil na avaliação.";

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card
        icon={<CheckSquare className="w-4 h-4" />}
        label="Tarefas da semana"
        value={`${tasksCompleted}/${tasksTotal}`}
        valueColor={taskColor}
        comment={taskMsg}
        commentColor={taskColor}
      />
      <Card
        icon={<CalendarDays className="w-4 h-4" />}
        label="Próximo evento"
        value={nextEvent?.title || "—"}
        valueColor={eventColor}
        comment={eventMsg}
        commentColor={eventColor}
      />
      <Card
        icon={<Trophy className="w-4 h-4" />}
        label="Ranking"
        value={rankingPosition ? `#${rankingPosition}` : "—"}
        valueColor={rankColor}
        comment={rankMsg}
        commentColor={rankColor}
      />
      <Card
        icon={<Star className="w-4 h-4" />}
        label="Nota da Mãe"
        value={momRating !== null ? `${momRating}★` : "Pendente"}
        valueColor={momRating !== null && momRating >= 4 ? "text-primary" : "text-secondary"}
        comment={momRating === null ? "Convide a mãe pra avaliar sua semana!" : ratingMsg}
        commentColor={momRating === null ? "text-secondary" : "text-muted-foreground"}
        stars={momRating}
      />
    </div>
  );
}

function Card({
  icon,
  label,
  value,
  valueColor,
  comment,
  commentColor,
  stars,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
  comment: string;
  commentColor: string;
  stars?: number | null;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-3.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-[11px] font-body">{label}</span>
      </div>
      <p className={`font-display text-xl font-bold ${valueColor} truncate`}>{value}</p>
      {stars !== undefined && stars !== null && (
        <div className="flex gap-0.5 my-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3 h-3 ${s <= stars ? "text-accent-foreground fill-accent" : "text-muted"}`}
            />
          ))}
        </div>
      )}
      <p className={`text-[10px] font-body italic ${commentColor} mt-1`}>{comment}</p>
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
