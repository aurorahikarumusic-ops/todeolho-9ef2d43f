import { useNavigate } from "react-router-dom";
import { usePublicSuggestions, usePendingSuggestions } from "@/hooks/useGrandmaSuggestions";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Megaphone, Check, Ban, Clock } from "lucide-react";

export default function PalpitesHistorySection() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  // All suggestions adopted by this mom's family
  const { data: adopted = [] } = useQuery({
    queryKey: ["adopted-suggestions", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase
        .from("grandma_suggestions")
        .select("*")
        .eq("adopted_family_id", profile.family_id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  // All suggestions responded by this user
  const { data: responded = [] } = useQuery({
    queryKey: ["responded-suggestions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("grandma_suggestions")
        .select("*")
        .eq("response_by", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!user,
  });

  const acceptedCount = [...adopted, ...responded].filter(s => s.status === "aceito").length;
  const rejectedCount = responded.filter(s => s.status === "recusado").length;
  const totalInteracted = acceptedCount + rejectedCount;

  return (
    <section>
      <Card className="border-avo-border bg-gradient-to-br from-avo-bg/50 to-white cursor-pointer hover:shadow-md transition-all hover:scale-[1.01]"
        onClick={() => navigate("/palpites")}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-full bg-avo/20 shadow-sm">
              <Megaphone className="w-5 h-5 text-avo" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-sm">
                👵 Mural de Palpites
              </p>
              <p className="text-[10px] text-muted-foreground font-body">
                Ninguém pediu, mas mesmo assim deram
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-avo" />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-lg p-2 text-center border border-green-200">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Check className="w-3 h-3 text-green-500" />
              </div>
              <p className="font-display font-bold text-sm text-green-600">{acceptedCount}</p>
              <p className="text-[9px] text-muted-foreground font-body">aceitos</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center border border-red-200">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Ban className="w-3 h-3 text-red-400" />
              </div>
              <p className="font-display font-bold text-sm text-red-500">{rejectedCount}</p>
              <p className="text-[9px] text-muted-foreground font-body">recusados</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center border border-avo-border">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-avo" />
              </div>
              <p className="font-display font-bold text-sm text-avo">{totalInteracted}</p>
              <p className="text-[9px] text-muted-foreground font-body">total</p>
            </div>
          </div>

          {/* Last adopted */}
          {adopted.length > 0 && (
            <div className="mt-3 pt-2 border-t border-avo-border/30">
              <p className="text-[10px] text-muted-foreground font-body mb-1.5">Últimos adotados:</p>
              <div className="space-y-1">
                {adopted.slice(0, 2).map(s => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <span>{s.suggestion_type === "tarefa" ? "📋" : "💬"}</span>
                    <span className="font-body truncate flex-1">{s.title}</span>
                    <Badge className="bg-green-100 text-green-700 text-[9px] border-0">✓</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
