import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useRanking } from "@/hooks/useProfile";
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
import { Trophy, Crown, Medal, Skull, Share2, Users, Plus, Copy } from "lucide-react";
import { startOfWeek } from "date-fns";

function getPositionDescription(pos: number, total: number): string {
  if (total <= 1) return "Único pai aqui. Primeiro e último ao mesmo tempo.";
  if (pos === 0) return "Fez tudo. Suspeito. Mas parabéns.";
  if (pos === 1) return "Chegou no 2° por acidente. Mas chegou.";
  if (pos === 2) return "Tentou. Mais ou menos. Tá no pódio.";
  if (pos <= 4) return "Quase no pódio. Quase.";
  if (pos <= 9) return "No meio. Nem bom, nem ruim. Mediano.";
  if (pos <= 14) return "Passando despercebido. Como em casa.";
  if (pos <= 19) return "Existindo. Isso conta (pouco).";
  if (pos === total - 1) return "Último. Guardamos esse momento pra sempre.";
  if (pos >= total - 3) return "Última fila. Tem gente olhando.";
  return "Tá aí. É o que importa.";
}

function getHeaderSubtitle(myPos: number | null, total: number): string {
  if (myPos === null) return "Você ainda não entrou no ranking. Faz algo, pai.";
  if (myPos <= 2) return "Você tá no pódio. Não estraga.";
  if (myPos === total - 1) return "Último lugar. Mas pelo menos você aparece aqui.";
  return `Você tá em #${myPos + 1}. Dá pra subir. Dá.`;
}

function getShareText(name: string, pos: number, total: number, pts: number): string {
  const posLabel = `#${pos + 1}`;
  if (pos <= 2) return `Tô no pódio dos pais no Estou de Olho 👁️\nPosição ${posLabel} com ${pts} pontos.\nSim, eu. Guarda esse print.`;
  if (pos === total - 1) return `Último lugar no ranking dos pais no Estou de Olho 👁️\n${pts} pontos. Mas apareço. Isso conta.`;
  return `Posição ${posLabel} no ranking dos pais no Estou de Olho 👁️\n${pts} pontos. Tô melhorando. (Devagar.)`;
}

const StarRating = ({ stars }: { stars: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`text-xs ${i <= stars ? "text-accent-foreground" : "text-muted-foreground/30"}`}>★</span>
    ))}
  </div>
);

