import { Share2 } from "lucide-react";
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
    const text = `👁️ *Estou de Olho* — Semana do ${name}\n\n✅ ${tasksCompleted} tarefas concluídas\n🔥 ${streak} dias de sequência\n🏆 #${rankingPosition || "?"} no ranking\n\n${getClosingLine()}\n\n📲 Baixe o app: estoudeolho.lovable.app`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado! Agora cola lá no WhatsApp e mostra que você serve pra algo. 📋");
    } catch {
      toast.error("Não foi possível copiar. Tenta de novo, pai.");
    }
  };

  return (
    <div className="mt-2 mb-4 px-0">
      <button
        onClick={handleShare}
        className="dad-neo-btn w-full flex items-center justify-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        📤 Compartilhar minha semana
      </button>
    </div>
  );
}
