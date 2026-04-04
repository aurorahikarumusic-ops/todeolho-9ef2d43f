import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/useProfile";

export default function JoinFamilyAvo() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || !user) return;
    setJoining(true);
    try {
      const { data: rawData, error } = await supabase.rpc("join_family_by_code", {
        invite_code: code.trim(),
      });
      const data = rawData as any;

      if (error) throw error;

      if (data?.error) {
        if (data.error === "Code not found") {
          toast.error("Código não encontrado, vovó!", {
            description: "Confere com a mãe. Ou a nora. Enfim, quem manda.",
          });
        } else {
          toast.error(data.error);
        }
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(`Conectada à família de ${data.host_name}! 👵🎉`, {
        description: "Agora você pode dar todos os palpites que quiser. A família que se prepare!",
        duration: 5000,
      });
    } catch {
      toast.error("Erro ao conectar, vovó. Pede ajuda pra neta.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <Card className="border-2 border-avo-border bg-gradient-to-b from-avo-bg to-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-avo to-avo-glow p-3 relative">
        <div className="absolute top-0 right-2 text-3xl opacity-20">🧶</div>
        <p className="font-display font-bold text-lg text-white text-center relative z-10">
          👵 Entrar na Família
        </p>
      </div>

      <CardContent className="p-5">
        <div className="bg-avo/5 border border-avo-border rounded-xl p-3 mb-4">
          <p className="font-body text-xs text-avo-text text-center leading-relaxed">
            <strong>Como funciona:</strong><br />
            1️⃣ Peça o <strong>código de convite</strong> pra mãe (ou nora 😏)<br />
            2️⃣ Digite o código abaixo<br />
            3️⃣ Pronto! Agora você pode dar palpite à vontade!
          </p>
        </div>

        <Input
          placeholder="Código da família"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="text-center font-display text-xl tracking-[0.2em] mb-3 h-12 border-avo-border focus-visible:ring-avo"
          maxLength={8}
        />

        <Button
          className="w-full font-display bg-avo hover:bg-avo/80 text-white"
          disabled={!code.trim() || joining}
          onClick={handleJoin}
          style={{ boxShadow: "0 4px 16px -4px hsl(270 60% 55% / 0.3)" }}
        >
          {joining ? "A vovó tá entrando..." : "👵 Entrar na Família"}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center mt-3 font-body italic">
          Sem código? Liga pra mãe. Ou manda um WhatsApp. Ou aparece lá em casa. 📞
        </p>
      </CardContent>
    </Card>
  );
}
