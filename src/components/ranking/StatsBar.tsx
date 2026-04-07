import { getDadTitle } from "@/lib/constants";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Zap, ChevronUp, Eye, Sparkles } from "lucide-react";
import { ranking_diff } from "./RankingHelpers";

export function MyStatsBar({ profile, position, total }: { profile: any; position: number; total: number }) {
  if (!profile || position < 0) return null;
  const percentile = total > 1 ? Math.round(((total - position) / total) * 100) : 100;
  const title = getDadTitle(profile.points);

  return (
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, hsl(var(--dad-accent) / 0.06), hsl(var(--card)))",
      boxShadow: "0 8px 32px hsl(var(--dad-accent) / 0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
      border: "1px solid hsl(var(--dad-border) / 0.4)",
    }}>
      <div className="relative flex items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-1.5 rounded-full blur-md" style={{
            background: "linear-gradient(135deg, hsl(var(--dad-accent) / 0.2), transparent)",
          }} />
          <Avatar className="relative h-12 w-12 ring-2 shadow-lg" style={{
            boxShadow: "0 4px 12px hsl(var(--dad-accent) / 0.15)",
          }}>
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="font-display font-bold" style={{
              background: "hsl(var(--dad-bg))", color: "hsl(var(--dad-text))",
            }}>{(profile.display_name || "P")[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-display font-bold text-lg" style={{ color: "hsl(var(--dad-accent))" }}>#{position + 1}</span>
            <span className="text-sm text-muted-foreground font-body">de {total}</span>
            {position <= 2 && <Crown className="w-4 h-4" style={{ color: "hsl(var(--dad-accent))" }} />}
          </div>
          <p className="text-xs font-body italic truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
            {title.emoji} {title.title} • Top {percentile}% dos pais
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" style={{ color: "hsl(var(--dad-accent))" }} />
            <span className="font-display font-bold text-xl" style={{ color: "hsl(var(--dad-accent))" }}>{profile.points}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">pontos</p>
        </div>
      </div>
      {position > 0 && (
        <div className="relative mt-3 pt-3" style={{ borderTop: "1px solid hsl(var(--dad-border) / 0.3)" }}>
          <div className="flex items-center justify-between text-[10px] mb-1 text-muted-foreground">
            <span className="flex items-center gap-1">
              <ChevronUp className="w-3 h-3" />
              Pra subir: +{Math.max(1, ranking_diff(profile, position))}pts
            </span>
            <span className="font-display">{profile.streak_days > 0 ? `🔥 ${profile.streak_days} dias` : ""}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{
              width: `${Math.min(95, Math.max(5, percentile))}%`,
              background: "linear-gradient(90deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))",
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function MomObserverBar({ ranking, partnerProfile }: { ranking: any[]; partnerProfile: any }) {
  if (!partnerProfile) return null;
  const partnerPos = ranking.findIndex((r: any) => r.id === partnerProfile.id);
  if (partnerPos < 0) return null;

  const total = ranking.length;
  const title = getDadTitle(partnerProfile.points);
  const percentile = total > 1 ? Math.round(((total - partnerPos) / total) * 100) : 100;

  const momComments = [
    "Poderia ser pior. Mas poderia ser BEM melhor.",
    "Ele tá tentando. Eu acho.",
    "Pelo menos ele abriu o app hoje.",
    "Melhor que ontem. O mínimo.",
    "Surpreendentemente, não é o último.",
  ];
  const comment = momComments[partnerPos % momComments.length];

  return (
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.06), hsl(var(--card)))",
      boxShadow: "0 8px 32px hsl(var(--mom-accent) / 0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
      border: "1px solid hsl(var(--mom-border) / 0.4)",
    }}>
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--mom-accent)) 0.5px, transparent 0)",
        backgroundSize: "20px 20px"
      }} />

      <div className="relative">
        <div className="flex items-center gap-1 mb-3">
          <Eye className="w-4 h-4" style={{ color: "hsl(var(--mom-accent))" }} />
          <span className="text-xs font-display font-bold" style={{ color: "hsl(var(--mom-text))" }}>
            Monitorando seu marido
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1.5 rounded-full blur-md" style={{
              background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.2), hsl(340 80% 70% / 0.15))",
            }} />
            <Avatar className="relative h-12 w-12 ring-2" style={{
              boxShadow: "0 4px 12px hsl(var(--mom-accent) / 0.15)",
            }}>
              <AvatarImage src={partnerProfile.avatar_url || undefined} />
              <AvatarFallback className="font-display font-bold" style={{
                background: "hsl(var(--mom-bg))", color: "hsl(var(--mom-text))"
              }}>{(partnerProfile.display_name || "P")[0]}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-display font-bold text-lg" style={{ color: "hsl(var(--mom-accent))" }}>
                #{partnerPos + 1}
              </span>
              <span className="text-sm text-muted-foreground font-body">de {total}</span>
              {partnerPos <= 2 && <Crown className="w-4 h-4" style={{ color: "hsl(var(--mom-accent))" }} />}
            </div>
            <p className="text-xs font-body italic truncate" style={{ color: "hsl(var(--mom-text) / 0.7)" }}>
              {title.emoji} {title.title} • Top {percentile}%
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--mom-accent))" }} />
              <span className="font-display font-bold text-xl" style={{ color: "hsl(var(--mom-accent))" }}>
                {partnerProfile.points}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">pontos</p>
          </div>
        </div>

        <div className="mt-3 pt-3" style={{ borderTop: "1px solid hsl(var(--mom-border) / 0.3)" }}>
          <p className="text-[11px] font-body italic text-center" style={{ color: "hsl(var(--mom-text) / 0.6)" }}>
            "{comment}"
          </p>
        </div>
      </div>
    </div>
  );
}

export const StarRating = ({ stars, isMom }: { stars: number; isMom?: boolean }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`text-xs ${i <= stars ? (isMom ? "text-mom" : "text-accent-foreground") : "text-muted-foreground/30"}`}>★</span>
    ))}
  </div>
);
