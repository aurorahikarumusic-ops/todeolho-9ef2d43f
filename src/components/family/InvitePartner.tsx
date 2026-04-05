import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Share2, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function InvitePartner() {
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [regenerating, setRegenerating] = useState(false);

  if (!profile?.family_code) return null;

  const code = profile.family_code.toUpperCase();
  const appUrl = "https://estoudeolho.lovable.app";
  const authLink = `${appUrl}/auth?convite=${code}`;
  const message = `👁️ *Estou de Olho* — O app que prova que pai também cuida (ou não).\n\nCria sua conta aqui: ${authLink}\n\nO código *${code}* já vai estar preenchido. É só criar a conta e entrar na família.\n\nA partir de agora, "eu não sabia" não é mais desculpa. Boa sorte. 😘`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(message);
    toast.success("Mensagem copiada! Agora é só colar no WhatsApp 📲");
  };

  const handleRegenerate = async () => {
    if (!user) return;
    setRegenerating(true);
    try {
      const newCode = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const { error } = await supabase
        .from("profiles")
        .update({ family_code: newCode })
        .eq("user_id", user.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Novo código gerado! 🔄", {
        description: "Envie o novo código para o pai.",
      });
    } catch {
      toast.error("Erro ao gerar novo código.");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <Card className="border-mom-border bg-mom-bg">
      <CardContent className="p-4 text-center">
        <p className="font-display font-bold text-lg text-mom-text mb-2">
          Convide o pai
        </p>
        <p className="font-body text-xs text-muted-foreground mb-4">
          Ele usa esse código pra se conectar com você.
        </p>

        <div className="bg-white rounded-xl py-4 px-6 mb-4 border-2 border-mom-border">
          <p className="font-display text-3xl font-bold tracking-[0.3em] text-mom-text">
            {code}
          </p>
        </div>

        <div className="flex gap-2 mb-2">
          <Button
            variant="outline"
            className="flex-1 border-mom text-mom hover:bg-mom/10"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4 mr-1" /> Copiar
          </Button>
          <Button
            className="flex-1 bg-mom hover:bg-mom/90"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-1" /> WhatsApp
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-mom"
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${regenerating ? "animate-spin" : ""}`} />
          {regenerating ? "Gerando..." : "Gerar novo código"}
        </Button>
      </CardContent>
    </Card>
  );
}
