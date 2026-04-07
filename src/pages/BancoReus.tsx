import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  if (len < 30) return { text: "Contravenção leve", color: "bg-green-400", icon: "😏" };
  if (len < 80) return { text: "Delito moderado", color: "bg-amber-400", icon: "😬" };
  if (len < 150) return { text: "Crime grave", color: "bg-orange-500", icon: "🚨" };
  return { text: "Sentença máxima", color: "bg-red-500", icon: "💀" };
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
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-0 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto bg-background">

      {/* ═══════ Neo-Brutalist Hero Header ═══════ */}
      <div className="dad-neo-card -mx-4 md:-mx-8 px-6 pt-8 pb-6 mb-6 relative overflow-hidden" style={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
        <div className="absolute top-4 right-4 text-7xl opacity-10 rotate-12 select-none">⚖️</div>
        <div className="absolute bottom-2 left-4 text-5xl opacity-10 -rotate-12 select-none">🔨</div>

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto border-3 border-[hsl(var(--dad-text))]" style={{ background: "hsl(var(--dad-accent))", boxShadow: "4px 4px 0 hsl(var(--dad-text))" }}>
            <Gavel className="w-8 h-8 text-white drop-shadow-md" />
          </div>

          <h1 className="font-display text-2xl font-bold text-center" style={{ color: "hsl(var(--dad-text))" }}>
            Banco dos Réus
          </h1>
          <p className="font-body text-sm text-center mt-1" style={{ color: "hsl(var(--dad-text) / 0.7)" }}>
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
                className="flex-1 max-w-[110px] rounded-xl py-2.5 px-2 text-center border-2"
                style={{
                  background: "white",
                  borderColor: "hsl(var(--dad-text))",
                  boxShadow: "3px 3px 0 hsl(var(--dad-text))",
                }}
              >
                <p className="font-display font-bold text-sm" style={{ color: "hsl(var(--dad-text))" }}>{s.value}</p>
                <p className="text-[9px] font-body" style={{ color: "hsl(var(--dad-text) / 0.6)" }}>{s.label}</p>
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
            className="dad-neo-btn w-full flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2" style={{ background: "hsl(var(--dad-accent))", borderColor: "hsl(var(--dad-text))" }}>
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-sm">Confessar um erro</p>
              <p className="font-body text-xs opacity-70">É melhor pra você. Confia.</p>
            </div>
            <AlertTriangle className="w-5 h-5 opacity-60" />
          </button>
        ) : (
          <div className="dad-neo-card overflow-hidden">
            {/* Form header */}
            <div className="px-5 py-3 flex items-center gap-2 border-b-3" style={{ background: "hsl(var(--dad-accent))", borderColor: "hsl(var(--dad-text))" }}>
              <Gavel className="w-4 h-4 text-white" />
              <span className="font-display text-sm font-bold text-white">Nova Confissão</span>
              {content.length >= 5 && (
                <span className="ml-auto text-[10px] text-white/80 font-body flex items-center gap-1">
                  {severity.icon} {severity.text}
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Ex: ${placeholder}`}
                className="min-h-[90px] font-body text-sm border-2 rounded-xl resize-none"
                style={{ borderColor: "hsl(var(--dad-text) / 0.3)", background: "white" }}
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
                  <div className="h-3 rounded-full bg-muted/50 overflow-hidden border-2" style={{ borderColor: "hsl(var(--dad-text))" }}>
                    <div
                      className={`h-full rounded-full ${severity.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, (content.length / 300) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button className="font-display text-xs px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors" onClick={() => { setShowForm(false); setContent(""); }}>
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={addConfession.isPending || content.trim().length < 5}
                  className="dad-neo-btn text-xs gap-1.5 flex items-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  {addConfession.isPending ? "Registrando..." : "Confessar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ Confessions List ═══════ */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-5xl animate-bounce">⚖️</div>
            <p className="font-body text-sm mt-3" style={{ color: "hsl(var(--dad-text) / 0.6)" }}>Carregando confissões...</p>
          </div>
        ) : confessions.length === 0 ? (
          <div className="dad-neo-card p-8 text-center border-dashed">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2" style={{ background: "hsl(var(--dad-accent) / 0.15)", borderColor: "hsl(var(--dad-text) / 0.3)" }}>
              <Gavel className="w-10 h-10" style={{ color: "hsl(var(--dad-accent))" }} />
            </div>
            <p className="font-display font-bold text-lg" style={{ color: "hsl(var(--dad-text))" }}>Ficha limpa</p>
            <p className="font-body text-sm mt-1" style={{ color: "hsl(var(--dad-text) / 0.6)" }}>
              Nenhuma confissão. Duvidoso... mas ok. 🤔
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-sm font-bold" style={{ color: "hsl(var(--dad-text))" }}>
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
                  className="cursor-pointer group dad-neo-card overflow-hidden transition-all duration-300"
                  style={isExpanded ? { transform: "translate(-2px, -2px)", boxShadow: "10px 10px 0 hsl(var(--dad-text))" } : undefined}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Emoji badge */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl border-2"
                        style={{ background: "hsl(var(--dad-accent) / 0.15)", borderColor: "hsl(var(--dad-text))" }}
                      >
                        {emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-body text-sm leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`} style={{ color: "hsl(var(--dad-text))" }}>
                          {c.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-body" style={{ color: "hsl(var(--dad-text) / 0.5)" }}>
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-display font-bold ${confSeverity.color} text-white border border-[hsl(var(--dad-text))]`}>
                            {confSeverity.icon} {confSeverity.text}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConfession.mutate(c.id); }}
                        className="p-1.5 shrink-0 rounded-lg hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all border-2 border-transparent hover:border-red-400"
                        style={{ color: "hsl(var(--dad-text) / 0.4)" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t-2 animate-fade-in" style={{ borderColor: "hsl(var(--dad-text) / 0.15)" }}>
                        <p className="text-[11px] font-body italic text-center" style={{ color: "hsl(var(--dad-text) / 0.5)" }}>
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
    </div>
  );
}
