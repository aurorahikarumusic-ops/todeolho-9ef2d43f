import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyPartner } from "@/hooks/useFamily";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Plus, CalendarDays, BarChart3, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { getMomGreeting } from "@/lib/mom-constants";
import InvitePartner from "@/components/family/InvitePartner";
import MonthlyChallenge from "@/components/home/MonthlyChallenge";
import MonthlyReport from "@/components/home/MonthlyReport";
import GrandmaPalpitesCard from "@/components/home/GrandmaPalpitesCard";
import MomLetterNotification from "@/components/redemption/MomLetterNotification";

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
        .from("tasks").select("*")
        .eq("family_id", profile.family_id)
        .gte("created_at", weekStart).lte("created_at", weekEnd);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  const { data: monthTasks = [] } = useQuery({
    queryKey: ["mom-month-tasks", profile?.family_id, monthStart],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase
        .from("tasks").select("*")
        .eq("family_id", profile.family_id)
        .gte("created_at", monthStart).lte("created_at", monthEnd);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  const { data: lastRating } = useQuery({
    queryKey: ["mom-last-rating", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("mom_ratings").select("*")
        .eq("rated_by", user.id)
        .order("created_at", { ascending: false })
        .limit(1).maybeSingle();
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

  let subtitle = `O ${dadName} tem ${tasksTotal - tasksCompleted} tarefas pendentes. Ele sabe disso.`;
  if (tasksCompleted === tasksTotal && tasksTotal > 0) {
    subtitle = `Essa semana o ${dadName} fez tudo. Guarda esse print.`;
  }
  if (rescues > 0) {
    subtitle = `Você resgatou ${rescues} tarefa(s) esse mês. Vai pro relatório.`;
  }

  const greeting = getMomGreeting(dadName, monthTasks.length);

  return (
    <div className="mom-neo-page pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
      {/* Header — Neo-Brutalista */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <Eye className="w-7 h-7" style={{ color: "hsl(var(--mom-accent))" }} />
          <h1 className="font-display text-2xl font-black">
            Estou de <span style={{ color: "hsl(var(--mom-accent))" }}>Olho</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="mom-neo-badge" style={{ background: "hsl(var(--mom-cta))", color: "white" }}>
            👩 CEO da Família
          </span>
          <button onClick={() => navigate("/perfil")} className="flex flex-col items-center gap-0.5 group">
            <Avatar className="h-11 w-11 group-hover:scale-105 transition-transform"
              style={{
                border: "3px solid hsl(var(--mom-text))",
                boxShadow: "4px 4px 0 hsl(var(--mom-text))",
              }}>
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name} />
              <AvatarFallback className="font-display text-sm font-bold"
                style={{ background: "hsl(var(--mom-bg))", color: "hsl(var(--mom-text))" }}>
                {profile.display_name?.charAt(0)?.toUpperCase() || "M"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-display font-bold" style={{ color: "hsl(var(--mom-accent-hover))" }}>Ver perfil</span>
          </button>
        </div>
      </div>

      {/* Greeting Card — Neo */}
      <div className="mom-neo-card p-5">
        <p className="font-display text-lg font-bold" style={{ color: "hsl(var(--mom-text))" }}>
          Olá, {profile.display_name}! 👩
        </p>
        <p className="font-body text-sm mt-1" style={{ color: "hsl(var(--mom-text) / 0.8)" }}>
          {subtitle}
        </p>
        <p className="font-body text-xs italic mt-2" style={{ color: "hsl(var(--mom-accent) / 0.7)" }}>
          {greeting}
        </p>
      </div>

      {/* Love Letter Notification */}
      <MomLetterNotification />

      {/* Partner banner */}
      {!partnerLoading && !profile.family_id && (
        <div className="mom-neo-card p-4 text-center" style={{ borderStyle: "dashed" }}>
          <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(var(--mom-accent))" }} />
          <p className="font-display font-bold text-sm mb-1" style={{ color: "hsl(var(--mom-text))" }}>
            O pai ainda não entrou no app.
          </p>
          <p className="font-body text-xs mb-3" style={{ color: "hsl(var(--mom-accent-hover))" }}>
            Reenvie o convite — ele provavelmente não viu.
          </p>
          <InvitePartner />
        </div>
      )}

      {/* Stats Strip — Neo cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mom-neo-card-sm p-3 text-center">
          <p className={`font-display text-xl font-bold ${tasksCompleted >= tasksTotal * 0.7 ? "text-primary" : "text-secondary"}`}>
            {tasksCompleted}/{tasksTotal}
          </p>
          <p className="text-[10px] font-body" style={{ color: "hsl(var(--mom-accent-hover))" }}>tarefas semana</p>
        </div>
        <div className="mom-neo-card-sm p-3 text-center">
          <p className={`font-display text-xl font-bold ${rescues > 0 ? "text-secondary" : "text-primary"}`}>
            {rescues}
          </p>
          <p className="text-[10px] font-body" style={{ color: "hsl(var(--mom-accent-hover))" }}>resgates/mês</p>
        </div>
        <div className="mom-neo-card-sm p-3 text-center">
          <p className="font-display text-xl font-bold" style={{ color: "hsl(var(--mom-accent))" }}>
            {lastRating ? `${lastRating.stars}★` : "—"}
          </p>
          <p className="text-[10px] font-body" style={{ color: "hsl(var(--mom-accent-hover))" }}>última avaliação</p>
        </div>
      </div>

      {/* Pending approval — Neo */}
      {pendingApproval > 0 && (
        <div className="mom-neo-card p-4 flex items-center justify-between"
          style={{ background: "hsl(var(--mom-cta) / 0.15)" }}>
          <div>
            <p className="font-display font-bold text-sm" style={{ color: "hsl(var(--mom-text))" }}>
              {pendingApproval} tarefa(s) aguardando aprovação
            </p>
            <p className="text-xs font-body italic" style={{ color: "hsl(var(--mom-accent-hover))" }}>
              O {dadName} concluiu. Você confere.
            </p>
          </div>
          <button className="mom-neo-btn text-sm" onClick={() => navigate("/tarefas")}>
            Ver
          </button>
        </div>
      )}

      {/* Grandma Palpites */}
      <GrandmaPalpitesCard />

      {/* Monthly Challenge */}
      <MonthlyChallenge />

      {/* Quick Actions — Neo buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button className="mom-neo-btn flex-col text-xs py-3 justify-center w-full"
          onClick={() => navigate("/tarefas")}>
          <Plus className="w-5 h-5" />
          Nova Tarefa
        </button>
        <button className="mom-neo-btn flex-col text-xs py-3 justify-center w-full"
          style={{ background: "hsl(var(--mom-bg))", color: "hsl(var(--mom-text))" }}
          onClick={() => navigate("/agenda")}>
          <CalendarDays className="w-5 h-5" />
          Novo Evento
        </button>
        <button className="mom-neo-btn flex-col text-xs py-3 justify-center w-full"
          style={{ background: "hsl(var(--mom-bg))", color: "hsl(var(--mom-text))" }}
          onClick={() => navigate("/ranking")}>
          <BarChart3 className="w-5 h-5" />
          Ranking
        </button>
      </div>

      {/* Weekly Summary — Neo card */}
      <div className="mom-neo-card p-4">
        <h3 className="font-display font-bold text-sm mb-3" style={{ color: "hsl(var(--mom-text))" }}>
          📊 Semana em números
        </h3>
        <div className="space-y-2 text-sm font-body">
          <div className="flex justify-between">
            <span style={{ color: "hsl(var(--mom-accent-hover))" }}>Tarefas criadas</span>
            <span className="font-bold" style={{ color: "hsl(var(--mom-text))" }}>{tasksTotal}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "hsl(var(--mom-accent-hover))" }}>Completadas pelo pai</span>
            <span className="font-bold text-primary">{tasksCompleted}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "hsl(var(--mom-accent-hover))" }}>Resgates (mês)</span>
            <span className={`font-bold ${rescues > 0 ? "text-secondary" : "text-primary"}`}>{rescues}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "hsl(var(--mom-accent-hover))" }}>Aguardando aprovação</span>
            <span className="font-bold" style={{ color: "hsl(var(--mom-accent))" }}>{pendingApproval}</span>
          </div>
        </div>
      </div>

      {/* Monthly Report */}
      <MonthlyReport />
    </div>
  );
}
