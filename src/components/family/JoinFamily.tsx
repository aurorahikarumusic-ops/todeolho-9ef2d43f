import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function JoinFamily() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || !user) return;
    setJoining(true);
    try {
      // Find profile with this family_code
      const { data: hostProfile, error: findError } = await supabase
        .from("profiles")
        .select("family_id, display_name")
        .eq("family_code", code.trim().toLowerCase())
        .maybeSingle();

      if (findError || !hostProfile?.family_id) {
        toast.error("Código não encontrado. Confere com a mãe.");
        return;
      }

      // Update my profile to join this family
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ family_id: hostProfile.family_id })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(
        `Conectado com ${hostProfile.display_name}!\nEla já está de olho. Literalmente. 👁️`,
        { duration: 5000 }
      );
    } catch {
      toast.error("Erro ao conectar. Tenta de novo.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <Card className="border-dad-border bg-dad-bg">
      <CardContent className="p-4">
        <p className="font-display font-bold text-lg text-dad-text mb-2 text-center">
          Conectar com a mãe
        </p>
        <p className="font-body text-xs text-muted-foreground mb-4 text-center">
          Peça o código de 6 dígitos pra ela. Ela tem.
        </p>

        <Input
          placeholder="Código da família"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="text-center font-display text-xl tracking-[0.2em] mb-3 h-12"
          maxLength={8}
        />

        <Button
          className="w-full bg-primary font-display"
          disabled={!code.trim() || joining}
          onClick={handleJoin}
        >
          {joining ? "Conectando..." : "Entrar na família"}
        </Button>
      </CardContent>
    </Card>
  );
}
