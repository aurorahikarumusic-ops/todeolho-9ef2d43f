import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import {
  useGrandmaSuggestions,
  useCreateSuggestion,
  useGrandmaRanking,
} from "@/hooks/useGrandmaSuggestions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, Trophy, CheckCircle, XCircle, Clock, Lightbulb, MessageSquare } from "lucide-react";
import JoinFamilyAvo from "@/components/grandma/JoinFamilyAvo";
import { useFamilyPartner } from "@/hooks/useFamily";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTION_TYPES = [
  { value: "tarefa", label: "Sugestão de Tarefa", icon: "📋", desc: "Crie uma tarefa pro pai fazer" },
  { value: "evento", label: "Sugestão de Evento", icon: "📅", desc: "Sugira um evento importante" },
  { value: "palpite", label: "Palpite Geral", icon: "💬", desc: "Dê sua opinião sobre tudo" },
];

const GRANDMA_TIPS = [
  "Na minha época não existia fralda descartável...",
  "Vocês dão muita moleza pra esse menino!",
  "Esse pai precisa aprender a trocar fralda direito",
  "Antigamente a gente criava 10 filhos sem reclamar",
  "Eu avisei que isso ia acontecer",
  "Tá frio! Coloca um casaco nessa criança!",
];

export default function AvoDashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: partner, isLoading: partnerLoading } = useFamilyPartner();
  const { data: suggestions = [] } = useGrandmaSuggestions();
  const { data: ranking = [] } = useGrandmaRanking();
  const createSuggestion = useCreateSuggestion();

  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("palpite");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const randomTip = GRANDMA_TIPS[Math.floor(Math.random() * GRANDMA_TIPS.length)];

  const mySuggestions = suggestions.filter((s) => s.user_id === user?.id);
  const accepted = mySuggestions.filter((s) => s.status === "aceito").length;
  const rejected = mySuggestions.filter((s) => s.status === "recusado").length;
  const pending = mySuggestions.filter((s) => s.status === "pendente").length;

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Calma, vovó!", { description: "Coloca pelo menos um título no palpite." });
      return;
    }
    try {
      await createSuggestion.mutateAsync({ title, description, suggestion_type: selectedType });
      toast.success("Palpite enviado! 👵", {
        description: "Agora é só esperar a família decidir se vai ouvir a experiência de quem já viveu.",
      });
      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch {
      toast.error("Erro ao enviar palpite");
    }
  };

  return (
    <div className="avo-neo-page pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
      {/* Header — Neo-Brutalista */}
      <div className="avo-neo-card p-5 relative overflow-hidden">
        <div className="absolute top-2 right-4 text-4xl opacity-20">🧶</div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{
              background: "hsl(var(--avo-bg))",
              border: "3px solid hsl(270 40% 25%)",
              boxShadow: "4px 4px 0 hsl(270 40% 25%)",
            }}>
            👵
          </div>
          <div>
            <h1 className="font-display text-xl font-black" style={{ color: "hsl(var(--avo-text))" }}>
              Olá, {profile?.display_name || "Vovó"}!
            </h1>
            <p className="font-body text-sm italic" style={{ color: "hsl(var(--avo-text) / 0.7)" }}>
              "{randomTip}"
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="avo-neo-card-sm p-3 text-center" style={{ background: "white" }}>
            <div className="text-2xl font-display font-bold" style={{ color: "hsl(var(--avo-accent))" }}>
              {mySuggestions.length}
            </div>
            <div className="text-[10px] font-body" style={{ color: "hsl(var(--avo-text) / 0.6)" }}>Palpites</div>
          </div>
          <div className="avo-neo-card-sm p-3 text-center" style={{ background: "white" }}>
            <div className="text-2xl font-display font-bold text-green-600">{accepted}</div>
            <div className="text-[10px] font-body" style={{ color: "hsl(var(--avo-text) / 0.6)" }}>Aceitos</div>
          </div>
          <div className="avo-neo-card-sm p-3 text-center" style={{ background: "white" }}>
            <div className="text-2xl font-display font-bold text-red-500">{rejected}</div>
            <div className="text-[10px] font-body" style={{ color: "hsl(var(--avo-text) / 0.6)" }}>Recusados</div>
          </div>
        </div>
      </div>

      {/* Send Suggestion CTA */}
      {!showForm ? (
        <button className="avo-neo-btn w-full justify-center text-lg py-4"
          onClick={() => setShowForm(true)}>
          <Lightbulb className="w-6 h-6" />
          Dar um Palpite 👵💡
        </button>
      ) : (
        <div className="avo-neo-card p-5 space-y-4">
          <h3 className="font-display text-lg font-bold flex items-center gap-2"
            style={{ color: "hsl(var(--avo-text))" }}>
            <Lightbulb className="w-5 h-5" style={{ color: "hsl(var(--avo-accent))" }} /> Novo Palpite
          </h3>

          {/* Type selector */}
          <div className="flex gap-2">
            {SUGGESTION_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`flex-1 p-2 rounded-xl transition-all ${
                  selectedType === t.value ? "avo-neo-card-sm scale-105" : ""
                }`}
                style={{
                  border: selectedType === t.value
                    ? "2px solid hsl(var(--avo-accent))"
                    : "2px solid hsl(var(--avo-border))",
                  background: selectedType === t.value
                    ? "hsl(var(--avo-bg))"
                    : "white",
                }}
              >
                <div className="text-xl">{t.icon}</div>
                <div className="text-[10px] font-body font-semibold mt-1">{t.label}</div>
              </button>
            ))}
          </div>

          <Input
            placeholder="Ex: O pai deveria levar as crianças no parque"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-body"
            style={{ borderColor: "hsl(var(--avo-border))" }}
          />
          <Textarea
            placeholder="Detalhes do palpite (opcional)... Na minha época..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="font-body resize-none"
            style={{ borderColor: "hsl(var(--avo-border))" }}
            rows={3}
          />
          <div className="flex gap-2">
            <button className="avo-neo-btn flex-1 justify-center"
              style={{ background: "white", color: "hsl(var(--avo-text))" }}
              onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button className="avo-neo-btn flex-1 justify-center"
              onClick={handleSubmit}
              disabled={createSuggestion.isPending}>
              <Send className="w-4 h-4" /> Enviar
            </button>
          </div>
        </div>
      )}

      {/* Ranking */}
      {ranking.length > 0 && (
        <div className="avo-neo-card overflow-hidden">
          <div className="p-4" style={{ background: "hsl(var(--avo-accent))" }}>
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Ranking das Avós Palpiteiras
            </h3>
            <p className="text-xs text-white/80 font-body">Quem dá mais palpite? 👀</p>
          </div>
          <div className="p-4 space-y-3">
            {ranking.map((avo, i) => (
              <div
                key={avo.user_id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  i === 0 ? "avo-neo-card-sm" : ""
                }`}
                style={{
                  background: i === 0 ? "hsl(var(--avo-bg))" : "hsl(var(--avo-bg) / 0.3)",
                }}
              >
                <div className="text-2xl font-display font-bold w-8 text-center"
                  style={{ color: "hsl(var(--avo-accent))" }}>
                  {i === 0 ? "👑" : i + 1}
                </div>
                <Avatar className="w-10 h-10" style={{ border: "2px solid hsl(var(--avo-border))" }}>
                  <AvatarFallback className="font-display"
                    style={{ background: "hsl(var(--avo-bg))", color: "hsl(var(--avo-accent))" }}>
                    {(avo.display_name || "V")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-body font-semibold text-sm">{avo.display_name || "Vovó"}</div>
                  <div className="flex gap-2 text-[10px] font-body" style={{ color: "hsl(var(--avo-text) / 0.6)" }}>
                    <span>📝 {avo.total} palpites</span>
                    <span>✅ {avo.accepted} aceitos</span>
                  </div>
                </div>
                {i === 0 && (
                  <span className="avo-neo-badge text-[10px]"
                    style={{ background: "hsl(var(--avo-accent))", color: "white" }}>
                    Top Palpiteira
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2"
          style={{ color: "hsl(var(--avo-text))" }}>
          <MessageSquare className="w-5 h-5" style={{ color: "hsl(var(--avo-accent))" }} /> Meus Palpites
        </h3>
        {mySuggestions.length === 0 ? (
          <div className="avo-neo-card p-8 text-center" style={{ borderStyle: "dashed" }}>
            <span className="text-4xl block mb-2">🧶</span>
            <p className="font-body text-sm" style={{ color: "hsl(var(--avo-text) / 0.6)" }}>
              Nenhum palpite ainda? Isso não é típico de avó...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mySuggestions.map((s) => {
              const statusConfig: Record<string, { icon: any; bg: string; label: string }> = {
                pendente: { icon: Clock, bg: "#FEF9C3", label: "Aguardando" },
                aceito: { icon: CheckCircle, bg: "#DCFCE7", label: "Aceito! 🎉" },
                recusado: { icon: XCircle, bg: "#FEE2E2", label: "Recusado 😤" },
                ignorado: { icon: Clock, bg: "#F3F4F6", label: "Ignorado 😒" },
              };
              const cfg = statusConfig[s.status] || statusConfig.pendente;
              const Icon = cfg.icon;
              const typeEmoji = s.suggestion_type === "tarefa" ? "📋" : s.suggestion_type === "evento" ? "📅" : "💬";

              return (
                <div key={s.id} className="avo-neo-card-sm p-4" style={{ background: cfg.bg }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{typeEmoji}</span>
                        <span className="font-body font-semibold text-sm">{s.title}</span>
                      </div>
                      {s.description && (
                        <p className="font-body text-xs" style={{ color: "hsl(var(--avo-text) / 0.6)" }}>
                          {s.description}
                        </p>
                      )}
                      {s.response_comment && (
                        <p className="font-body text-xs mt-1 italic" style={{ color: "hsl(var(--avo-text))" }}>
                          💬 Resposta: "{s.response_comment}"
                        </p>
                      )}
                    </div>
                    <span className="avo-neo-badge text-[10px] ml-2"
                      style={{ background: cfg.bg }}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>
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
