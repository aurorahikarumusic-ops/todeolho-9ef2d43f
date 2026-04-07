import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Gavel, Lock, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import { MOM_BADGES } from "@/lib/mom-constants";

const DAD_ACHIEVEMENTS = {
  earned: [
    { key: "streak_7", emoji: "🔥", name: "Sequência de 7 dias", desc: "7 dias seguidos de presença" },
    { key: "hero_snack", emoji: "⭐", name: "Herói do Lanche", desc: "Lembrou do lanche sem lembrete" },
    { key: "self_scheduler", emoji: "📅", name: "Agendou Sozinho", desc: "3+ eventos criados em 1 semana" },
    { key: "photo_proof_5", emoji: "📸", name: "Prova em Mãos", desc: "5 provas fotográficas enviadas" },
    { key: "top_3", emoji: "🏆", name: "Top 3", desc: "Chegou no pódio do ranking" },
    { key: "missions_10", emoji: "💬", name: "Missão Cumprida", desc: "10 missões diárias completadas" },
    { key: "dad_of_month", emoji: "👑", name: "Pai do Mês", desc: "Venceu o ranking mensal" },
    { key: "group_joined", emoji: "🤝", name: "Pai em Grupo", desc: "Entrou em um grupo de amigos" },
  ],
  shame: [
    { key: "google_maps_dad", emoji: "😬", name: "Pai Google Maps", desc: "Perguntou endereço que já estava na agenda" },
    { key: "hibernation", emoji: "💤", name: "Modo Hibernação", desc: "Ficou 72h+ sem abrir o app" },
    { key: "who_is_doctor", emoji: "🤔", name: "Quem é o Pediatra?", desc: "Demorou pra adicionar evento de saúde" },
    { key: "rescued_5", emoji: "🛟", name: "Resgatado", desc: "Mãe resgatou 5+ tarefas no mês" },
    { key: "i_knew_it", emoji: "🤥", name: "Eu Já Sabia", desc: "Clicou 'eu já sabia' 5 vezes" },
    { key: "free_fall", emoji: "📉", name: "Queda Livre", desc: "Caiu 3+ posições em 1 semana" },
  ],
  locked: [
    { hint: "Complete 30 dias seguidos" },
    { hint: "Chegue ao 1° lugar no ranking" },
    { hint: "A mãe deu 5★ por 4 semanas" },
  ],
};

interface BadgeInfo {
  emoji: string;
  name: string;
  desc: string;
}

function BadgeCard({ emoji, name, desc, earned, type, onClick, isDad }: {
  emoji: string; name: string; desc: string; earned: boolean; type: "good" | "shame" | "locked"; onClick: () => void; isDad?: boolean;
}) {
  if (isDad) {
    const styleMap = {
      good: earned
        ? { background: "hsl(var(--dad-bg))", border: "3px solid hsl(var(--dad-text))", boxShadow: "4px 4px 0 hsl(var(--dad-text))" }
        : { background: "hsl(var(--dad-bg))", border: "2px dashed hsl(var(--dad-border))" },
      shame: earned
        ? { background: "hsl(var(--dad-bg))", border: "3px solid hsl(var(--dad-accent-hover))", boxShadow: "4px 4px 0 hsl(var(--dad-accent-hover))" }
        : { background: "hsl(var(--dad-bg))", border: "2px dashed hsl(var(--dad-border))" },
      locked: { background: "hsl(var(--dad-bg))", border: "2px dashed hsl(var(--dad-border))" },
    };
    return (
      <button onClick={onClick} className={`flex-shrink-0 w-28 rounded-xl p-3 text-center transition-all ${earned ? "hover:scale-105 hover:-translate-y-1" : "opacity-40"}`} style={styleMap[type]}>
        <span className={`text-3xl block mb-1.5 ${earned ? "" : "grayscale"}`}>{emoji}</span>
        <p className="font-display text-[11px] font-bold leading-tight" style={{ color: earned ? "hsl(var(--dad-text))" : "hsl(var(--dad-accent-hover))" }}>{name}</p>
      </button>
    );
  }

  const bgMap = {
    good: earned ? "bg-dad-bg border-dad-border" : "bg-muted/30 border-muted-foreground/10",
    shame: earned ? "bg-secondary/10 border-secondary/30" : "bg-muted/30 border-muted-foreground/10",
    locked: "bg-muted/20 border-dashed border-muted-foreground/20",
  };

  return (
    <button onClick={onClick} className={`flex-shrink-0 w-28 rounded-xl border-2 p-3 text-center transition-all ${bgMap[type]} ${earned ? "shadow-sm hover:shadow-md hover:scale-105" : "opacity-50"}`}>
      <span className={`text-3xl block mb-1.5 ${earned ? "" : "grayscale"}`}>{emoji}</span>
      <p className={`font-display text-[11px] font-bold leading-tight ${earned ? "text-foreground" : "text-muted-foreground"}`}>{name}</p>
    </button>
  );
}

