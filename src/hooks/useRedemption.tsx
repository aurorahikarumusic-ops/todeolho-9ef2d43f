import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";
import { useFamilyPartner } from "./useFamily";
import { startOfWeek, startOfMonth, endOfMonth, differenceInDays } from "date-fns";

export interface RedemptionTrigger {
  type: string;
  title: string;
  subtitle: string;
  value?: number;
}

export function useRedemptionCheck() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: partner } = useFamilyPartner();
  const isDad = profile?.role === "pai";

  return useQuery({
    queryKey: ["redemption-check", user?.id, profile?.family_id],
    queryFn: async (): Promise<RedemptionTrigger | null> => {
      if (!user || !profile || !isDad) return null;

      // Check if already shown in last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentEvents } = await supabase
        .from("redemption_events")
        .select("id")
        .eq("user_id", user.id)
        .gte("shown_at", sevenDaysAgo)
        .limit(1);
      if (recentEvents && recentEvents.length > 0) return null;

      // Check if dismissed in last 48h
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: dismissed } = await supabase
        .from("redemption_events")
        .select("id")
        .eq("user_id", user.id)
        .gte("dismissed_at", fortyEightHoursAgo)
        .limit(1);
      if (dismissed && dismissed.length > 0) return null;

      const dadName = profile.display_name || "Pai";
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString().split("T")[0];
      const monthStart = startOfMonth(now).toISOString();
      const monthEnd = endOfMonth(now).toISOString();

      // Check if top 3 AND has 4+ stars → never show
      const { data: rankings } = await supabase
        .from("profiles")
        .select("user_id, points")
        .eq("role", "pai")
        .order("points", { ascending: false })
        .limit(50);
      const rankPos = rankings?.findIndex(p => p.user_id === user.id);
      const isTop3 = rankPos !== undefined && rankPos >= 0 && rankPos < 3;

      const { data: momRating } = await supabase
        .from("mom_ratings")
        .select("stars")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .maybeSingle();

      if (isTop3 && momRating && momRating.stars >= 4) return null;

      // Trigger 1: Low mom rating (1-2 stars)
      if (momRating && momRating.stars <= 2) {
        return {
          type: "low_rating",
          title: `A nota foi baixa, ${dadName}. Palavras certas podem mudar isso.`,
          subtitle: "Escreva com suas palavras. Chega pra ela como uma carta.",
        };
      }

      // Trigger 2: Last place
      if (rankings && rankings.length > 2) {
        const lastIdx = rankings.length - 1;
        if (rankings[lastIdx].user_id === user.id) {
          return {
            type: "last_place",
            title: `Semana difícil, ${dadName}. Tem uma forma de mudar o clima.`,
            subtitle: "Escreva com suas palavras. Chega pra ela como uma carta.",
          };
        }
      }

      // Trigger 3: Dropped 3+ positions (simplified check)
      // We'll skip complex historical tracking for now

      // Trigger 4: 3+ rescues this month
      if (profile.family_id) {
        const { data: monthTasks } = await supabase
          .from("tasks")
          .select("id")
          .eq("family_id", profile.family_id)
          .eq("rescued_by_mom", true)
          .gte("created_at", monthStart)
          .lte("created_at", monthEnd);
        const rescueCount = monthTasks?.length || 0;
        if (rescueCount >= 3) {
          return {
            type: "many_rescues",
            title: `A mãe te salvou ${rescueCount} vezes. Ela merece ouvir que você sabe disso.`,
            subtitle: "Escreva com suas palavras. Chega pra ela como uma carta.",
            value: rescueCount,
          };
        }
      }

      // Trigger 5: 3+ overdue tasks
      if (profile.family_id) {
        const { data: overdue } = await supabase
          .from("tasks")
          .select("id")
          .eq("family_id", profile.family_id)
          .is("completed_at", null)
          .lt("due_date", now.toISOString())
          .limit(5);
        if (overdue && overdue.length >= 3) {
          return {
            type: "overdue_tasks",
            title: `${overdue.length} tarefas atrasadas, ${dadName}. Que tal compensar de outro jeito?`,
            subtitle: "Escreva com suas palavras. Chega pra ela como uma carta.",
            value: overdue.length,
          };
        }
      }

      // Trigger 6: Absent 5+ days
      if (profile.last_active_at) {
        const daysAway = differenceInDays(now, new Date(profile.last_active_at));
        if (daysAway >= 5) {
          return {
            type: "returned_absent",
            title: `Você sumiu por ${daysAway} dias. Que tal voltar com algo bonito?`,
            subtitle: "Escreva com suas palavras. Chega pra ela como uma carta.",
            value: daysAway,
          };
        }
      }

      return null;
    },
    enabled: !!user && !!profile && isDad,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReceivedLetters() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["received-letters", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("love_letters")
        .select("*")
        .eq("recipient_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });
}

export function useSentLetters() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sent-letters", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("love_letters")
        .select("*")
        .eq("sender_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });
}
