import { useProfile } from "@/hooks/useProfile";
import { useFamilyPartner } from "@/hooks/useFamily";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Share2, FileBarChart } from "lucide-react";

export default function MonthlyReport() {
  const { data: profile } = useProfile();
  const { data: partner } = useFamilyPartner();

  const now = new Date();
  const monthStart = startOfMonth(now).toISOString();
  const monthEnd = endOfMonth(now).toISOString();
  const monthName = format(now, "MMMM", { locale: ptBR });

  const { data: monthTasks = [] } = useQuery({
    queryKey: ["monthly-report-tasks", profile?.family_id, monthStart],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", profile.family_id)
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  const { data: monthRatings = [] } = useQuery({
    queryKey: ["monthly-report-ratings", profile?.user_id, monthStart],
    queryFn: async () => {
      if (!profile?.user_id) return [];
      const { data } = await supabase
        .from("mom_ratings")
        .select("*")
        .eq("rated_by", profile.user_id)
        .gte("week_start", monthStart.split("T")[0])
        .lte("week_start", monthEnd.split("T")[0]);
      return data || [];
    },
    enabled: !!profile?.user_id,
  });

  const dadName = partner?.display_name?.split(" ")[0] || "Pai";
  const created = monthTasks.length;
  const completed = monthTasks.filter((t: any) => t.completed_at && !t.rescued_by_mom).length;
  const rescued = monthTasks.filter((t: any) => t.rescued_by_mom).length;
  const avgRating = monthRatings.length > 0
    ? (monthRatings.reduce((sum: number, r: any) => sum + r.stars, 0) / monthRatings.length).toFixed(1)
    : "—";

  const getVeredito = () => {
    if (rescued === 0 && completed >= created * 0.8) return "Mês excepcional. Guarda esse relatório.";
    if (rescued > 3) return `${rescued} resgates. ${dadName} tá devendo.`;
    if (completed === 0) return "Sem tarefas concluídas. Sem comentários.";
    return `Mês regular. ${dadName} sobreviveu.`;
  };

  const handleShare = async () => {
    const text = `📊 Relatório de ${monthName} — Estou de Olho 👁️\n\n📋 Tarefas criadas: ${created}\n✅ Concluídas: ${completed}\n🛟 Resgates: ${rescued}\n⭐ Avaliação média: ${avgRating}\n\n${getVeredito()}\n\n📲 estoudeolho.lovable.app`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Relatório copiado! Cola no WhatsApp. 📋");
    }
  };

  if (created === 0) return null;

  return (
    <Card className="border-mom-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileBarChart className="w-5 h-5 text-mom" />
          <h3 className="font-display font-bold text-sm">Relatório de {monthName}</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="font-display text-lg font-bold">{created}</p>
            <p className="text-[10px] text-muted-foreground">Tarefas criadas</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="font-display text-lg font-bold text-primary">{completed}</p>
            <p className="text-[10px] text-muted-foreground">Concluídas</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className={`font-display text-lg font-bold ${rescued > 0 ? "text-secondary" : "text-primary"}`}>{rescued}</p>
            <p className="text-[10px] text-muted-foreground">Resgates</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="font-display text-lg font-bold text-mom">{avgRating}⭐</p>
            <p className="text-[10px] text-muted-foreground">Avaliação média</p>
          </div>
        </div>

        <p className="text-xs font-body italic text-muted-foreground mb-3 text-center">
          {getVeredito()}
        </p>

        <Button
          variant="outline"
          className="w-full border-mom text-mom hover:bg-mom/10 font-display text-sm"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" /> Compartilhar relatório
        </Button>
      </CardContent>
    </Card>
  );
}
