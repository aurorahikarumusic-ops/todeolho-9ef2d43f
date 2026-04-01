import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDadTitle, getTimeGreeting, getRandomItem, IRONIC_GREETINGS, DAILY_TIPS } from "@/lib/constants";
import { CalendarDays, CheckSquare, Trophy, Flame, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const { data: upcomingEvents } = useQuery({
    queryKey: ["upcoming-events", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("family_id", profile.family_id)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  const { data: pendingTasks } = useQuery({
    queryKey: ["pending-tasks", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", profile.family_id)
        .is("completed_at", null)
        .order("due_date", { ascending: true })
        .limit(5);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  if (!profile) return null;

  const dadTitle = getDadTitle(profile.points);
  const timeKey = getTimeGreeting();
  const greeting = getRandomItem(IRONIC_GREETINGS[timeKey]);
  const tip = getRandomItem(DAILY_TIPS);
  const isPai = profile.role === "pai";

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl font-bold">
              Tô de <span className="text-secondary">Olho</span>
            </h1>
          </div>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Olá, {profile.display_name?.split(" ")[0] || "pai"} 👋
          </p>
        </div>
        <div className="text-right">
          <Badge variant="secondary" className="font-display text-sm">
            {dadTitle.emoji} {dadTitle.title}
          </Badge>
          <p className="text-xs text-muted-foreground font-body mt-1">
            {profile.points} pts
          </p>
        </div>
      </div>

      {/* Ironic Greeting */}
      <Card className="mb-4 border-0 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <p className="font-body text-sm text-foreground leading-relaxed">
            {isPai ? greeting : `Olá, mãe! O pai ${profile.display_name?.split(" ")[0] || ""} tá no app. Progresso. 🎉`}
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4 text-center">
            <Flame className="w-6 h-6 text-secondary mx-auto mb-1" />
            <p className="font-display text-2xl font-bold">{profile.streak_days}</p>
            <p className="text-xs text-muted-foreground font-body">Sequência</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4 text-center">
            <CheckSquare className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="font-display text-2xl font-bold">{pendingTasks?.length || 0}</p>
            <p className="text-xs text-muted-foreground font-body">Tarefas</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4 text-center">
            <CalendarDays className="w-6 h-6 text-accent-foreground mx-auto mb-1" />
            <p className="font-display text-2xl font-bold">{upcomingEvents?.length || 0}</p>
            <p className="text-xs text-muted-foreground font-body">Eventos</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="mb-4 border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="font-body text-sm">{event.title}</span>
                  <span className="text-xs text-muted-foreground font-body">
                    {format(new Date(event.event_date), "dd MMM", { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-body italic">
              Nenhum evento. Ou você esqueceu de cadastrar. O que é mais provável? 🤔
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      <Card className="mb-4 border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            Tarefas Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTasks && pendingTasks.length > 0 ? (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="font-body text-sm">{task.title}</span>
                  <Badge variant="outline" className="text-xs font-body">
                    {task.category}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-body italic">
              Nenhuma tarefa pendente. Parabéns ou a mãe fez tudo. Provavelmente a segunda opção.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Daily Tip */}
      <Card className="border-0 bg-accent/30">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-body text-foreground flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>{tip}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
