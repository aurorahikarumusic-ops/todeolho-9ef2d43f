import { useState } from "react";
import { usePublicSuggestions, useAdoptSuggestion, useGrandmaRanking } from "@/hooks/useGrandmaSuggestions";
import { useProfile } from "@/hooks/useProfile";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { HandHeart, Megaphone } from "lucide-react";

const SARCASTIC_HEADERS = [
  "Tô só dizendo, não tô mandando... 👀",
  "Avisei que isso ia acontecer...",
  "Na minha época era diferente!",
  "A experiência fala mais alto, querida.",
  "Ninguém pediu, mas aqui vai meu palpite 👵",
];

const ADOPT_REACTIONS = [
  "A vovó vai adorar saber que alguém ouviu! 🎉",
  "Parabéns por aceitar sabedoria ancestral! 👵✨",
  "O pai nem sabe o que tá vindo... 😏",
  "Experiência de avó não se discute!",
];

export default function MuralPalpites() {
  const { data: profile } = useProfile();
  const { data: suggestions = [], isLoading } = usePublicSuggestions();
  const { data: ranking = [] } = useGrandmaRanking();
  const adoptMutation = useAdoptSuggestion();
  const isMom = profile?.role === "mae";

  const randomHeader = SARCASTIC_HEADERS[Math.floor(Math.random() * SARCASTIC_HEADERS.length)];

  const handleAdopt = async (id: string) => {
    try {
      await adoptMutation.mutateAsync(id);
      const reaction = ADOPT_REACTIONS[Math.floor(Math.random() * ADOPT_REACTIONS.length)];
      toast.success("Palpite adotado! 👵→👩→👨", { description: reaction });
    } catch {
      toast.error("Erro ao adotar palpite");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6 pb-24" style={{ background: "hsl(var(--avo-bg, 270 80% 97%))" }}>

      {/* ═══════ Neo-Brutalist Hero Header ═══════ */}
      <div
        className="relative rounded-2xl overflow-hidden p-6"
        style={{
          background: "hsl(270 80% 97%)",
          border: "3px solid hsl(var(--avo-text, 270 40% 25%))",
          boxShadow: "6px 6px 0 hsl(var(--avo-text, 270 40% 25%))",
        }}
      >
        <div className="absolute -top-4 -right-4 text-8xl opacity-10 rotate-12 select-none">👵</div>
        <div className="absolute bottom-2 left-4 text-6xl opacity-5 -rotate-12 select-none">🧶</div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-6 h-6 text-avo" />
            <Badge
              className="text-[10px] font-display font-bold text-white"
              style={{
                background: "hsl(var(--avo, 270 60% 55%))",
                border: "2px solid hsl(var(--avo-text, 270 40% 25%))",
                boxShadow: "2px 2px 0 hsl(var(--avo-text, 270 40% 25%))",
              }}
            >
              MURAL PÚBLICO
            </Badge>
          </div>
          <h1 className="font-display text-xl font-bold leading-tight" style={{ color: "hsl(var(--avo-text, 270 40% 25%))" }}>
            "Ninguém pediu, mas mesmo assim vou dar meu palpite" 👵
          </h1>
          <p className="font-body text-sm mt-2 italic" style={{ color: "hsl(var(--avo-text, 270 40% 25%) / 0.7)" }}>
            {randomHeader}
          </p>
        </div>
      </div>

      {/* ═══════ Top Palpiteiras Mini-ranking ═══════ */}
      {ranking.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {ranking.slice(0, 5).map((avo, i) => (
            <div
              key={avo.user_id}
              className="flex-shrink-0 flex items-center gap-2 rounded-full px-3 py-2"
              style={{
                background: "white",
                border: "2px solid hsl(var(--avo-text, 270 40% 25%))",
                boxShadow: "3px 3px 0 hsl(var(--avo-text, 270 40% 25%))",
              }}
            >
              <span className="text-sm">{i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👵"}</span>
              <Avatar className="w-6 h-6 border-2" style={{ borderColor: "hsl(var(--avo-text, 270 40% 25%))" }}>
                <AvatarFallback className="bg-avo/20 text-avo text-[10px] font-display">
                  {(avo.display_name || "V")[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-body text-xs font-semibold whitespace-nowrap">{avo.display_name || "Vovó"}</span>
              <Badge
                variant="outline"
                className="text-[9px] font-display font-bold"
                style={{ borderColor: "hsl(var(--avo, 270 60% 55%))", color: "hsl(var(--avo-text, 270 40% 25%))" }}
              >
                {avo.total} 💬
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ Suggestions List ═══════ */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-5xl animate-bounce mb-3">🧶</div>
          <p className="font-body text-sm" style={{ color: "hsl(var(--avo-text, 270 40% 25%) / 0.6)" }}>Carregando palpites das vovós...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <div
          className="p-8 text-center rounded-2xl border-dashed"
          style={{
            background: "white",
            border: "3px dashed hsl(var(--avo-text, 270 40% 25%) / 0.3)",
            boxShadow: "6px 6px 0 hsl(var(--avo-text, 270 40% 25%) / 0.1)",
          }}
        >
          <span className="text-5xl block mb-3">🤫</span>
          <h3 className="font-display text-lg font-bold mb-1" style={{ color: "hsl(var(--avo-text, 270 40% 25%))" }}>Silêncio incomum...</h3>
          <p className="font-body text-sm" style={{ color: "hsl(var(--avo-text, 270 40% 25%) / 0.6)" }}>
            As avós estão quietas? Isso não é normal.<br />
            Devem estar planejando algo grande. 👀
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((s) => {
            const typeConfig: Record<string, { emoji: string; label: string; bgAccent: string }> = {
              tarefa: { emoji: "📋", label: "Tarefa pra criar", bgAccent: "hsl(220 80% 95%)" },
              evento: { emoji: "📅", label: "Evento importante", bgAccent: "hsl(30 80% 95%)" },
              palpite: { emoji: "💬", label: "Palpite geral", bgAccent: "hsl(270 80% 97%)" },
            };
            const cfg = typeConfig[s.suggestion_type] || typeConfig.palpite;

            return (
              <div
                key={s.id}
                className="rounded-2xl overflow-hidden transition-all group cursor-default"
                style={{
                  background: "white",
                  border: "3px solid hsl(var(--avo-text, 270 40% 25%))",
                  boxShadow: "6px 6px 0 hsl(var(--avo-text, 270 40% 25%))",
                }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cfg.emoji}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-display font-bold"
                        style={{ borderColor: "hsl(var(--avo, 270 60% 55%))", color: "hsl(var(--avo-text, 270 40% 25%))" }}
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-body" style={{ color: "hsl(var(--avo-text, 270 40% 25%) / 0.5)" }}>
                      {new Date(s.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base mb-1" style={{ color: "hsl(var(--avo-text, 270 40% 25%))" }}>{s.title}</h4>
                  {s.description && (
                    <p className="font-body text-sm mb-3 italic" style={{ color: "hsl(var(--avo, 270 60% 55%))" }}>
                      "{s.description}"
                    </p>
                  )}

                  <div
                    className="flex items-center justify-between mt-3 pt-3"
                    style={{ borderTop: "2px solid hsl(var(--avo-text, 270 40% 25%) / 0.1)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👵</span>
                      <span className="font-body text-xs" style={{ color: "hsl(var(--avo-text, 270 40% 25%) / 0.5)" }}>Uma avó sabia escreveu isso</span>
                    </div>

                    {s.status === "aceito" ? (
                      <Badge
                        className="text-[10px] font-display font-bold text-white"
                        style={{
                          background: "hsl(142 71% 45%)",
                          border: "2px solid hsl(var(--avo-text, 270 40% 25%))",
                          boxShadow: "2px 2px 0 hsl(var(--avo-text, 270 40% 25%))",
                        }}
                      >
                        ✅ Adotado
                      </Badge>
                    ) : isMom ? (
                      <button
                        onClick={() => handleAdopt(s.id)}
                        disabled={adoptMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-display text-xs font-bold text-white transition-all active:translate-y-0.5 disabled:opacity-50"
                        style={{
                          background: "hsl(var(--avo, 270 60% 55%))",
                          border: "2px solid hsl(var(--avo-text, 270 40% 25%))",
                          boxShadow: "3px 3px 0 hsl(var(--avo-text, 270 40% 25%))",
                        }}
                      >
                        <HandHeart className="w-3.5 h-3.5" />
                        Adotar pro pai 😏
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom tip */}
      <div className="text-center py-4">
        <p className="font-body text-xs italic" style={{ color: "hsl(var(--avo-text, 270 40% 25%) / 0.5)" }}>
          {isMom
            ? "💡 Adote um palpite e ele vira tarefa pro pai automaticamente!"
            : "👀 Só as mães podem adotar palpites... os pais só observam e tremem."}
        </p>
      </div>
    </div>
  );
}
