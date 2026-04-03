import { useState } from "react";
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
import { format, differenceInHours, startOfMonth, endOfMonth, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  User, Edit2, Trophy, Flame, Star, LifeBuoy, CheckSquare, CalendarDays,
  LogOut, Share2, ChevronRight, Baby, Shield, Clock, Bell
} from "lucide-react";
import { getDadTitle } from "@/lib/constants";
import { sendLocalNotification, isPushSupported, getNotificationPermission, requestPushSubscription } from "@/lib/pushNotifications";

const ACHIEVEMENT_DEFS = {
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

  // Monthly tasks stats
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

  // Monthly events
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

  // Mom rating
  const { data: momRating } = useQuery({
    queryKey: ["my-mom-rating", user?.id, weekStart],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("mom_ratings").select("*")
        .eq("user_id", user.id).eq("week_start", weekStart).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Ranking position
  const { data: rankPos } = useQuery({
    queryKey: ["rank-pos", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, points")
        .eq("role", "pai").order("points", { ascending: false }).limit(50);
      if (!data) return null;
      const idx = data.findIndex(p => p.user_id === user?.id);
      return idx >= 0 ? idx + 1 : null;
    },
    enabled: !!user,
  });

  // Children
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

  // Achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("achievements").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  // Add child
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
      toast.success("Filho adicionado! Você sabe quantos tem agora? 😏");
    },
  });

  if (!profile) return null;

  const dadTitle = getDadTitle(profile.points);
  const monthCompleted = monthTasks.filter(t => t.completed_at).length;
  const monthTotal = monthTasks.length;
  const monthPct = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;
  const rescues = monthTasks.filter(t => t.rescued_by_mom).length;
  const lastActiveHours = profile.last_active_at
    ? differenceInHours(new Date(), new Date(profile.last_active_at)) : 0;

  const earnedKeys = achievements.map((a: any) => a.badge_key);

  const getChildCompletion = (child: any) => {
    let filled = 1; // name always filled
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
    toast.success("Nome atualizado. A mãe foi notificada. Brincadeira.");
  };

  const handleLogout = async () => {
    await signOut();
    toast("Saiu. Seu ranking continua correndo sem você. 👋");
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error("Erro ao enviar foto."); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-busting: append timestamp to force browser to reload the new image
    const avatarUrlWithCacheBust = `${urlData.publicUrl}?t=${Date.now()}`;
    await updateProfile.mutateAsync({ avatar_url: avatarUrlWithCacheBust });
    toast.success("Foto atualizada. A mãe aprova? Veremos.");
  };

  return (
    <div className="pb-24 px-4 pt-8 max-w-lg mx-auto space-y-5">
      {/* Profile Header */}
      <div className="flex items-start gap-4">
        <label className="cursor-pointer relative group">
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0 overflow-hidden group-hover:opacity-80 transition-opacity">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-2xl font-bold text-primary">
                {(profile.display_name || "P")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Edit2 className="w-3 h-3 text-primary-foreground" />
          </div>
        </label>
        <div className="flex-1 min-w-0">
          {editMode ? (
            <div className="flex gap-2">
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-sm" autoFocus />
              <Button size="sm" className="h-8 text-xs" onClick={handleSaveName}>Salvar</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold truncate">{profile.display_name}</h1>
              <button onClick={() => { setEditName(profile.display_name); setEditMode(true); }}>
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
          <Badge className="mt-1 text-[10px]" variant="default">{dadTitle.emoji} {dadTitle.title}</Badge>
          <p className="text-xs text-muted-foreground font-body italic mt-1">
            {rescues > 0
              ? `A mãe te salvou ${rescues} vez${rescues > 1 ? "es" : ""} esse mês.`
              : lastActiveHours > 24
                ? `Última ação: ${lastActiveHours}h atrás.`
                : `Você abriu o app hoje. Bom começo.`}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
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

      {/* Level Progress */}
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

      {/* Achievements */}
      <div>
        <h2 className="font-display text-lg font-bold mb-3">Seus Selos (os bons e os ruins)</h2>

        <p className="text-xs font-display font-semibold text-primary mb-2">Conquistados</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {ACHIEVEMENT_DEFS.earned.map(a => {
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
          {ACHIEVEMENT_DEFS.shame.map(a => {
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
          {ACHIEVEMENT_DEFS.locked.map((a, i) => (
            <Badge key={i} variant="outline" className="text-xs opacity-50">
              🔒 {a.hint}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Children */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">Seus Filhos</h2>
          <Button size="sm" variant="outline" onClick={() => setShowChildSheet(true)}>
            <Baby className="w-3.5 h-3.5 mr-1" /> Adicionar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground font-body italic mb-3">
          {children.length === 0 ? "Nenhum filho cadastrado. Você tem filhos, né?" : `(você lembra quantos são? ${children.length}.)`}
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
                    <span className="text-xs font-display font-bold text-primary">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5 mb-2" />
                  {pct < 70 && (
                    <p className="text-[10px] text-secondary font-body italic">
                      A mãe sabe tudo isso. Você deveria também.
                    </p>
                  )}
                  {pct === 100 && (
                    <p className="text-[10px] text-primary font-body italic">
                      Perfil completo. Você conhece seu filho. Oficialmente.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {child.school && <Badge variant="outline" className="text-[9px]">🏫 {child.school}</Badge>}
                    {child.doctor_name && <Badge variant="outline" className="text-[9px]">🏥 {child.doctor_name}</Badge>}
                    {!child.school && (
                      <span className="text-[9px] text-secondary italic">Falta: escola</span>
                    )}
                    {!child.doctor_name && (
                      <span className="text-[9px] text-secondary italic">Falta: pediatra</span>
                    )}
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
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/privacidade")}>
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-sm font-body">📄 Política de Privacidade</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/termos")}>
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-sm font-body">📋 Termos de Uso</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/exclusao-dados")}>
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-sm font-body text-muted-foreground">🗑️ Exclusão de Dados</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate("/suporte")}>
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-sm font-body">💬 Suporte & Contato</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Test Notification */}
        <Button
          variant="outline"
          className="w-full font-display text-sm"
          onClick={async () => {
            const perm = await getNotificationPermission();
            if (perm !== "granted") {
              if (user) await requestPushSubscription(user.id);
            }
            const msgs = [
              "Você esqueceu de alguma coisa. Não sabemos o quê. Mas você sabe.",
              "A mãe já fez o que você ia fazer. De novo.",
              "Seu filho perguntou por você. Tá sabendo?",
              "Ranking atualizado. Você não vai gostar.",
              "Última chance de fazer algo útil hoje.",
            ];
            sendLocalNotification("Estou de Olho 👁️", msgs[Math.floor(Math.random() * msgs.length)]);
          }}
        >
          <Bell className="w-4 h-4 mr-2" />
          🔔 Me mande um esporro agora
        </Button>

        {/* Share DNA */}
        <Button variant="outline" className="w-full font-display text-sm" onClick={() => {
          const text = `DNA do Pai — ${format(new Date(), "MMMM yyyy", { locale: ptBR })} 👁️\n${profile.display_name}\n${dadTitle.emoji} ${dadTitle.title}\n${monthPct}% tarefas • ${profile.streak_days} dias seguidos • ${rescues} resgates\nEstou de Olho — porque alguém tem que lembrar`;
          if (navigator.share) navigator.share({ text });
          else { navigator.clipboard.writeText(text); toast("DNA copiado!"); }
        }}>
          <Share2 className="w-4 h-4 mr-2" />
          📊 Compartilhar meu DNA de pai
        </Button>

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
                Seu ranking continua correndo sem você.
                {rankPos && rankPos > 1 && " O 1° lugar agradece."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-display">Fica</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-destructive font-display">
                Sai (e perde pontos)
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
            <Button className="w-full bg-primary font-display" onClick={() => addChildMutation.mutate()}
              disabled={!newChild.name || addChildMutation.isPending}>
              {addChildMutation.isPending ? "Salvando..." : "Adicionar Filho"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
