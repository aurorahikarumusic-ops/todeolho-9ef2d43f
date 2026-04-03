import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";

export default function InvitePartner() {
  const { data: profile } = useProfile();
  if (!profile?.family_code) return null;

  const code = profile.family_code.toUpperCase();
  const appUrl = window.location.origin;
  const message = `Baixa o Estou de Olho (${appUrl}) e usa o código ${code}.\nAgora eu tenho provas de tudo. 👁️`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Estou de Olho", text: message });
      } catch { /* cancelled */ }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
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

        <div className="flex gap-2">
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
      </CardContent>
    </Card>
  );
}
