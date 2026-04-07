import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useIsMom, useFamilyPartner } from "@/hooks/useFamily";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { differenceInHours, startOfMonth, endOfMonth, startOfWeek } from "date-fns";
import {
  Flame, Star, LifeBuoy, CheckSquare, CalendarDays, Crown, Gem, ChevronRight, Trophy
} from "lucide-react";
import { getDadTitle } from "@/lib/constants";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ChildrenSection from "@/components/profile/ChildrenSection";
import { DadBadgesCarousel, MomBadgesCarousel, BadgeDetailModal } from "@/components/profile/BadgesSection";
import SettingsSection from "@/components/profile/SettingsSection";
import RedemptionSection from "@/components/profile/RedemptionSection";
import LevelProgress from "@/components/profile/LevelProgress";
import FamilyConnection from "@/components/profile/FamilyConnection";
import PalpitesHistorySection from "@/components/profile/PalpitesHistorySection";
import CartasRecebidas from "@/components/redemption/CartasRecebidas";
import ModoRedencao from "@/components/redemption/ModoRedencao";
import { Trophy } from "lucide-react";

export default function Perfil() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const isMom = useIsMom();
  const { data: partner, allMembers } = useFamilyPartner();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRedencao, setShowRedencao] = useState(false);
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
          const { data, error } = await supabase.functions.invoke("verify-payment", { body: { sessionId } });
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
        setSearchParams({}, { replace: true });
      };
      verifyPayment();
    } else if (payment === "cancelled") {
      const cancelledLetterId = searchParams.get("letter_id");
      if (cancelledLetterId) {
        supabase.from("love_letters").delete().eq("id", cancelledLetterId).then(() => {
          queryClient.invalidateQueries({ queryKey: ["sent-letters"] });
        });
      }
      toast.info("Pagamento cancelado. A carta não paga foi removida.");
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
        .eq(isMom ? "rated_by" : "user_id", user.id).eq("week_start", weekStart)
        .order("created_at", { ascending: false }).limit(1);
      return data && data.length > 0 ? data[0] : null;
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
      const { data } = await supabase.from("children").select("*").eq("family_id", profile.family_id);
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


  if (!profile) return null;

  const letterRecipient = isMom
    ? allMembers.find(m => m.role === "pai") || partner
    : partner;

  if (showRedencao) {
    return (
      <ModoRedencao
        onClose={() => setShowRedencao(false)}
        recipientName={letterRecipient?.display_name}
        recipientId={letterRecipient?.user_id}
      />
    );
  }

  const monthCompleted = monthTasks.filter(t => t.completed_at).length;
  const monthTotal = monthTasks.length;
  const monthPct = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;
  const rescues = monthTasks.filter(t => t.rescued_by_mom).length;
  const tasksCreatedByMe = monthTasks.filter(t => t.created_by === user?.id).length;
  const lastActiveHours = profile.last_active_at
    ? differenceInHours(new Date(), new Date(profile.last_active_at)) : 0;
  const earnedKeys = achievements.map((a: any) => a.badge_key);

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
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Erro ao processar imagem")), "image/jpeg", 0.85);
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
      const { error } = await supabase.storage.from("avatars").upload(path, resized, { upsert: true, contentType: "image/jpeg" });
      if (error) { toast.error("Erro ao enviar foto: " + error.message, { id: "avatar-upload" }); return; }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      await updateProfile.mutateAsync({ avatar_url: `${urlData.publicUrl}?t=${Date.now()}` });
      toast.success(isMom ? "Foto atualizada. Linda como sempre. 👑" : "Foto atualizada. A mãe aprova? Veremos.", { id: "avatar-upload" });
    } catch (err: any) {
      toast.error("Erro ao processar foto: " + (err.message || "tente novamente"), { id: "avatar-upload" });
    }
  };

  const handleEditName = async (name: string) => {
    await updateProfile.mutateAsync({ display_name: name });
    toast.success(isMom ? "Nome atualizado, chefe! 👑" : "Nome atualizado. A mãe foi notificada. Brincadeira.");
  };

  const stats = isMom ? [
    { icon: <CheckSquare className="w-4 h-4 text-mom" />, value: `${tasksCreatedByMe}`, label: "criadas" },
    { icon: <CalendarDays className="w-4 h-4 text-mom" />, value: `${monthEvents.length}`, label: "eventos" },
    { icon: <LifeBuoy className="w-4 h-4 text-secondary" />, value: `${rescues}`, label: "resgates" },
    { icon: <Star className="w-4 h-4 text-mom" />, value: momRating ? `${momRating.stars}★` : "—", label: "avaliação" },
    { icon: <Trophy className="w-4 h-4 text-mom" />, value: `${monthPct}%`, label: "completas" },
    { icon: <Crown className="w-4 h-4 text-mom" />, value: `${children.length}`, label: "filhos" },
  ] : [
    { icon: <Flame className="w-4 h-4" style={{ color: "hsl(var(--arena-fire))" }} />, value: `${profile.streak_days}`, label: "sequência", color: "--arena-fire" },
    { icon: <Trophy className="w-4 h-4" style={{ color: "hsl(var(--arena-gold))" }} />, value: rankPos ? `#${rankPos}` : "—", label: "ranking", color: "--arena-gold" },
    { icon: <Star className="w-4 h-4" style={{ color: "hsl(var(--arena-electric))" }} />, value: momRating ? `${momRating.stars}★` : "—", label: "nota mãe", color: "--arena-electric" },
    { icon: <CheckSquare className="w-4 h-4" style={{ color: "hsl(var(--arena-neon))" }} />, value: `${monthPct}%`, label: "tarefas", color: "--arena-neon" },
    { icon: <CalendarDays className="w-4 h-4" style={{ color: "hsl(var(--arena-electric))" }} />, value: `${monthEvents.length}`, label: "eventos", color: "--arena-electric" },
    { icon: <LifeBuoy className="w-4 h-4" style={{ color: "hsl(var(--arena-fire))" }} />, value: `${rescues}`, label: "resgates", color: "--arena-fire" },
  ];

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-6">

      {/* Profile Header */}
      <ProfileHeader
        profile={profile} isMom={isMom} stats={stats}
        onEditName={handleEditName} onAvatarUpload={handleAvatarUpload}
        rescues={rescues} lastActiveHours={lastActiveHours} tasksCreatedByMe={tasksCreatedByMe}
      />

      {/* Secondary Stats */}
      <section className="grid grid-cols-3 gap-2.5">
        {(stats as any[]).slice(3).map((s: any, i: number) => (
          <Card key={i} className="border shadow-sm bg-white">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="font-display font-bold text-lg" style={!isMom ? { color: "hsl(var(--dad-accent))" } : undefined}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-body">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Level Progress (Dad only) */}
      {!isMom && <LevelProgress points={profile.points} />}

      {/* Redemption / Letters */}
      {!isMom && (
        <section>
          <RedemptionSection onOpenRedencao={() => setShowRedencao(true)} isMom={false} />
        </section>
      )}

      {!isMom && <section><CartasRecebidas /></section>}

      {/* Badges */}
      <section>
        {isMom
          ? <MomBadgesCarousel earnedKeys={earnedKeys} onSelect={setSelectedBadge} />
          : <DadBadgesCarousel earnedKeys={earnedKeys} onSelect={setSelectedBadge} />}
      </section>

      <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />

      {/* Pérolas (Mom) */}
      {isMom && (
        <section>
          <Card className="border-mom-border bg-mom-bg cursor-pointer hover:shadow-md transition-all hover:scale-[1.01]"
            onClick={() => navigate("/mural")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-mom shadow-md">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-sm text-mom-text">Mural de Pérolas 💎</p>
                <p className="text-[10px] text-muted-foreground font-body">Veja as maiores cabeçadas dos maridos</p>
              </div>
              <ChevronRight className="w-4 h-4 text-mom" />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Palpites History */}
      {(isMom || profile.role === "pai") && <PalpitesHistorySection />}

      {/* Mom Letters */}
      {isMom && (
        <section className="space-y-3">
          <RedemptionSection onOpenRedencao={() => setShowRedencao(true)} isMom={true} />
          <CartasRecebidas />
        </section>
      )}

      <Separator className="my-2" />

      {/* Family Connection */}
      <FamilyConnection profile={profile} isMom={isMom} allMembers={allMembers} />

      {/* Children */}
      <ChildrenSection
        children={children} isMom={isMom}
        familyId={profile.family_id}
      />

      <Separator className="my-2" />

      {/* Settings */}
      <SettingsSection
        profile={profile} isMom={isMom}
        rankPos={rankPos} monthPct={monthPct} rescues={rescues}
      />

    </div>
  );
}
