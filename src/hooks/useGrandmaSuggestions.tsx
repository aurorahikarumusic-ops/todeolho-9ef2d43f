import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

// All public suggestions (the mural)
export function usePublicSuggestions() {
  return useQuery({
    queryKey: ["public-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grandma_suggestions")
        .select("*")
        .eq("status", "pendente")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useGrandmaSuggestions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["grandma-suggestions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("grandma_suggestions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function usePendingSuggestions() {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["pending-suggestions", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data, error } = await supabase
        .from("grandma_suggestions")
        .select("*")
        .eq("adopted_family_id", profile.family_id)
        .eq("status", "pendente")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.family_id,
  });
}

export function useCreateSuggestion() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (suggestion: { title: string; description?: string; suggestion_type: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("grandma_suggestions")
        .insert({
          user_id: user.id,
          family_id: profile?.family_id || null,
          ...suggestion,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grandma-suggestions"] });
      qc.invalidateQueries({ queryKey: ["public-suggestions"] });
    },
  });
}

// Mom adopts a public suggestion for her family
export function useAdoptSuggestion() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (suggestionId: string) => {
      if (!user || !profile?.family_id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("grandma_suggestions")
        .update({
          adopted_by: user.id,
          adopted_family_id: profile.family_id,
          status: "aceito",
          response_by: user.id,
          response_comment: "Adotado do mural público 👵→👩",
        })
        .eq("id", suggestionId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["public-suggestions"] });
      qc.invalidateQueries({ queryKey: ["pending-suggestions"] });
      qc.invalidateQueries({ queryKey: ["grandma-suggestions"] });
    },
  });
}

export function useRespondSuggestion() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, comment }: { id: string; status: string; comment?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("grandma_suggestions")
        .update({
          status,
          response_by: user.id,
          response_comment: comment || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grandma-suggestions"] });
      qc.invalidateQueries({ queryKey: ["pending-suggestions"] });
      qc.invalidateQueries({ queryKey: ["public-suggestions"] });
    },
  });
}

export function useGrandmaRanking() {
  return useQuery({
    queryKey: ["grandma-ranking"],
    queryFn: async () => {
      const { data: avos, error: avosError } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .eq("role", "avo");
      if (avosError) throw avosError;
      if (!avos?.length) return [];

      const { data: suggestions, error: sugError } = await supabase
        .from("grandma_suggestions")
        .select("user_id, status");
      if (sugError) throw sugError;

      const stats = avos.map((avo) => {
        const mySuggestions = (suggestions || []).filter((s) => s.user_id === avo.user_id);
        return {
          ...avo,
          total: mySuggestions.length,
          accepted: mySuggestions.filter((s) => s.status === "aceito").length,
          rejected: mySuggestions.filter((s) => s.status === "recusado").length,
        };
      });

      return stats.sort((a, b) => b.total - a.total);
    },
  });
}
