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
  const taskPct = tasksTotal > 0 ? tasksCompleted / tasksTotal : 0;
  const taskColor = "--arena-neon";
  const taskMsg =
    taskPct >= 1 ? "Perfeito. Suspeito." : taskPct >= 0.5 ? "Metade feita. Metade não." : "Tá devendo.";

  const isToday = nextEvent && isSameDay(nextEvent.date, new Date());
  const isTomorrow = nextEvent && isSameDay(nextEvent.date, addDays(new Date(), 1));
  const eventMsg = !nextEvent
    ? "Nada agendado. A mãe já atualizou a agenda?"
    : isToday ? "É hoje. Você sabia?"
    : isTomorrow ? "Amanhã. Não esquece."
    : format(nextEvent.date, "dd MMM", { locale: ptBR });

  const rankMsg =
    rankingPosition && rankingPosition <= 3 ? "No pódio. Aproveita."
    : rankingPosition && rankingPosition >= 10 ? "Último. Mas é o último que aparece aqui."
    : "Dá pra subir. Dá.";

  const ratingMsg =
    momRating === null ? "A mãe ainda não avaliou. Boa sorte."
    : momRating >= 5 ? "Ela aprovou. Raro."
    : momRating >= 3 ? "Mediano. Você sabe o que isso significa."
    : "Ela foi gentil na avaliação.";

  return (
    <div className="grid grid-cols-2 gap-3">
      <ArenaCard
        icon={<CheckSquare className="w-4 h-4" style={{ color: "hsl(var(--arena-neon))" }} />}
        label="Tarefas da semana"
        value={`${tasksCompleted}/${tasksTotal}`}
        accentVar={taskColor}
        comment={taskMsg}
      />
      <ArenaCard
        icon={<CalendarDays className="w-4 h-4" style={{ color: "hsl(var(--arena-electric))" }} />}
        label="Próximo evento"
        value={nextEvent?.title || "—"}
        accentVar="--arena-electric"
        comment={eventMsg}
      />
      <ArenaCard
        icon={<Trophy className="w-4 h-4" style={{ color: "hsl(var(--arena-gold))" }} />}
        label="Ranking"
        value={rankingPosition ? `#${rankingPosition}` : "—"}
        accentVar="--arena-gold"
        comment={rankMsg}
      />
      <ArenaCard
        icon={<Star className="w-4 h-4" style={{ color: "hsl(var(--arena-fire))" }} />}
        label="Nota da Mãe"
        value={momRating !== null ? `${momRating}★` : "Pendente"}
        accentVar="--arena-fire"
        comment={momRating === null ? "Convide a mãe pra avaliar!" : ratingMsg}
        stars={momRating}
      />
    </div>
  );
}

function ArenaCard({
  icon,
  label,
  value,
  accentVar,
  comment,
  stars,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentVar: string;
  comment: string;
  stars?: number | null;
}) {
  return (
    <div
      className="rounded-xl p-3.5 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(var(--arena-dark) / 0.9), hsl(30 25% 12%))",
        border: `1px solid hsl(var(${accentVar}) / 0.12)`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[11px] font-body" style={{ color: "hsl(30 15% 75%)" }}>{label}</span>
      </div>
      <p
        className="font-display text-xl font-bold truncate"
        style={{
          color: `hsl(var(${accentVar}))`,
          textShadow: `0 0 6px hsl(var(${accentVar}) / 0.2)`,
        }}
      >
        {value}
      </p>
      {stars !== undefined && stars !== null && (
        <div className="flex gap-0.5 my-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className="w-3 h-3"
              style={{
                color: s <= stars ? "hsl(var(--arena-gold))" : "hsl(30 15% 50%)",
                fill: s <= stars ? "hsl(var(--arena-gold))" : "none",
              }}
            />
          ))}
        </div>
      )}
      <p className="text-[10px] font-body italic mt-1" style={{ color: "hsl(30 15% 70%)" }}>
        {comment}
      </p>
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
