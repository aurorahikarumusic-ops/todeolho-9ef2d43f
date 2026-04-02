import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format, isBefore, isToday, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, CheckSquare, Camera, Star, LifeBuoy, Trash2 } from "lucide-react";
import TaskCelebration from "@/components/tasks/TaskCelebration";
import ProofPhotoViewer from "@/components/tasks/ProofPhotoViewer";

const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  school: { label: "Escola", emoji: "🏫" },
  health: { label: "Saúde", emoji: "🏥" },
  home: { label: "Casa", emoji: "🏠" },
  finances: { label: "Finanças", emoji: "💰" },
  fun: { label: "Diversão", emoji: "🎮" },
};

const MISSIONS = [
  "Manda uma mensagem de voz pro seu filho antes do almoço.",
  "Pergunta pra sua esposa como ela tá. De verdade. Sem celular na mão.",
  "Anota uma coisa que seu filho gosta que você sempre esquece.",
  "Verifica a agenda. Tem algo essa semana que você não sabia.",
  "Manda uma foto sua com seu filho pro álbum do app.",
  "Descobre o nome do melhor amigo do seu filho.",
  "Lembra o nome da professora sem perguntar pra mãe.",
  "Chega em casa hoje sem olhar o celular nos primeiros 10 minutos.",
  "Conta uma história pro seu filho antes de dormir.",
  "Pergunta o que aconteceu na escola hoje. E escuta a resposta.",
];

function getDailyMission(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return MISSIONS[seed % MISSIONS.length];
}

function getTaskIronicComment(task: any) {
  if (task.rescued_by_mom) return "A mãe fez. De novo.";
  if (task.completed_at) {
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const completedAt = new Date(task.completed_at);
    if (dueDate && isBefore(dueDate, completedAt)) {
      return "Feito. Atrasado, mas feito. Conta (um pouco).";
    }
    return "Feito no prazo. Guardamos pra história. ✓";
  }
  if (!task.due_date) return "Ainda dá tempo. Não desperdiça.";
  const dueDate = new Date(task.due_date);
  if (isToday(dueDate)) return "É hoje. Não é amanhã. É hoje.";
  if (isBefore(dueDate, new Date())) {
    const hoursLate = differenceInHours(new Date(), dueDate);
    if (hoursLate <= 12) return "Atrasou. Dá pra recuperar. Talvez.";
    return "A mãe já resolveu isso. Mas vamos fingir que não.";
  }
  return "Ainda dá tempo. Não desperdiça.";
}

function calculatePoints(task: any, withPhoto: boolean): number {
  if (task.rescued_by_mom) return -30;
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const now = new Date();
  const isLate = dueDate && isBefore(dueDate, now);
  if (isLate) return withPhoto ? 20 : 10;
  return withPhoto ? 50 : 35;
}

