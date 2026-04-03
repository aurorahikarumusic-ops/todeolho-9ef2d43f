import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X, Camera, LifeBuoy } from "lucide-react";

interface Props {
  task: any;
  dadName: string;
}

export default function MomTaskApproval({ task, dadName }: Props) {
  const queryClient = useQueryClient();
  const [showReprove, setShowReprove] = useState(false);
  const [reproveComment, setReproveComment] = useState("");

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tasks")
        .update({ mom_approved: true })
        .eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      toast.success(`Aprovado! O ${dadName} ganhou +${task.points || 50} pontos. Ele fez mesmo.`);
    },
  });

  const reproveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tasks")
        .update({
          mom_approved: false,
          mom_reprove_comment: reproveComment.trim() || null,
          completed_at: null,
        })
        .eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      setShowReprove(false);
      toast.success(`Reprovado. O ${dadName} vai ter que refazer.`);
    },
  });

  const rescueMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tasks")
        .update({ rescued_by_mom: true, completed_at: new Date().toISOString() })
        .eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      toast.success(`Resgate registrado. O ${dadName} foi notificado. Ele sabe.`, { duration: 4000 });
    },
  });

  const isAwaitingApproval = task.completed_at && task.mom_approved === null && !task.rescued_by_mom;
  const isPending = !task.completed_at && !task.rescued_by_mom;

  return (
    <>
      <Card className={`relative overflow-hidden ${task.rescued_by_mom ? "border-secondary/40" : isAwaitingApproval ? "border-mom/40 bg-mom-bg/30" : ""}`}>
        {task.rescued_by_mom && (
          <div className="bg-secondary/10 px-4 py-1.5 flex items-center gap-2 border-b border-secondary/20">
            <LifeBuoy className="w-3.5 h-3.5 text-secondary" />
            <span className="text-[10px] font-body font-semibold text-secondary">
              🛟 Você resgatou essa tarefa
            </span>
          </div>
        )}
        {isAwaitingApproval && (
          <div className="bg-mom/10 px-4 py-1.5 flex items-center gap-2 border-b border-mom/20">
            <span className="text-[10px] font-body font-semibold text-mom">
              ⏳ Aguardando sua aprovação
            </span>
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-sm">{task.title}</h3>
              {task.due_date && (
                <p className="text-xs text-muted-foreground mt-1">
                  Prazo: {format(new Date(task.due_date), "dd/MM · HH:mm")}
                </p>
              )}
              {task.description && (
                <p className="text-xs text-muted-foreground font-body mt-1">{task.description}</p>
              )}
              <div className="flex gap-1 mt-2">
                {task.proof_required && (
                  <Badge variant="outline" className="text-[10px]">📸 Prova exigida</Badge>
                )}
                {task.urgency === "urgente" && (
                  <Badge className="bg-secondary text-[10px]">⚡ Urgente</Badge>
                )}
                {task.urgency === "critico" && (
                  <Badge className="bg-destructive text-[10px]">⚠️ Crítico</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              {isAwaitingApproval && (
                <>
                  {task.photo_proof_url && (
                    <a href={task.photo_proof_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-7 text-[10px]">
                        <Camera className="w-3 h-3 mr-1" /> Ver foto
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    className="h-7 text-[10px] bg-primary"
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="w-3 h-3 mr-1" /> Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-destructive text-destructive"
                    onClick={() => setShowReprove(true)}
                  >
                    <X className="w-3 h-3 mr-1" /> Reprovar
                  </Button>
                </>
              )}
              {isPending && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[10px] text-muted-foreground"
                  onClick={() => {
                    if (confirm(`Tem certeza? Isso vai pro histórico dele como resgate.\nE vai descontar 30 pontos do ranking.\n(Vale a pena? Sim. Clica.)`)) {
                      rescueMutation.mutate();
                    }
                  }}
                  disabled={rescueMutation.isPending}
                >
                  <LifeBuoy className="w-3 h-3 mr-1" /> Eu resolvi
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reprove Sheet */}
      <Sheet open={showReprove} onOpenChange={setShowReprove}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Reprovar tarefa</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 mt-4">
            <p className="text-sm font-body text-muted-foreground">
              Motivo da reprovação de "{task.title}":
            </p>
            <Textarea
              placeholder="O que ele fez de errado dessa vez?"
              value={reproveComment}
              onChange={(e) => setReproveComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              className="w-full bg-destructive font-display"
              onClick={() => reproveMutation.mutate()}
              disabled={reproveMutation.isPending}
            >
              {reproveMutation.isPending ? "Reprovando..." : "Confirmar reprovação"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
