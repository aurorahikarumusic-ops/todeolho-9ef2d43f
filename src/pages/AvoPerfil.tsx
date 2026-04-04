import { useState } from "react";
import JoinFamilyAvo from "@/components/grandma/JoinFamilyAvo";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useGrandmaSuggestions, useGrandmaRanking } from "@/hooks/useGrandmaSuggestions";
import { useFamilyPartner } from "@/hooks/useFamily";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  User, Edit2, Trophy, MessageSquare, CheckCircle, XCircle, Clock,
  LogOut, Share2, ChevronRight, Lightbulb, Shield, Star
} from "lucide-react";

const GRANDMA_TITLES = [
  { min: 0, title: "Avó Novata", emoji: "🧶" },
  { min: 5, title: "Avó Palpiteira", emoji: "💬" },
  { min: 15, title: "Avó Intrometida", emoji: "👓" },
  { min: 30, title: "Avó CEO", emoji: "👑" },
  { min: 50, title: "Avó Lendária", emoji: "🏆" },
  { min: 100, title: "Avó Suprema", emoji: "⭐" },
];

function getGrandmaTitle(total: number) {
  return [...GRANDMA_TITLES].reverse().find((t) => total >= t.min) || GRANDMA_TITLES[0];
}

const AVO_BADGES = [
  { key: "first_tip", emoji: "💬", name: "Primeiro Palpite", desc: "Enviou o primeiro palpite" },
  { key: "tip_10", emoji: "📣", name: "Megafone", desc: "10 palpites enviados" },
  { key: "accepted_5", emoji: "✅", name: "Avó Certeira", desc: "5 palpites aceitos" },
  { key: "rejected_5", emoji: "🙅", name: "Avó Ignorada", desc: "5 palpites recusados" },
  { key: "streak_palpite", emoji: "🔥", name: "Sequência de Palpites", desc: "Palpites por 7 dias seguidos" },
  { key: "top_1", emoji: "👑", name: "Rainha dos Palpites", desc: "1° lugar no ranking" },
];

