import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useFamilyPartner, useIsMom } from "@/hooks/useFamily";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, isBefore, isToday, differenceInHours } from "date-fns";
import {
  Plus, CheckSquare, Camera, Star, LifeBuoy, Trash2,
  Clock, AlertTriangle, Flame, Trophy, ChevronRight, Zap, Shield
} from "lucide-react";
import TaskCelebration from "@/components/tasks/TaskCelebration";
import { notifyCrossPanel } from "@/lib/notify";
import ProofPhotoViewer from "@/components/tasks/ProofPhotoViewer";
import MomTaskApproval from "@/components/tasks/MomTaskApproval";

const CATEGORIES: Record<string, { label: string; emoji: string; color: string }> = {
  school: { label: "Escola", emoji: "🏫", color: "#6366f1" },
  health: { label: "Saúde", emoji: "🏥", color: "#ef4444" },
  home: { label: "Casa", emoji: "🏠", color: "#22c55e" },
  finances: { label: "Finanças", emoji: "💰", color: "#f59e0b" },
  fun: { label: "Diversão", emoji: "🎮", color: "#8b5cf6" },
};

const URGENCY_CONFIG: Record<string, { label: string; color: string; icon: any; glow: string }> = {
  normal: { label: "Normal", color: "#22c55e", icon: CheckSquare, glow: "rgba(34,197,94,0.3)" },
  urgente: { label: "Urgente", color: "#f59e0b", icon: Zap, glow: "rgba(245,158,11,0.4)" },
  critico: { label: "Crítico", color: "#ef4444", icon: AlertTriangle, glow: "rgba(239,68,68,0.5)" },
};

const DAD_COMMENTS = [
  "Feito. Atrasado, mas feito. Conta (um pouco).",
  "Parabéns por fazer o mínimo. A barra era baixa.",
  "Completou sem a mãe mandar? Isso merece um troféu.",
  "Registrado no histórico. Pra quando disserem que você não faz nada.",
];

const MOM_COMMENTS = [
  "Ele fez. Sem reclamar? Duvidoso.",
  "Tarefa concluída. Milagres acontecem.",
  "Registrado. Agora faltam só mais 47.",
  "A prova está nos autos. Literalmente.",
];