function HorizontalScroll({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 140, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-sm font-bold flex items-center gap-1.5">{icon} {title}</h3>
        <div className="flex gap-1">
          <button onClick={() => scroll(-1)} className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => scroll(1)} className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {children}
      </div>
    </div>
  );
}

export function DadBadgesCarousel({ earnedKeys, onSelect }: { earnedKeys: string[]; onSelect: (b: BadgeInfo) => void }) {
  const earnedCount = DAD_ACHIEVEMENTS.earned.filter(a => earnedKeys.includes(a.key)).length
    + DAD_ACHIEVEMENTS.shame.filter(a => earnedKeys.includes(a.key)).length;
  const totalCount = DAD_ACHIEVEMENTS.earned.length + DAD_ACHIEVEMENTS.shame.length + DAD_ACHIEVEMENTS.locked.length;

  return (
    <div className="space-y-4 p-4 rounded-2xl relative overflow-hidden" style={{
      background: "linear-gradient(135deg, hsl(var(--dad-accent) / 0.06), hsl(var(--card)))",
      border: "1px solid hsl(var(--dad-border) / 0.4)",
      boxShadow: "0 8px 32px hsl(var(--dad-accent) / 0.08)",
    }}>
      <div className="flex items-center justify-between relative">
        <h2 className="font-display text-base font-bold">⚔️ Arsenal de Selos</h2>
        <Badge variant="outline" className="text-[10px]">{earnedCount}/{totalCount}</Badge>
      </div>

      <HorizontalScroll title="Conquistados" icon={<Star className="w-3.5 h-3.5" style={{ color: "hsl(var(--dad-accent))" }} />}>
        {DAD_ACHIEVEMENTS.earned.map(a => (
          <BadgeCard key={a.key} emoji={a.emoji} name={a.name} desc={a.desc}
            earned={earnedKeys.includes(a.key)} type="good"
            onClick={() => onSelect(a)} />
        ))}
      </HorizontalScroll>

      <HorizontalScroll title="Registros Históricos" icon={<Gavel className="w-3.5 h-3.5 text-muted-foreground" />}>
        {DAD_ACHIEVEMENTS.shame.map(a => (
          <BadgeCard key={a.key} emoji={a.emoji} name={a.name} desc={a.desc}
            earned={earnedKeys.includes(a.key)} type="shame"
            onClick={() => onSelect(a)} />
        ))}
      </HorizontalScroll>

      <HorizontalScroll title="Trancados" icon={<Lock className="w-3.5 h-3.5 text-muted-foreground" />}>
        {DAD_ACHIEVEMENTS.locked.map((a, i) => (
          <BadgeCard key={i} emoji="🔒" name={a.hint} desc="Continue jogando para desbloquear"
            earned={false} type="locked"
            onClick={() => {}} />
        ))}
      </HorizontalScroll>
    </div>
  );
}

export function MomBadgesCarousel({ earnedKeys, onSelect }: { earnedKeys: string[]; onSelect: (b: BadgeInfo) => void }) {
  const earnedCount = MOM_BADGES.filter(b => earnedKeys.includes(b.key)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold">👑 Selos de CEO</h2>
        <Badge variant="outline" className="text-[10px]">{earnedCount}/{MOM_BADGES.length} desbloqueados</Badge>
      </div>

      <HorizontalScroll title="Seus Selos" icon={<Crown className="w-3.5 h-3.5 text-mom" />}>
        {MOM_BADGES.map(b => (
          <BadgeCard key={b.key} emoji={b.emoji} name={b.name} desc={b.desc}
            earned={earnedKeys.includes(b.key)} type="good"
            onClick={() => onSelect(b)} />
        ))}
      </HorizontalScroll>
    </div>
  );
}

export function BadgeDetailModal({ badge, onClose }: { badge: BadgeInfo | null; onClose: () => void }) {
  if (!badge) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 mx-6 max-w-sm w-full shadow-2xl animate-scale-in text-center" onClick={e => e.stopPropagation()}>
        <span className="text-5xl block mb-3">{badge.emoji}</span>
        <h3 className="font-display font-bold text-lg mb-1">{badge.name}</h3>
        <p className="text-sm text-muted-foreground font-body">{badge.desc}</p>
        <button className="mt-4 px-4 py-2 rounded-md border text-sm font-display" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
