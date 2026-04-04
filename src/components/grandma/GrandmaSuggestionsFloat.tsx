import { useState } from "react";
import { usePendingSuggestions, useRespondSuggestion } from "@/hooks/useGrandmaSuggestions";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, Check, Ban, MessageSquare } from "lucide-react";

const REJECT_PHRASES_MOM = [
  "Obrigada, sogra... mas não. 😊",
  "Vou fingir que não vi esse palpite.",
  "A gente se vira, vó. Confia.",
  "Mãe sabe o que faz 👑",
];

const REJECT_PHRASES_DAD = [
  "Valeu, dona sogra... mas passo. 😅",
  "Anotado e ignorado com carinho.",
  "Deixa comigo, vó. Eu acho.",
  "A internet já me ensinou isso, vó.",
];

const ACCEPT_PHRASES = [
  "Vovó sabe das coisas! ✅",
  "Experiência não se discute! 👵",
  "Até que foi uma boa ideia...",
];

export default function GrandmaSuggestionsFloat() {
  const { data: profile } = useProfile();
  const { data: pending = [] } = usePendingSuggestions();
  const respondMutation = useRespondSuggestion();
  const [open, setOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState<Record<string, string>>({});

  const isMom = profile?.role === "mae";

  if (pending.length === 0) return null;

  const handleAccept = async (id: string) => {
    try {
      const phrase = ACCEPT_PHRASES[Math.floor(Math.random() * ACCEPT_PHRASES.length)];
      await respondMutation.mutateAsync({ id, status: "aceito", comment: phrase });
      toast.success("Palpite aceito! 👵✅", {
        description: "A vovó vai ficar orgulhosa.",
      });
    } catch {
      toast.error("Erro ao aceitar palpite");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const phrases = isMom ? REJECT_PHRASES_MOM : REJECT_PHRASES_DAD;
      const comment = rejectComment[id] || phrases[Math.floor(Math.random() * phrases.length)];
      await respondMutation.mutateAsync({ id, status: "recusado", comment });
      toast.info("Palpite recusado 👵❌", {
        description: isMom ? "A chefe decidiu." : "O pai decidiu. Milagre.",
      });
    } catch {
      toast.error("Erro ao recusar palpite");
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-avo text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{
          boxShadow: "0 6px 24px -4px hsl(270 60% 55% / 0.5)",
          animation: "bounce 2s ease-in-out infinite",
        }}
      >
        <span className="text-2xl">👵</span>
        {pending.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {pending.length}
          </span>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl max-h-[70vh] overflow-y-auto animate-bounce-in">
            <div className="sticky top-0 bg-gradient-to-r from-avo to-avo-glow p-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    👵 Palpites da Vovó
                  </h3>
                  <p className="text-xs text-white/80 font-body">
                    {isMom ? "Aceite ou ignore com elegância, chefe." : "A sogra mandou sugestões... 😅"}
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {pending.map((s) => {
                const typeEmoji = s.suggestion_type === "tarefa" ? "📋" : s.suggestion_type === "evento" ? "📅" : "💬";

                return (
                  <Card key={s.id} className="border-2 border-avo-border bg-avo-bg/30">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{typeEmoji}</span>
                        <Badge className="bg-avo/20 text-avo-text text-[10px]">
                          {s.suggestion_type === "tarefa" ? "Tarefa" : s.suggestion_type === "evento" ? "Evento" : "Palpite"}
                        </Badge>
                      </div>
                      <h4 className="font-body font-semibold text-sm mb-1">{s.title}</h4>
                      {s.description && (
                        <p className="font-body text-xs text-muted-foreground mb-3">{s.description}</p>
                      )}

                      <Input
                        placeholder="Resposta personalizada (opcional)"
                        value={rejectComment[s.id] || ""}
                        onChange={(e) => setRejectComment({ ...rejectComment, [s.id]: e.target.value })}
                        className="mb-2 text-xs h-8 font-body border-avo-border"
                      />

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(s.id)}
                          disabled={respondMutation.isPending}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" /> Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(s.id)}
                          disabled={respondMutation.isPending}
                          className="flex-1 text-xs border-red-300 text-red-500 hover:bg-red-50"
                        >
                          <Ban className="w-3 h-3 mr-1" /> Recusar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
