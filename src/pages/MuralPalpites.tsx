import { useState } from "react";
import { usePublicSuggestions, useAdoptSuggestion, useGrandmaRanking } from "@/hooks/useGrandmaSuggestions";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageSquare, Sparkles, Trophy, HandHeart, Megaphone } from "lucide-react";

const SARCASTIC_HEADERS = [
  "Ninguém pediu, mas aqui vai meu palpite 👵",
  "Avisei que isso ia acontecer...",
  "Na minha época era diferente!",
  "Tô só dizendo, não tô mandando... 👀",
  "A experiência fala mais alto, querida.",
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
    <div className="p-4 max-w-lg mx-auto space-y-6 pb-24">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-avo-border bg-gradient-to-br from-avo-bg via-white to-avo-bg/50 p-6">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-avo via-avo-glow to-avo" />
        <div className="absolute -top-4 -right-4 text-8xl opacity-10 rotate-12">👵</div>
        <div className="absolute bottom-2 left-4 text-6xl opacity-5 -rotate-12">🧶</div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-6 h-6 text-avo" />
            <Badge className="bg-avo/20 text-avo text-[10px] font-display">MURAL PÚBLICO</Badge>
          </div>
          <h1 className="font-display text-xl font-bold text-avo-text leading-tight">
            "Ninguém pediu, mas mesmo assim vou dar meu palpite" 👵
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2 italic">
            {randomHeader}
          </p>
        </div>
      </div>

      {/* Top Palpiteiras Mini-ranking */}
      {ranking.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {ranking.slice(0, 5).map((avo, i) => (
            <div
              key={avo.user_id}
              className="flex-shrink-0 flex items-center gap-2 bg-avo-bg/60 border border-avo-border rounded-full px-3 py-2"
            >
              <span className="text-sm">{i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👵"}</span>
              <Avatar className="w-6 h-6 border border-avo-border">
                <AvatarFallback className="bg-avo/20 text-avo text-[10px] font-display">
                  {(avo.display_name || "V")[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-body text-xs font-semibold whitespace-nowrap">{avo.display_name || "Vovó"}</span>
              <Badge variant="outline" className="text-[9px] border-avo/30 text-avo">
                {avo.total} 💬
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-5xl animate-spin mb-3">🧶</div>
          <p className="font-body text-sm text-muted-foreground">Carregando palpites das vovós...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <Card className="border-2 border-dashed border-avo-border">
          <CardContent className="py-12 text-center">
            <span className="text-5xl block mb-3">🤫</span>
            <h3 className="font-display text-lg font-bold text-avo-text mb-1">Silêncio incomum...</h3>
            <p className="font-body text-sm text-muted-foreground">
              As avós estão quietas? Isso não é normal.<br />
              Devem estar planejando algo grande. 👀
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions.map((s) => {
            const typeConfig: Record<string, { emoji: string; label: string; border: string }> = {
              tarefa: { emoji: "📋", label: "Tarefa pra criar", border: "border-blue-200" },
              evento: { emoji: "📅", label: "Evento importante", border: "border-orange-200" },
              palpite: { emoji: "💬", label: "Palpite geral", border: "border-avo-border" },
            };
            const cfg = typeConfig[s.suggestion_type] || typeConfig.palpite;

            return (
              <Card
                key={s.id}
                className={`border-2 ${cfg.border} bg-gradient-to-br from-white to-avo-bg/20 overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01]`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cfg.emoji}</span>
                      <Badge variant="outline" className="text-[10px] border-avo/30 text-avo-text">
                        {cfg.label}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-body text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base text-foreground mb-1">{s.title}</h4>
                  {s.description && (
                    <p className="font-body text-sm text-muted-foreground mb-3 italic">
                      "{s.description}"
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-lg">👵</span>
                      <span className="font-body text-xs">Uma avó sabia escreveu isso</span>
                    </div>

                    {isMom && (
                      <Button
                        size="sm"
                        onClick={() => handleAdopt(s.id)}
                        disabled={adoptMutation.isPending}
                        className="bg-avo hover:bg-avo/80 text-white text-xs gap-1 shadow-md"
                        style={{ boxShadow: "0 4px 14px -4px hsl(270 60% 55% / 0.4)" }}
                      >
                        <HandHeart className="w-3.5 h-3.5" />
                        Adotar pro pai 😏
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom tip */}
      <div className="text-center py-4">
        <p className="font-body text-xs text-muted-foreground italic">
          {isMom
            ? "💡 Adote um palpite e ele vira tarefa pro pai automaticamente!"
            : "👀 Só as mães podem adotar palpites... os pais só observam e tremem."}
        </p>
      </div>
    </div>
  );
}
