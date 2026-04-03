import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Gavel, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BancoReus() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: confessions = [], isLoading } = useQuery({
    queryKey: ["confessions-page", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("confessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addConfession = useMutation({
    mutationFn: async (text: string) => {
      if (!user || !profile?.family_id) throw new Error("Sem família");
      const { error } = await supabase.from("confessions").insert({
        user_id: user.id,
        family_id: profile.family_id,
        content: text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["confessions-page"] });
      setContent("");
      setShowForm(false);
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
    if (!trimmed || trimmed.length < 5) {
      toast.error("Confessa direito! Mínimo 5 caracteres.");
      return;
    }
    if (trimmed.length > 300) {
      toast.error("Máximo 300 caracteres.");
      return;
    }
    addConfession.mutate(trimmed);
  };

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
          <Gavel className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            Banco dos Réus
          </h1>
          <p className="font-body text-xs text-muted-foreground">
            Confesse antes que ela descubra ⚖️
          </p>
        </div>
      </div>

      {/* Confession form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full text-left font-body text-sm text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg border border-dashed border-amber-300/50 hover:border-amber-400 bg-amber-50/50 dark:bg-amber-950/10"
        >
          ⚖️ Confessar um erro antes que ela descubra...
        </button>
      ) : (
        <Card className="border-amber-300/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="p-4 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='Ex: "Deixei a louça de molho desde ontem... e esqueci."'
              className="min-h-[80px] font-body text-sm border-amber-300/50 focus:border-amber-500"
              maxLength={300}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-body">{content.length}/300</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setContent(""); }}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={addConfession.isPending}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Confessar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confessions list */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-4xl animate-bounce">⚖️</div>
          <p className="font-body text-sm text-muted-foreground mt-2">Carregando confissões...</p>
        </div>
      ) : confessions.length === 0 ? (
        <Card className="border-dashed border-amber-300/50">
          <CardContent className="p-8 text-center">
            <Gavel className="w-12 h-12 text-amber-300 mx-auto mb-3" />
            <p className="font-display font-bold text-foreground">Nenhuma confissão ainda</p>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Ficha limpa? Duvidoso. Mas ok. 🤔
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {confessions.map((c: any) => (
            <Card key={c.id} className="border-amber-200/30 hover:border-amber-300/50 transition-colors">
              <CardContent className="p-4 flex items-start gap-3">
                <span className="text-2xl mt-0.5">⚖️</span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-foreground leading-relaxed">{c.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-body">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <button
                  onClick={() => deleteConfession.mutate(c.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