export default function AvoPerfil() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: partner } = useFamilyPartner();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();
  const { data: suggestions = [] } = useGrandmaSuggestions();
  const { data: ranking = [] } = useGrandmaRanking();

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");

  if (!profile) return null;

  const mySuggestions = suggestions.filter((s) => s.user_id === user?.id);
  const accepted = mySuggestions.filter((s) => s.status === "aceito").length;
  const rejected = mySuggestions.filter((s) => s.status === "recusado").length;
  const pending = mySuggestions.filter((s) => s.status === "pendente").length;
  const total = mySuggestions.length;

  const myRankPos = ranking.findIndex((r) => r.user_id === user?.id);
  const title = getGrandmaTitle(total);
  const acceptRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

  // Simple badge earning logic
  const earnedBadges = AVO_BADGES.filter((b) => {
    if (b.key === "first_tip") return total >= 1;
    if (b.key === "tip_10") return total >= 10;
    if (b.key === "accepted_5") return accepted >= 5;
    if (b.key === "rejected_5") return rejected >= 5;
    if (b.key === "top_1") return myRankPos === 0 && ranking.length > 1;
    return false;
  });

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    await updateProfile.mutateAsync({ display_name: editName.trim() });
    setEditMode(false);
    toast.success("Nome atualizado, vovó! 👵");
  };

  const handleLogout = async () => {
    await signOut();
    toast("Saiu. Os netos vão sentir falta dos palpites. 👵👋");
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    try {
      toast.loading("Enviando foto...", { id: "avatar-upload" });
      const path = `${user.id}/avatar.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: "image/jpeg",
      });
      if (error) { toast.error("Erro ao enviar foto", { id: "avatar-upload" }); return; }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      await updateProfile.mutateAsync({ avatar_url: `${urlData.publicUrl}?t=${Date.now()}` });
      toast.success("Foto linda, vovó! 👵📸", { id: "avatar-upload" });
    } catch {
      toast.error("Erro ao processar foto", { id: "avatar-upload" });
    }
  };

  const stats = [
    { icon: <MessageSquare className="w-4 h-4 text-avo" />, value: `${total}`, label: "palpites" },
    { icon: <CheckCircle className="w-4 h-4 text-green-500" />, value: `${accepted}`, label: "aceitos" },
    { icon: <XCircle className="w-4 h-4 text-red-400" />, value: `${rejected}`, label: "recusados" },
    { icon: <Clock className="w-4 h-4 text-yellow-500" />, value: `${pending}`, label: "pendentes" },
    { icon: <Trophy className="w-4 h-4 text-avo" />, value: myRankPos >= 0 ? `#${myRankPos + 1}` : "—", label: "ranking" },
    { icon: <Star className="w-4 h-4 text-avo-glow" />, value: `${acceptRate}%`, label: "aceitação" },
  ];

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl mx-auto space-y-6">

      {/* Profile Header */}
      <section className="relative rounded-2xl overflow-hidden border-2 border-avo-border bg-avo-bg">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="h-2 bg-gradient-to-r from-avo to-avo-glow" />

        <div className="relative p-5">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer relative group shrink-0">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
              <div className="w-20 h-20 rounded-full border-4 border-avo flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shadow-lg bg-avo/10">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-3xl font-bold text-avo">
                    {(profile.display_name || "V")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white bg-avo">
                <Edit2 className="w-3.5 h-3.5 text-white" />
              </div>
            </label>

            <div className="flex-1 min-w-0">
              {editMode ? (
                <div className="flex gap-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm bg-white" autoFocus />
                  <Button size="sm" className="h-8 text-xs text-white bg-avo hover:bg-avo/80" onClick={handleSaveName}>Salvar</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-bold text-foreground truncate">{profile.display_name}</h1>
                  <button onClick={() => { setEditName(profile.display_name); setEditMode(true); }}>
                    <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </div>
              )}
              <Badge className="text-[10px] text-white border-0 bg-avo mt-1">
                {title.emoji} {title.title}
              </Badge>
              <p className="text-[11px] text-muted-foreground font-body italic mt-1.5">
                {total === 0 ? "Nenhum palpite ainda? Isso não é de avó..." : `${total} palpites, ${acceptRate}% aceitos`}
              </p>
            </div>
          </div>

          {/* Stats */}
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

      {/* Secondary Stats */}
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

      {/* Badges */}
      <section>
        <h2 className="font-display text-lg font-bold text-avo-text mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-avo" /> Selos da Vovó
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {AVO_BADGES.map((badge) => {
            const earned = earnedBadges.some((b) => b.key === badge.key);
            return (
              <div
                key={badge.key}
                className={`shrink-0 w-24 snap-start rounded-xl border-2 p-3 text-center transition-all ${
                  earned
                    ? "border-avo bg-avo-bg shadow-md"
                    : "border-border bg-muted/30 opacity-50 grayscale"
                }`}
              >
                <span className="text-2xl block mb-1">{badge.emoji}</span>
                <p className="font-body font-semibold text-[10px] leading-tight">{badge.name}</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section className="space-y-2">
        <button
          onClick={() => navigate("/ranking")}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
        >
          <span className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-avo" />
            <span className="font-body font-semibold text-sm">Ranking das Avós</span>
          </span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button
          onClick={() => navigate("/app")}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
        >
          <span className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-avo" />
            <span className="font-body font-semibold text-sm">Dar Palpite</span>
          </span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button
          onClick={() => {
            const text = `👵 Sou avó palpiteira no *Estou de Olho* 👁️\n${total} palpites, ${accepted} aceitos!\nTítulo: ${title.emoji} ${title.title}\n\nBaixe: https://estoudeolho.lovable.app`;
            navigator.clipboard.writeText(text);
            toast.success("Copiado! Manda no grupo da família! 📋");
          }}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
        >
          <span className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-avo" />
            <span className="font-body font-semibold text-sm">Compartilhar Perfil</span>
          </span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </section>

      <Separator />

      {/* Family connection */}
      {profile.family_id ? (
        partner && (
          <Card className="border border-avo-border">
            <CardContent className="p-4">
              <p className="font-body text-sm text-avo-text font-semibold mb-1">👨‍👩‍👧 Família Conectada</p>
              <p className="font-body text-xs text-muted-foreground">
                Conectada com: <strong>{partner.display_name}</strong>
              </p>
            </CardContent>
          </Card>
        )
      ) : (
        <JoinFamilyAvo />
      )}

      {/* Logout */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full font-display gap-2 border-destructive/30 text-destructive hover:bg-destructive/5">
            <LogOut className="w-4 h-4" /> Sair da Conta
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Sair? 👵</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              Tem certeza, vovó? Os netos vão sentir falta dos seus palpites...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Ficar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="font-display bg-destructive">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="text-center pb-4 space-y-1">
        <a href="/privacidade" className="text-[11px] text-muted-foreground underline font-body hover:text-avo mr-3">Privacidade</a>
        <a href="/termos" className="text-[11px] text-muted-foreground underline font-body hover:text-avo mr-3">Termos</a>
        <a href="/suporte" className="text-[11px] text-muted-foreground underline font-body hover:text-avo">Suporte</a>
      </div>
    </div>
  );
}
