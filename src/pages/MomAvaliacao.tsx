import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useFamilyPartner } from "@/hooks/useFamily";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { startOfWeek, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, FileText, TrendingUp } from "lucide-react";
import { notifyCrossPanel } from "@/lib/notify";
import { RATING_LABELS } from "@/lib/mom-constants";

export default function MomAvaliacao() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: partner, allMembers } = useFamilyPartner();
  const queryClient = useQueryClient();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split("T")[0];
  const dadPartner = allMembers.find(m => m.role === "pai") || partner;
  const dadName = dadPartner?.display_name || "o pai";

  const { data: existingRating } = useQuery({
    queryKey: ["mom-rating-this-week", user?.id, weekStart],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("mom_ratings")
        .select("*")
        .eq("rated_by", user.id)
        .eq("week_start", weekStart)
        .order("created_at", { ascending: false })
        .limit(1);
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!user,
  });

  const { data: allRatings = [] } = useQuery({
    queryKey: ["mom-all-ratings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("mom_ratings")
        .select("*")
        .eq("rated_by", user.id)
        .order("week_start", { ascending: false })
        .limit(12);
      return data || [];
    },
    enabled: !!user,
  });

  const submitRating = useMutation({
    mutationFn: async () => {
      if (!user || !dadPartner) throw new Error("Falta parceiro");
      const { error } = await supabase.from("mom_ratings").insert({
        user_id: dadPartner.user_id,
        rated_by: user.id,
        stars,
        comment: comment.trim() || null,
        week_start: weekStart,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mom-rating-this-week"] });
      queryClient.invalidateQueries({ queryKey: ["mom-all-ratings"] });
      toast.success(`Avaliação publicada! O ${dadName} já pode ver.`, { duration: 4000 });
      if (user && profile?.family_id) {
        notifyCrossPanel("rating_submitted", profile.family_id, user.id, {
          stars,
          comment: comment.trim() || undefined,
        });
      }
    },
    onError: () => toast.error("Erro ao salvar avaliação."),
  });

  if (!profile) return null;

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-8 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-6 h-6 text-mom" />
          <h1 className="font-display text-2xl font-bold">Avaliação Semanal</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body italic">
          É hora de avaliar o {dadName}. Ele tá ansioso. (Ou deveria estar.)
        </p>
      </div>

      {existingRating ? (
        <Card className="border-mom-border bg-mom-bg">
          <CardContent className="p-6 text-center">
            <p className="text-4xl mb-2">{"⭐".repeat(existingRating.stars)}</p>
            <p className="font-display text-lg font-bold text-mom-text">
              {RATING_LABELS[existingRating.stars] || ""}
            </p>
            {existingRating.comment && (
              <p className="font-body text-sm text-muted-foreground mt-2 italic">
                "{existingRating.comment}"
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-3 font-body">
              Avaliação dessa semana já publicada ✓
            </p>
          </CardContent>
        </Card>
      ) : dadPartner ? (
        <Card className="border-mom-border">
          <CardContent className="p-6">
            <p className="font-display font-bold text-center mb-4">
              Semana de {format(new Date(weekStart), "dd/MM", { locale: ptBR })}
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setStars(s)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 ${s <= stars ? "fill-mom text-mom" : "text-muted-foreground/30"}`}
                  />
                </button>
              ))}
            </div>

            {stars > 0 && (
              <p className="text-center text-sm font-body italic text-mom mb-4">
                {RATING_LABELS[stars]}
              </p>
            )}

            <Textarea
              placeholder="Opcional. Mas você tem muito a dizer."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-4 min-h-[80px]"
            />

            <Button
              className="w-full bg-mom hover:bg-mom/90 font-display"
              disabled={stars === 0 || submitRating.isPending}
              onClick={() => submitRating.mutate()}
            >
              {submitRating.isPending ? "Publicando..." : "Publicar avaliação"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-3xl mb-2">🤷</p>
            <p className="font-body text-sm text-muted-foreground">
              Conecte-se com o pai primeiro para avaliar.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rating History */}
      {/* Rating Evolution Chart */}
      {allRatings.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-mom" />
              <h3 className="font-display font-bold text-sm">Evolução do {dadName}</h3>
            </div>
            <div className="flex items-end gap-1 h-24">
              {[...allRatings].reverse().map((r: any, i: number) => (
                <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-mom/70 transition-all"
                    style={{ height: `${(r.stars / 5) * 100}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {format(new Date(r.week_start), "dd/MM")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {allRatings.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg mb-3">Histórico</h2>
          <div className="space-y-2">
            {allRatings.map((r: any) => (
              <Card key={r.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-body">
                    Semana {format(new Date(r.week_start), "dd/MM", { locale: ptBR })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{"⭐".repeat(r.stars)}</span>
                    {r.comment && (
                      <span className="text-[10px] text-muted-foreground italic max-w-[120px] truncate">
                        "{r.comment}"
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
