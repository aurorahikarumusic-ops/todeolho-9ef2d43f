import { useNavigate } from "react-router-dom";
import { usePublicSuggestions, useAdoptSuggestion } from "@/hooks/useGrandmaSuggestions";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";

export default function GrandmaPalpitesCard() {
  const { data: profile } = useProfile();
  const { data: suggestions = [] } = usePublicSuggestions();
  const adoptMutation = useAdoptSuggestion();
  const navigate = useNavigate();

  const isMom = profile?.role === "mae";
  const isDad = profile?.role === "pai";

  // For dads: fetch suggestions adopted for their family (accepted by mom)
  const { data: familyAdopted = [] } = useQuery({
    queryKey: ["family-adopted-suggestions", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase
        .from("grandma_suggestions")
        .select("*")
        .eq("adopted_family_id", profile.family_id)
        .eq("status", "aceito")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!profile?.family_id && isDad,
  });

  // For moms: show public palpites they can adopt
  // For dads: show adopted palpites for their family
  const displayItems = isDad ? familyAdopted.slice(0, 3) : suggestions.slice(0, 3);

  if (displayItems.length === 0) return null;

  const handleAdopt = async (id: string) => {
    try {
      await adoptMutation.mutateAsync(id);
      toast.success("Palpite adotado! Agora vira tarefa pro pai 😈👵");
    } catch {
      toast.error("Erro ao adotar palpite");
    }
  };

  return (
    <div className={isDad ? "dad-neo-card p-4" : ""}>
      <Card className={isDad ? "border-0 shadow-none bg-transparent" : "border-avo-border bg-gradient-to-br from-avo-bg to-white overflow-hidden"}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${isDad ? "bg-[hsl(var(--dad-accent))]/20" : "bg-avo/20"}`}>
                <Megaphone className={`w-4 h-4 ${isDad ? "text-[hsl(var(--dad-accent))]" : "text-avo"}`} />
              </div>
              <h3 className="font-display font-bold text-sm" style={isDad ? { color: "hsl(var(--dad-text))" } : undefined}>
                {isMom ? "👵 Palpites Fresquinhos" : "👵 A Sogra Mandou..."}
              </h3>
            </div>
            <Badge className={isDad ? "bg-[hsl(var(--dad-accent))]/20 text-[hsl(var(--dad-text))] text-[10px] border-2 border-[hsl(var(--dad-text))] font-display" : "bg-avo/20 text-avo-text text-[10px] border-0"}>
              {displayItems.length} {isDad ? "pendente" : "novo"}{displayItems.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="space-y-2">
            {displayItems.map((s) => (
              <div key={s.id} className={`flex items-center gap-2 rounded-lg p-2 ${isDad ? "bg-white border-2 border-[hsl(var(--dad-text))]" : "bg-white/80 border border-avo-border/50"}`}>
                <span className="text-lg shrink-0">
                  {s.suggestion_type === "tarefa" ? "📋" : s.suggestion_type === "evento" ? "📅" : "💬"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs font-semibold truncate">{s.title}</p>
                  {s.description && (
                    <p className="font-body text-[10px] text-muted-foreground truncate">{s.description}</p>
                  )}
                </div>
                {isMom && (
                  <Button
                    size="sm"
                    className="h-7 text-[10px] bg-avo hover:bg-avo/90 text-white shrink-0"
                    onClick={() => handleAdopt(s.id)}
                    disabled={adoptMutation.isPending}
                  >
                    <Check className="w-3 h-3 mr-0.5" /> Adotar
                  </Button>
                )}
              </div>
            ))}
          </div>

          <button
            className={isDad ? "dad-neo-btn w-full mt-3 text-xs flex items-center justify-center gap-1" : "w-full mt-3 text-xs text-avo hover:text-avo hover:bg-avo/10 font-display rounded-md px-3 py-2 transition-colors"}
            onClick={() => navigate("/palpites")}
          >
            Ver todos os palpites <ChevronRight className="w-3 h-3 ml-1" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
