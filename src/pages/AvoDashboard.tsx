import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import {
  useGrandmaSuggestions,
  useCreateSuggestion,
  useGrandmaRanking,
} from "@/hooks/useGrandmaSuggestions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, Trophy, CheckCircle, XCircle, Clock, Lightbulb, CalendarDays, MessageSquare } from "lucide-react";
import JoinFamilyAvo from "@/components/grandma/JoinFamilyAvo";
import { useFamilyPartner } from "@/hooks/useFamily";

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

  if (!partnerLoading && !partner && !profile?.family_id) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <div className="text-center py-8">
          <span className="text-6xl block mb-4">👵</span>
          <h1 className="font-display text-2xl font-bold text-avo">Olá, Vovó!</h1>
          <p className="font-body text-muted-foreground mt-2">
            Primeiro, você precisa se conectar à família. Peça o código de convite para a mãe.
          </p>
        </div>
        <JoinFamily />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-avo-border bg-avo-bg p-6">
        <div className="absolute top-0 left-0 right-0 h-2 bg-avo" />
        <div className="absolute top-2 right-4 text-4xl opacity-20">🧶</div>
        <div className="flex items-center gap-4 mt-2">
          <div className="w-16 h-16 rounded-full bg-avo/20 flex items-center justify-center text-3xl border-2 border-avo">
            👵
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-avo-text">
              Olá, {profile?.display_name || "Vovó"}!
            </h1>
            <p className="font-body text-sm text-avo-text/70 italic">"{randomTip}"</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/80 rounded-xl p-3 text-center border border-avo-border shadow-sm">
            <div className="text-2xl font-display font-bold text-avo">{mySuggestions.length}</div>
            <div className="text-[10px] font-body text-muted-foreground">Palpites</div>
          </div>
          <div className="bg-white/80 rounded-xl p-3 text-center border border-green-200 shadow-sm">
            <div className="text-2xl font-display font-bold text-green-600">{accepted}</div>
            <div className="text-[10px] font-body text-muted-foreground">Aceitos</div>
          </div>
          <div className="bg-white/80 rounded-xl p-3 text-center border border-red-200 shadow-sm">
            <div className="text-2xl font-display font-bold text-red-500">{rejected}</div>
            <div className="text-[10px] font-body text-muted-foreground">Recusados</div>
          </div>
        </div>
      </div>

      {/* Send Suggestion CTA */}
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full h-14 font-display text-lg bg-avo hover:bg-avo/80 text-white shadow-lg"
          style={{
            boxShadow: "0 8px 30px -6px hsl(270 60% 55% / 0.4)",
          }}
        >
          <Lightbulb className="w-6 h-6 mr-2" />
          Dar um Palpite 👵💡
        </Button>
      ) : (
        <Card className="border-2 border-avo-border bg-avo-bg/50">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-avo-text flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-avo" /> Novo Palpite
            </h3>

            {/* Type selector */}
            <div className="flex gap-2">
              {SUGGESTION_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`flex-1 p-2 rounded-xl border-2 text-center transition-all ${
                    selectedType === t.value
                      ? "border-avo bg-avo/10 scale-105"
                      : "border-avo-border bg-white/50"
                  }`}
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
              className="font-body border-avo-border"
            />
            <Textarea
              placeholder="Detalhes do palpite (opcional)... Na minha época..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="font-body border-avo-border resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createSuggestion.isPending}
                className="flex-1 bg-avo hover:bg-avo/80 text-white"
              >
                <Send className="w-4 h-4 mr-1" /> Enviar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking */}
      {ranking.length > 0 && (
        <Card className="border-2 border-avo-border overflow-hidden">
          <div className="bg-gradient-to-r from-avo to-avo-glow p-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Ranking das Avós Palpiteiras
            </h3>
            <p className="text-xs text-white/80 font-body">Quem dá mais palpite? 👀</p>
          </div>
          <CardContent className="pt-4 space-y-3">
            {ranking.map((avo, i) => (
              <div
                key={avo.user_id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  i === 0 ? "bg-avo-bg border-2 border-avo scale-[1.02]" : "bg-muted/30"
                }`}
              >
                <div className="text-2xl font-display font-bold text-avo w-8 text-center">
                  {i === 0 ? "👑" : i + 1}
                </div>
                <Avatar className="w-10 h-10 border-2 border-avo-border">
                  <AvatarFallback className="bg-avo/20 text-avo font-display">
                    {(avo.display_name || "V")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-body font-semibold text-sm">{avo.display_name || "Vovó"}</div>
                  <div className="flex gap-2 text-[10px] font-body text-muted-foreground">
                    <span>📝 {avo.total} palpites</span>
                    <span>✅ {avo.accepted} aceitos</span>
                  </div>
                </div>
                {i === 0 && <Badge className="bg-avo text-white text-[10px]">Top Palpiteira</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div>
        <h3 className="font-display text-lg font-bold text-avo-text mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-avo" /> Meus Palpites
        </h3>
        {mySuggestions.length === 0 ? (
          <Card className="border-2 border-dashed border-avo-border">
            <CardContent className="py-8 text-center">
              <span className="text-4xl block mb-2">🧶</span>
              <p className="font-body text-muted-foreground text-sm">
                Nenhum palpite ainda? Isso não é típico de avó...
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {mySuggestions.map((s) => {
              const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
                pendente: { icon: Clock, color: "text-yellow-600 bg-yellow-50 border-yellow-200", label: "Aguardando" },
                aceito: { icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200", label: "Aceito! 🎉" },
                recusado: { icon: XCircle, color: "text-red-500 bg-red-50 border-red-200", label: "Recusado 😤" },
                ignorado: { icon: Clock, color: "text-gray-400 bg-gray-50 border-gray-200", label: "Ignorado 😒" },
              };
              const cfg = statusConfig[s.status] || statusConfig.pendente;
              const Icon = cfg.icon;
              const typeEmoji = s.suggestion_type === "tarefa" ? "📋" : s.suggestion_type === "evento" ? "📅" : "💬";

              return (
                <Card key={s.id} className={`border-2 ${cfg.color}`}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{typeEmoji}</span>
                          <span className="font-body font-semibold text-sm">{s.title}</span>
                        </div>
                        {s.description && (
                          <p className="font-body text-xs text-muted-foreground">{s.description}</p>
                        )}
                        {s.response_comment && (
                          <p className="font-body text-xs mt-1 italic text-avo-text">
                            💬 Resposta: "{s.response_comment}"
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${cfg.color} ml-2`}>
                        <Icon className="w-3 h-3 mr-1" /> {cfg.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
