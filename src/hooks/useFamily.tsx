import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export function useFamilyPartner() {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["family-partner", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", profile.family_id)
        .neq("user_id", profile.user_id)
        .maybeSingle();
      return data;
    },
    enabled: !!profile?.family_id,
  });
}

export function useIsMom() {
  const { data: profile } = useProfile();
  return profile?.role === "mae";
}

export function useIsDad() {
  const { data: profile } = useProfile();
  return profile?.role === "pai";
}
