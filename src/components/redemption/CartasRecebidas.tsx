import { useState } from "react";
import { useReceivedLetters, useDeleteLetter } from "@/hooks/useRedemption";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import AnimatedLetter from "./AnimatedLetter";

const TONE_LABELS: Record<string, { label: string; emoji: string }> = {
  coracao: { label: "Do Coração", emoji: "💚" },
  leveza: { label: "Com Leveza", emoji: "😄" },
  romantico: { label: "Romântico", emoji: "💜" },
  gratidao: { label: "Gratidão", emoji: "🌻" },
};

export default function CartasRecebidas() {
  const { data: letters = [] } = useReceivedLetters();
  const deleteLetter = useDeleteLetter();
  const [viewing, setViewing] = useState<string | null>(null);

  const viewingLetter = letters.find(l => l.id === viewing);

  if (viewingLetter) {
    return (
      <AnimatedLetter
        letter={{
          id: viewingLetter.id,
          tone: viewingLetter.tone,
          content: viewingLetter.content,
          date_label: viewingLetter.date_label,
          sender_name: viewingLetter.sender_name,
          recipient_name: viewingLetter.recipient_name,
          include_signature: viewingLetter.include_signature ?? false,
        }}
        skipEnvelope
        onClose={() => setViewing(null)}
      />
    );
  }

  if (letters.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <span className="text-3xl block mb-2">💌</span>
          <p className="font-body text-sm text-muted-foreground italic">
            Nenhuma carta ainda. O app tá trabalhando nisso.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-display text-sm font-bold flex items-center gap-2">
        💌 Cartas Recebidas
      </h3>
      {letters.map(letter => {
        const toneInfo = TONE_LABELS[letter.tone] || { label: letter.tone, emoji: "💌" };
        return (
          <Card
            key={letter.id}
            className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.01]"
            onClick={() => setViewing(letter.id)}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(340,60%,97%)] flex items-center justify-center text-lg shrink-0">
                ✉️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm font-bold truncate">
                    {letter.sender_name || "Pai"}
                  </p>
                  <Badge variant="outline" className="text-[9px] h-4 shrink-0">
                    {toneInfo.emoji} {toneInfo.label}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground font-body truncate mt-0.5">
                  {letter.content.slice(0, 60)}...
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {format(new Date(letter.sent_at), "dd/MM/yyyy", { locale: ptBR })}
                  {letter.saved_by_recipient && " • ❤️ guardada"}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir carta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. A carta será removida permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteLetter.mutate(letter.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
