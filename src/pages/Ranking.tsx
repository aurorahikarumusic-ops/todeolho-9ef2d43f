import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useRanking } from "@/hooks/useProfile";
import { useIsMom, useFamilyPartner } from "@/hooks/useFamily";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { getDadTitle } from "@/lib/constants";
import { Trophy, Crown, Skull, Share2, Users, Plus, Copy, Flame, TrendingUp, Eye, Star, Heart } from "lucide-react";
import { startOfWeek } from "date-fns";
import { RATING_LABELS } from "@/lib/mom-constants";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { PodiumSection, MomPodiumSection } from "@/components/ranking/PodiumSection";
import { MyStatsBar, MomObserverBar, StarRating } from "@/components/ranking/StatsBar";
import { getPositionDescription, getMomPositionDescription, getShareText, getPositionStyle } from "@/components/ranking/RankingHelpers";

export default function Ranking() {
  const { user } = useAuth();
  const { data: myProfile } = useProfile();
  const { data: ranking = [], isLoading } = useRanking();
  const isMom = useIsMom();
  const { data: familyPartner } = useFamilyPartner();
  const queryClient = useQueryClient();
  const [showGroupSheet, setShowGroupSheet] = useState(false);
  const [showJoinSheet, setShowJoinSheet] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split("T")[0];

  const { data: momRatings = [] } = useQuery({
    queryKey: ["mom-ratings", weekStart],
    queryFn: async () => {
      const { data } = await supabase.from("mom_ratings").select("*").eq("week_start", weekStart);
      return data || [];
    },
  });

  const { data: myGroups = [] } = useQuery({
    queryKey: ["my-groups", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: memberships } = await supabase.from("ranking_group_members").select("group_id").eq("user_id", user.id);
      if (!memberships?.length) return [];
      const groupIds = memberships.map(m => m.group_id);
      const { data: groups } = await supabase.from("ranking_groups").select("*").in("id", groupIds);
      const groupsWithMembers = await Promise.all(
        (groups || []).map(async (group: any) => {
          const { data: members } = await supabase.from("ranking_group_members").select("user_id").eq("group_id", group.id);
          if (!members?.length) return { ...group, members: [] };
          const memberIds = members.map(m => m.user_id);
          const { data: profiles } = await supabase.from("profiles").select("id, display_name, points, streak_days, avatar_url").in("user_id", memberIds).order("points", { ascending: false });
          return { ...group, members: profiles || [] };
        })
      );
      return groupsWithMembers;
    },
    enabled: !!user,
  });

  const myPos = ranking.findIndex((r: any) => r.id === myProfile?.id);

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      const { data: group, error } = await supabase.from("ranking_groups").insert({ name: groupName, created_by: user.id }).select().single();
      if (error) throw error;
      await supabase.from("ranking_group_members").insert({ group_id: group.id, user_id: user.id });
      return group;
    },
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      setShowGroupSheet(false);
      setGroupName("");
      toast.success(`Grupo criado! Código: ${group.invite_code}`, { duration: 5000 });
    },
    onError: () => toast.error("Erro ao criar grupo."),
  });

  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      const { data: group } = await supabase.from("ranking_groups").select("id").eq("invite_code", joinCode.trim().toLowerCase()).single();
      if (!group) throw new Error("Código inválido");
      await supabase.from("ranking_group_members").insert({ group_id: group.id, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      setShowJoinSheet(false);
      setJoinCode("");
      toast.success(isMom ? "Entrou no grupo! Hora de monitorar. 👀" : "Entrou no grupo! Agora vamos ver quem é o pior pai. 😏");
    },
    onError: () => toast.error("Código inválido ou você já está no grupo."),
  });

  const handleShare = async () => {
    if (!myProfile || myPos < 0) return;
    const text = getShareText(myProfile.display_name, myPos, ranking.length, myProfile.points);
    await navigator.clipboard.writeText(text);
    toast.success("Copiado! Cola no WhatsApp e mostra que você serve pra algo. 📋");
  };

  const getRatingForUser = (targetUserId: string) => {
    return momRatings.find((r: any) => r.user_id === targetUserId);
  };

  const renderRankingList = (list: typeof ranking, startIdx = 3) => (
    <div className="space-y-2">
      {list.slice(startIdx).map((dad: any, i: number) => {
        const index = startIdx + i;
        const title = getDadTitle(dad.points);
        const isMe = myProfile?.id === dad.id;
        const isExpanded = expandedCard === dad.id;
        const rating = getRatingForUser(dad.user_id);
        const isLast = index === list.length - 1;

        return (
          <div
            key={dad.id}
            onClick={() => setExpandedCard(isExpanded ? null : dad.id)}
            className={`rounded-xl border p-3 cursor-pointer transition-all duration-300 ${isMe ? "ring-2 ring-primary/30" : ""}`}
            style={{
              ...getPositionStyle(index, isMom),
              borderColor: isMe ? "hsl(var(--dad-accent) / 0.3)" : isLast && list.length > 3 ? "hsl(var(--destructive) / 0.3)" : undefined,
              boxShadow: isExpanded ? "0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)" : undefined,
              transform: isExpanded ? "translate(-2px, -2px)" : "scale(1)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0" style={{
                background: isLast && list.length > 3 ? "hsl(var(--destructive) / 0.1)" : isMom ? "hsl(var(--mom-bg))" : "hsl(var(--dad-bg))",
                color: isLast && list.length > 3 ? "hsl(var(--destructive))" : isMom ? "hsl(var(--mom-text))" : "hsl(var(--dad-text))",
              }}>
                {index + 1}
              </div>

              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={dad.avatar_url || undefined} />
                <AvatarFallback className="font-display text-sm" style={{
                  background: isMom ? "hsl(var(--mom-bg))" : "hsl(var(--dad-bg))",
                  color: isMom ? "hsl(var(--mom-text))" : "hsl(var(--dad-text))",
                }}>{(dad.display_name || "P")[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-display font-bold text-sm truncate">{(dad.display_name || "Pai").split(" ")[0]}</p>
                  {isMe && (
                    <Badge className="text-[9px] px-1.5 py-0 border-0" style={{
                      background: isMom ? "hsl(var(--mom-accent) / 0.15)" : "hsl(var(--secondary) / 0.8)",
                      color: isMom ? "hsl(var(--mom-accent))" : "hsl(var(--secondary-foreground))",
                    }}>
                      {isMom ? "marido" : "você"}
                    </Badge>
                  )}
                  <span className="text-xs">{title.emoji}</span>
                </div>
                <p className="text-[10px] font-body italic truncate text-muted-foreground">
                  {isMom ? getMomPositionDescription(index, list.length) : getPositionDescription(index, list.length)}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-display font-bold text-base" style={{
                  color: isMom ? "hsl(var(--mom-accent))" : "hsl(var(--dad-accent))",
                }}>{dad.points}</p>
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>pts</span>
                  {dad.streak_days > 0 && (
                    <span className="text-[10px] flex items-center gap-0.5" style={{
                      color: isMom ? "hsl(var(--mom-accent) / 0.7)" : "hsl(var(--secondary))",
                    }}>
                      <Flame className="w-3 h-3" />{dad.streak_days}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-3 pt-3 space-y-2" style={{
                borderTop: "1px solid hsl(var(--border) / 0.3)",
                animation: "fadeSlideDown 0.3s ease-out",
              }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-body" style={{ color: "hsl(var(--muted-foreground))" }}>Título:</span>
                  <Badge variant="outline" className="text-[10px]" style={{
                    borderColor: isMom ? "hsl(var(--mom-border))" : "hsl(var(--dad-border))",
                    color: isMom ? "hsl(var(--mom-text))" : "hsl(var(--dad-text))",
                  }}>{title.emoji} {title.title}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-body" style={{ color: "hsl(var(--muted-foreground))" }}>Sequência:</span>
                  <span className="text-xs font-display font-bold" style={{ color: "hsl(var(--dad-text))" }}>{dad.streak_days} dias 🔥</span>
                </div>
                {rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-body" style={{ color: "hsl(var(--muted-foreground))" }}>Nota da mãe:</span>
                    <div className="flex items-center gap-1.5">
                      <StarRating stars={rating.stars} isMom={isMom} />
                      {rating.comment && <span className="text-[9px] italic" style={{ color: "hsl(var(--muted-foreground))" }}>"{rating.comment}"</span>}
                    </div>
                  </div>
                )}
                {isMom && !rating && (
                  <p className="text-[10px] italic text-center" style={{ color: "hsl(var(--mom-text) / 0.5)" }}>
                    Você ainda não avaliou esse pai. Vá em Avaliar. 📝
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="text-center relative">
        {isMom ? (
          <>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl" style={{
              background: "radial-gradient(circle, hsl(var(--mom-accent) / 0.1), transparent)",
            }} />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-lg" style={{
                background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.15), hsl(var(--mom-bg)))",
                boxShadow: "0 8px 32px hsl(var(--mom-accent) / 0.12), inset 0 2px 0 rgba(255,255,255,0.2)",
                border: "1px solid hsl(var(--mom-border) / 0.3)",
              }}>
                <Eye className="w-8 h-8" style={{ color: "hsl(var(--mom-accent))", filter: "drop-shadow(0 2px 4px hsl(var(--mom-accent) / 0.3))" }} />
              </div>
              <h1 className="font-display text-2xl font-bold mb-1" style={{
                background: "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(340 60% 45%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Painel de Vigilância</h1>
              <p className="text-sm font-body italic" style={{ color: "hsl(var(--mom-text) / 0.6)" }}>
                Observando, julgando e avaliando. Como sempre.
              </p>
            </div>
          </>
        ) : (
          <div className="relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl" style={{
              background: "radial-gradient(circle, hsl(var(--dad-accent) / 0.1), transparent)",
            }} />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-lg" style={{
                background: "linear-gradient(135deg, hsl(var(--dad-accent) / 0.15), hsl(var(--dad-bg)))",
                boxShadow: "0 8px 32px hsl(var(--dad-accent) / 0.12), inset 0 2px 0 rgba(255,255,255,0.2)",
                border: "1px solid hsl(var(--dad-border) / 0.3)",
              }}>
                <Trophy className="w-8 h-8" style={{ color: "hsl(var(--dad-accent))", filter: "drop-shadow(0 2px 4px hsl(var(--dad-accent) / 0.3))" }} />
              </div>
              <h1 className="font-display text-2xl font-bold mb-1" style={{
                background: "linear-gradient(135deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>⚔️ O Mural da Vergonha</h1>
              <p className="text-sm font-body italic text-muted-foreground">
                {myPos >= 0 ? myPos <= 2 ? "🔥 Você tá no pódio. Não estraga agora." : `⚡ Posição #${myPos + 1}. Hora de escalar.` : "Entre na arena fazendo alguma coisa, pai."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      {isMom ? (
        <MomObserverBar ranking={ranking} partnerProfile={familyPartner ? (ranking.find((r: any) => r.user_id === familyPartner.user_id) || familyPartner) : null} />
      ) : (
        myProfile && myPos >= 0 && <MyStatsBar profile={myProfile} position={myPos} total={ranking.length} />
      )}

      {/* Tabs */}
      <Tabs defaultValue="geral">
        <TabsList className="w-full grid grid-cols-3 h-11" style={isMom ? {
          background: "hsl(var(--mom-bg))",
          border: "1px solid hsl(var(--mom-border) / 0.3)",
        } : undefined}>
          <TabsTrigger value="geral" className="text-xs font-display gap-1" style={isMom ? { color: "hsl(var(--mom-text))" } : undefined}>
            {isMom ? <Eye className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />}
            {isMom ? "Vigilância" : "Geral"}
          </TabsTrigger>
          <TabsTrigger value="amigos" className="text-xs font-display gap-1">
            <Users className="w-3.5 h-3.5" /> Amigos
          </TabsTrigger>
          <TabsTrigger value="familia" className="text-xs font-display gap-1">
            {isMom ? <Heart className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
            Família
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: isMom ? "hsl(var(--mom-bg))" : "hsl(var(--muted))" }} />
              ))}
            </div>
          ) : ranking.length === 0 ? (
            <Card className="border-dashed" style={isMom ? { borderColor: "hsl(var(--mom-border))" } : undefined}>
              <CardContent className="py-10 text-center">
                {isMom ? (
                  <>
                    <Eye className="w-12 h-12 mx-auto mb-3" style={{ color: "hsl(var(--mom-accent) / 0.4)" }} />
                    <p className="font-display text-lg font-bold mb-1">Ninguém pra vigiar ainda</p>
                    <p className="text-sm font-body italic" style={{ color: "hsl(var(--mom-text) / 0.6)" }}>Convide o pai pra entrar.</p>
                  </>
                ) : (
                  <>
                    <Skull className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-display text-lg font-bold mb-1">Você é o único pai aqui</p>
                    <p className="text-sm text-muted-foreground font-body italic mb-4">1° e último ao mesmo tempo.</p>
                    <Button variant="outline" size="sm" onClick={() => {
                      const text = "Entrei no 'Estou de Olho', app que tira sarro de pai ausente 😂\nhttps://estoudeolho.lovable.app";
                      navigator.clipboard.writeText(text);
                      toast("Link copiado!");
                    }}>
                      <Users className="w-4 h-4 mr-2" /> Convidar outros pais
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {isMom ? <MomPodiumSection ranking={ranking} /> : <PodiumSection ranking={ranking} myProfile={myProfile} />}
              {ranking.length > 3 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1" style={{ background: isMom ? "hsl(var(--mom-border) / 0.3)" : "hsl(var(--border))" }} />
                    <span className="text-[10px] font-body uppercase tracking-wider" style={{
                      color: isMom ? "hsl(var(--mom-text) / 0.5)" : "hsl(var(--muted-foreground))",
                    }}>{isMom ? "Os demais suspeitos" : "Restante da galera"}</span>
                    <div className="h-px flex-1" style={{ background: isMom ? "hsl(var(--mom-border) / 0.3)" : "hsl(var(--border))" }} />
                  </div>
                  {renderRankingList(ranking)}
                </div>
              )}
              {ranking.length > 3 && (
                <div className="rounded-2xl p-3 text-center relative overflow-hidden" style={isMom ? {
                  background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.05), hsl(var(--card)))",
                  border: "1px solid hsl(var(--mom-border) / 0.2)",
                } : {
                  background: "linear-gradient(135deg, hsl(var(--destructive) / 0.05), hsl(var(--card)))",
                  border: "1px solid hsl(var(--destructive) / 0.2)",
                }}>
                  <p className="text-2xl mb-1">{isMom ? "👀" : "💀"}</p>
                  <p className="font-display font-bold text-xs" style={{
                    color: isMom ? "hsl(var(--mom-accent))" : "hsl(var(--destructive))",
                  }}>{isMom ? "Caso Perdido" : "⚰️ Hall da Vergonha Eterna"}</p>
                  <p className="text-[10px] font-body italic" style={{
                    color: isMom ? "hsl(var(--mom-text) / 0.5)" : "hsl(var(--dad-accent-hover))",
                  }}>
                    {ranking[ranking.length - 1]?.display_name?.split(" ")[0]} ocupa essa posição {isMom ? "preocupante" : "nobre"}.
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="amigos" className="mt-4 space-y-3">
          {myGroups.length === 0 ? (
            <Card className="border-dashed" style={isMom ? { borderColor: "hsl(var(--mom-border))" } : undefined}>
              <CardContent className="py-8 text-center">
                <Users className="w-10 h-10 mx-auto mb-3" style={{ color: isMom ? "hsl(var(--mom-accent) / 0.4)" : "hsl(var(--muted-foreground))" }} />
                <p className="font-display font-bold mb-1">Nenhum grupo ainda</p>
                <p className="text-xs font-body italic mb-4" style={{ color: isMom ? "hsl(var(--mom-text) / 0.6)" : "hsl(var(--muted-foreground))" }}>
                  {isMom ? "Crie um grupo de mães ou monitore outros pais." : "Crie um grupo ou entre com um código."}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" onClick={() => setShowGroupSheet(true)} style={isMom ? {
                    background: "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(340 65% 50%))", color: "white",
                  } : undefined}>
                    <Plus className="w-4 h-4 mr-1" /> Criar grupo
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowJoinSheet(true)}>Entrar com código</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowGroupSheet(true)}><Plus className="w-3.5 h-3.5 mr-1" /> Novo grupo</Button>
                <Button size="sm" variant="outline" onClick={() => setShowJoinSheet(true)}>Entrar com código</Button>
              </div>
              {myGroups.map((group: any) => (
                <div key={group.id} className="rounded-xl p-4" style={{
                  border: `1px solid ${isMom ? "hsl(var(--mom-border) / 0.3)" : "hsl(var(--border))"}`,
                }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-display font-bold text-sm">{group.name}</p>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                      navigator.clipboard.writeText(group.invite_code);
                      toast("Código copiado: " + group.invite_code);
                    }}>
                      <Copy className="w-3 h-3 mr-1" /> {group.invite_code}
                    </Button>
                  </div>
                  {group.members?.length > 0 ? (
                    <div className="space-y-2">
                      {group.members.map((member: any, idx: number) => (
                        <div key={member.id} className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{
                          background: member.id === myProfile?.id ? (isMom ? "hsl(var(--mom-accent) / 0.05)" : "hsl(var(--primary) / 0.05)") : undefined,
                        }}>
                          <span className="font-display font-bold text-xs w-5 text-center text-muted-foreground">{idx === 0 ? "👑" : `${idx + 1}`}</span>
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback className="text-xs font-display font-bold">{(member.display_name || "P")[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-display font-bold truncate">
                              {(member.display_name || "Pai").split(" ")[0]}
                              {member.id === myProfile?.id && <span className="ml-1" style={{ color: "hsl(var(--secondary))" }}>(você)</span>}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-display font-bold text-xs" style={{ color: "hsl(var(--primary))" }}>{member.points}pts</p>
                            {member.streak_days > 0 && <p className="text-[9px]" style={{ color: "hsl(var(--secondary))" }}>🔥{member.streak_days}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] font-body italic text-muted-foreground">Sem membros ainda.</p>
                  )}
                </div>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="familia" className="mt-4 space-y-4">
          <div className="rounded-2xl overflow-hidden" style={{
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            background: "linear-gradient(160deg, hsl(var(--card)), hsl(var(--background)))",
          }}>
            <div className="px-6 py-4 relative overflow-hidden" style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.06))",
              borderBottom: "1px solid hsl(var(--border) / 0.5)",
            }}>
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))",
                  border: "1px solid hsl(var(--primary) / 0.15)",
                }}>
                  <Star className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">{isMom ? "Seu Veredito Semanal" : "Avaliação da Família"}</h3>
                  <p className="text-[11px] font-body text-muted-foreground">Semana de {weekStart.split("-").reverse().slice(0, 2).join("/")}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              {(() => {
                const rating = myProfile ? getRatingForUser(myProfile.user_id) : null;
                if (rating) {
                  const label = RATING_LABELS[rating.stars] || "";
                  return (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className="w-7 h-7 transition-all" style={{
                              color: s <= rating.stars ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground) / 0.2)",
                              fill: s <= rating.stars ? "hsl(var(--secondary))" : "none",
                              filter: s <= rating.stars ? "drop-shadow(0 2px 4px hsl(var(--secondary) / 0.3))" : "none",
                            }} />
                          ))}
                        </div>
                        <span className="font-display font-bold text-lg" style={{
                          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}>{rating.stars}/5</span>
                      </div>
                      <div className="flex justify-center">
                        <span className="px-4 py-1.5 rounded-full text-xs font-display font-bold" style={{
                          background: rating.stars >= 4 ? "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05))" : rating.stars >= 3 ? "hsl(var(--secondary) / 0.1)" : "hsl(var(--destructive) / 0.08)",
                          color: rating.stars >= 4 ? "hsl(var(--primary))" : rating.stars >= 3 ? "hsl(var(--secondary))" : "hsl(var(--destructive))",
                          border: `1px solid ${rating.stars >= 4 ? "hsl(var(--primary) / 0.15)" : rating.stars >= 3 ? "hsl(var(--secondary) / 0.2)" : "hsl(var(--destructive) / 0.15)"}`,
                        }}>{label}</span>
                      </div>
                      {rating.comment && (
                        <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--muted) / 0.4)", border: "1px solid hsl(var(--border) / 0.5)" }}>
                          <p className="text-xs font-body italic text-muted-foreground">"{rating.comment}"</p>
                        </div>
                      )}
                      <p className="text-[10px] text-center font-body" style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}>
                        {isMom ? "Você avaliou esta semana ✓" : "Avaliação publicada pela mãe ✓"}
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-7 h-7" style={{ color: "hsl(var(--muted-foreground) / 0.15)", fill: "none" }} />
                      ))}
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-display font-bold text-sm text-muted-foreground">{isMom ? "Avaliação pendente" : "Aguardando nota"}</p>
                      <p className="text-xs font-body italic" style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}>
                        {isMom ? "Vá em Avaliar para dar sua nota semanal. 📝" : "A mãe avalia toda semana. Torça pelo melhor."}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Share */}
      {!isMom && myPos >= 0 && ranking.length > 1 && (
        <Button className="w-full font-display gap-2 border-0" style={{
          background: "linear-gradient(135deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))", color: "white",
        }} onClick={handleShare}>
          <Share2 className="w-4 h-4" /> Compartilhar meu ranking
        </Button>
      )}

      {isMom && ranking.length > 0 && (
        <Button className="w-full font-display gap-2 border-0" style={{
          background: "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(340 65% 50%))", color: "white",
        }} onClick={() => {
          const text = `👁️ Estou de Olho no ranking dos pais!\n${ranking.length} pais monitorados.\n😏 Baixe: https://estoudeolho.lovable.app`;
          navigator.clipboard.writeText(text);
          toast.success("Copiado!");
        }}>
          <Share2 className="w-4 h-4" /> Compartilhar vigilância
        </Button>
      )}

      {/* Sheets */}
      <Sheet open={showGroupSheet} onOpenChange={setShowGroupSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader><SheetTitle className="font-display text-lg">Criar Grupo</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground font-body mb-2">Sugestões:</p>
              <div className="flex flex-wrap gap-2">
                {(isMom ? ["Mães Vigilantes", "Clube das Mães", "Grupo do Zap das Mães", "As Fiscais"] : ["Pais da Escola", "Pais do Bairro", "Os Pais da Firma", "Turma do Futebol"]).map(s => (
                  <Badge key={s} variant="outline" className="cursor-pointer hover:bg-accent text-xs" onClick={() => setGroupName(s)}>{s}</Badge>
                ))}
              </div>
            </div>
            <Input placeholder="Nome do grupo" value={groupName} onChange={e => setGroupName(e.target.value)} />
            <Button className="w-full font-display" style={{ background: "hsl(var(--primary))" }} onClick={() => createGroupMutation.mutate()} disabled={!groupName || createGroupMutation.isPending}>
              {createGroupMutation.isPending ? "Criando..." : "Criar Grupo"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showJoinSheet} onOpenChange={setShowJoinSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader><SheetTitle className="font-display text-lg">Entrar em um Grupo</SheetTitle></SheetHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Código do grupo (ex: a1b2c3d4)" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
            <Button className="w-full font-display" style={{ background: "hsl(var(--primary))" }} onClick={() => joinGroupMutation.mutate()} disabled={!joinCode || joinGroupMutation.isPending}>
              {joinGroupMutation.isPending ? "Entrando..." : "Entrar no Grupo"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 200px; }
        }
      `}</style>
    </div>
  );
}
