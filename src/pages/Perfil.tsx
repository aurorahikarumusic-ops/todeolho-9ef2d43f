import { useState, useCallback } from "react";
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
  LogOut, Share2, ChevronRight, Baby, Shield, Clock, Bell, Crown, Gem, Gavel, Send, Trash2
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { getDadTitle } from "@/lib/constants";
import { MOM_BADGES } from "@/lib/mom-constants";
import InvitePartner from "@/components/family/InvitePartner";
import JoinFamily from "@/components/family/JoinFamily";
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
    { hint: "Complete 30 dias seguidos pra descobrir" },
    { hint: "Chegue ao 1° lugar no ranking" },
    { hint: "A mãe deu 5★ por 4 semanas seguidas" },
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
  const [newChild, setNewChild] = useState({ name: "", school: "", doctor_name: "", allergies: "", birth_date: "" });

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

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error("Erro ao enviar foto."); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrlWithCacheBust = `${urlData.publicUrl}?t=${Date.now()}`;
    await updateProfile.mutateAsync({ avatar_url: avatarUrlWithCacheBust });
    toast.success(isMom ? "Foto atualizada. Linda como sempre. 👑" : "Foto atualizada. A mãe aprova? Veremos.");
  };

  // Color scheme based on role
  const accent = isMom ? "text-mom" : "text-primary";
  const accentBg = isMom ? "bg-mom" : "bg-primary";
  const accentBorder = isMom ? "border-mom" : "border-primary";
  const profileBorderColor = isMom ? "border-mom" : "border-primary";
  const profileBgColor = isMom ? "bg-mom/10" : "bg-primary/10";

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-8 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-5">
      {/* Profile Header */}
      <div className="flex items-start gap-4">
        <label className="cursor-pointer relative group">
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
          <div className={`w-16 h-16 rounded-full ${profileBgColor} border-2 ${profileBorderColor} flex items-center justify-center shrink-0 overflow-hidden group-hover:opacity-80 transition-opacity`}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className={`font-display text-2xl font-bold ${accent}`}>
                {(profile.display_name || "U")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${accentBg} flex items-center justify-center`}>
            <Edit2 className="w-3 h-3 text-white" />
          </div>
        </label>
        <div className="flex-1 min-w-0">
          {editMode ? (
            <div className="flex gap-2">
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-sm" autoFocus />
              <Button size="sm" className={`h-8 text-xs ${isMom ? "bg-mom hover:bg-mom/90" : ""}`} onClick={handleSaveName}>Salvar</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold truncate">{profile.display_name}</h1>
              <button onClick={() => { setEditName(profile.display_name); setEditMode(true); }}>
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
          <Badge className={`mt-1 text-[10px] ${isMom ? "bg-mom text-white" : ""}`} variant="default">
            {isMom ? "👑 CEO da Família" : `${dadTitle.emoji} ${dadTitle.title}`}
          </Badge>
          <p className="text-xs text-muted-foreground font-body italic mt-1">
            {isMom
              ? tasksCreatedByMe > 0
                ? `Você criou ${tasksCreatedByMe} tarefa(s) esse mês. Tudo sob controle.`
                : "A família funciona porque você funciona."
              : rescues > 0
                ? `A mãe te salvou ${rescues} vez${rescues > 1 ? "es" : ""} esse mês.`
                : lastActiveHours > 24
                  ? `Última ação: ${lastActiveHours}h atrás.`
                  : `Você abriu o app hoje. Bom começo.`}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        {isMom ? [
          { icon: <CheckSquare className="w-4 h-4 text-mom" />, value: `${tasksCreatedByMe}`, label: "tarefas criadas" },
          { icon: <CalendarDays className="w-4 h-4 text-mom" />, value: `${monthEvents.length}`, label: "eventos/mês" },
          { icon: <LifeBuoy className="w-4 h-4 text-secondary" />, value: `${rescues}`, label: rescues === 0 ? "resgates (ótimo)" : "resgates" },
          { icon: <Star className="w-4 h-4 text-mom" />, value: momRating ? `${momRating.stars}★` : "—", label: "última avaliação" },
          { icon: <Trophy className="w-4 h-4 text-mom" />, value: `${monthPct}%`, label: "completadas/mês" },
          { icon: <Crown className="w-4 h-4 text-mom" />, value: `${children.length}`, label: children.length === 1 ? "filho" : "filhos" },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="font-display font-bold text-lg">{s.value}</p>
              <p className="text-[9px] text-muted-foreground font-body">{s.label}</p>
            </CardContent>
          </Card>
        )) : [
          { icon: <Flame className="w-4 h-4 text-secondary" />, value: `${profile.streak_days}`, label: profile.streak_days === 0 ? "dias (zero)" : profile.streak_days >= 7 ? "dias (raro)" : "dias seguidos" },
          { icon: <Trophy className="w-4 h-4 text-primary" />, value: rankPos ? `#${rankPos}` : "—", label: rankPos === 1 ? "1° (suspeito)" : !rankPos ? "sem ranking" : "posição" },
          { icon: <Star className="w-4 h-4 text-accent-foreground" />, value: momRating ? `${momRating.stars}★` : "—", label: momRating?.stars === 5 ? "(ela tá bem?)" : momRating?.stars === 1 ? "(ela foi gentil)" : "nota da mãe" },
          { icon: <CheckSquare className="w-4 h-4 text-primary" />, value: `${monthPct}%`, label: "tarefas/mês" },
          { icon: <CalendarDays className="w-4 h-4 text-primary" />, value: `${monthEvents.length}`, label: "eventos/mês" },
          { icon: <LifeBuoy className="w-4 h-4 text-secondary" />, value: `${rescues}`, label: rescues === 0 ? "resgates (bom)" : rescues >= 7 ? "resgates (recorde)" : "resgates" },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="font-display font-bold text-lg">{s.value}</p>
              <p className="text-[9px] text-muted-foreground font-body">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Level Progress / Mom Badges */}
      {isMom ? (
        <Card className="border-mom-border bg-mom-bg">
          <CardContent className="p-4">
            <h3 className="font-display font-bold text-sm text-mom-text mb-3">👑 Seus Selos de CEO</h3>
            <div className="flex flex-wrap gap-2">
              {MOM_BADGES.map(b => {
                const earned = earnedKeys.includes(b.key);
                return (
                  <Badge key={b.key} variant={earned ? "default" : "outline"}
                    className={`text-xs ${earned ? "bg-mom text-white" : "opacity-40"}`}>
                    {b.emoji} {b.name}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-sm">{dadTitle.emoji} {dadTitle.title}</span>
                <span className="text-xs text-muted-foreground font-body">{profile.points} pts</span>
              </div>
              <Progress value={Math.min(100, (profile.points % 200) / 2)} className="h-2 mb-2" />
              <p className="text-[10px] text-muted-foreground font-body italic">
                {profile.points < 200 ? "Para ser 'Pai Tentando': alcance 201 pontos."
                  : profile.points < 500 ? "Para ser 'Pai Promissor': alcance 501 pontos."
                  : profile.points < 900 ? "Para ser 'Pai de Verdade': alcance 901 pontos."
                  : profile.points < 1400 ? "Para ser 'Pai Lendário': alcance 1401 pontos."
                  : "Você é lendário. Isso não deveria existir."}
              </p>
            </CardContent>
          </Card>

          {/* Dad Achievements */}
          <div>
            <h2 className="font-display text-lg font-bold mb-3">Seus Selos (os bons e os ruins)</h2>
            <p className="text-xs font-display font-semibold text-primary mb-2">Conquistados</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {DAD_ACHIEVEMENTS.earned.map(a => {
                const earned = earnedKeys.includes(a.key);
                return (
                  <Badge key={a.key} variant={earned ? "default" : "outline"}
                    className={`text-xs ${earned ? "" : "opacity-40"}`}>
                    {a.emoji} {a.name}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs font-display font-semibold text-secondary mb-2">Registros históricos</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {DAD_ACHIEVEMENTS.shame.map(a => {
                const earned = earnedKeys.includes(a.key);
                return (
                  <Badge key={a.key} variant={earned ? "secondary" : "outline"}
                    className={`text-xs ${earned ? "" : "opacity-40"}`}>
                    {a.emoji} {a.name}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs font-display font-semibold text-muted-foreground mb-2">Trancados</p>
            <div className="flex flex-wrap gap-2">
              {DAD_ACHIEVEMENTS.locked.map((a, i) => (
                <Badge key={i} variant="outline" className="text-xs opacity-50">
                  🔒 {a.hint}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ROLE-SPECIFIC SECTION: Pérolas for Mom / Banco dos Réus for Dad */}
      {isMom ? (
        <Card className="border-pink-300/50 bg-gradient-to-br from-pink-50 to-fuchsia-50 dark:from-pink-950/20 dark:to-fuchsia-950/20 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/mural")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-lg shadow-pink-500/30">
              <Gem className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-sm bg-gradient-to-r from-pink-500 to-fuchsia-600 bg-clip-text text-transparent">
                Mural de Pérolas 💎
              </p>
              <p className="text-[10px] text-muted-foreground font-body">
                Veja e compartilhe as maiores cabeçadas dos maridos
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-pink-400" />
          </CardContent>
        </Card>
      ) : (
        <BancoReus userId={user?.id} familyId={profile.family_id} />
      )}

      <Separator />

      {/* Family Connection */}
      {!partner && (
        <div>
          <h2 className="font-display text-lg font-bold mb-3">Conexão Familiar</h2>
          {isMom ? (
            <InvitePartner />
          ) : (
            <JoinFamily />
          )}
        </div>
      )}

      {partner && (
        <Card className={`border-0 shadow-sm ${isMom ? "bg-dad-bg" : "bg-mom-bg"}`}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMom ? "bg-primary/20" : "bg-mom/20"}`}>
              <span className="text-lg">{isMom ? "👨" : "👩"}</span>
            </div>
            <div>
              <p className="font-display font-bold text-sm">{partner.display_name}</p>
              <p className="text-[10px] text-muted-foreground font-body">
                {isMom ? "O pai" : "A mãe"} — conectado ✓
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Children */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">Seus Filhos</h2>
          <Button size="sm" variant="outline" className={isMom ? `${accentBorder} ${accent}` : ""} onClick={() => setShowChildSheet(true)}>
            <Baby className="w-3.5 h-3.5 mr-1" /> Adicionar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground font-body italic mb-3">
          {children.length === 0
            ? (isMom ? "Nenhum filho cadastrado ainda." : "Nenhum filho cadastrado. Você tem filhos, né?")
            : (isMom ? `${children.length} filho(s) cadastrado(s).` : `(você lembra quantos são? ${children.length}.)`)}
        </p>

        <div className="space-y-3">
          {children.map((child: any) => {
            const pct = getChildCompletion(child);
            return (
              <Card key={child.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-lg">
                      👶
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold text-sm">{child.name}</p>
                      {child.birth_date && (
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(child.birth_date), "dd/MM/yyyy")}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-display font-bold ${accent}`}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5 mb-2" />
                  {pct < 70 && (
                    <p className="text-[10px] text-secondary font-body italic">
                      {isMom ? "Complete o perfil para ter tudo registrado." : "A mãe sabe tudo isso. Você deveria também."}
                    </p>
                  )}
                  {pct === 100 && (
                    <p className={`text-[10px] font-body italic ${accent}`}>
                      Perfil completo. ✓
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {child.school && <Badge variant="outline" className="text-[9px]">🏫 {child.school}</Badge>}
                    {child.doctor_name && <Badge variant="outline" className="text-[9px]">🏥 {child.doctor_name}</Badge>}
                    {!child.school && <span className="text-[9px] text-secondary italic">Falta: escola</span>}
                    {!child.doctor_name && <span className="text-[9px] text-secondary italic">Falta: pediatra</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Settings */}
      <div className="space-y-2">
        <h2 className="font-display text-lg font-bold mb-3">Configurações</h2>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-body">Código da família</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{profile.family_code || "—"}</span>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-body">Membro desde</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(profile.created_at), "dd/MM/yyyy")}
            </span>
          </CardContent>
        </Card>

        {/* Legal Links */}
        {[
          { path: "/privacidade", label: "📄 Política de Privacidade" },
          { path: "/termos", label: "📋 Termos de Uso" },
          { path: "/exclusao-dados", label: "🗑️ Exclusão de Dados" },
          { path: "/suporte", label: "💬 Suporte & Contato" },
        ].map(link => (
          <Card key={link.path} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(link.path)}>
            <CardContent className="p-3 flex items-center justify-between">
              <span className="text-sm font-body">{link.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}

        {/* Test Notification */}
        <Button
          variant="outline"
          className={`w-full font-display text-sm ${isMom ? `${accentBorder} ${accent}` : ""}`}
          onClick={async () => {
            const perm = await getNotificationPermission();
            if (perm !== "granted") {
              if (user) await requestPushSubscription(user.id);
            }
            const msgs = isMom
              ? [
                  "A família agradece. Ele não vai falar, mas sabe.",
                  "Você criou mais uma tarefa. O pai foi notificado.",
                  "Teste de notificação. Tudo funcionando, chefe. 👑",
                ]
              : [
                  "Você esqueceu de alguma coisa. Não sabemos o quê. Mas você sabe.",
                  "A mãe já fez o que você ia fazer. De novo.",
                  "Ranking atualizado. Você não vai gostar.",
                ];
            sendLocalNotification("Estou de Olho 👁️", msgs[Math.floor(Math.random() * msgs.length)]);
          }}
        >
          <Bell className="w-4 h-4 mr-2" />
          {isMom ? "🔔 Testar notificação" : "🔔 Me mande um esporro agora"}
        </Button>

        {/* Share DNA - Dad only */}
        {!isMom && (
          <Button variant="outline" className="w-full font-display text-sm" onClick={() => {
            const text = `DNA do Pai — ${format(new Date(), "MMMM yyyy", { locale: ptBR })} 👁️\n${profile.display_name}\n${dadTitle.emoji} ${dadTitle.title}\n${monthPct}% tarefas • ${profile.streak_days} dias seguidos • ${rescues} resgates\nEstou de Olho — porque alguém tem que lembrar`;
            if (navigator.share) navigator.share({ text });
            else { navigator.clipboard.writeText(text); toast("DNA copiado!"); }
          }}>
            <Share2 className="w-4 h-4 mr-2" />
            📊 Compartilhar meu DNA de pai
          </Button>
        )}

        {/* Logout */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full text-destructive font-display">
              <LogOut className="w-4 h-4 mr-2" /> Sair do app
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Tem certeza que quer sair?</AlertDialogTitle>
              <AlertDialogDescription className="font-body">
                {isMom
                  ? "Sem você, a família vira um caos. Mais do que já é."
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
      </div>

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

// ==================== Banco dos Réus (Dad only) ====================
function BancoReus({ userId, familyId }: { userId?: string; familyId?: string | null }) {
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: confessions = [] } = useQuery({
    queryKey: ["confessions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("confessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const addConfession = useMutation({
    mutationFn: async (text: string) => {
      if (!userId || !familyId) throw new Error("Sem família");
      const { error } = await supabase.from("confessions").insert({
        user_id: userId,
        family_id: familyId,
        content: text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["confessions"] });
      setContent("");
      setShowForm(false);
      toast.success("Confissão registrada. Boa sorte. ⚖️");
    },
    onError: () => toast.error("Erro ao confessar"),
  });

  const deleteConfession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("confessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["confessions"] });
      toast.success("Confissão apagada. Mas a culpa... permanece.");
    },
  });

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || trimmed.length < 5) {
      toast.error("Confessa direito! Mínimo de 5 caracteres.");
      return;
    }
    if (trimmed.length > 300) {
      toast.error("Máximo de 300 caracteres. Seja breve.");
      return;
    }
    addConfession.mutate(trimmed);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
          <Gavel className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Banco dos Réus ⚖️</h2>
          <p className="text-[10px] text-muted-foreground font-body">
            Confesse antes que ela descubra. É melhor pra você.
          </p>
        </div>
      </div>

      {/* Add confession */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full text-left font-body text-sm text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg border border-dashed border-amber-300/50 hover:border-amber-400 bg-amber-50/50 dark:bg-amber-950/10"
        >
          ⚖️ Confessar um erro antes que ela descubra...
        </button>
      ) : (
        <Card className="border-amber-300/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="p-4 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='Ex: "Deixei a louça de molho desde ontem... e esqueci."'
              className="min-h-[70px] font-body text-sm border-amber-300/50 focus:border-amber-500"
              maxLength={300}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-body">{content.length}/300</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setContent(""); }}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={addConfession.isPending}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Confessar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List of confessions */}
      {confessions.length === 0 ? (
        <p className="text-xs text-muted-foreground font-body italic text-center py-2">
          Nenhuma confissão ainda. Sortudo... ou mentiroso. 🤔
        </p>
      ) : (
        <div className="space-y-2">
          {confessions.map((c: any) => (
            <Card key={c.id} className="border-amber-200/30">
              <CardContent className="p-3 flex items-start gap-3">
                <span className="text-lg mt-0.5">⚖️</span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-foreground">{c.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <button
                  onClick={() => deleteConfession.mutate(c.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
