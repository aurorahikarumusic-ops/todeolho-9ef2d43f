import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export function useFamilyPartner() {
  const { data: profile, isLoading: profileLoading } = useProfile();

  const query = useQuery({
    queryKey: ["family-partner", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, role, avatar_url, points, streak_days, family_id")
        .eq("family_id", profile.family_id)
        .neq("user_id", profile.user_id);
      return data && data.length > 0 ? data : null;
    },
    enabled: !!profile?.family_id,
  });

  // Smart partner: mom sees pai, pai sees mae, others get first member
  const members = query.data || [];
  const roleCounterpart: Record<string, string> = { mae: "pai", pai: "mae" };
  const targetRole = profile?.role ? roleCounterpart[profile.role] : null;
  const smartPartner = targetRole
    ? members.find(m => m.role === targetRole) || members[0] || null
    : members[0] || null;

  return {
    ...query,
    data: smartPartner,
    allMembers: members,
    isLoading: profileLoading || query.isLoading,
  };
}

export function useIsMom() {
  const { data: profile } = useProfile();
  return profile?.role === "mae";
}

export function useIsDad() {
  const { data: profile } = useProfile();
  return profile?.role === "pai";
}
