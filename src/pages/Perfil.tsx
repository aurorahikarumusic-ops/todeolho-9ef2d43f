import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useIsMom, useFamilyPartner } from "@/hooks/useFamily";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format, differenceInHours, startOfMonth, endOfMonth, startOfWeek, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  User, Edit2, Trophy, Flame, Star, LifeBuoy, CheckSquare, CalendarDays,
  LogOut, Share2, ChevronRight, Baby, Shield, Clock, Bell, Crown, Gem, Gavel, Lock, ChevronLeft
} from "lucide-react";
import { getDadTitle } from "@/lib/constants";
import { MOM_BADGES } from "@/lib/mom-constants";
import InvitePartner from "@/components/family/InvitePartner";
import JoinFamily from "@/components/family/JoinFamily";
import PalpitesHistorySection from "@/components/profile/PalpitesHistorySection";
import CartasRecebidas from "@/components/redemption/CartasRecebidas";
import ModoRedencao from "@/components/redemption/ModoRedencao";
import { useSentLetters, useDeleteLetter } from "@/hooks/useRedemption";
import { sendLocalNotification, getNotificationPermission, requestPushSubscription } from "@/lib/pushNotifications";

const DAD_ACHIEVEMENTS = {
  earned: [
    { key: "streak_7", emoji: "🔥", name: "Sequência de 7 dias", desc: "7 dias seguidos de presença" },
    { key: "hero_snack", emoji: "⭐", name: "Herói do Lanche", desc: "Lembrou do lanche sem lembrete" },
    { key: "self_scheduler", emoji: "📅", name: "Agendou Sozinho", desc: "3+ eventos criados em 1 semana" },
    { key: "photo_proof_5", emoji: "📸", name: "Prova em Mãos", desc: "5 provas fotográficas enviadas" },
    { key: "top_3", emoji: "🏆", name: "Top 3", desc: "Chegou no pódio do ranking" },
    { key: "missions_10", emoji: "💬", name: "Missão Cumprida", desc: "10 missões diárias completadas" },
    { key: "dad_of_month", emoji: "👑", name: "Pai do Mês", desc: "Venceu o ranking mensal" },
    { key: "group_joined", emoji: "🤝", name: "Pai em Grupo", desc: "Entrou em um grupo de amigos" },
  ],
  shame: [
    { key: "google_maps_dad", emoji: "😬", name: "Pai Google Maps", desc: "Perguntou endereço que já estava na agenda" },
    { key: "hibernation", emoji: "💤", name: "Modo Hibernação", desc: "Ficou 72h+ sem abrir o app" },
    { key: "who_is_doctor", emoji: "🤔", name: "Quem é o Pediatra?", desc: "Demorou pra adicionar evento de saúde" },
    { key: "rescued_5", emoji: "🛟", name: "Resgatado", desc: "Mãe resgatou 5+ tarefas no mês" },
    { key: "i_knew_it", emoji: "🤥", name: "Eu Já Sabia", desc: "Clicou 'eu já sabia' 5 vezes" },
    { key: "free_fall", emoji: "📉", name: "Queda Livre", desc: "Caiu 3+ posições em 1 semana" },
  ],
  locked: [
    { hint: "Complete 30 dias seguidos" },
    { hint: "Chegue ao 1° lugar no ranking" },
    { hint: "A mãe deu 5★ por 4 semanas" },
  ],
};

