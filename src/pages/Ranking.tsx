import { useRanking, useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDadTitle, RANKING_DESCRIPTIONS } from "@/lib/constants";
import { Trophy, Medal, Crown, Skull } from "lucide-react";

export default function Ranking() {
  const { data: ranking, isLoading } = useRanking();
  const { data: myProfile } = useProfile();

  const getPositionIcon = (pos: number) => {
    if (pos === 0) return <Crown className="w-6 h-6 text-accent-foreground" />;
    if (pos === 1) return <Medal className="w-6 h-6 text-muted-foreground" />;
    if (pos === 2) return <Medal className="w-6 h-6 text-secondary" />;
    return <span className="w-6 h-6 flex items-center justify-center font-display font-bold text-muted-foreground">{pos + 1}</span>;
  };

  const getDescription = (pos: number, total: number) => {
    if (pos === 0) return RANKING_DESCRIPTIONS[0];
    if (pos === 1) return RANKING_DESCRIPTIONS[1];
    if (pos === 2) return RANKING_DESCRIPTIONS[2];
    if (pos === total - 1) return RANKING_DESCRIPTIONS[4];
    return RANKING_DESCRIPTIONS[3];
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-secondary" />
        <div>
          <h1 className="font-display text-2xl font-bold">Ranking dos Pais</h1>
          <p className="font-body text-sm text-muted-foreground">
            Quem esquece menos, ganha mais. A barra é essa.
          </p>
        </div>
      </div>

      {/* My Position */}
      {myProfile && myProfile.role === "pai" && ranking && (
        <Card className="mb-4 border-2 border-primary bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-display text-xl font-bold text-primary">
                #{(ranking.findIndex(r => r.id === myProfile.id) + 1) || "?"}
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-foreground">
                  Sua posição
                </p>
                <p className="text-sm text-muted-foreground font-body">
                  {myProfile.points} pontos • {getDadTitle(myProfile.points).emoji} {getDadTitle(myProfile.points).title}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-0 shadow-sm animate-pulse">
                <CardContent className="pt-4 pb-4">
                  <div className="h-14 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : ranking && ranking.length > 0 ? (
          ranking.map((dad, index) => {
            const title = getDadTitle(dad.points);
            const isMe = myProfile?.id === dad.id;
            return (
              <Card
                key={dad.id}
                className={`border-0 shadow-sm transition-all ${
                  isMe ? "ring-2 ring-primary" : ""
                } ${index === 0 ? "bg-accent/30" : ""}`}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    {getPositionIcon(index)}
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                      {title.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-sm truncate">
                          {dad.display_name?.split(" ")[0] || "Pai Anônimo"}
                        </p>
                        {isMe && (
                          <Badge className="text-xs font-body bg-primary">Você</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-body italic">
                        {getDescription(index, ranking.length)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-primary">{dad.points}</p>
                      <p className="text-xs text-muted-foreground font-body">pts</p>
                    </div>
                  </div>
                  {dad.streak_days > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-secondary font-body">
                      🔥 {dad.streak_days} dias de sequência
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-8 pb-8 text-center">
              <Skull className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display text-lg font-bold text-foreground mb-1">
                Nenhum pai no ranking
              </p>
              <p className="text-sm text-muted-foreground font-body">
                Parece que ninguém quis ser avaliado. Que conveniente.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hall da Vergonha teaser */}
      <Card className="mt-6 border-0 bg-secondary/10">
        <CardContent className="pt-4 pb-4 text-center">
          <p className="font-display text-sm font-bold text-secondary">
            🏚️ Hall da Vergonha
          </p>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Último lugar no fim do mês ganha "destaque" especial. Boa sorte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
