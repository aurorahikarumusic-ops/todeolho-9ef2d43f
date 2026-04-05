import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyPartner } from "@/hooks/useFamily";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getDadTitle } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import GreetingHeader from "@/components/home/GreetingHeader";
import DadGauge from "@/components/home/DadGauge";
import DailyQuote from "@/components/home/DailyQuote";
import PresenceStreak from "@/components/home/PresenceStreak";
import SummaryCards from "@/components/home/SummaryCards";
import ShareWeekCard from "@/components/home/ShareWeekCard";
import PushPermissionBanner from "@/components/home/PushPermissionBanner";
import JoinFamily from "@/components/family/JoinFamily";
import GrandmaPalpitesCard from "@/components/home/GrandmaPalpitesCard";
import RedemptionCard from "@/components/redemption/RedemptionCard";
import ModoRedencao from "@/components/redemption/ModoRedencao";
import { useRedemptionCheck } from "@/hooks/useRedemption";
import { startOfWeek, endOfWeek } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: partner, isLoading: partnerLoading } = useFamilyPartner();
  const { data: redemptionTrigger } = useRedemptionCheck();
  const [showRedencao, setShowRedencao] = useState(false);
  const navigate = useNavigate();

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

  if (showRedencao) {
    return (
      <ModoRedencao
        onClose={() => setShowRedencao(false)}
        recipientName={partner?.display_name}
        recipientId={partner?.user_id}
      />
    );
  }
  const tasksTotal = weekTasks?.length || 0;
  const tasksCompleted = weekTasks?.filter((t) => t.completed_at).length || 0;
  const hasCompletedToday = weekTasks?.some(
    (t) => t.completed_at && new Date(t.completed_at).toDateString() === now.toDateString()
  ) || false;

  // Weekly performance percentage for gauge — more motivating formula
  const gaugeBase = Math.min(100, (profile.points * 1.5) + (profile.streak_days * 8) + (tasksCompleted * 15));
  const gaugePercentage = Math.min(100, Math.max(5, gaugeBase)); // minimum 5% to feel progress

  // Week activity — realistic: today is the current day, streak fills backwards from today
  const todayIdx = (now.getDay() + 6) % 7; // Mon=0, Tue=1, ..., Sun=6
  const weekActivity = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = todayIdx - i;
    return daysAgo >= 0 && daysAgo < profile.streak_days + (hasCompletedToday ? 1 : 0);
  });

  const dadTitle = getDadTitle(profile.points);

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
      {/* App Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <Eye className="w-6 h-6" style={{ color: "hsl(var(--arena-neon))", filter: "drop-shadow(0 0 4px hsl(var(--arena-neon) / 0.4))" }} />
          <h1 className="font-display text-2xl font-bold">
            Estou de <span style={{ color: "hsl(var(--arena-fire))" }}>Olho</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="font-display text-xs border-0 text-white" style={{
            background: "linear-gradient(135deg, hsl(var(--arena-fire)), hsl(var(--arena-gold)))",
            boxShadow: "0 2px 8px hsl(var(--arena-fire) / 0.3)",
          }}>
            {dadTitle.emoji} {dadTitle.title}
          </Badge>
          <button onClick={() => navigate("/perfil")} className="flex flex-col items-center gap-0.5 group">
            <Avatar className="h-10 w-10 ring-2 group-hover:ring-primary transition-all" style={{
              boxShadow: "0 0 12px hsl(var(--arena-neon) / 0.2)",
              borderColor: "hsl(var(--arena-neon) / 0.3)",
            }}>
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name} />
              <AvatarFallback className="font-display text-sm" style={{
                background: "hsl(var(--arena-neon) / 0.12)",
                color: "hsl(var(--arena-neon))",
              }}>
                {profile.display_name?.charAt(0)?.toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[9px] group-hover:text-primary transition-colors" style={{ color: "hsl(220 15% 70%)" }}>Ver perfil</span>
          </button>
        </div>
      </div>

      {/* Push Notification Banner */}
      <PushPermissionBanner />

      {/* Connect with Mom Banner */}
      {!partnerLoading && !partner && (
        <Card className="border-dashed" style={{
          borderColor: "hsl(var(--arena-gold) / 0.2)",
          background: "linear-gradient(135deg, hsl(var(--arena-dark) / 0.8), hsl(220 25% 16%))",
        }}>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(var(--arena-gold))" }} />
            <p className="font-display font-bold text-sm mb-1" style={{ color: "hsl(220 15% 88%)" }}>
              Conecte-se com a mãe
            </p>
            <p className="font-body text-xs mb-3" style={{ color: "hsl(220 15% 70%)" }}>
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

      {/* Modo Redenção Card */}
      {redemptionTrigger && (
        <RedemptionCard trigger={redemptionTrigger} onStartLetter={() => setShowRedencao(true)} />
      )}

      {/* 2. Dad Gauge */}
      <DadGauge percentage={gaugePercentage} />

      {/* 3. Daily Quote */}
      <DailyQuote />

      {/* 4. Presence Streak */}
      <PresenceStreak streakDays={profile.streak_days} weekActivity={weekActivity} lastActiveAt={profile.last_active_at} />

      {/* 5. Summary Cards */}
      <SummaryCards
        tasksCompleted={tasksCompleted}
        tasksTotal={tasksTotal}
        nextEvent={nextEvent || null}
        rankingPosition={rankingPosition || null}
        momRating={null}
      />

      {/* 6. Grandma Palpites */}
      <GrandmaPalpitesCard />

      {/* 7. Share Week Card */}
      <ShareWeekCard
        displayName={profile.display_name}
        tasksCompleted={tasksCompleted}
        streak={profile.streak_days}
        rankingPosition={rankingPosition || null}
      />
    </div>
  );
}
