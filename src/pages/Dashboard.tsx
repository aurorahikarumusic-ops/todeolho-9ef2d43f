import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyPartner } from "@/hooks/useFamily";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Users } from "lucide-react";
import { getDadTitle } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  const { data: partner, allMembers, isLoading: partnerLoading } = useFamilyPartner();
  const { data: redemptionTrigger } = useRedemptionCheck();
  const [showRedencao, setShowRedencao] = useState(false);
  const navigate = useNavigate();

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

  const { data: weekTasks } = useQuery({
    queryKey: ["week-tasks", profile?.family_id],
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

  const { data: pendingTasks } = useQuery({
    queryKey: ["pending-tasks", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase
        .from("tasks").select("*")
        .eq("family_id", profile.family_id)
        .is("completed_at", null).limit(5);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  const { data: nextEvent } = useQuery({
    queryKey: ["next-event", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return null;
      const { data } = await supabase
        .from("events").select("*")
        .eq("family_id", profile.family_id)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true }).limit(1);
      return data && data.length > 0 ? { title: data[0].title, date: new Date(data[0].event_date) } : null;
    },
    enabled: !!profile?.family_id,
  });

  const { data: rankingPosition } = useQuery({
    queryKey: ["ranking-position", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles").select("user_id, points")
        .eq("role", "pai").order("points", { ascending: false }).limit(50);
      if (!data) return null;
      const idx = data.findIndex((p) => p.user_id === user?.id);
      return idx >= 0 ? idx + 1 : null;
    },
    enabled: !!user,
  });

  const weekStartDate = startOfWeek(now, { weekStartsOn: 1 }).toISOString().split("T")[0];

  const { data: momRating } = useQuery({
    queryKey: ["dad-mom-rating", user?.id, weekStartDate],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("mom_ratings")
        .select("stars")
        .eq("user_id", user.id)
        .eq("week_start", weekStartDate)
        .order("created_at", { ascending: false })
        .limit(1);
      return data && data.length > 0 ? data[0].stars : null;
    },
    enabled: !!user,
  });

  if (!profile) return null;

  // Pai sends to mom specifically
  const letterRecipient = allMembers.find(m => m.role === "mae") || partner;

  if (showRedencao) {
    return (
      <ModoRedencao
        onClose={() => setShowRedencao(false)}
        recipientName={letterRecipient?.display_name}
        recipientId={letterRecipient?.user_id}
      />
    );
  }

  const tasksTotal = weekTasks?.length || 0;
  const tasksCompleted = weekTasks?.filter((t) => t.completed_at).length || 0;
  const hasCompletedToday = weekTasks?.some(
    (t) => t.completed_at && new Date(t.completed_at).toDateString() === now.toDateString()
  ) || false;

  const gaugeBase = Math.min(100, (profile.points * 1.5) + (profile.streak_days * 8) + (tasksCompleted * 15));
  const gaugePercentage = Math.min(100, Math.max(5, gaugeBase));

  const todayIdx = (now.getDay() + 6) % 7;
  const weekActivity = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = todayIdx - i;
    return daysAgo >= 0 && daysAgo < profile.streak_days + (hasCompletedToday ? 1 : 0);
  });

  const dadTitle = getDadTitle(profile.points);

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4 bg-background min-h-screen">

      {/* App Header — Neo-Brutalista */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <Eye className="w-7 h-7" style={{
            color: "hsl(var(--dad-accent))",
            animation: "eye-pulse 3s ease-in-out infinite",
          }} />
          <h1 className="font-display text-2xl font-black">
            Estou de <span style={{ color: "hsl(var(--dad-accent))" }}>Olho</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="dad-neo-badge" style={{
            background: "hsl(var(--dad-cta))",
            color: "white",
          }}>
            {dadTitle.emoji} {dadTitle.title}
          </span>
          <button onClick={() => navigate("/perfil")} className="flex flex-col items-center gap-0.5 group">
            <Avatar className="h-11 w-11 group-hover:scale-105 transition-transform"
              style={{
                border: "3px solid hsl(var(--dad-text))",
                boxShadow: "4px 4px 0 hsl(var(--dad-text))",
              }}>
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name} />
              <AvatarFallback className="font-display text-sm font-bold" style={{
                background: "hsl(var(--dad-bg))", color: "hsl(var(--dad-text))",
              }}>
                {profile.display_name?.charAt(0)?.toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-display font-bold" style={{ color: "hsl(var(--dad-accent-hover))" }}>Ver perfil</span>
          </button>
        </div>
      </div>

      <PushPermissionBanner />

      {/* Connect with Mom — Neo card */}
      {!partnerLoading && !profile.family_id && (
        <div className="dad-neo-card p-4 text-center"
          style={{ background: "#FFEAAE", borderStyle: "dashed" }}>
          <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(var(--dad-accent))" }} />
          <p className="font-display font-bold text-sm mb-1" style={{ color: "hsl(var(--dad-text))" }}>
            Conecte-se com a mãe
          </p>
          <p className="font-body text-xs mb-3" style={{ color: "hsl(var(--dad-accent-hover))" }}>
            Peça o código de 6 dígitos pra ela. Sem ele, você tá jogando sozinho.
          </p>
          <JoinFamily />
        </div>
      )}

      <GreetingHeader
        displayName={profile.display_name}
        lastActiveAt={profile.last_active_at}
        hasPendingTasks={(pendingTasks?.length || 0) > 0}
        hasCompletedToday={hasCompletedToday}
      />

      {redemptionTrigger && (
        <RedemptionCard trigger={redemptionTrigger} onStartLetter={() => setShowRedencao(true)} />
      )}

      <DadGauge percentage={gaugePercentage} />
      <DailyQuote />
      <PresenceStreak streakDays={profile.streak_days} weekActivity={weekActivity} lastActiveAt={profile.last_active_at} />
      <SummaryCards
        tasksCompleted={tasksCompleted}
        tasksTotal={tasksTotal}
        nextEvent={nextEvent || null}
        rankingPosition={rankingPosition || null}
        momRating={momRating ?? null}
      />
      <GrandmaPalpitesCard />
      <ShareWeekCard
        displayName={profile.display_name}
        tasksCompleted={tasksCompleted}
        streak={profile.streak_days}
        rankingPosition={rankingPosition || null}
      />
    </div>
  );
}
