import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Re-fetch profile when family is joined (e.g. after Google OAuth with invite code)
  useEffect(() => {
    const handler = () => qc.invalidateQueries({ queryKey: ["profile"] });
    window.addEventListener("family-joined", handler);
    return () => window.removeEventListener("family-joined", handler);
  }, [qc]);

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) {
        // If profile not found, user was likely deleted — sign out
        if (error.code === 'PGRST116') {
          await supabase.auth.signOut();
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!user,
    retry: (failureCount, error: any) => {
      // Don't retry if profile not found
      if (error?.code === 'PGRST116') return false;
      return failureCount < 2;
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { role?: string; display_name?: string; avatar_url?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useRanking() {
  return useQuery({
    queryKey: ["ranking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, points, streak_days, avatar_url, role")
        .eq("role", "pai")
        .order("points", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}
