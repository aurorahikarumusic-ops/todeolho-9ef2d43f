import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyPartner } from "@/hooks/useFamily";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Plus, CalendarDays, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { getMomGreeting } from "@/lib/mom-constants";
import InvitePartner from "@/components/family/InvitePartner";
import MonthlyChallenge from "@/components/home/MonthlyChallenge";
import MonthlyReport from "@/components/home/MonthlyReport";
import GrandmaPalpitesCard from "@/components/home/GrandmaPalpitesCard";

export default function MomDashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: partner, isLoading: partnerLoading } = useFamilyPartner();
  const navigate = useNavigate();

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const monthStart = startOfMonth(now).toISOString();
  const monthEnd = endOfMonth(now).toISOString();

  const { data: weekTasks = [] } = useQuery({
    queryKey: ["mom-week-tasks", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", profile.family_id)
        .gte("created_at", weekStart)
        .lte("created_at", weekEnd);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  const { data: monthTasks = [] } = useQuery({
    queryKey: ["mom-month-tasks", profile?.family_id, monthStart],
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

  const { data: lastRating } = useQuery({
    queryKey: ["mom-last-rating", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("mom_ratings")
        .select("*")
        .eq("rated_by", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  if (!profile) return null;

  const dadName = partner?.display_name || "o pai";
  const tasksTotal = weekTasks.length;
  const tasksCompleted = weekTasks.filter((t: any) => t.completed_at && !t.rescued_by_mom).length;
  const rescues = monthTasks.filter((t: any) => t.rescued_by_mom).length;
  const pendingApproval = weekTasks.filter((t: any) => t.completed_at && t.mom_approved === null && !t.rescued_by_mom).length;

  // Dynamic subtitle
  let subtitle = `O ${dadName} tem ${tasksTotal - tasksCompleted} tarefas pendentes. Ele sabe disso.`;
  if (tasksCompleted === tasksTotal && tasksTotal > 0) {
    subtitle = `Essa semana o ${dadName} fez tudo. Guarda esse print.`;
  }
  if (rescues > 0) {
    subtitle = `Você resgatou ${rescues} tarefa(s) esse mês. Vai pro relatório.`;
  }

  const greeting = getMomGreeting(dadName, monthTasks.length);

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <Eye className="w-6 h-6 text-mom" />
          <h1 className="font-display text-2xl font-bold">
            Estou de <span className="text-mom">Olho</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-mom text-white font-display text-xs">
            👩 CEO da Família
          </Badge>
          <button onClick={() => navigate("/perfil")} className="flex flex-col items-center gap-0.5 group">
            <Avatar className="h-10 w-10 ring-2 ring-mom/30 group-hover:ring-mom transition-all">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name} />
              <AvatarFallback className="bg-mom/10 text-mom font-display text-sm">
                {profile.display_name?.charAt(0)?.toUpperCase() || "M"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[9px] text-muted-foreground group-hover:text-mom transition-colors">Ver perfil</span>
          </button>
        </div>
      </div>

      {/* Greeting Card */}
      <Card className="border-mom-border bg-mom-bg">
        <CardContent className="p-4">
          <p className="font-display text-lg font-bold text-mom-text">
            Olá, {profile.display_name}! 👩
          </p>
          <p className="font-body text-sm text-mom-text/80 mt-1">
            {subtitle}
          </p>
          <p className="font-body text-xs italic text-mom/70 mt-2">
            {greeting}
          </p>
        </CardContent>
      </Card>

      {/* Partner banner */}
      {!partnerLoading && !partner && (
        <div className="space-y-2">
          <Card className="border-mom-border border-dashed bg-mom-bg/50">
            <CardContent className="p-4 text-center">
              <p className="font-body text-sm text-mom-text mb-2">
                O pai ainda não entrou no app.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mb-2 border-mom text-mom hover:bg-mom/10"
                onClick={() => navigate("/perfil")}
              >
                Reenviar convite — ele provavelmente não viu.
              </Button>
            </CardContent>
          </Card>
          <InvitePartner />
        </div>
      )}

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className={`font-display text-xl font-bold ${tasksCompleted >= tasksTotal * 0.7 ? "text-primary" : "text-secondary"}`}>
              {tasksCompleted}/{tasksTotal}
            </p>
            <p className="text-[10px] text-muted-foreground font-body">tarefas semana</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className={`font-display text-xl font-bold ${rescues > 0 ? "text-secondary" : "text-primary"}`}>
              {rescues}
            </p>
            <p className="text-[10px] text-muted-foreground font-body">resgates/mês</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="font-display text-xl font-bold text-mom">
              {lastRating ? `${lastRating.stars}★` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground font-body">última avaliação</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending approval */}
      {pendingApproval > 0 && (
        <Card className="border-secondary bg-secondary/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-sm">
                {pendingApproval} tarefa(s) aguardando aprovação
              </p>
              <p className="text-xs text-muted-foreground font-body italic">
                O {dadName} concluiu. Você confere.
              </p>
            </div>
            <Button size="sm" className="bg-mom" onClick={() => navigate("/tarefas")}>
              Ver
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grandma Palpites */}
      <GrandmaPalpitesCard />

      {/* Monthly Challenge */}
      <MonthlyChallenge />

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          className="h-14 bg-mom hover:bg-mom/90 font-display text-xs flex flex-col gap-1"
          onClick={() => navigate("/tarefas")}
        >
          <Plus className="w-5 h-5" />
          Nova Tarefa
        </Button>
        <Button
          variant="outline"
          className="h-14 border-primary text-primary hover:bg-primary/10 font-display text-xs flex flex-col gap-1"
          onClick={() => navigate("/agenda")}
        >
          <CalendarDays className="w-5 h-5" />
          Novo Evento
        </Button>
        <Button
          variant="outline"
          className="h-14 border-mom text-mom hover:bg-mom/10 font-display text-xs flex flex-col gap-1"
          onClick={() => navigate("/ranking")}
        >
          <BarChart3 className="w-5 h-5" />
          Ranking
        </Button>
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-display font-bold text-sm mb-3">📊 Semana em números</h3>
          <div className="space-y-2 text-sm font-body">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tarefas criadas</span>
              <span className="font-bold">{tasksTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completadas pelo pai</span>
              <span className="font-bold text-primary">{tasksCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resgates (mês)</span>
              <span className={`font-bold ${rescues > 0 ? "text-secondary" : "text-primary"}`}>{rescues}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aguardando aprovação</span>
              <span className="font-bold text-mom">{pendingApproval}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Report */}
      <MonthlyReport />
    </div>
  );
}
