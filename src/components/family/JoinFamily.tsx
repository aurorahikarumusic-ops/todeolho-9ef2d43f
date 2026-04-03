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
      const { data, error } = await supabase.rpc("join_family_by_code", {
        invite_code: code.trim(),
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error === "Code not found") {
          toast.error("Código não encontrado. Confere com a mãe.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(
        `Conectado com ${data.host_name}!\nEla já está de olho. Literalmente. 👁️`,
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
