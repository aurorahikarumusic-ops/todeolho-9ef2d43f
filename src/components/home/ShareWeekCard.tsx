import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareWeekCardProps {
  displayName: string;
  tasksCompleted: number;
  streak: number;
  rankingPosition: number | null;
}

export default function ShareWeekCard({ displayName, tasksCompleted, streak, rankingPosition }: ShareWeekCardProps) {
  const name = displayName?.split(" ")[0] || "Pai";
  
  const getClosingLine = () => {
    if (tasksCompleted >= 5 && streak >= 5) return `${name} mandou bem essa semana. Repete.`;
    if (tasksCompleted >= 2) return `${name} fez o suficiente essa semana. O suficiente.`;
    return `${name} teve uma semana... existiu. Isso conta.`;
  };

  const handleShare = async () => {
    const text = `👁️ Tô de Olho — Semana do ${name}\n\n✅ ${tasksCompleted} tarefas concluídas\n🔥 ${streak} dias de sequência\n🏆 #${rankingPosition || "?"} no ranking\n\n${getClosingLine()}\n\n📲 fazoquetemandei.lovable.app`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado! Cola no WhatsApp agora. 📋");
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
      <Button
        onClick={handleShare}
        className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-display text-sm h-11 rounded-xl shadow-lg"
      >
        <Share2 className="w-4 h-4" />
        📤 Compartilhar minha semana
      </Button>
    </div>
  );
}
