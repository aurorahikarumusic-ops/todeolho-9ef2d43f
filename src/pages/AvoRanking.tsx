import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGrandmaRanking } from "@/hooks/useGrandmaSuggestions";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Trophy, Share2, Sparkles, MessageSquare, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

const PODIUM_PHRASES = [
  "Quem dá mais palpite merece o trono! 👑",
  "Na minha época avó não precisava de ranking...",
  "A melhor palpiteira do app! 🏆",
];

export default function AvoRanking() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: ranking = [] } = useGrandmaRanking();
  const [animate, setAnimate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(t);
  }, []);

  const myPos = ranking.findIndex((r) => r.user_id === user?.id);
  const myStats = myPos >= 0 ? ranking[myPos] : null;
  const myTitle = myStats ? getGrandmaTitle(myStats.total) : GRANDMA_TITLES[0];

  const handleShare = () => {
    const posLabel = myPos >= 0 ? `#${myPos + 1}` : "—";
    const text = `👵 Sou a avó ${posLabel} no ranking de palpiteiras do *Estou de Olho* 👁️\n${myStats?.total || 0} palpites dados! ${myStats?.accepted || 0} aceitos!\n\nBaixe: https://estoudeolho.lovable.app`;
    navigator.clipboard.writeText(text);
    toast.success("Copiado! Manda no grupo da família, vovó! 📋");
  };

  if (ranking.length === 0) {
    return (
      <div className="p-4 max-w-lg mx-auto pb-24">
        <div className="text-center py-12">
          <span className="text-6xl block mb-4">👵</span>
          <h1 className="font-display text-2xl font-bold text-avo">Ranking das Avós</h1>
          <p className="font-body text-muted-foreground mt-2">
            Nenhuma avó palpiteira ainda... Que mundo é esse?
          </p>
        </div>
      </div>
    );
  }

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-avo flex items-center justify-center gap-2">
          <Trophy className="w-7 h-7" /> Ranking das Avós
        </h1>
        <p className="font-body text-sm text-muted-foreground italic mt-1">
          {PODIUM_PHRASES[Math.floor(Math.random() * PODIUM_PHRASES.length)]}
        </p>
      </div>

      {/* My position card */}
      {myStats && (
        <Card className="border-2 border-avo bg-gradient-to-r from-avo-bg to-white overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-avo/20 flex items-center justify-center text-2xl border-2 border-avo">
                {myTitle.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-lg text-avo">#{myPos + 1}</span>
                  <Badge className="bg-avo text-white text-[10px]">{myTitle.title}</Badge>
                </div>
                <div className="flex gap-3 mt-1 text-xs font-body text-muted-foreground">
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {myStats.total} palpites</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> {myStats.accepted} aceitos</span>
                  <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> {myStats.rejected} recusados</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Podium 3D */}
      <div className="relative" style={{ perspective: "800px" }}>
        <div className="flex items-end justify-center gap-3 pt-8 pb-4">
          {podiumOrder.map((avo, visualIdx) => {
            const actualPos = visualIdx === 0 ? 1 : visualIdx === 1 ? 0 : 2;
            if (!avo) return null;
            const heights = ["h-28", "h-36", "h-24"];
            const medals = ["🥈", "🥇", "🥉"];
            const scales = ["scale-95", "scale-105", "scale-90"];
            const title = getGrandmaTitle(avo.total);
            const isMe = avo.user_id === user?.id;

            return (
              <div
                key={avo.user_id}
                className={`flex flex-col items-center transition-all duration-700 ${scales[visualIdx]} ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  transitionDelay: `${visualIdx * 150}ms`,
                  transform: animate ? `${scales[visualIdx]} rotateX(2deg)` : undefined,
                }}
              >
                {/* Avatar */}
                <div className={`relative mb-2 ${isMe ? "ring-2 ring-avo ring-offset-2" : ""} rounded-full`}>
                  <Avatar className="w-14 h-14 border-2 border-avo-border">
                    <AvatarImage src={avo.avatar_url || undefined} />
                    <AvatarFallback className="bg-avo/20 text-avo font-display text-lg">
                      {(avo.display_name || "V")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -top-2 -right-2 text-xl">{medals[visualIdx]}</span>
                </div>

                {/* Name */}
                <p className="font-body font-semibold text-xs text-center truncate max-w-[80px]">
                  {avo.display_name?.split(" ")[0] || "Vovó"}
                </p>
                <p className="text-[10px] text-muted-foreground">{avo.total} palpites</p>

                {/* Podium block */}
                <div
                  className={`${heights[visualIdx]} w-20 rounded-t-xl mt-2 flex flex-col items-center justify-start pt-3 border-2 border-avo-border relative overflow-hidden`}
                  style={{
                    background: `linear-gradient(to bottom, hsl(var(--avo-bg)), hsl(var(--avo-border)))`,
                    boxShadow: "0 8px 24px -4px hsl(270 60% 55% / 0.2), inset 0 2px 0 hsl(var(--avo-bg))",
                  }}
                >
                  <span className="text-2xl font-display font-bold text-avo">{actualPos + 1}</span>
                  <span className="text-[9px] text-avo-text font-body mt-1">{title.emoji}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rest of ranking */}
      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map((avo, i) => {
            const pos = i + 3;
            const title = getGrandmaTitle(avo.total);
            const isMe = avo.user_id === user?.id;

            return (
              <div
                key={avo.user_id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isMe ? "bg-avo-bg border-2 border-avo" : "bg-card border border-border"
                }`}
              >
                <span className="font-display font-bold text-lg text-avo w-8 text-center">
                  {pos + 1}
                </span>
                <Avatar className="w-10 h-10 border-2 border-avo-border">
                  <AvatarImage src={avo.avatar_url || undefined} />
                  <AvatarFallback className="bg-avo/20 text-avo font-display">
                    {(avo.display_name || "V")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-sm truncate">{avo.display_name || "Vovó"}</span>
                    <span className="text-xs">{title.emoji}</span>
                  </div>
                  <div className="flex gap-2 text-[10px] font-body text-muted-foreground">
                    <span>💬 {avo.total}</span>
                    <span>✅ {avo.accepted}</span>
                    <span>❌ {avo.rejected}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share */}
      {myPos >= 0 && (
        <Button
          onClick={handleShare}
          className="w-full font-display gap-2 bg-avo hover:bg-avo/80 text-white"
          style={{ boxShadow: "0 4px 16px hsl(270 60% 55% / 0.3)" }}
        >
          <Share2 className="w-4 h-4" /> Compartilhar meu ranking de vovó
        </Button>
      )}
    </div>
  );
}