export default function Ranking() {
  const { user } = useAuth();
  const { data: myProfile } = useProfile();
  const { data: ranking = [], isLoading } = useRanking();
  const queryClient = useQueryClient();
  const [showGroupSheet, setShowGroupSheet] = useState(false);
  const [showJoinSheet, setShowJoinSheet] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split("T")[0];

  // Mom ratings for current week
  const { data: momRatings = [] } = useQuery({
    queryKey: ["mom-ratings", weekStart],
    queryFn: async () => {
      const { data } = await supabase
        .from("mom_ratings")
        .select("*")
        .eq("week_start", weekStart);
      return data || [];
    },
  });

  // Groups
  const { data: myGroups = [] } = useQuery({
    queryKey: ["my-groups", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: memberships } = await supabase
        .from("ranking_group_members")
        .select("group_id")
        .eq("user_id", user.id);
      if (!memberships?.length) return [];
      const groupIds = memberships.map(m => m.group_id);
      const { data: groups } = await supabase
        .from("ranking_groups")
        .select("*")
        .in("id", groupIds);
      return groups || [];
    },
    enabled: !!user,
  });

  const myPos = ranking.findIndex(r => r.id === myProfile?.id);
  const firstPlace = ranking[0];
  const lastPlace = ranking.length > 1 ? ranking[ranking.length - 1] : null;

  // Create group
  const createGroupMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      const { data: group, error } = await supabase
        .from("ranking_groups")
        .insert({ name: groupName, created_by: user.id })
        .select()
        .single();
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

  // Join group
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      const { data: group } = await supabase
        .from("ranking_groups")
        .select("id")
        .eq("invite_code", joinCode.trim().toLowerCase())
        .single();
      if (!group) throw new Error("Código inválido");
      await supabase.from("ranking_group_members").insert({ group_id: group.id, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      setShowJoinSheet(false);
      setJoinCode("");
      toast.success("Entrou no grupo! Agora vamos ver quem é o pior pai. 😏");
    },
    onError: () => toast.error("Código inválido ou você já está no grupo."),
  });

  const handleShare = async () => {
    if (!myProfile || myPos < 0) return;
    const text = getShareText(myProfile.display_name, myPos, ranking.length, myProfile.points);
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado! Cola onde quiser.");
    }
  };

  const getPositionIcon = (pos: number) => {
    if (pos === 0) return <Crown className="w-6 h-6 text-accent-foreground" />;
    if (pos === 1) return <Medal className="w-6 h-6 text-muted-foreground" />;
    if (pos === 2) return <Medal className="w-6 h-6 text-secondary" />;
    return <span className="w-6 h-6 flex items-center justify-center font-display font-bold text-sm text-muted-foreground">{pos + 1}</span>;
  };

  const getRatingForUser = (userId: string) => {
    const rating = momRatings.find((r: any) => r.user_id === userId);
    return rating;
  };

  const renderRankingList = (list: typeof ranking) => (
    <div className="space-y-2.5">
      {list.map((dad, index) => {
        const title = getDadTitle(dad.points);
        const isMe = myProfile?.id === dad.id;
        const rating = getRatingForUser(dad.id);

        return (
          <Card
            key={dad.id}
            className={`border-0 shadow-sm transition-all ${isMe ? "border-l-4 border-l-secondary ring-1 ring-primary/20" : ""} ${index === 0 ? "bg-accent/20" : ""}`}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                {getPositionIcon(index)}
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-base shrink-0">
                  {title.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-sm truncate">
                      {(dad.display_name || "Pai").split(" ")[0]}
                      {dad.display_name?.split(" ")[1] ? ` ${dad.display_name.split(" ")[1][0]}.` : ""}
                    </p>
                    {isMe && <Badge className="text-[10px] bg-secondary text-secondary-foreground">← Você</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-body italic">
                    {getPositionDescription(index, list.length)}
                  </p>
                  {/* Mom rating */}
                  {rating ? (
                    <div className="mt-1">
                      <div className="flex items-center gap-1.5">
                        <StarRating stars={rating.stars} />
                        <span className="text-[9px] text-muted-foreground">Nota da mãe</span>
                      </div>
                      {rating.comment && (
                        <p className="text-[9px] italic text-muted-foreground mt-0.5">"{rating.comment}"</p>
                      )}
                    </div>
                  ) : isMe ? (
                    <p className="text-[9px] italic text-muted-foreground mt-1">A mãe ainda não avaliou. Boa sorte.</p>
                  ) : null}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-primary text-sm">{dad.points}</p>
                  <p className="text-[10px] text-muted-foreground">pts</p>
                  {dad.streak_days > 0 && (
                    <p className="text-[10px] text-secondary">🔥{dad.streak_days}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-6 h-6 text-secondary" />
          <h1 className="font-display text-2xl font-bold">O Mural da Vergonha</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body italic">
          {getHeaderSubtitle(myPos >= 0 ? myPos : null, ranking.length)}
        </p>
      </div>

      {/* Trophy + Hall da Vergonha cards */}
      {ranking.length > 1 && (
        <div className="grid grid-cols-2 gap-3">
          {/* Pai do Mês */}
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-3 text-center">
              <p className="text-2xl mb-1">👑</p>
              <p className="font-display font-bold text-xs truncate">
                {firstPlace?.display_name?.split(" ")[0] || "—"}
              </p>
              <p className="text-[10px] text-primary font-body font-semibold">Pai do Mês</p>
              <p className="text-xs font-display font-bold text-primary mt-1">{firstPlace?.points}pts</p>
            </CardContent>
          </Card>

          {/* Hall da Vergonha */}
          {lastPlace && (
            <Card className="bg-secondary/10 border-secondary/20">
              <CardContent className="p-3 text-center">
                <p className="text-2xl mb-1">😬</p>
                <p className="font-display font-bold text-xs truncate">
                  {lastPlace.display_name?.split(" ")[0] || "—"}
                </p>
                <p className="text-[10px] text-secondary font-body font-semibold">Hall da Vergonha</p>
                <p className="text-xs font-display font-bold text-secondary mt-1">{lastPlace.points}pts</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="geral">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="geral" className="text-xs font-display">Geral</TabsTrigger>
          <TabsTrigger value="amigos" className="text-xs font-display">Amigos</TabsTrigger>
          <TabsTrigger value="familia" className="text-xs font-display">Família</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border-0 shadow-sm animate-pulse">
                  <CardContent className="py-4"><div className="h-12 bg-muted rounded" /></CardContent>
                </Card>
              ))}
            </div>
          ) : ranking.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <Skull className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-display text-lg font-bold mb-1">Você é o único pai aqui</p>
                <p className="text-sm text-muted-foreground font-body italic mb-4">
                  Você está em 1° lugar. E em último. Ao mesmo tempo.
                  <br />Convida alguém logo.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = "Entrei no 'Estou de Olho', app que tira sarro de pai ausente 😂\nVamos ver quem é o pior pai.\nhttps://estoudeolho.lovable.app";
                    if (navigator.share) navigator.share({ text });
                    else { navigator.clipboard.writeText(text); toast("Link copiado!"); }
                  }}
                >
                  <Users className="w-4 h-4 mr-2" /> Convidar outros pais
                </Button>
              </CardContent>
            </Card>
          ) : (
            renderRankingList(ranking)
          )}
        </TabsContent>

        <TabsContent value="amigos" className="mt-3 space-y-3">
          {myGroups.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-display font-bold mb-1">Nenhum grupo ainda</p>
                <p className="text-xs text-muted-foreground font-body italic mb-4">
                  Crie um grupo ou entre com um código. A competição fica melhor entre amigos.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" onClick={() => setShowGroupSheet(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Criar grupo
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowJoinSheet(true)}>
                    Entrar com código
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowGroupSheet(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Novo grupo
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowJoinSheet(true)}>
                  Entrar com código
                </Button>
              </div>
              {myGroups.map((group: any) => (
                <Card key={group.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-display font-bold text-sm">{group.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(group.invite_code);
                          toast("Código copiado: " + group.invite_code);
                        }}
                      >
                        <Copy className="w-3 h-3 mr-1" /> {group.invite_code}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-body italic">
                      Compartilha o código com os pais do grupo.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="familia" className="mt-3">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-3xl mb-3">👨‍👩‍👧‍👦</p>
              <p className="font-display font-bold mb-1">Avaliação da Família</p>
              {myProfile && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-body">Nota da mãe:</span>
                    {getRatingForUser(myProfile.id) ? (
                      <StarRating stars={getRatingForUser(myProfile.id)!.stars} />
                    ) : (
                      <span className="text-xs italic text-muted-foreground">Ainda não avaliou</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-body italic">
                    A mãe avalia toda semana. Torça pelo melhor. Ou pelo menos por um 3.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share button — only show when more than 1 participant */}
      {myPos >= 0 && ranking.length > 1 && (
        <Button
          className="w-full bg-secondary text-secondary-foreground font-display"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          📤 Compartilhar meu ranking
        </Button>
      )}

      {/* Create Group Sheet */}
      <Sheet open={showGroupSheet} onOpenChange={setShowGroupSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Criar Grupo</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground font-body mb-2">Sugestões:</p>
              <div className="flex flex-wrap gap-2">
                {["Pais da Escola", "Pais do Bairro", "Os Pais da Firma", "Turma do Futebol"].map(s => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent text-xs"
                    onClick={() => setGroupName(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <Input
              placeholder="Nome do grupo"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
            />
            <Button
              className="w-full bg-primary font-display"
              onClick={() => createGroupMutation.mutate()}
              disabled={!groupName || createGroupMutation.isPending}
            >
              {createGroupMutation.isPending ? "Criando..." : "Criar Grupo"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Join Group Sheet */}
      <Sheet open={showJoinSheet} onOpenChange={setShowJoinSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Entrar em um Grupo</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Código do grupo (ex: a1b2c3d4)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
            />
            <Button
              className="w-full bg-primary font-display"
              onClick={() => joinGroupMutation.mutate()}
              disabled={!joinCode || joinGroupMutation.isPending}
            >
              {joinGroupMutation.isPending ? "Entrando..." : "Entrar no Grupo"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