export default function Tarefas() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [completingTask, setCompletingTask] = useState<any>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [newTask, setNewTask] = useState({
    title: "", description: "", due_date: "", due_time: "18:00",
    category: "home", proof_required: false,
  });
  const [celebration, setCelebration] = useState<{ points: number } | null>(null);
  const [proofViewer, setProofViewer] = useState<{
    photoUrl: string; taskTitle: string; storagePath: string;
  } | null>(null);

  const { data: tasks = [] } = useQuery({
    queryKey: ["all-tasks", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", profile.family_id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  // Daily mission via edge function (server-side creation)
  const { data: todayMission } = useQuery({
    queryKey: ["daily-mission", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.functions.invoke("create-daily-mission");
      if (error) {
        // Fallback: try to read existing mission
        const today = new Date().toISOString().split("T")[0];
        const { data: existing } = await supabase
          .from("daily_missions")
          .select("*")
          .eq("user_id", user.id)
          .eq("mission_date", today)
          .maybeSingle();
        return existing;
      }
      return data;
    },
    enabled: !!user,
  });

  const pending = tasks.filter(t => !t.completed_at && !t.rescued_by_mom);
  const completed = tasks.filter(t => t.completed_at || t.rescued_by_mom);
  const overdue = tasks.filter(t =>
    !t.completed_at && !t.rescued_by_mom && t.due_date && isBefore(new Date(t.due_date), new Date())
  );

  // Header subtitle
  let subtitle = `${pending.length} pendentes, ${completed.length} concluídas. Tá indo.`;
  if (pending.length === 0 && completed.length > 0) subtitle = "Tudo feito! Isso não acontece toda semana. Aproveita.";
  if (overdue.length > 0) subtitle = `Você tem ${overdue.length} tarefa${overdue.length > 1 ? "s" : ""} atrasada${overdue.length > 1 ? "s" : ""}. A mãe já sabe.`;
  if (completed.length === 0 && pending.length > 0) subtitle = "Nenhuma tarefa concluída hoje. Só lembrando.";

  // Photo upload helper
  const uploadProofPhoto = async (taskId: string, file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${taskId}.${ext}`;
    const { error } = await supabase.storage.from("task-proofs").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("task-proofs").getPublicUrl(path);
    return urlData.publicUrl;
  };

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, withPhoto, photoFile }: { taskId: string; withPhoto: boolean; photoFile?: File }) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task || !user) throw new Error("Erro");
      const pts = calculatePoints(task, withPhoto);

      let photoUrl: string | null = null;
      let storagePath: string | null = null;
      if (withPhoto && photoFile) {
        photoUrl = await uploadProofPhoto(taskId, photoFile);
        const ext = photoFile.name.split(".").pop() || "jpg";
        storagePath = `${user.id}/${taskId}.${ext}`;
      }

      await supabase.from("tasks").update({
        completed_at: new Date().toISOString(),
        photo_proof_url: photoUrl,
      }).eq("id", taskId);
      
      if (pts > 0) {
        await supabase.from("profiles").update({ points: (profile?.points || 0) + pts }).eq("user_id", user.id);
      }
      return { pts, photoUrl, storagePath, taskTitle: task.title };
    },
    onSuccess: ({ pts, photoUrl, storagePath, taskTitle }) => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setCompletingTask(null);
      setProofFile(null);
      
      // Show celebration overlay
      if (pts > 0) {
        setCelebration({ points: pts });
      }

      // Show proof photo viewer if photo was uploaded
      if (photoUrl && storagePath) {
        setTimeout(() => {
          setProofViewer({ photoUrl, taskTitle, storagePath });
        }, pts > 0 ? 2000 : 300);
      }
    },
    onError: () => toast.error("Erro ao concluir. Tenta de novo, pai."),
  });

  // Complete daily mission
  const completeMissionMutation = useMutation({
    mutationFn: async () => {
      if (!todayMission || !user) throw new Error("Sem missão");
      await supabase.from("daily_missions").update({ completed_at: new Date().toISOString() }).eq("id", todayMission.id);
      await supabase.from("profiles").update({ points: (profile?.points || 0) + 40 }).eq("user_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-mission"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(`Missão cumprida! +40 pontos.\n${profile?.display_name}, você fez isso sem a mãe pedir.\nIsso tem nome. Chama-se ser pai.`, { duration: 5000 });
    },
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.family_id || !user) throw new Error("Sem família");
      const dueDate = newTask.due_date
        ? new Date(`${newTask.due_date}T${newTask.due_time}`).toISOString()
        : null;
      const { error } = await supabase.from("tasks").insert({
        title: newTask.title,
        description: newTask.description || null,
        due_date: dueDate,
        category: newTask.category,
        proof_required: newTask.proof_required,
        family_id: profile.family_id,
        created_by: user.id,
        assigned_to: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      setShowAddSheet(false);
      setNewTask({ title: "", description: "", due_date: "", due_time: "18:00", category: "home", proof_required: false });
      toast.success("Tarefa criada! Você adicionou sozinho. +30 pontos de iniciativa. ✨", { duration: 4000 });
    },
    onError: () => toast.error("Erro ao criar tarefa."),
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      toast.success("Tarefa removida. Como se nunca tivesse existido. 🗑️", { duration: 3000 });
    },
    onError: () => toast.error("Erro ao excluir."),
  });

  const renderTaskCard = (task: any) => {
    const cat = CATEGORIES[task.category] || CATEGORIES.home;
    const isDadTask = task.created_by === user?.id;
    const isOverdue = task.due_date && isBefore(new Date(task.due_date), new Date()) && !task.completed_at;

    return (
      <Card key={task.id} className={`relative overflow-hidden ${task.rescued_by_mom ? "border-secondary/40" : ""}`}>
        {task.rescued_by_mom && (
          <div className="bg-secondary/10 px-4 py-1.5 flex items-center gap-2 border-b border-secondary/20">
            <LifeBuoy className="w-3.5 h-3.5 text-secondary" />
            <span className="text-[10px] font-body font-semibold text-secondary">
              🛟 Resgate da mãe
            </span>
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            {!task.completed_at && !task.rescued_by_mom && (
              <Checkbox
                className="mt-1 border-primary data-[state=checked]:bg-primary"
                onCheckedChange={() => {
                  if (task.proof_required) {
                    setCompletingTask(task);
                  } else {
                    setCompletingTask(task);
                  }
                }}
              />
            )}
            {(task.completed_at || task.rescued_by_mom) && (
              <div className="mt-1 w-4 h-4 rounded-sm bg-primary/20 flex items-center justify-center">
                <CheckSquare className="w-3.5 h-3.5 text-primary" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{cat.emoji}</span>
                <h3 className={`font-display font-bold text-sm truncate ${task.completed_at ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h3>
              </div>

              {task.due_date && (
                <p className={`text-xs mb-1.5 ${isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                  {format(new Date(task.due_date), "dd/MM · HH:mm")}
                  {isOverdue && " ⚠️"}
                </p>
              )}

              <div className="flex items-center gap-2 mb-1.5">
                <Badge
                  variant={isDadTask ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {isDadTask ? "Missão do app" : "Mãe atribuiu"}
                </Badge>
                {task.proof_required && (
                  <Badge variant="outline" className="text-[10px]">
                    📸 Prova exigida
                  </Badge>
                )}
              </div>

              <p className="text-xs font-body italic text-muted-foreground">
                {getTaskIronicComment(task)}
              </p>
            </div>

            {/* Points indicator */}
            {task.completed_at && !task.rescued_by_mom && (
              <span className="text-xs font-display font-bold text-primary shrink-0">
                +{task.points || 50}pts
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = (type: "pending" | "overdue" | "completed") => {
    const messages = {
      pending: {
        emoji: "🎯",
        title: "Nenhuma tarefa pendente!",
        text: "Ou você fez tudo, ou a mãe ainda não atualizou.\nDas duas, uma é mais provável.",
      },
      overdue: {
        emoji: "🎉",
        title: "Nada atrasado!",
        text: "Isso é incomum. Aproveita o momento.",
      },
      completed: {
        emoji: "🤷",
        title: "Nada concluído ainda",
        text: "Tudo feito essa semana.\nA gente tá orgulhoso.\n(Não esperávamos isso.)",
      },
    };
    const m = messages[type];
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center">
          <p className="text-4xl mb-3">{m.emoji}</p>
          <p className="font-display text-lg font-bold mb-1">{m.title}</p>
          <p className="text-sm text-muted-foreground font-body italic whitespace-pre-line">{m.text}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="pb-24 px-4 pt-8 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CheckSquare className="w-6 h-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">A Lista da Mãe</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body italic">{subtitle}</p>
      </div>

      {/* Daily Mission */}
      {todayMission && !todayMission.completed_at && (
        <Card className="border-accent bg-accent/10 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <Badge className="bg-accent text-accent-foreground text-[10px] mb-2">
                  ⭐ Missão Surpresa do Dia
                </Badge>
                <p className="font-body text-sm mb-3">{todayMission.mission_text}</p>
                <Button
                  size="sm"
                  className="bg-primary text-xs"
                  onClick={() => completeMissionMutation.mutate()}
                  disabled={completeMissionMutation.isPending}
                >
                  {completeMissionMutation.isPending ? "..." : "✅ Missão cumprida! (+40pts)"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {todayMission?.completed_at && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3 text-center">
            <p className="text-xs font-body italic text-primary">
              ✅ Missão do dia cumprida! Você fez sem a mãe pedir. Respeito.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="pending" className="text-xs font-display">
            Pendentes ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs font-display">
            Concluídas ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs font-display">
            Atrasadas ({overdue.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 mt-3">
          {pending.length === 0 ? renderEmptyState("pending") : pending.map(renderTaskCard)}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-3">
          {completed.length === 0 ? renderEmptyState("completed") : completed.map(renderTaskCard)}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-3 mt-3">
          {overdue.length === 0 ? renderEmptyState("overdue") : overdue.map(renderTaskCard)}
        </TabsContent>
      </Tabs>

      {/* FAB */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-20 right-4 z-40 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 px-4 h-12"
        title="Criar nova tarefa"
      >
        <Plus className="w-5 h-5" />
        <span className="font-display text-sm">Nova tarefa</span>
      </button>

      {/* Complete Task Sheet */}
      <Sheet open={!!completingTask} onOpenChange={(open) => { if (!open) { setCompletingTask(null); setProofFile(null); } }}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Tarefa concluída! 🎉</SheetTitle>
          </SheetHeader>
          {completingTask && (
            <div className="space-y-3 mt-4">
              <p className="text-sm font-body text-muted-foreground">
                {completingTask.title}
              </p>

              {/* File input for photo */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  id="proof-photo"
                  className="hidden"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
                {proofFile && (
                  <p className="text-xs text-primary font-body">📷 {proofFile.name}</p>
                )}
              </div>

              {completingTask.proof_required ? (
                <div className="space-y-3">
                  <p className="text-xs font-body italic text-secondary">
                    📸 A mãe exigiu foto como prova. Sem foto, sem pontos.
                  </p>
                  <Button
                    className="w-full bg-primary font-display"
                    onClick={() => {
                      if (!proofFile) {
                        document.getElementById("proof-photo")?.click();
                        return;
                      }
                      completeTaskMutation.mutate({ taskId: completingTask.id, withPhoto: true, photoFile: proofFile });
                    }}
                    disabled={completeTaskMutation.isPending}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {proofFile ? `Enviar foto e concluir (+50pts)` : "Tirar foto como prova (+50pts)"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Primary action: conclude without photo */}
                  <Button
                    className="w-full bg-primary font-display"
                    onClick={() => {
                      if (proofFile) {
                        completeTaskMutation.mutate({ taskId: completingTask.id, withPhoto: true, photoFile: proofFile });
                      } else {
                        completeTaskMutation.mutate({ taskId: completingTask.id, withPhoto: false });
                      }
                    }}
                    disabled={completeTaskMutation.isPending}
                  >
                    {proofFile ? `Enviar foto e concluir (+50pts)` : "✅ Concluir tarefa (+35pts)"}
                  </Button>
                  {/* Secondary: add photo for bonus */}
                  {!proofFile && (
                    <Button
                      variant="outline"
                      className="w-full font-display text-muted-foreground"
                      onClick={() => document.getElementById("proof-photo")?.click()}
                      disabled={completeTaskMutation.isPending}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Adicionar foto (+15pts bônus)
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Task Sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Nova Tarefa</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-body">Nome da tarefa</Label>
              <Input
                placeholder="Ex: Levar filho no médico"
                value={newTask.title}
                onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="text-xs font-body">Prazo</Label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="w-28">
                <Label className="text-xs font-body">Hora</Label>
                <Input
                  type="time"
                  value={newTask.due_time}
                  onChange={e => setNewTask(p => ({ ...p, due_time: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-body">Categoria</Label>
              <Select
                value={newTask.category}
                onValueChange={v => setNewTask(p => ({ ...p, category: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, c]) => (
                    <SelectItem key={key} value={key}>{c.emoji} {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-body">Notas (opcional)</Label>
              <Textarea
                placeholder="Detalhes da tarefa..."
                value={newTask.description}
                onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                className="mt-1 min-h-[60px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs font-body">Exigir foto como prova?</Label>
              <Switch
                checked={newTask.proof_required}
                onCheckedChange={v => setNewTask(p => ({ ...p, proof_required: v }))}
              />
            </div>

            <Button
              className="w-full bg-primary font-display"
              onClick={() => addTaskMutation.mutate()}
              disabled={!newTask.title || addTaskMutation.isPending}
            >
              {addTaskMutation.isPending ? "Salvando..." : "Criar Tarefa"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Celebration Overlay */}
      {celebration && (
        <TaskCelebration
          points={celebration.points}
          onClose={() => setCelebration(null)}
        />
      )}

      {/* Proof Photo Viewer */}
      {proofViewer && (
        <ProofPhotoViewer
          open={!!proofViewer}
          onClose={() => setProofViewer(null)}
          photoUrl={proofViewer.photoUrl}
          taskTitle={proofViewer.taskTitle}
          storagePath={proofViewer.storagePath}
        />
      )}
    </div>
  );
}