function getTaskIronicComment(task: any, isMom: boolean) {
  if (task.rescued_by_mom) return "A mãe fez. De novo. Como sempre.";
  if (task.completed_at) {
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const completedAt = new Date(task.completed_at);
    if (dueDate && isBefore(dueDate, completedAt)) return "Feito. Atrasado. Típico.";
    const idx = Math.floor(Math.random() * (isMom ? MOM_COMMENTS : DAD_COMMENTS).length);
    return (isMom ? MOM_COMMENTS : DAD_COMMENTS)[idx];
  }
  if (!task.due_date) return isMom ? "Sem prazo. Vai cobrar quando?" : "Sem prazo. Não desperdiça.";
  const dueDate = new Date(task.due_date);
  if (isToday(dueDate)) return isMom ? "É HOJE. Ele sabe?" : "É HOJE. Não é amanhã.";
  if (isBefore(dueDate, new Date())) {
    const hoursLate = differenceInHours(new Date(), dueDate);
    if (hoursLate <= 12) return isMom ? "Atrasou. Surpresa zero." : "Atrasou. Dá pra recuperar. Talvez.";
    return isMom ? "Passou do prazo. Quer resgatar?" : "A mãe já sabe. Corre.";
  }
  return isMom ? "Aguardando. Tick tock." : "Ainda dá tempo. Não desperdiça.";
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
  const isMom = useIsMom();
  const { data: partner } = useFamilyPartner();
  const queryClient = useQueryClient();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [completingTask, setCompletingTask] = useState<any>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "", description: "", due_date: "", due_time: "18:00",
    category: "home", proof_required: isMom, urgency: "normal",
  });
  const [celebration, setCelebration] = useState<{ points: number } | null>(null);
  const [proofViewer, setProofViewer] = useState<{
    photoUrl: string; taskTitle: string; storagePath: string;
  } | null>(null);

  const dadName = partner?.display_name || "o pai";

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

  const { data: todayMission } = useQuery({
    queryKey: ["daily-mission", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.functions.invoke("create-daily-mission");
      if (error) {
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
  const awaitingApproval = tasks.filter(t => t.completed_at && t.mom_approved === null && !t.rescued_by_mom);
  const completed = tasks.filter(t => (t.completed_at && t.mom_approved !== null) || t.rescued_by_mom);
  const rescued = tasks.filter(t => t.rescued_by_mom);
  const overdue = tasks.filter(t =>
    !t.completed_at && !t.rescued_by_mom && t.due_date && isBefore(new Date(t.due_date), new Date())
  );

  // Photo upload
  const uploadProofPhoto = async (taskId: string, file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${taskId}.${ext}`;
    const { error } = await supabase.storage.from("task-proofs").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("task-proofs").getPublicUrl(path);
    return urlData.publicUrl;
  };

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
      if (pts > 0) setCelebration({ points: pts });
      if (photoUrl && storagePath) {
        setTimeout(() => setProofViewer({ photoUrl, taskTitle, storagePath }), pts > 0 ? 2000 : 300);
      }
      if (user && profile?.family_id) {
        notifyCrossPanel("task_completed", profile.family_id, user.id, { title: taskTitle, has_photo: !!photoUrl });
      }
    },
    onError: () => toast.error("Erro ao concluir. Tenta de novo."),
  });

  const completeMissionMutation = useMutation({
    mutationFn: async () => {
      if (!todayMission || !user) throw new Error("Sem missão");
      await supabase.from("daily_missions").update({ completed_at: new Date().toISOString() }).eq("id", todayMission.id);
      await supabase.from("profiles").update({ points: (profile?.points || 0) + 40 }).eq("user_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-mission"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Missão cumprida! +40pts 🎯\nVocê fez sem a mãe pedir. Histórico.", { duration: 5000 });
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.family_id || !user) throw new Error("Sem família");
      const dueDate = newTask.due_date ? new Date(`${newTask.due_date}T${newTask.due_time}`).toISOString() : null;
      const pointsByUrgency: Record<string, number> = { normal: 30, urgente: 40, critico: 50 };
      const { data: inserted, error } = await supabase.from("tasks").insert({
        title: newTask.title,
        description: newTask.description || null,
        due_date: dueDate,
        category: newTask.category,
        proof_required: newTask.proof_required,
        family_id: profile.family_id,
        created_by: user.id,
        assigned_to: isMom && partner ? partner.user_id : user.id,
        points: pointsByUrgency[newTask.urgency] || 30,
        urgency: newTask.urgency,
      } as any).select().single();
      if (error) throw error;
      return inserted;
    },
    onSuccess: (inserted) => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      setShowAddSheet(false);
      setNewTask({ title: "", description: "", due_date: "", due_time: "18:00", category: "home", proof_required: false, urgency: "normal" });
      toast.success(
        isMom
          ? `Tarefa enviada pro ${dadName}! Ele já foi notificado. 😈`
          : "Tarefa criada! Você adicionou sozinho. +30pts de iniciativa ✨"
      );
      if (inserted && user && profile?.family_id) {
        notifyCrossPanel("task_created", profile.family_id, user.id, { title: inserted.title, urgency: inserted.urgency });
      }
    },
    onError: () => toast.error("Erro ao criar tarefa."),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      toast.success("Tarefa removida. Puf. Nunca existiu. 🗑️");
    },
  });

  const renderTaskCard = (task: any) => {
    const cat = CATEGORIES[task.category] || CATEGORIES.home;
    const urgency = URGENCY_CONFIG[task.urgency] || URGENCY_CONFIG.normal;
    const isDadTask = task.created_by === user?.id;
    const isOverdue = task.due_date && isBefore(new Date(task.due_date), new Date()) && !task.completed_at;
    const isExpanded = expandedTask === task.id;
    const UrgencyIcon = urgency.icon;

    return (
      <div
        key={task.id}
        className={`rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
          isExpanded ? "scale-[1.01]" : "hover:scale-[1.005]"
        } ${task.rescued_by_mom ? "opacity-70" : ""}`}
        style={{
          background: isMom ? "hsl(var(--card))" : "linear-gradient(135deg, hsl(var(--arena-dark) / 0.9), hsl(30 25% 12%))",
          boxShadow: isExpanded
            ? isMom
              ? `0 12px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15), -4px 0 0 ${cat.color}`
              : `0 12px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05), -4px 0 0 ${cat.color}`
            : isMom
              ? `0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1), -4px 0 0 ${cat.color}`
              : `0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.03), -4px 0 0 ${cat.color}`,
          border: isMom ? undefined : "1px solid hsl(30 30% 18%)",
        }}
        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
      >
        {/* Rescued banner */}
        {task.rescued_by_mom && (
          <div className="px-4 py-2 flex items-center gap-2"
            style={{ background: "linear-gradient(90deg, rgba(244,63,94,0.1), transparent)" }}>
            <LifeBuoy className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[10px] font-display font-bold text-rose-500 uppercase tracking-wider">
              🛟 Resgate da mãe — Ela fez. De novo.
            </span>
          </div>
        )}

        {/* Urgency banner for critical */}
        {task.urgency === "critico" && !task.completed_at && !task.rescued_by_mom && (
          <div className="px-4 py-1.5 flex items-center gap-2 animate-pulse"
            style={{ background: "linear-gradient(90deg, rgba(239,68,68,0.15), transparent)" }}>
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-display font-bold text-red-500 uppercase tracking-wider">
              🔴 Crítico — A mãe tá de olho
            </span>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Status indicator */}
            {!task.completed_at && !task.rescued_by_mom ? (
              <button
                onClick={(e) => { e.stopPropagation(); setCompletingTask(task); }}
                className="mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${urgency.color}20, ${urgency.color}10)`,
                  border: `2px solid ${urgency.color}50`,
                }}
              >
                <UrgencyIcon className="w-4 h-4" style={{ color: urgency.color }} />
              </button>
            ) : (
              <div
                className="mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: task.rescued_by_mom
                    ? "linear-gradient(135deg, rgba(244,63,94,0.2), rgba(244,63,94,0.1))"
                    : "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.1))",
                }}
              >
                <CheckSquare className="w-4 h-4" style={{ color: task.rescued_by_mom ? "#f43f5e" : "hsl(var(--primary))" }} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-display font-bold text-sm truncate ${task.completed_at ? "line-through" : ""}`} style={!isMom && !task.completed_at ? { color: "hsl(30 15% 90%)" } : !isMom ? { color: "hsl(30 15% 70%)" } : undefined}>
                  {cat.emoji} {task.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                {task.due_date && (
                <span className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    isOverdue
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : isMom ? "bg-muted/50 text-muted-foreground" : ""
                  }`}
                  style={!isMom && !isOverdue ? { background: "hsl(30 30% 18%)", color: "hsl(30 15% 78%)" } : undefined}>
                    <Clock className="w-2.5 h-2.5" />
                    {format(new Date(task.due_date), "dd/MM · HH:mm")}
                    {isOverdue && " ⚠️"}
                  </span>
                )}
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full font-display font-bold"
                  style={{
                    background: `${urgency.color}15`,
                    color: urgency.color,
                  }}
                >
                  {urgency.label}
                </span>
                {task.proof_required && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-display font-bold">
                    📸 Prova
                  </span>
                )}
              </div>

              <p className="text-[10px] font-body italic" style={!isMom ? { color: "hsl(30 15% 65%)" } : undefined}>
                {getTaskIronicComment(task, isMom)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              {task.points && !task.rescued_by_mom && (
                <span
                  className="text-xs font-display font-black"
                  style={{
                    background: task.completed_at
                      ? "linear-gradient(135deg, hsl(var(--primary)), #22c55e)"
                      : "linear-gradient(135deg, hsl(var(--muted-foreground)), hsl(var(--foreground)))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {task.completed_at ? "+" : ""}{task.points}pts
                </span>
              )}
              {task.rescued_by_mom && (
                <span className="text-xs font-display font-black text-red-500">-30pts</span>
              )}
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} style={!isMom ? { color: "hsl(30 15% 50%)" } : { color: "hsl(var(--muted-foreground) / 0.3)" }} />
            </div>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="mt-3 pt-3 space-y-3 animate-fade-in" style={{ borderTop: isMom ? "1px solid hsl(var(--muted) / 0.2)" : "1px solid hsl(30 30% 18%)" }}>
              {task.description && (
                <p className="text-xs font-body" style={!isMom ? { color: "hsl(30 15% 75%)" } : { color: "hsl(var(--muted-foreground))" }}>📝 {task.description}</p>
              )}

              <div className="flex items-center gap-2">
                <Badge variant={isDadTask ? "default" : "secondary"} className="text-[9px] h-5">
                  {isDadTask ? (
                    <><Sparkles className="w-2.5 h-2.5 mr-1" /> Iniciativa do pai</>
                  ) : (
                    <>{isMom ? "Você criou" : "Mãe mandou"}</>
                  )}
                </Badge>
                <span className="text-[9px]" style={!isMom ? { color: "hsl(30 15% 60%)" } : { color: "hsl(var(--muted-foreground) / 0.5)" }}>
                  {format(new Date(task.created_at), "dd/MM")}
                </span>
              </div>

              <div className="flex gap-2">
                {!task.completed_at && !task.rescued_by_mom && (
                  <Button
                    size="sm"
                    className="text-xs h-8 flex-1 rounded-xl font-display font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${urgency.color}, ${urgency.color}cc)`,
                      boxShadow: `0 4px 12px ${urgency.glow}`,
                    }}
                    onClick={(e) => { e.stopPropagation(); setCompletingTask(task); }}
                  >
                    ✅ Concluir
                  </Button>
                )}
                {(task.completed_at || task.rescued_by_mom) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 text-muted-foreground hover:text-red-500 rounded-xl"
                    onClick={(e) => { e.stopPropagation(); deleteTaskMutation.mutate(task.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Excluir
                  </Button>
                )}
                {task.photo_proof_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      const ext = task.photo_proof_url?.split(".").pop()?.split("?")[0] || "jpg";
                      setProofViewer({
                        photoUrl: task.photo_proof_url!,
                        taskTitle: task.title,
                        storagePath: `${task.assigned_to || task.created_by}/${task.id}.${ext}`,
                      });
                    }}
                  >
                    <Camera className="w-3.5 h-3.5 mr-1" />
                    Ver foto
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEmptyState = (emoji: string, title: string, text: string) => (
    <div className="rounded-3xl p-10 text-center"
      style={{
        borderColor: isMom ? "hsl(var(--muted))" : "hsl(var(--arena-gold) / 0.2)",
        background: isMom ? undefined : "linear-gradient(135deg, hsl(var(--arena-dark) / 0.9), hsl(30 25% 12%))",
        boxShadow: isMom ? "inset 0 2px 8px rgba(0,0,0,0.03)" : "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
        border: isMom ? "2px dashed hsl(var(--muted))" : "1px solid hsl(var(--arena-gold) / 0.12)",
      }}>
      <p className="text-5xl mb-3">{emoji}</p>
      <p className="font-display text-lg font-bold mb-1" style={!isMom ? { color: "hsl(0 0% 100%)" } : undefined}>{title}</p>
      <p className="text-sm font-body italic whitespace-pre-line" style={!isMom ? { color: "hsl(30 20% 85%)" } : undefined}>{text}</p>
    </div>
  );

  // Subtitle
  let subtitle = isMom
    ? `Você cria. Ele faz. Ou a gente registra que não fez.`
    : `${pending.length} pendentes. Tá indo.`;
  if (!isMom && pending.length === 0 && completed.length > 0) subtitle = "Tudo feito! Isso não acontece sempre. Aproveita.";
  if (!isMom && overdue.length > 0) subtitle = `${overdue.length} atrasada${overdue.length > 1 ? "s" : ""}. A mãe já sabe. 👀`;
  if (isMom && awaitingApproval.length > 0) subtitle = `${awaitingApproval.length} aguardando sua aprovação. Hora de julgar.`;

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
      {/* Hero Header */}
      <div
        className="relative rounded-3xl p-5 overflow-hidden"
        style={{
          background: isMom
            ? "linear-gradient(135deg, hsl(var(--mom-bg)), hsl(var(--mom-border)), hsl(var(--mom-cta)))"
            : "linear-gradient(135deg, hsl(var(--arena-dark) / 0.95), hsl(30 25% 12%), hsl(var(--arena-dark)))",
          perspective: "800px",
        }}
      >
        {isMom ? (
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-30"
            style={{ background: "hsl(var(--mom-accent))" }} />
        ) : (
          <>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-40"
              style={{ background: "hsl(var(--arena-neon))" }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ background: "hsl(var(--arena-fire))" }} />
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: "linear-gradient(hsl(var(--arena-neon)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--arena-neon)) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }} />
            <div className="absolute top-0 left-6 right-6 h-px" style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--arena-neon) / 0.5), transparent)",
            }} />
          </>
        )}

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            {isMom ? <Shield className="w-6 h-6 text-mom" /> : <CheckSquare className="w-6 h-6" style={{ color: "hsl(var(--arena-neon))", filter: "drop-shadow(0 0 6px hsl(var(--arena-neon) / 0.5))" }} />}
            <h1 className="font-display text-xl font-bold" style={!isMom ? {
              background: "linear-gradient(135deg, hsl(var(--arena-gold)), hsl(var(--arena-fire)), hsl(var(--arena-neon)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            } : undefined}>
              {isMom ? "Painel de Controle" : "⚔️ Missões do Pai"}
            </h1>
          </div>
          <p className={`text-xs font-body italic mb-4 ${isMom ? "text-muted-foreground" : ""}`} style={!isMom ? { color: "hsl(var(--arena-glow) / 0.7)" } : undefined}>{subtitle}</p>

          {/* Quick stats */}
          <div className="flex gap-2">
            <div className={`flex-1 backdrop-blur-sm rounded-2xl p-3 text-center`}
              style={{
                background: isMom ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)",
                boxShadow: isMom ? "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)" : "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                border: isMom ? undefined : "1px solid hsl(var(--arena-neon) / 0.15)",
              }}>
              <p className="font-display text-2xl font-black" style={!isMom ? { color: "hsl(var(--arena-neon))", textShadow: "0 0 8px hsl(var(--arena-neon) / 0.4)" } : undefined}>{pending.length}</p>
              <p className={`text-[8px] font-body uppercase tracking-wider ${isMom ? "text-muted-foreground" : ""}`} style={!isMom ? { color: "hsl(30 15% 78%)" } : undefined}>Pendentes</p>
            </div>
            {isMom && (
              <div className="flex-1 bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-3 text-center"
                style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
                <p className="font-display text-2xl font-black text-amber-500">{awaitingApproval.length}</p>
                <p className="text-[8px] text-muted-foreground font-body uppercase tracking-wider">Aprovação</p>
              </div>
            )}
            <div className="flex-1 backdrop-blur-sm rounded-2xl p-3 text-center"
              style={{
                background: isMom ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)",
                boxShadow: isMom ? "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)" : "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                border: isMom ? undefined : "1px solid hsl(var(--arena-gold) / 0.15)",
              }}>
              <p className="font-display text-2xl font-black" style={!isMom ? { color: "hsl(var(--arena-gold))", textShadow: "0 0 8px hsl(var(--arena-gold) / 0.3)" } : { color: "hsl(var(--primary))" }}>{completed.length}</p>
              <p className={`text-[8px] font-body uppercase tracking-wider ${isMom ? "text-muted-foreground" : ""}`} style={!isMom ? { color: "hsl(30 15% 78%)" } : undefined}>Feitas</p>
            </div>
            <div className="flex-1 backdrop-blur-sm rounded-2xl p-3 text-center"
              style={{
                background: isMom ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)",
                boxShadow: isMom ? "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)" : "0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                border: isMom ? undefined : "1px solid hsl(var(--arena-fire) / 0.15)",
              }}>
              <p className="font-display text-2xl font-black" style={!isMom ? { color: "hsl(var(--arena-fire))", textShadow: "0 0 8px hsl(var(--arena-fire) / 0.3)" } : { color: "#ef4444" }}>{isMom ? rescued.length : overdue.length}</p>
              <p className={`text-[8px] font-body uppercase tracking-wider ${isMom ? "text-muted-foreground" : ""}`} style={!isMom ? { color: "hsl(30 15% 78%)" } : undefined}>{isMom ? "Resgates" : "Atrasadas"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Mission - Dad only */}
      {!isMom && todayMission && !todayMission.completed_at && (
        <div
          className="rounded-2xl p-4 overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, hsl(var(--arena-dark) / 0.9), hsl(220 20% 14%))",
            boxShadow: "0 6px 24px rgba(0,0,0,0.2), 0 0 30px hsl(var(--arena-gold) / 0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
            border: "1px solid hsl(var(--arena-gold) / 0.25)",
          }}
        >
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-30"
            style={{ background: "hsl(var(--arena-gold))" }} />
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full blur-xl opacity-20"
            style={{ background: "hsl(var(--arena-fire))" }} />
          <div className="absolute top-0 left-4 right-4 h-px" style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--arena-gold) / 0.5), transparent)",
          }} />
          <div className="relative z-10 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, hsl(var(--arena-gold)), hsl(var(--arena-fire)))",
                boxShadow: "0 4px 12px hsl(var(--arena-gold) / 0.4), 0 0 16px hsl(var(--arena-gold) / 0.2)",
              }}>
              <Star className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-display text-xs font-bold uppercase tracking-wider mb-1" style={{
                background: "linear-gradient(90deg, hsl(var(--arena-gold)), hsl(var(--arena-fire)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                ⭐ Missão Surpresa do Dia
              </p>
              <p className="font-body text-sm mb-3" style={{ color: "hsl(30 15% 88%)" }}>{todayMission.mission_text}</p>
              <Button
                size="sm"
                className="text-xs font-display font-bold rounded-xl border-0 text-white"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--arena-neon)), hsl(var(--arena-gold)))",
                  boxShadow: "0 4px 16px hsl(var(--arena-neon) / 0.3)",
                }}
                onClick={() => completeMissionMutation.mutate()}
                disabled={completeMissionMutation.isPending}
              >
                {completeMissionMutation.isPending ? "..." : "✅ Missão cumprida! (+40pts)"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isMom && todayMission?.completed_at && (
        <div className="rounded-2xl p-3 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--arena-dark) / 0.9), hsl(30 25% 12%))",
            border: "1px solid hsl(var(--arena-neon) / 0.25)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2), 0 0 12px hsl(var(--arena-neon) / 0.1)",
          }}>
          <p className="text-xs font-body italic" style={{ color: "hsl(0 0% 100%)" }}>
            ✅ Missão do dia cumprida! Sem a mãe pedir. Isso sim é evolução.
          </p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={isMom && awaitingApproval.length > 0 ? "approval" : "pending"}>
        <TabsList className={`w-full grid rounded-2xl h-11 ${isMom ? "grid-cols-4" : "grid-cols-3"}`}>
          <TabsTrigger value="pending" className="text-[10px] font-display font-bold rounded-xl data-[state=active]:shadow-md">
            🎯 Pendentes ({pending.length})
          </TabsTrigger>
          {isMom && (
            <TabsTrigger value="approval" className="text-[10px] font-display font-bold rounded-xl data-[state=active]:shadow-md">
              👩‍⚖️ Julgar ({awaitingApproval.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="completed" className="text-[10px] font-display font-bold rounded-xl data-[state=active]:shadow-md">
            ✅ Feitas ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-[10px] font-display font-bold rounded-xl data-[state=active]:shadow-md">
            {isMom ? "🛟 Resgates" : "⚠️ Atrasadas"} ({isMom ? rescued.length : overdue.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 mt-3">
          {pending.length === 0
            ? renderEmptyState("🎯", isMom ? "Nada pendente!" : "Tudo limpo!",
                isMom ? `O ${dadName} fez tudo? Guarda esse print.` : "Ou você fez tudo, ou a mãe ainda não atualizou.\nDas duas, uma é mais provável.")
            : isMom
              ? pending.map((t) => <MomTaskApproval key={t.id} task={t} dadName={dadName} />)
              : pending.map(renderTaskCard)}
        </TabsContent>

        {isMom && (
          <TabsContent value="approval" className="space-y-3 mt-3">
            {awaitingApproval.length === 0
              ? renderEmptyState("👩‍⚖️", "Tribunal vazio",
                  `O ${dadName} não concluiu nada ainda.\nPor que você tá surpresa?`)
              : awaitingApproval.map((t) => <MomTaskApproval key={t.id} task={t} dadName={dadName} />)}
          </TabsContent>
        )}

        <TabsContent value="completed" className="space-y-3 mt-3">
          {completed.length === 0
            ? renderEmptyState("🤷", "Nada concluído",
                isMom ? `O ${dadName} não fez nada ainda. Chocante.` : "Nenhuma tarefa concluída.\nA gente tá orgulhoso. (Não esperávamos isso.)")
            : isMom
              ? completed.map((t) => <MomTaskApproval key={t.id} task={t} dadName={dadName} />)
              : completed.map(renderTaskCard)}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-3 mt-3">
          {isMom ? (
            rescued.length === 0
              ? renderEmptyState("🏆", "Zero resgates!",
                  `O ${dadName} fez tudo sozinho.\nIsso é real? Guarda esse print.`)
              : rescued.map((t) => <MomTaskApproval key={t.id} task={t} dadName={dadName} />)
          ) : (
            overdue.length === 0
              ? renderEmptyState("🎉", "Nada atrasado!",
                  "Isso é raro. Aproveita o momento.\nAmanhã é outro dia.")
              : overdue.map(renderTaskCard)
          )}
        </TabsContent>
      </Tabs>

      {/* FAB */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-20 right-4 z-40 rounded-2xl flex items-center gap-2 transition-all active:scale-95 px-5 h-12"
        style={{
          background: isMom
            ? "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(var(--mom-accent-hover)))"
            : "linear-gradient(135deg, hsl(var(--arena-neon)), hsl(var(--arena-gold)))",
          color: "white",
          boxShadow: isMom
            ? "0 6px 20px hsl(var(--mom-accent) / 0.4)"
            : "0 6px 20px hsl(var(--arena-neon) / 0.4), 0 0 30px hsl(var(--arena-gold) / 0.15)",
        }}
      >
        <Plus className="w-5 h-5" />
        <span className="font-display text-sm font-bold">{isMom ? "Criar tarefa" : "Nova tarefa"}</span>
      </button>

      {/* Complete Task Sheet */}
      <Sheet open={!!completingTask} onOpenChange={(open) => { if (!open) { setCompletingTask(null); setProofFile(null); } }}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">🎉 Tarefa concluída!</SheetTitle>
          </SheetHeader>
          {completingTask && (
            <div className="space-y-4 mt-4">
              <div className="rounded-2xl p-4 bg-muted/30">
                <p className="font-display font-bold text-sm">{completingTask.title}</p>
                <p className="text-[10px] text-muted-foreground font-body mt-1">
                  {completingTask.proof_required ? "📸 A mãe exigiu foto. Sem foto, sem pontos." : "Foto é opcional, mas vale +15pts bônus."}
                </p>
              </div>

              <input type="file" accept="image/*" capture="environment" id="proof-photo" className="hidden"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)} />

              {proofFile && (
                <div className="rounded-xl bg-green-500/10 p-2 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-700 font-body font-bold">📷 {proofFile.name}</p>
                </div>
              )}

              {completingTask.proof_required ? (
                <Button
                  className="w-full font-display font-bold h-12 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
                    boxShadow: "0 4px 16px hsl(var(--primary) / 0.3)",
                  }}
                  onClick={() => {
                    if (!proofFile) { document.getElementById("proof-photo")?.click(); return; }
                    completeTaskMutation.mutate({ taskId: completingTask.id, withPhoto: true, photoFile: proofFile });
                  }}
                  disabled={completeTaskMutation.isPending}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {proofFile ? "Enviar foto e concluir (+50pts)" : "Tirar foto como prova (+50pts)"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    className="w-full font-display font-bold h-12 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
                      boxShadow: "0 4px 16px hsl(var(--primary) / 0.3)",
                    }}
                    onClick={() => {
                      if (proofFile) {
                        completeTaskMutation.mutate({ taskId: completingTask.id, withPhoto: true, photoFile: proofFile });
                      } else {
                        completeTaskMutation.mutate({ taskId: completingTask.id, withPhoto: false });
                      }
                    }}
                    disabled={completeTaskMutation.isPending}
                  >
                    {proofFile ? "Enviar foto e concluir (+50pts)" : "✅ Concluir tarefa (+35pts)"}
                  </Button>
                  {!proofFile && (
                    <Button
                      variant="outline"
                      className="w-full font-display text-muted-foreground rounded-xl"
                      onClick={() => document.getElementById("proof-photo")?.click()}
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
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">
              {isMom ? "📋 Nova Missão pro Pai" : "✨ Nova Tarefa"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-display font-bold">Nome da tarefa</Label>
              <Input placeholder="Ex: Levar filho no médico" value={newTask.title}
                onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} className="mt-1 rounded-xl" />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="text-xs font-display font-bold">Prazo</Label>
                <Input type="date" value={newTask.due_date}
                  onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} className="mt-1 rounded-xl" />
              </div>
              <div className="w-28">
                <Label className="text-xs font-display font-bold">Hora</Label>
                <Input type="time" value={newTask.due_time}
                  onChange={e => setNewTask(p => ({ ...p, due_time: e.target.value }))} className="mt-1 rounded-xl" />
              </div>
            </div>

            <div>
              <Label className="text-xs font-display font-bold">Categoria</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(CATEGORIES).map(([key, c]) => (
                  <button key={key}
                    onClick={() => setNewTask(p => ({ ...p, category: key }))}
                    className={`px-3 py-2 rounded-xl text-xs font-display font-bold transition-all ${
                      newTask.category === key ? "scale-105 ring-2 ring-offset-1" : "opacity-60 hover:opacity-100"
                    }`}
                    style={{
                      background: newTask.category === key ? `${c.color}20` : "hsl(var(--muted))",
                      color: newTask.category === key ? c.color : undefined,
                      ["--tw-ring-color" as any]: c.color,
                    }}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-display font-bold">Notas (opcional)</Label>
              <Textarea placeholder="Detalhes da tarefa..." value={newTask.description}
                onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                className="mt-1 min-h-[60px] rounded-xl" />
            </div>

            <div className="flex items-center justify-between bg-muted/30 rounded-xl p-3">
              <div>
                <Label className="text-xs font-display font-bold">Exigir foto como prova?</Label>
                <p className="text-[9px] text-muted-foreground font-body">
                  {isMom ? "Sem foto, ele não ganha ponto." : "Foto vale +15pts bônus."}
                </p>
              </div>
              <Switch checked={newTask.proof_required}
                onCheckedChange={v => setNewTask(p => ({ ...p, proof_required: v }))} />
            </div>

            {isMom && (
              <div>
                <Label className="text-xs font-display font-bold">Nível de urgência</Label>
                <div className="flex gap-2 mt-2">
                  {Object.entries(URGENCY_CONFIG).map(([key, u]) => {
                    const Icon = u.icon;
                    return (
                      <button key={key}
                        onClick={() => setNewTask(p => ({ ...p, urgency: key }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-display font-bold transition-all ${
                          newTask.urgency === key ? "scale-105 ring-2 ring-offset-1" : "opacity-50 hover:opacity-80"
                        }`}
                        style={{
                          background: newTask.urgency === key ? `${u.color}15` : "hsl(var(--muted))",
                          color: newTask.urgency === key ? u.color : undefined,
                          ["--tw-ring-color" as any]: u.color,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {u.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              className="w-full font-display font-bold h-12 rounded-xl text-sm"
              style={{
                background: isMom
                  ? "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(var(--mom-accent-hover)))"
                  : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
                boxShadow: isMom ? "0 4px 16px hsl(var(--mom-accent) / 0.3)" : "0 4px 16px hsl(var(--primary) / 0.25)",
              }}
              onClick={() => addTaskMutation.mutate()}
              disabled={!newTask.title || addTaskMutation.isPending}
            >
              {addTaskMutation.isPending ? "Salvando..." : isMom ? "😈 Enviar pro pai" : "✅ Criar Tarefa"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Celebration & Proof Viewer */}
      {celebration && <TaskCelebration points={celebration.points} onClose={() => setCelebration(null)} />}
      {proofViewer && (
        <ProofPhotoViewer open={!!proofViewer} onClose={() => setProofViewer(null)}
          photoUrl={proofViewer.photoUrl} taskTitle={proofViewer.taskTitle} storagePath={proofViewer.storagePath} />
      )}
    </div>
  );
}

// Small helper component used inline
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
    </svg>
  );
}