export default function Perfil() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const isMom = useIsMom();
  const { data: partner } = useFamilyPartner();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [showChildSheet, setShowChildSheet] = useState(false);
  const [showRedencao, setShowRedencao] = useState(false);
  const { data: sentLetters = [] } = useSentLetters();
  const deleteLetter = useDeleteLetter();
  const [newChild, setNewChild] = useState({ name: "", school: "", doctor_name: "", allergies: "", birth_date: "" });
  const [selectedBadge, setSelectedBadge] = useState<{ emoji: string; name: string; desc: string } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentVerifiedRef = useRef(false);

  // Verify payment after Stripe redirect
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    
    if (payment === "success" && sessionId && !paymentVerifiedRef.current) {
      paymentVerifiedRef.current = true;
      
      const verifyPayment = async () => {
        try {
          const { data, error } = await supabase.functions.invoke("verify-payment", {
            body: { sessionId },
          });
          
          if (error) throw error;
          
          if (data?.success) {
            toast.success("💌 Pagamento confirmado! Sua carta foi enviada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["sent-letters"] });
            queryClient.invalidateQueries({ queryKey: ["received-letters"] });
          } else {
            toast.error("Pagamento ainda não confirmado. Tente novamente em instantes.");
          }
        } catch (err: any) {
          console.error("Payment verification error:", err);
          toast.error("Erro ao verificar pagamento: " + (err.message || "tente novamente"));
        }
        
        // Clean URL params
        setSearchParams({}, { replace: true });
      };
      
      verifyPayment();
    } else if (payment === "cancelled") {
      toast.info("Pagamento cancelado. Sua carta foi salva como rascunho.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const monthStart = startOfMonth(new Date()).toISOString();
  const monthEnd = endOfMonth(new Date()).toISOString();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split("T")[0];

  const { data: monthTasks = [] } = useQuery({
    queryKey: ["month-tasks", profile?.family_id, monthStart],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase.from("tasks").select("*")
        .eq("family_id", profile.family_id)
        .gte("created_at", monthStart).lte("created_at", monthEnd);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  const { data: monthEvents = [] } = useQuery({
    queryKey: ["month-events", profile?.family_id, monthStart],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase.from("events").select("*")
        .eq("family_id", profile.family_id)
        .gte("event_date", monthStart).lte("event_date", monthEnd);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  const { data: momRating } = useQuery({
    queryKey: ["my-mom-rating", user?.id, weekStart],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("mom_ratings").select("*")
        .eq(isMom ? "rated_by" : "user_id", user.id).eq("week_start", weekStart).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: rankPos } = useQuery({
    queryKey: ["rank-pos", user?.id],
    queryFn: async () => {
      if (isMom) return null;
      const { data } = await supabase.from("profiles").select("user_id, points")
        .eq("role", "pai").order("points", { ascending: false }).limit(50);
      if (!data) return null;
      const idx = data.findIndex(p => p.user_id === user?.id);
      return idx >= 0 ? idx + 1 : null;
    },
    enabled: !!user && !isMom,
  });

  const { data: children = [] } = useQuery({
    queryKey: ["children", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return [];
      const { data } = await supabase.from("children").select("*")
        .eq("family_id", profile.family_id);
      return data || [];
    },
    enabled: !!profile?.family_id,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("achievements").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const addChildMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.family_id) throw new Error("Sem família");
      const { error } = await supabase.from("children").insert({
        family_id: profile.family_id,
        name: newChild.name,
        school: newChild.school || null,
        doctor_name: newChild.doctor_name || null,
        allergies: newChild.allergies || null,
        birth_date: newChild.birth_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setShowChildSheet(false);
      setNewChild({ name: "", school: "", doctor_name: "", allergies: "", birth_date: "" });
      toast.success(isMom ? "Filho adicionado! 👑" : "Filho adicionado! Você sabe quantos tem agora? 😏");
    },
  });

  if (!profile) return null;

  if (showRedencao) {
    return (
      <ModoRedencao
        onClose={() => setShowRedencao(false)}
        recipientName={partner?.display_name}
        recipientId={partner?.user_id}
      />
    );
  }

  const dadTitle = getDadTitle(profile.points);
  const monthCompleted = monthTasks.filter(t => t.completed_at).length;
  const monthTotal = monthTasks.length;
  const monthPct = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;
  const rescues = monthTasks.filter(t => t.rescued_by_mom).length;
  const tasksCreatedByMe = monthTasks.filter(t => t.created_by === user?.id).length;
  const lastActiveHours = profile.last_active_at
    ? differenceInHours(new Date(), new Date(profile.last_active_at)) : 0;

  const earnedKeys = achievements.map((a: any) => a.badge_key);

  const getChildCompletion = (child: any) => {
    let filled = 1;
    const total = 5;
    if (child.school) filled++;
    if (child.doctor_name) filled++;
    if (child.allergies) filled++;
    if (child.birth_date) filled++;
    return Math.round((filled / total) * 100);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    await updateProfile.mutateAsync({ display_name: editName.trim() });
    setEditMode(false);
    toast.success(isMom ? "Nome atualizado, chefe! 👑" : "Nome atualizado. A mãe foi notificada. Brincadeira.");
  };

  const handleLogout = async () => {
    await signOut();
    toast(isMom ? "Saiu. A família sente sua falta. 👑" : "Saiu. Seu ranking continua correndo sem você. 👋");
  };

  const resizeImage = (file: File, maxSize: number = 1200): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) { height = Math.round((height * maxSize) / width); width = maxSize; }
          else { width = Math.round((width * maxSize) / height); height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error("Erro ao processar imagem")),
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Erro ao carregar imagem")); };
      img.src = url;
    });
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    try {
      toast.loading("Enviando foto...", { id: "avatar-upload" });
      const resized = await resizeImage(file);
      const path = `${user.id}/avatar.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, resized, {
        upsert: true,
        contentType: "image/jpeg",
      });
      if (error) { toast.error("Erro ao enviar foto: " + error.message, { id: "avatar-upload" }); return; }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrlWithCacheBust = `${urlData.publicUrl}?t=${Date.now()}`;
      await updateProfile.mutateAsync({ avatar_url: avatarUrlWithCacheBust });
      toast.success(isMom ? "Foto atualizada. Linda como sempre. 👑" : "Foto atualizada. A mãe aprova? Veremos.", { id: "avatar-upload" });
    } catch (err: any) {
      toast.error("Erro ao processar foto: " + (err.message || "tente novamente"), { id: "avatar-upload" });
    }
  };

  const accent = isMom ? "text-mom" : "text-primary";
  const accentBg = isMom ? "bg-mom" : "bg-primary";
  const accentBorder = isMom ? "border-mom" : "border-primary";
  const profileBorderColor = isMom ? "border-mom" : "border-primary";
  const profileBgColor = isMom ? "bg-mom/10" : "bg-primary/10";

  // Build stats array
  const stats = isMom ? [
    { icon: <CheckSquare className="w-4 h-4 text-mom" />, value: `${tasksCreatedByMe}`, label: "criadas" },
    { icon: <CalendarDays className="w-4 h-4 text-mom" />, value: `${monthEvents.length}`, label: "eventos" },
    { icon: <LifeBuoy className="w-4 h-4 text-secondary" />, value: `${rescues}`, label: "resgates" },
    { icon: <Star className="w-4 h-4 text-mom" />, value: momRating ? `${momRating.stars}★` : "—", label: "avaliação" },
    { icon: <Trophy className="w-4 h-4 text-mom" />, value: `${monthPct}%`, label: "completas" },
    { icon: <Crown className="w-4 h-4 text-mom" />, value: `${children.length}`, label: "filhos" },
  ] : [
    { icon: <Flame className="w-4 h-4 text-secondary" />, value: `${profile.streak_days}`, label: "sequência" },
    { icon: <Trophy className="w-4 h-4 text-primary" />, value: rankPos ? `#${rankPos}` : "—", label: "ranking" },
    { icon: <Star className="w-4 h-4 text-accent-foreground" />, value: momRating ? `${momRating.stars}★` : "—", label: "nota mãe" },
    { icon: <CheckSquare className="w-4 h-4 text-primary" />, value: `${monthPct}%`, label: "tarefas" },
    { icon: <CalendarDays className="w-4 h-4 text-primary" />, value: `${monthEvents.length}`, label: "eventos" },
    { icon: <LifeBuoy className="w-4 h-4 text-secondary" />, value: `${rescues}`, label: "resgates" },
  ];

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-6">

      {/* ═══════════════════ SECTION 1: Profile Header ═══════════════════ */}
      <section className={`relative rounded-2xl overflow-hidden border-2 ${isMom ? "border-mom-border bg-mom-bg" : "border-dad-border bg-dad-bg"}`}>
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        
        {/* Top accent bar */}
        <div className={`h-2 ${isMom ? "bg-mom" : "bg-primary"}`} />
        
        <div className="relative p-5">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer relative group shrink-0">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
              <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shadow-lg ${isMom ? "border-mom bg-mom/10" : "border-primary bg-primary/10"}`}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className={`font-display text-3xl font-bold ${isMom ? "text-mom-text" : "text-dad-text"}`}>
                    {(profile.display_name || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white ${isMom ? "bg-mom" : "bg-primary"}`}>
                <Edit2 className="w-3.5 h-3.5 text-white" />
              </div>
            </label>

            <div className="flex-1 min-w-0">
              {editMode ? (
                <div className="flex gap-2">
                  <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-sm bg-white" autoFocus />
                  <Button size="sm" className={`h-8 text-xs text-white ${isMom ? "bg-mom hover:bg-mom/90" : "bg-primary hover:bg-primary/90"}`} onClick={handleSaveName}>Salvar</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-bold text-foreground truncate">{profile.display_name}</h1>
                  <button onClick={() => { setEditName(profile.display_name); setEditMode(true); }}>
                    <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </div>
              )}
              <div className="mt-1">
                <Badge className={`text-[10px] text-white border-0 ${isMom ? "bg-mom" : "bg-primary"}`}>
                  {isMom ? "👑 CEO da Família" : `${dadTitle.emoji} ${dadTitle.title}`}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-body italic mt-1.5 leading-tight">
                {isMom
                  ? tasksCreatedByMe > 0
                    ? `${tasksCreatedByMe} tarefa(s) criadas esse mês`
                    : "A família funciona porque você funciona."
                  : rescues > 0
                    ? `A mãe te salvou ${rescues}x esse mês`
                    : lastActiveHours > 24 ? `Última ação: ${lastActiveHours}h atrás` : "Ativo hoje. Bom começo."}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            {stats.slice(0, 3).map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-2.5 text-center shadow-sm border border-border">
                <p className="font-display font-bold text-lg text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-body">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 2: Secondary Stats ═══════════════════ */}
      <section className="grid grid-cols-3 gap-2.5">
        {stats.slice(3).map((s, i) => (
          <Card key={i} className="border shadow-sm bg-white">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="font-display font-bold text-lg text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-body">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ═══════════════════ SECTION 3: Level Progress (Dad) ═══════════════════ */}
      {!isMom && (
        <section>
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-sm">{dadTitle.emoji} {dadTitle.title}</span>
                <span className="text-xs text-muted-foreground font-body">{profile.points} pts</span>
              </div>
              <Progress value={Math.min(100, (profile.points % 200) / 2)} className="h-2 mb-2" />
              <p className="text-[10px] text-muted-foreground font-body italic">
                {profile.points < 200 ? "Próximo: 'Pai Tentando' — 201 pts"
                  : profile.points < 500 ? "Próximo: 'Pai Promissor' — 501 pts"
                  : profile.points < 900 ? "Próximo: 'Pai de Verdade' — 901 pts"
                  : profile.points < 1400 ? "Próximo: 'Pai Lendário' — 1401 pts"
                  : "Você é lendário. Isso não deveria existir."}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ═══════════════════ SECTION 3b: Modo Redenção (Dad) ═══════════════════ */}
      {!isMom && (
        <section>
          <Card className="overflow-hidden border-[1.5px] border-[hsl(340,60%,88%)] bg-[hsl(340,60%,97%)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[hsl(340,72%,57%)] flex items-center justify-center text-xl shadow-md shrink-0">
                  💌
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-sm text-[hsl(340,40%,25%)]">
                    Modo Redenção
                  </p>
                  <p className="font-body text-[11px] text-[hsl(340,50%,55%)] italic leading-snug">
                    Escreva uma carta do coração pra ela. Chega animada, tipo filme.
                  </p>
                  {sentLetters.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {sentLetters.length} carta{sentLetters.length > 1 ? "s" : ""} enviada{sentLetters.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setShowRedencao(true)}
                className="w-full mt-3 rounded-full bg-[hsl(340,72%,57%)] hover:bg-[hsl(340,72%,50%)] text-white font-display font-bold text-sm h-10"
              >
                ✉️ Escrever carta
              </Button>
              {sentLetters.length > 0 && (
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
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita.
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* ═══════════════════ Cartas Recebidas (Dad) ═══════════════════ */}
      {!isMom && (
        <section>
          <CartasRecebidas />
        </section>
      )}
      <section>
        {isMom ? (
          <MomBadgesCarousel earnedKeys={earnedKeys} onSelect={setSelectedBadge} />
        ) : (
          <DadBadgesCarousel earnedKeys={earnedKeys} onSelect={setSelectedBadge} />
        )}
      </section>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBadge(null)}>
          <div className="bg-card rounded-2xl p-6 mx-6 max-w-sm w-full shadow-2xl animate-scale-in text-center" onClick={e => e.stopPropagation()}>
            <span className="text-5xl block mb-3">{selectedBadge.emoji}</span>
            <h3 className="font-display font-bold text-lg mb-1">{selectedBadge.name}</h3>
            <p className="text-sm text-muted-foreground font-body">{selectedBadge.desc}</p>
            <Button className="mt-4" variant="outline" onClick={() => setSelectedBadge(null)}>Fechar</Button>
          </div>
        </div>
      )}

      {/* ═══════════════════ SECTION 5: Pérolas (Mom only) ═══════════════════ */}
      {isMom && (
        <section>
          <Card className="border-mom-border bg-mom-bg cursor-pointer hover:shadow-md transition-all hover:scale-[1.01]"
            onClick={() => navigate("/mural")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-mom shadow-md">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-sm text-mom-text">
                  Mural de Pérolas 💎
                </p>
                <p className="text-[10px] text-muted-foreground font-body">
                  Veja as maiores cabeçadas dos maridos
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-mom" />
            </CardContent>
          </Card>
        </section>
      )}

      {/* ═══════════════════ SECTION 5b: Palpites History (Mom & Dad) ═══════════════════ */}
      {(isMom || profile.role === "pai") && <PalpitesHistorySection />}

      {/* ═══════════════════ SECTION 5c: Cartas — Enviar & Recebidas (Mom) ═══════════════════ */}
      {isMom && (
        <section className="space-y-3">
          <Card className="overflow-hidden border-[1.5px] border-[hsl(340,60%,88%)] bg-[hsl(340,60%,97%)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[hsl(340,72%,57%)] flex items-center justify-center text-xl shadow-md shrink-0">
                  💌
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-sm text-[hsl(340,40%,25%)]">
                    Enviar carta pro pai
                  </p>
                  <p className="font-body text-[11px] text-[hsl(340,50%,55%)] italic leading-snug">
                    Ele vai receber uma carta animada. Surpreenda (ou ameace com carinho).
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowRedencao(true)}
                className="w-full mt-3 rounded-full bg-[hsl(340,72%,57%)] hover:bg-[hsl(340,72%,50%)] text-white font-display font-bold text-sm h-10"
              >
                ✉️ Escrever carta
              </Button>
            </CardContent>
          </Card>
          <CartasRecebidas />
        </section>
      )}
      <Separator className="my-2" />

      {/* ═══════════════════ SECTION 6: Family Connection ═══════════════════ */}
      <section>
        <h2 className="font-display text-base font-bold mb-3 flex items-center gap-2">
          <User className="w-4 h-4" /> Conexão Familiar
        </h2>
        {!partner ? (
          isMom ? <InvitePartner /> : <JoinFamily />
        ) : (
          <Card className={`border-0 shadow-sm ${isMom ? "bg-primary/5" : "bg-mom/5"}`}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMom ? "bg-primary/15" : "bg-mom/15"}`}>
                <span className="text-lg">{isMom ? "👨" : "👩"}</span>
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-sm">{partner.display_name}</p>
                <p className="text-[10px] text-muted-foreground font-body">
                  {isMom ? "O pai" : "A mãe"} — conectado ✓
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <Separator className="my-2" />

      {/* ═══════════════════ SECTION 7: Children ═══════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold flex items-center gap-2">
            <Baby className="w-4 h-4" /> Filhos
          </h2>
          <Button size="sm" variant="outline" className={`h-7 text-xs ${isMom ? `${accentBorder} ${accent}` : ""}`} onClick={() => setShowChildSheet(true)}>
            Adicionar
          </Button>
        </div>

        {children.length === 0 ? (
          <p className="text-xs text-muted-foreground font-body italic text-center py-4">
            {isMom ? "Nenhum filho cadastrado ainda." : "Nenhum filho cadastrado. Você tem filhos, né?"}
          </p>
        ) : (
          <div className="space-y-2">
            {children.map((child: any) => {
              const pct = getChildCompletion(child);
              return (
                <Card key={child.id} className="border-0 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-base">👶</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm">{child.name}</p>
                        {child.birth_date && (
                          <p className="text-[10px] text-muted-foreground">{format(new Date(child.birth_date), "dd/MM/yyyy")}</p>
                        )}
                      </div>
                      <span className={`text-xs font-display font-bold ${accent}`}>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1 mb-1.5" />
                    <div className="flex flex-wrap gap-1">
                      {child.school && <Badge variant="outline" className="text-[9px] h-5">🏫 {child.school}</Badge>}
                      {child.doctor_name && <Badge variant="outline" className="text-[9px] h-5">🏥 {child.doctor_name}</Badge>}
                      {!child.school && <span className="text-[9px] text-secondary italic">Falta: escola</span>}
                      {!child.doctor_name && <span className="text-[9px] text-secondary italic">Falta: pediatra</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Separator className="my-2" />

      {/* ═══════════════════ SECTION 8: Settings & Legal ═══════════════════ */}
      <section className="space-y-2">
        <h2 className="font-display text-base font-bold flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4" /> Configurações
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground font-body mb-1">Código família</p>
              <p className="text-xs font-mono font-bold">{profile.family_code || "—"}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-muted-foreground font-body mb-1">Membro desde</p>
              <p className="text-xs font-bold">{format(new Date(profile.created_at), "dd/MM/yy")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className={`flex-1 text-xs h-9 font-display ${isMom ? `${accentBorder} ${accent}` : ""}`}
            onClick={async () => {
              const perm = await getNotificationPermission();
              if (perm !== "granted" && user) await requestPushSubscription(user.id);
              const msgs = isMom
                ? ["Teste de notificação. Tudo ok, chefe. 👑"]
                : ["Você esqueceu algo. Não sabemos o quê. Mas você sabe."];
              sendLocalNotification("Estou de Olho 👁️", msgs[0]);
            }}
          >
            <Bell className="w-3.5 h-3.5" /> Testar notificação
          </Button>

          {!isMom && (
            <Button variant="outline" className="flex-1 text-xs h-9 font-display" onClick={() => {
              const text = `DNA do Pai — ${format(new Date(), "MMMM yyyy", { locale: ptBR })} 👁️\n${profile.display_name}\n${dadTitle.emoji} ${dadTitle.title}\n${monthPct}% tarefas • ${profile.streak_days} dias seguidos • ${rescues} resgates\nEstou de Olho — porque alguém tem que lembrar`;
              if (navigator.share) navigator.share({ text });
              else { navigator.clipboard.writeText(text); toast("DNA copiado!"); }
            }}>
              <Share2 className="w-3.5 h-3.5" /> Compartilhar DNA
            </Button>
          )}
        </div>

        {/* Legal links - compact */}
        <div className="grid grid-cols-2 gap-1.5 pt-2">
          {[
            { path: "/privacidade", label: "Privacidade", icon: "📄" },
            { path: "/termos", label: "Termos", icon: "📋" },
            { path: "/exclusao-dados", label: "Exclusão de Dados", icon: "🗑️" },
            { path: "/suporte", label: "Suporte", icon: "💬" },
          ].map(link => (
            <button key={link.path} onClick={() => navigate(link.path)}
              className="text-left text-xs text-muted-foreground font-body hover:text-foreground transition-colors py-2 px-3 rounded-lg hover:bg-muted/50 flex items-center gap-1.5">
              <span>{link.icon}</span> {link.label}
            </button>
          ))}
        </div>

        {/* Logout */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full text-destructive font-display text-sm mt-2">
              <LogOut className="w-4 h-4 mr-2" /> Sair do app
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Tem certeza que quer sair?</AlertDialogTitle>
              <AlertDialogDescription className="font-body">
                {isMom
                  ? "Sem você, a família vira um caos."
                  : `Seu ranking continua correndo sem você.${rankPos && rankPos > 1 ? " O 1° lugar agradece." : ""}`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-display">Fica</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-destructive font-display">
                {isMom ? "Sair" : "Sai (e perde pontos)"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      {/* Add Child Sheet */}
      <Sheet open={showChildSheet} onOpenChange={setShowChildSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Adicionar Filho</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-body">Nome</label>
              <Input value={newChild.name} onChange={e => setNewChild(p => ({ ...p, name: e.target.value }))} className="mt-1" placeholder="Nome do filho" />
            </div>
            <div>
              <label className="text-xs font-body">Data de nascimento</label>
              <Input type="date" value={newChild.birth_date} onChange={e => setNewChild(p => ({ ...p, birth_date: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-body">Escola</label>
              <Input value={newChild.school} onChange={e => setNewChild(p => ({ ...p, school: e.target.value }))} className="mt-1" placeholder="Nome da escola" />
            </div>
            <div>
              <label className="text-xs font-body">Pediatra</label>
              <Input value={newChild.doctor_name} onChange={e => setNewChild(p => ({ ...p, doctor_name: e.target.value }))} className="mt-1" placeholder="Nome do pediatra" />
            </div>
            <div>
              <label className="text-xs font-body">Alergias / Observações</label>
              <Input value={newChild.allergies} onChange={e => setNewChild(p => ({ ...p, allergies: e.target.value }))} className="mt-1" placeholder="Ex: Alergia a amendoim" />
            </div>
            <Button className={`w-full font-display ${isMom ? "bg-mom hover:bg-mom/90" : "bg-primary"}`}
              onClick={() => addChildMutation.mutate()}
              disabled={!newChild.name || addChildMutation.isPending}>
              {addChildMutation.isPending ? "Salvando..." : "Adicionar Filho"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ═══════════════════ Badge Carousel Components ═══════════════════

function BadgeCard({ emoji, name, desc, earned, type, onClick }: {
  emoji: string; name: string; desc: string; earned: boolean; type: "good" | "shame" | "locked"; onClick: () => void;
}) {
  const bgMap = {
    good: earned
      ? "bg-dad-bg border-dad-border"
      : "bg-muted/30 border-muted-foreground/10",
    shame: earned
      ? "bg-secondary/10 border-secondary/30"
      : "bg-muted/30 border-muted-foreground/10",
    locked: "bg-muted/20 border-dashed border-muted-foreground/20",
  };

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 w-28 rounded-xl border-2 p-3 text-center transition-all ${bgMap[type]} ${earned ? "shadow-sm hover:shadow-md hover:scale-105" : "opacity-50"}`}
    >
      <span className={`text-3xl block mb-1.5 ${earned ? "" : "grayscale"}`}>{emoji}</span>
      <p className={`font-display text-[11px] font-bold leading-tight ${earned ? "text-foreground" : "text-muted-foreground"}`}>{name}</p>
    </button>
  );
}

function HorizontalScroll({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 140, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-sm font-bold flex items-center gap-1.5">{icon} {title}</h3>
        <div className="flex gap-1">
          <button onClick={() => scroll(-1)} className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => scroll(1)} className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {children}
      </div>
    </div>
  );
}

function DadBadgesCarousel({ earnedKeys, onSelect }: { earnedKeys: string[]; onSelect: (b: { emoji: string; name: string; desc: string }) => void }) {
  const earnedCount = DAD_ACHIEVEMENTS.earned.filter(a => earnedKeys.includes(a.key)).length
    + DAD_ACHIEVEMENTS.shame.filter(a => earnedKeys.includes(a.key)).length;
  const totalCount = DAD_ACHIEVEMENTS.earned.length + DAD_ACHIEVEMENTS.shame.length + DAD_ACHIEVEMENTS.locked.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold">🏅 Seus Selos</h2>
        <Badge variant="outline" className="text-[10px]">{earnedCount}/{totalCount} desbloqueados</Badge>
      </div>

      <HorizontalScroll title="Conquistados" icon={<Star className="w-3.5 h-3.5 text-primary" />}>
        {DAD_ACHIEVEMENTS.earned.map(a => (
          <BadgeCard key={a.key} emoji={a.emoji} name={a.name} desc={a.desc}
            earned={earnedKeys.includes(a.key)} type="good"
            onClick={() => onSelect(a)} />
        ))}
      </HorizontalScroll>

      <HorizontalScroll title="Registros Históricos" icon={<Gavel className="w-3.5 h-3.5 text-secondary" />}>
        {DAD_ACHIEVEMENTS.shame.map(a => (
          <BadgeCard key={a.key} emoji={a.emoji} name={a.name} desc={a.desc}
            earned={earnedKeys.includes(a.key)} type="shame"
            onClick={() => onSelect(a)} />
        ))}
      </HorizontalScroll>

      <HorizontalScroll title="Trancados" icon={<Lock className="w-3.5 h-3.5 text-muted-foreground" />}>
        {DAD_ACHIEVEMENTS.locked.map((a, i) => (
          <BadgeCard key={i} emoji="🔒" name={a.hint} desc="Continue jogando para desbloquear"
            earned={false} type="locked"
            onClick={() => {}} />
        ))}
      </HorizontalScroll>
    </div>
  );
}

function MomBadgesCarousel({ earnedKeys, onSelect }: { earnedKeys: string[]; onSelect: (b: { emoji: string; name: string; desc: string }) => void }) {
  const earnedCount = MOM_BADGES.filter(b => earnedKeys.includes(b.key)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold">👑 Selos de CEO</h2>
        <Badge variant="outline" className="text-[10px]">{earnedCount}/{MOM_BADGES.length} desbloqueados</Badge>
      </div>

      <HorizontalScroll title="Seus Selos" icon={<Crown className="w-3.5 h-3.5 text-mom" />}>
        {MOM_BADGES.map(b => (
          <BadgeCard key={b.key} emoji={b.emoji} name={b.name} desc={b.desc}
            earned={earnedKeys.includes(b.key)} type="good"
            onClick={() => onSelect(b)} />
        ))}
      </HorizontalScroll>
    </div>
  );
}



