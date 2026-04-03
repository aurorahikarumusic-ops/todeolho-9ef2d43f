import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useFamilyPartner } from "@/hooks/useFamily";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { format, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trophy, Plus } from "lucide-react";

export default function MonthlyChallenge() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: partner } = useFamilyPartner();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    success_criteria: "",
    badge_emoji: "🏅",
    badge_name: "",
  });

  const { data: currentChallenge } = useQuery({
    queryKey: ["monthly-challenge", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return null;
      const now = new Date();
      const monthEnd = endOfMonth(now).toISOString().split("T")[0];
      const { data } = await supabase
        .from("monthly_challenges")
        .select("*")
        .eq("family_id", profile.family_id)
        .gte("deadline", new Date().toISOString().split("T")[0])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!profile?.family_id,
  });

  const createChallenge = useMutation({
    mutationFn: async () => {
      if (!user || !profile?.family_id) throw new Error("Sem família");
      const deadline = endOfMonth(new Date()).toISOString().split("T")[0];
      const { error } = await supabase.from("monthly_challenges").insert({
        family_id: profile.family_id,
        created_by: user.id,
        title: form.title,
        description: form.description || null,
        success_criteria: form.success_criteria || null,
        badge_emoji: form.badge_emoji || "🏅",
        badge_name: form.badge_name || form.title,
        deadline,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-challenge"] });
      setShowCreate(false);
      setForm({ title: "", description: "", success_criteria: "", badge_emoji: "🏅", badge_name: "" });
      toast.success("Desafio do mês criado! O pai foi avisado. 🎯");
    },
    onError: () => toast.error("Erro ao criar desafio."),
  });

  const dadName = partner?.display_name?.split(" ")[0] || "o pai";

  if (!currentChallenge && profile?.role !== "mae") return null;

  return (
    <>
      <Card className="border-mom-border bg-gradient-to-br from-mom-bg to-white overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-mom" />
            <h3 className="font-display font-bold text-sm">Desafio do Mês</h3>
          </div>

          {currentChallenge ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{currentChallenge.badge_emoji}</span>
                <h4 className="font-display font-bold">{currentChallenge.title}</h4>
              </div>
              {currentChallenge.description && (
                <p className="text-xs font-body text-muted-foreground mb-2">{currentChallenge.description}</p>
              )}
              {currentChallenge.success_criteria && (
                <p className="text-xs font-body text-primary mb-2">
                  🎯 Critério: {currentChallenge.success_criteria}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground font-body">
                Prazo: {format(new Date(currentChallenge.deadline), "dd/MM/yyyy")}
              </p>
              {currentChallenge.completed_at && (
                <div className="mt-2 p-2 rounded-lg bg-primary/10 text-center">
                  <span className="text-sm font-display font-bold text-primary">
                    ✅ Desafio cumprido!
                  </span>
                </div>
              )}
            </div>
          ) : profile?.role === "mae" ? (
            <div className="text-center">
              <p className="text-xs font-body text-muted-foreground mb-3">
                Nenhum desafio ativo. Crie um para o {dadName}.
              </p>
              <Button
                size="sm"
                className="bg-mom hover:bg-mom/90 font-display"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="w-4 h-4 mr-1" /> Criar Desafio
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Sheet open={showCreate} onOpenChange={setShowCreate}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Novo Desafio do Mês 🎯</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-body">Nome do desafio</Label>
              <Input
                placeholder="Ex: Buscar as crianças 10 vezes"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-body">Descrição (opcional)</Label>
              <Textarea
                placeholder="Detalhes do desafio..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 min-h-[60px]"
              />
            </div>
            <div>
              <Label className="text-xs font-body">Critério de sucesso</Label>
              <Input
                placeholder="Ex: 10 buscas comprovadas com foto"
                value={form.success_criteria}
                onChange={(e) => setForm((f) => ({ ...f, success_criteria: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <div className="w-20">
                <Label className="text-xs font-body">Emoji</Label>
                <Input
                  value={form.badge_emoji}
                  onChange={(e) => setForm((f) => ({ ...f, badge_emoji: e.target.value }))}
                  className="mt-1 text-center text-xl"
                  maxLength={4}
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs font-body">Nome do badge</Label>
                <Input
                  placeholder="Ex: Pai Presente"
                  value={form.badge_name}
                  onChange={(e) => setForm((f) => ({ ...f, badge_name: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground font-body">
              Prazo: até {format(endOfMonth(new Date()), "dd/MM/yyyy")} (fim do mês)
            </p>
            <Button
              className="w-full bg-mom hover:bg-mom/90 font-display"
              onClick={() => createChallenge.mutate()}
              disabled={!form.title.trim() || createChallenge.isPending}
            >
              {createChallenge.isPending ? "Criando..." : "Lançar Desafio"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
