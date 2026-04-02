import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Share2, X, Trash2 } from "lucide-react";

interface ProofPhotoViewerProps {
  open: boolean;
  onClose: () => void;
  photoUrl: string;
  taskTitle: string;
  storagePath: string; // e.g. "userId/taskId.jpg"
}

export default function ProofPhotoViewer({ open, onClose, photoUrl, taskTitle, storagePath }: ProofPhotoViewerProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      // Try native share
      if (navigator.share) {
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const file = new File([blob], "prova.jpg", { type: blob.type });

        await navigator.share({
          title: `Prova: ${taskTitle}`,
          text: `Olha só, eu fiz! 📸 "${taskTitle}" — Estou de Olho`,
          files: [file],
        });
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(photoUrl);
        toast.success("Link copiado! Compartilha onde quiser.");
      }

      // Delete the photo after sharing
      const { error } = await supabase.storage.from("task-proofs").remove([storagePath]);
      if (!error) {
        toast.success("Foto compartilhada e apagada! Missão cumprida. 🗑️", { duration: 3000 });
      }
      onClose();
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast.error("Erro ao compartilhar.");
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-lg">📸 Prova Fotográfica</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <p className="text-xs font-body italic text-muted-foreground">
            A evidência do crime (de ser um bom pai). Compartilha antes que apaguem.
          </p>

          <div className="rounded-xl overflow-hidden border-2 border-primary/20">
            <img
              src={photoUrl}
              alt={`Prova: ${taskTitle}`}
              className="w-full max-h-[50vh] object-contain bg-muted"
            />
          </div>

          <p className="text-center text-xs font-body text-muted-foreground">
            "{taskTitle}"
          </p>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-primary font-display"
              onClick={handleShare}
              disabled={sharing}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {sharing ? "Compartilhando..." : "Compartilhar 📤"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground font-body">
            Ao compartilhar, a foto será apagada automaticamente. Evidência temporária.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
