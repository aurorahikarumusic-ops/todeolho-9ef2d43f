import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyPartner } from "@/hooks/useFamily";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDadTitle } from "@/lib/constants";
import GreetingHeader from "@/components/home/GreetingHeader";
import DadGauge from "@/components/home/DadGauge";
import DailyQuote from "@/components/home/DailyQuote";
import PresenceStreak from "@/components/home/PresenceStreak";
import SummaryCards from "@/components/home/SummaryCards";
import ShareWeekCard from "@/components/home/ShareWeekCard";
import PushPermissionBanner from "@/components/home/PushPermissionBanner";
import JoinFamily from "@/components/family/JoinFamily";
import { startOfWeek, endOfWeek } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: partner } = useFamilyPartner();

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

  // Tasks this week
  const { data: weekTasks } = useQuery({
    queryKey: ["week-tasks", profile?.family_id],
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

  // Pending tasks (for greeting context)
  const { data: pendingTasks } = useQuery({
    queryKey: ["pending-tasks", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", profile.family_id)
        .is("completed_at", null)
        .limit(5);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  // Next event
  const { data: nextEvent } = useQuery({
    queryKey: ["next-event", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return null;
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("family_id", profile.family_id)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(1);
      return data && data.length > 0 ? { title: data[0].title, date: new Date(data[0].event_date) } : null;
    },
    enabled: !!profile?.family_id,
  });

  // Ranking position
  const { data: rankingPosition } = useQuery({
    queryKey: ["ranking-position", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, points")
        .eq("role", "pai")
        .order("points", { ascending: false })
        .limit(50);
      if (!data) return null;
      const idx = data.findIndex((p) => p.user_id === user?.id);
      return idx >= 0 ? idx + 1 : null;
    },
    enabled: !!user,
  });

  if (!profile) return null;

  const tasksTotal = weekTasks?.length || 0;
  const tasksCompleted = weekTasks?.filter((t) => t.completed_at).length || 0;
  const hasCompletedToday = weekTasks?.some(
    (t) => t.completed_at && new Date(t.completed_at).toDateString() === now.toDateString()
  ) || false;

  // Weekly performance percentage for gauge — more motivating formula
  const gaugeBase = Math.min(100, (profile.points * 1.5) + (profile.streak_days * 8) + (tasksCompleted * 15));
  const gaugePercentage = Math.min(100, Math.max(5, gaugeBase)); // minimum 5% to feel progress

  // Week activity — mark streak days ending today as active
  const streakCapped = Math.min(7, profile.streak_days + 1); // +1 because user is here now
  const weekActivity = Array.from({ length: 7 }, (_, i) => i >= 7 - streakCapped);

  const dadTitle = getDadTitle(profile.points);

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
      {/* App Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">
            Estou de <span className="text-secondary">Olho</span>
          </h1>
        </div>
        <Badge variant="secondary" className="font-display text-xs">
          {dadTitle.emoji} {dadTitle.title}
        </Badge>
      </div>

      {/* Push Notification Banner */}
      <PushPermissionBanner />

      {/* Connect with Mom Banner */}
      {!partner && (
        <Card className="border-primary/30 border-dashed bg-dad-bg">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-display font-bold text-sm text-dad-text mb-1">
              Conecte-se com a mãe
            </p>
            <p className="font-body text-xs text-muted-foreground mb-3">
              Peça o código de 6 dígitos pra ela. Sem ele, você tá jogando sozinho.
            </p>
            <JoinFamily />
          </CardContent>
        </Card>
      )}

      {/* 1. Greeting Header */}
      <GreetingHeader
        displayName={profile.display_name}
        lastActiveAt={profile.last_active_at}
        hasPendingTasks={(pendingTasks?.length || 0) > 0}
        hasCompletedToday={hasCompletedToday}
      />

      {/* 2. Dad Gauge */}
      <DadGauge percentage={gaugePercentage} />

      {/* 3. Daily Quote */}
      <DailyQuote />

      {/* 4. Presence Streak */}
      <PresenceStreak streakDays={profile.streak_days} weekActivity={weekActivity} />

      {/* 5. Summary Cards */}
      <SummaryCards
        tasksCompleted={tasksCompleted}
        tasksTotal={tasksTotal}
        nextEvent={nextEvent || null}
        rankingPosition={rankingPosition || null}
        momRating={null}
      />

      {/* 6. Share Week Card */}
      <ShareWeekCard
        displayName={profile.display_name}
        tasksCompleted={tasksCompleted}
        streak={profile.streak_days}
        rankingPosition={rankingPosition || null}
      />
    </div>
  );
}
