import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useSentLetters, useDeleteLetter } from "@/hooks/useRedemption";

interface RedemptionSectionProps {
  onOpenRedencao: () => void;
  isMom: boolean;
}

export default function RedemptionSection({ onOpenRedencao, isMom }: RedemptionSectionProps) {
  const { data: sentLetters = [] } = useSentLetters();
  const deleteLetter = useDeleteLetter();

  return (
    <Card className="overflow-hidden border-[1.5px] border-[hsl(340,60%,88%)] bg-[hsl(340,60%,97%)]">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[hsl(340,72%,57%)] flex items-center justify-center text-xl shadow-md shrink-0">
            💌
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-sm text-[hsl(340,40%,25%)]">
              {isMom ? "Enviar carta pro pai" : "Modo Redenção"}
            </p>
            <p className="font-body text-[11px] text-[hsl(340,50%,55%)] italic leading-snug">
              {isMom
                ? "Ele vai receber uma carta animada. Surpreenda (ou ameace com carinho)."
                : "Escreva uma carta do coração pra ela. Chega animada, tipo filme."}
            </p>
            {!isMom && sentLetters.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {sentLetters.length} carta{sentLetters.length > 1 ? "s" : ""} enviada{sentLetters.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={onOpenRedencao}
          className="w-full mt-3 rounded-full bg-[hsl(340,72%,57%)] hover:bg-[hsl(340,72%,50%)] text-white font-display font-bold text-sm h-10"
        >
          ✉️ Escrever carta
        </Button>
        {!isMom && sentLetters.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Cartas enviadas</p>
            {sentLetters.map(letter => (
              <div key={letter.id} className="flex items-center gap-2 rounded-lg px-3 py-2 bg-white/60 border border-[hsl(340,60%,90%)]">
                <span className="text-sm">✉️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{letter.recipient_name || "Amor"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{letter.content.slice(0, 40)}...</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir carta enviada?</AlertDialogTitle>
                      <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
