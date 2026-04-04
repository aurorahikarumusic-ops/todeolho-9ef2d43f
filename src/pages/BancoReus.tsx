import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Gavel, Send, Trash2, AlertTriangle, Scale, ShieldAlert, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const SARCASTIC_PLACEHOLDERS = [
  '"Deixei a louça de molho desde ontem... e esqueci."',
  '"Falei que levei o filho no dentista. Fui no drive-thru."',
  '"Prometi que ia buscar na escola. Cheguei 40min atrasado."',
  '"Comprei o produto errado no mercado. De novo."',
  '"Disse que tava trabalhando. Tava jogando."',
];

const VERDICT_EMOJIS = ["⚖️", "🔨", "👨‍⚖️", "🚨", "😬", "💀"];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSeverityLabel(len: number): { text: string; color: string; icon: string } {
  if (len < 30) return { text: "Contravenção leve", color: "from-green-400 to-emerald-500", icon: "😏" };
  if (len < 80) return { text: "Delito moderado", color: "from-amber-400 to-orange-500", icon: "😬" };
  if (len < 150) return { text: "Crime grave", color: "from-orange-500 to-red-500", icon: "🚨" };
  return { text: "Sentença máxima", color: "from-red-500 to-rose-700", icon: "💀" };
}

export default function BancoReus() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: confessions = [], isLoading } = useQuery({
    queryKey: ["confessions-page", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("confessions").select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addConfession = useMutation({
    mutationFn: async (text: string) => {
      if (!user || !profile?.family_id) throw new Error("Sem família");
      const { error } = await supabase.from("confessions").insert({
        user_id: user.id, family_id: profile.family_id, content: text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["confessions-page"] });
      setContent(""); setShowForm(false);
      toast.success("Confissão registrada. Boa sorte. ⚖️");
    },
    onError: () => toast.error("Erro ao confessar"),
  });

  const deleteConfession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("confessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["confessions-page"] });
      toast.success("Confissão apagada. Mas a culpa permanece.");
    },
  });

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || trimmed.length < 5) { toast.error("Confessa direito! Mínimo 5 caracteres."); return; }
    if (trimmed.length > 300) { toast.error("Máximo 300 caracteres."); return; }
    addConfession.mutate(trimmed);
  };

  const severity = getSeverityLabel(content.length);
  const totalConfessions = confessions.length;
  const placeholder = getRandomItem(SARCASTIC_PLACEHOLDERS);

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-0 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">

      {/* ═══════ 3D Hero Header ═══════ */}
      <div
        className="relative -mx-4 md:-mx-8 px-6 pt-8 pb-6 mb-6 overflow-hidden"
        style={{
          background: "linear-gradient(145deg, hsl(35 90% 55%) 0%, hsl(25 85% 45%) 50%, hsl(15 80% 35%) 100%)",
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, white 20px, white 21px)`,
        }} />
        <div className="absolute top-4 right-4 text-7xl opacity-10 rotate-12 select-none">⚖️</div>
        <div className="absolute bottom-2 left-4 text-5xl opacity-10 -rotate-12 select-none">🔨</div>

        <div className="relative">
          {/* Gavel icon with 3D effect */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
            style={{
              background: "linear-gradient(145deg, hsl(40 90% 65%), hsl(30 85% 50%))",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.15)",
              transform: "perspective(400px) rotateX(5deg)",
            }}
          >
            <Gavel className="w-8 h-8 text-white drop-shadow-md" />
          </div>

          <h1 className="font-display text-2xl font-bold text-white text-center drop-shadow-lg">
            Banco dos Réus
          </h1>
          <p className="font-body text-sm text-white/80 text-center mt-1">
            Confesse antes que ela descubra ⚖️
          </p>

          {/* Stats row */}
          <div className="flex justify-center gap-3 mt-5">
            {[
              { value: totalConfessions, label: "confissões", icon: <Scale className="w-3.5 h-3.5" /> },
              { value: totalConfessions > 5 ? "Réu primário" : "Ficha limpa", label: "status", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
              { value: totalConfessions > 0 ? "👀" : "—", label: "a mãe viu?", icon: <Eye className="w-3.5 h-3.5" /> },
            ].map((s, i) => (
              <div
                key={i}
                className="flex-1 max-w-[110px] rounded-xl py-2.5 px-2 text-center"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <p className="font-display font-bold text-sm text-white">{s.value}</p>
                <p className="text-[9px] text-white/70 font-body">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* ═══════ Confession Form ═══════ */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full group relative overflow-hidden rounded-2xl p-[2px] transition-all hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, hsl(35 90% 55%), hsl(25 85% 45%), hsl(35 90% 55%))",
              backgroundSize: "200% 200%",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          >
            <div className="rounded-[14px] bg-card px-5 py-4 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(145deg, hsl(35 90% 60%), hsl(25 85% 48%))",
                  boxShadow: "0 4px 12px rgba(200, 130, 30, 0.3), inset 0 1px 2px rgba(255,255,255,0.2)",
                }}
              >
                <Gavel className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-display font-bold text-sm">Confessar um erro</p>
                <p className="font-body text-xs text-muted-foreground">É melhor pra você. Confia.</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 8px 32px rgba(200, 130, 30, 0.15), 0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Form header */}
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, hsl(35 90% 55%), hsl(25 85% 45%))" }}
            >
              <Gavel className="w-4 h-4 text-white" />
              <span className="font-display text-sm font-bold text-white">Nova Confissão</span>
              {content.length >= 5 && (
                <span className="ml-auto text-[10px] text-white/80 font-body flex items-center gap-1">
                  {severity.icon} {severity.text}
                </span>
              )}
            </div>

            <div className="bg-card p-4 space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Ex: ${placeholder}`}
                className="min-h-[90px] font-body text-sm border-amber-300/30 focus:border-amber-500 bg-muted/30 rounded-xl resize-none"
                maxLength={300}
                autoFocus
              />

              {/* Severity meter */}
              {content.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-body">Gravidade:</span>
                    <span className="text-[10px] text-muted-foreground font-body">{content.length}/300</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${severity.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, (content.length / 300) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" className="font-display text-xs" onClick={() => { setShowForm(false); setContent(""); }}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={addConfession.isPending || content.trim().length < 5}
                  className="gap-1.5 font-display text-xs text-white rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, hsl(35 90% 55%), hsl(25 85% 45%))",
                    boxShadow: "0 4px 12px rgba(200, 130, 30, 0.3)",
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  {addConfession.isPending ? "Registrando..." : "Confessar"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ Confessions List ═══════ */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-5xl" style={{ animation: "gavel-swing 1.5s ease-in-out infinite" }}>⚖️</div>
            <p className="font-body text-sm text-muted-foreground mt-3">Carregando confissões...</p>
          </div>
        ) : confessions.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: "linear-gradient(145deg, hsl(var(--card)), hsl(var(--muted) / 0.3))",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06), inset 0 1px 3px rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "linear-gradient(145deg, hsl(35 90% 60% / 0.15), hsl(25 85% 48% / 0.05))",
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <Gavel className="w-10 h-10 text-amber-400/60" />
            </div>
            <p className="font-display font-bold text-lg">Ficha limpa</p>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Nenhuma confissão. Duvidoso... mas ok. 🤔
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-sm font-bold text-muted-foreground">
                📋 Histórico Criminal ({totalConfessions})
              </h2>
            </div>

            {confessions.map((c: any, idx: number) => {
              const isExpanded = expandedId === c.id;
              const confSeverity = getSeverityLabel(c.content.length);
              const emoji = VERDICT_EMOJIS[idx % VERDICT_EMOJIS.length];

              return (
                <div
                  key={c.id}
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  className="cursor-pointer group rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: "hsl(var(--card))",
                    boxShadow: isExpanded
                      ? "0 12px 32px rgba(200, 130, 30, 0.12), 0 2px 8px rgba(0,0,0,0.06)"
                      : "0 2px 8px rgba(0,0,0,0.04)",
                    transform: isExpanded ? "scale(1.01)" : "scale(1)",
                    borderLeft: `4px solid`,
                    borderImage: `linear-gradient(to bottom, ${
                      confSeverity.color.includes("green") ? "hsl(142, 71%, 45%)" :
                      confSeverity.color.includes("red") ? "hsl(0, 84%, 60%)" :
                      "hsl(35, 90%, 55%)"
                    }, transparent) 1`,
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* 3D emoji badge */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                        style={{
                          background: "linear-gradient(145deg, hsl(35 90% 60% / 0.15), hsl(25 85% 48% / 0.05))",
                          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.15), 0 2px 6px rgba(0,0,0,0.05)",
                        }}
                      >
                        {emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-body text-sm leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                          {c.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-muted-foreground font-body">
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-display font-bold bg-gradient-to-r ${confSeverity.color} text-white`}>
                            {confSeverity.icon} {confSeverity.text}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConfession.mutate(c.id); }}
                        className="text-muted-foreground hover:text-destructive transition-all p-1.5 shrink-0 rounded-lg hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-muted/30 animate-fade-in">
                        <p className="text-[11px] text-muted-foreground font-body italic text-center">
                          {c.content.length > 100
                            ? "Confissão longa. A culpa é real. A mãe sabe."
                            : c.content.length > 50
                            ? "Confissão moderada. Você tentou minimizar, mas sabemos."
                            : "Curto e grosso. Pelo menos foi sincero."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes gavel-swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
      `}</style>
    </div>
  );
}
