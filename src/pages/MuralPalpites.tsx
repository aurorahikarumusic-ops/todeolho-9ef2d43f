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
    <div className="p-4 max-w-lg mx-auto space-y-6 pb-24 bg-background min-h-screen">

      {/* ═══════ Neo-Brutalist Hero Header ═══════ */}
      <div className="avo-neo-card relative overflow-hidden p-6">
        <div className="absolute -top-4 -right-4 text-8xl opacity-10 rotate-12 select-none">👵</div>
        <div className="absolute bottom-2 left-4 text-6xl opacity-5 -rotate-12 select-none">🧶</div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-6 h-6 text-avo" />
            <span className="avo-neo-badge bg-avo text-white">MURAL PÚBLICO</span>
          </div>
          <h1 className="font-display text-xl font-bold leading-tight" style={{ color: "hsl(var(--avo-text))" }}>
            "Ninguém pediu, mas mesmo assim vou dar meu palpite" 👵
          </h1>
          <p className="font-body text-sm mt-2 italic" style={{ color: "hsl(var(--avo-text) / 0.7)" }}>
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
              className="avo-neo-card flex-shrink-0 flex items-center gap-2 !rounded-full px-3 py-2"
              style={{ background: "white" }}
            >
              <span className="text-sm">{i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👵"}</span>
              <Avatar className="w-6 h-6 border-2" style={{ borderColor: "hsl(var(--avo-text))" }}>
                <AvatarFallback className="bg-avo/20 text-avo text-[10px] font-display">
                  {(avo.display_name || "V")[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-body text-xs font-semibold whitespace-nowrap">{avo.display_name || "Vovó"}</span>
              <span className="avo-neo-badge text-[9px] !py-0.5 !px-1.5" style={{ color: "hsl(var(--avo-text))" }}>
                {avo.total} 💬
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ Suggestions List ═══════ */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-5xl animate-bounce mb-3">🧶</div>
          <p className="font-body text-sm" style={{ color: "hsl(var(--avo-text) / 0.6)" }}>Carregando palpites das vovós...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="avo-neo-card p-8 text-center !border-dashed">
          <span className="text-5xl block mb-3">🤫</span>
          <h3 className="font-display text-lg font-bold mb-1" style={{ color: "hsl(var(--avo-text))" }}>Silêncio incomum...</h3>
          <p className="font-body text-sm" style={{ color: "hsl(var(--avo-text) / 0.6)" }}>
            As avós estão quietas? Isso não é normal.<br />
            Devem estar planejando algo grande. 👀
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((s) => {
            const typeConfig: Record<string, { emoji: string; label: string }> = {
              tarefa: { emoji: "📋", label: "Tarefa pra criar" },
              evento: { emoji: "📅", label: "Evento importante" },
              palpite: { emoji: "💬", label: "Palpite geral" },
            };
            const cfg = typeConfig[s.suggestion_type] || typeConfig.palpite;

            return (
              <div key={s.id} className="avo-neo-card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cfg.emoji}</span>
                      <span className="avo-neo-badge text-[10px] !py-0.5 !px-2" style={{ color: "hsl(var(--avo-text))" }}>
                        {cfg.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-body" style={{ color: "hsl(var(--avo-text) / 0.5)" }}>
                      {new Date(s.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base mb-1" style={{ color: "hsl(var(--avo-text))" }}>{s.title}</h4>
                  {s.description && (
                    <p className="font-body text-sm mb-3 italic text-avo">
                      "{s.description}"
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "2px solid hsl(var(--avo-text) / 0.1)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👵</span>
                      <span className="font-body text-xs" style={{ color: "hsl(var(--avo-text) / 0.5)" }}>Uma avó sabia escreveu isso</span>
                    </div>

                    {s.status === "aceito" ? (
                      <span className="avo-neo-badge text-[10px] !py-0.5 !px-2 bg-green-500 text-white">
                        ✅ Adotado
                      </span>
                    ) : isMom ? (
                      <button
                        onClick={() => handleAdopt(s.id)}
                        disabled={adoptMutation.isPending}
                        className="avo-neo-btn text-xs !py-1.5 !px-3 disabled:opacity-50"
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
        <p className="font-body text-xs italic" style={{ color: "hsl(var(--avo-text) / 0.5)" }}>
          {isMom
            ? "💡 Adote um palpite e ele vira tarefa pro pai automaticamente!"
            : "👀 Só as mães podem adotar palpites... os pais só observam e tremem."}
        </p>
      </div>
    </div>
  );
}
