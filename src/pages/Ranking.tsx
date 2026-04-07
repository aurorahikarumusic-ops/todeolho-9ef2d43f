import { useState, useEffect } from "react";
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
import { Trophy, Crown, Medal, Skull, Share2, Users, Plus, Copy, Flame, TrendingUp, Zap, ChevronUp, ChevronDown, Eye, Star, Sparkles, Heart } from "lucide-react";
import { startOfWeek } from "date-fns";
import { RATING_LABELS } from "@/lib/mom-constants";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function getPositionDescription(pos: number, total: number): string {
  if (total <= 1) return "Único pai aqui. Primeiro e último ao mesmo tempo.";
  if (pos === 0) return "Reinando. Suspeito, mas reinando.";
  if (pos === 1) return "Quase lá. Tão perto e tão longe.";
  if (pos === 2) return "Bronze. Poderia ser pior. E provavelmente vai ser.";
  if (pos <= 4) return "Top 5. Quase no pódio. Quase.";
  if (pos <= 9) return "Meio da tabela. Como na vida.";
  if (pos === total - 1) return "Último. A lenda viva da vergonha.";
  if (pos >= total - 3) return "Zona de rebaixamento. Cuidado.";
  return "Existindo no ranking. Parabéns (não).";
}

function getMomPositionDescription(pos: number, total: number): string {
  if (total <= 1) return "Só um pai no radar. Coitado. Coitada de você.";
  if (pos === 0) return "Seu marido lidera. Aproveite. Vai durar pouco.";
  if (pos === 1) return "Quase lá. Quase bom o suficiente.";
  if (pos === 2) return "Pódio. Poderia ser pior. E será.";
  if (pos <= 4) return "Top 5. Tá no caminho. Devagar.";
  if (pos === total - 1) return "Último. Você sabia desde o começo.";
  return "Existindo. Já é alguma coisa, né?";
}

function getShareText(name: string, pos: number, total: number, pts: number): string {
  const posLabel = `#${pos + 1}`;
  if (pos <= 2) return `👑 Tô no PÓDIO dos pais no *Estou de Olho* 👁️\nPosição ${posLabel} com ${pts} pontos!\nSim, eu. Guarda esse print. 🏆`;
  if (pos === total - 1) return `💀 Último lugar no ranking dos pais no *Estou de Olho* 👁️\n${pts} pontos. Mas pelo menos apareço. 😅`;
  return `⚡ Posição ${posLabel} no ranking dos pais no *Estou de Olho* 👁️\n${pts} pontos. Subindo! (Devagar, mas subindo.)`;
}

const StarRating = ({ stars, isMom }: { stars: number; isMom?: boolean }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`text-xs ${i <= stars ? (isMom ? "text-mom" : "text-accent-foreground") : "text-muted-foreground/30"}`}>★</span>
    ))}
  </div>
);

// ============ UNIFIED 3D PODIUM ============
function PodiumSection({ ranking, myProfile }: { ranking: any[]; myProfile: any }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (ranking.length < 2) return null;

  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];

  const podiumData = [
    { dad: second, pos: 2, barH: 100, delay: "0.5s", medal: "🥈", glow: "hsl(var(--secondary) / 0.3)" },
    { dad: first, pos: 1, barH: 140, delay: "0.15s", medal: "👑", glow: "hsl(var(--primary) / 0.4)" },
    { dad: third, pos: 3, barH: 72, delay: "0.7s", medal: "🥉", glow: "hsl(var(--secondary) / 0.2)" },
  ];

  return (
    <div className="relative py-6">
      {/* Ambient light */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-[60px]"
          style={{ background: "hsl(var(--primary) / 0.15)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 blur-xl"
          style={{ background: "linear-gradient(to top, hsl(var(--primary) / 0.05), transparent)" }} />
      </div>

      {/* Reflective floor */}
      <div className="absolute bottom-0 left-4 right-4 h-3 rounded-b-2xl"
        style={{
          background: "linear-gradient(180deg, hsl(var(--border) / 0.2), hsl(var(--border) / 0.05))",
          filter: "blur(1px)",
        }} />

      <div className="relative flex items-end justify-center gap-3 sm:gap-5 px-2 pt-4 pb-3">
        {podiumData.map(({ dad, pos, barH, delay, medal, glow }) => {
          if (!dad) return <div key={pos} className="w-24" />;
          const isMe = myProfile?.id === dad.id;

          return (
            <div
              key={dad.id}
              className="flex flex-col items-center"
              style={{
                animation: animate ? `podium3DRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay} both` : "none",
              }}
            >
              {/* Medal floating */}
              <div className="relative mb-1" style={{
                animation: animate ? "podiumFloat 3s ease-in-out infinite" : "none",
                animationDelay: delay,
              }}>
                <span className={`${pos === 1 ? "text-3xl" : "text-2xl"}`} style={{
                  filter: `drop-shadow(0 4px 8px ${glow})`,
                }}>{medal}</span>
                {pos === 1 && (
                  <div className="absolute -inset-3 rounded-full animate-pulse"
                    style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.2), transparent)" }} />
                )}
              </div>

              {/* Avatar with spinning ring */}
              <div className={`relative mb-2 ${pos === 1 ? "scale-[1.15]" : ""}`}>
                <div className="absolute -inset-2 rounded-full" style={{
                  background: pos === 1
                    ? "conic-gradient(from 0deg, hsl(var(--primary) / 0.5), hsl(var(--secondary) / 0.5), hsl(var(--primary) / 0.5))"
                    : "conic-gradient(from 0deg, hsl(var(--border) / 0.3), hsl(var(--border) / 0.1), hsl(var(--border) / 0.3))",
                  filter: "blur(3px)",
                  animation: pos === 1 ? "spin 4s linear infinite" : "none",
                }} />
                <div className="absolute -inset-1 rounded-full" style={{
                  background: pos === 1
                    ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))"
                    : "linear-gradient(135deg, hsl(var(--border) / 0.5), hsl(var(--muted)))",
                }} />
                <Avatar className="relative h-14 w-14 border-2 border-card shadow-xl" style={{
                  boxShadow: pos === 1
                    ? "0 8px 30px hsl(var(--primary) / 0.3), 0 2px 8px rgba(0,0,0,0.1)"
                    : "0 4px 16px rgba(0,0,0,0.1)",
                }}>
                  <AvatarImage src={dad.avatar_url || undefined} />
                  <AvatarFallback className="font-display font-bold text-lg bg-card text-foreground">
                    {(dad.display_name || "P")[0]}
                  </AvatarFallback>
                </Avatar>
                {isMe && (
                  <div className="absolute -bottom-1 -right-1 rounded-full w-5 h-5 flex items-center justify-center text-[7px] font-bold shadow-md"
                    style={{ background: "hsl(var(--primary))", color: "white" }}>EU</div>
                )}
              </div>

              <p className="font-display font-bold text-xs text-center truncate max-w-[85px] mb-1">
                {(dad.display_name || "Pai").split(" ")[0]}
              </p>

              <Badge className="text-[10px] font-display border-0 mb-2 shadow-sm" style={{
                background: pos === 1
                  ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))"
                  : "hsl(var(--muted))",
                color: pos === 1 ? "white" : "hsl(var(--foreground))",
                boxShadow: pos === 1 ? "0 4px 12px hsl(var(--primary) / 0.3)" : undefined,
              }}>
                {dad.points} pts
              </Badge>

              {/* 3D Podium bar */}
              <div className="relative" style={{ width: pos === 1 ? 88 : 76, height: barH }}>
                <div className="absolute inset-0 rounded-t-xl overflow-hidden" style={{
                  background: pos === 1
                    ? "linear-gradient(180deg, hsl(var(--primary) / 0.2) 0%, hsl(var(--primary) / 0.08) 100%)"
                    : "linear-gradient(180deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 100%)",
                  border: "1px solid hsl(var(--border) / 0.4)",
                  borderBottom: "none",
                  boxShadow: pos === 1
                    ? "inset 0 1px 20px rgba(255,255,255,0.15), 0 -8px 30px hsl(var(--primary) / 0.08)"
                    : "inset 0 1px 10px rgba(255,255,255,0.1)",
                }}>
                  <div className="absolute inset-y-0 left-[30%] w-[2px] opacity-20"
                    style={{ background: "linear-gradient(180deg, white 0%, transparent 80%)" }} />
                  <div className="absolute top-0 left-0 right-0 h-1/3 rounded-t-xl"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)" }} />
                </div>

                {/* 3D top face */}
                <div className="absolute -top-2 left-1 right-1 h-4 rounded-t-lg"
                  style={{
                    background: pos === 1
                      ? "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.15))"
                      : "linear-gradient(135deg, hsl(var(--border) / 0.4), hsl(var(--muted) / 0.8))",
                    transform: "perspective(200px) rotateX(40deg)",
                    transformOrigin: "bottom",
                    border: "1px solid hsl(var(--border) / 0.2)",
                  }} />

                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="font-display font-black text-2xl" style={{
                    color: pos === 1 ? "hsl(var(--primary) / 0.25)" : "hsl(var(--foreground) / 0.12)",
                    textShadow: "0 1px 2px rgba(255,255,255,0.3)",
                  }}>{pos}°</span>
                </div>

                {dad.streak_days > 0 && (
                  <div className="absolute top-3 left-0 right-0 text-center">
                    <span className="text-[10px] font-display font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.15)",
                        backdropFilter: "blur(4px)",
                        color: "hsl(var(--foreground) / 0.7)",
                      }}>🔥{dad.streak_days}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes podium3DRise {
          0% { opacity: 0; transform: translateY(40px) scale(0.9); }
          60% { opacity: 1; transform: translateY(-8px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes podiumFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
          if (!dad) return <div key={pos} className="w-24" />;
          const isMe = myProfile?.id === dad.id;
          const title = getDadTitle(dad.points);
          return (
            <div
              key={dad.id}
              className="flex flex-col items-center gap-2"
              style={{ animation: animate ? `momPodiumRise 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay} both` : "none" }}
            >
              <div className="relative">
                <span className="text-2xl" style={{
                  filter: pos === 1 ? "drop-shadow(0 0 12px hsl(var(--dad-accent) / 0.6))" : "drop-shadow(0 2px 6px rgba(0,0,0,0.15))",
                }}>{medal}</span>
                {pos === 1 && (
                  <Flame className="absolute -top-2 -right-3 w-4 h-4 animate-pulse" style={{ color: "hsl(var(--dad-accent))" }} />
                )}
              </div>

              <div className={`relative ${pos === 1 ? "scale-110" : ""}`}>
                <div className="absolute -inset-1.5 rounded-full blur-md" style={{
                  background: pos === 1
                    ? "linear-gradient(135deg, hsl(var(--dad-accent) / 0.4), hsl(30 80% 70% / 0.3))"
                    : "linear-gradient(135deg, hsl(var(--dad-accent) / 0.15), transparent)",
                }} />
                <Avatar className="relative h-14 w-14 ring-2 border-2 border-card shadow-lg" style={{
                  boxShadow: pos === 1 ? "0 4px 20px hsl(var(--dad-accent) / 0.3)" : undefined,
                }}>
                  <AvatarImage src={dad.avatar_url || undefined} />
                  <AvatarFallback className="font-display font-bold text-lg" style={{
                    background: "hsl(var(--dad-bg))", color: "hsl(var(--dad-text))",
                  }}>{(dad.display_name || "P")[0]}</AvatarFallback>
                </Avatar>
                {isMe && (
                  <div className="absolute -bottom-1 -right-1 rounded-full w-5 h-5 flex items-center justify-center text-[8px] font-bold" style={{
                    background: "hsl(var(--dad-accent))",
                    color: "white",
                  }}>EU</div>
                )}
              </div>

              <p className="font-display font-bold text-xs text-center truncate max-w-[80px]">{(dad.display_name || "Pai").split(" ")[0]}</p>
              
              <Badge className="text-[10px] font-display border-0" style={{
                background: pos === 1
                  ? "linear-gradient(135deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))"
                  : "hsl(var(--dad-bg))",
                color: pos === 1 ? "white" : "hsl(var(--dad-text))",
                boxShadow: pos === 1 ? "0 2px 10px hsl(var(--dad-accent) / 0.3)" : undefined,
              }}>
                {dad.points}pts
              </Badge>

              <div className={`w-20 ${height} rounded-t-2xl relative overflow-hidden`} style={{
                background: pos === 1
                  ? "linear-gradient(180deg, hsl(var(--dad-accent) / 0.25), hsl(var(--dad-accent) / 0.08))"
                  : "linear-gradient(180deg, hsl(var(--dad-border) / 0.3), hsl(var(--dad-bg) / 0.5))",
                border: "1px solid hsl(var(--dad-border) / 0.4)",
                boxShadow: "inset 0 2px 10px rgba(255,255,255,0.15), 0 -4px 20px rgba(0,0,0,0.05)",
              }}>
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(90deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(255,255,255,0.06) 100%)",
                }} />
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="font-display font-bold text-base" style={{ color: "hsl(var(--dad-text) / 0.5)" }}>{pos}°</span>
                </div>
                {dad.streak_days > 0 && (
                  <div className="absolute top-2 left-0 right-0 text-center"><span className="text-[10px]">🔥{dad.streak_days}</span></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ MOM PODIUM (Elegant 3D) ============
function MomPodiumSection({ ranking }: { ranking: any[] }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (ranking.length < 2) return null;

  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];

  const podiumData = [
    { dad: second, pos: 2, height: "h-20", delay: "0.5s", medal: "🥈" },
    { dad: first, pos: 1, height: "h-28", delay: "0.2s", medal: "💎" },
    { dad: third, pos: 3, height: "h-16", delay: "0.7s", medal: "🥉" },
  ];

  return (
    <div className="relative py-4">
      {/* Elegant glow */}
      <div className="absolute inset-0 rounded-3xl" style={{
        background: "radial-gradient(ellipse at 50% 0%, hsl(var(--mom-accent) / 0.12) 0%, transparent 70%)",
      }} />

      <div className="relative flex items-end justify-center gap-4 px-4 pt-4 pb-2">
        {podiumData.map(({ dad, pos, height, delay, medal }) => {
          if (!dad) return <div key={pos} className="w-24" />;
          const title = getDadTitle(dad.points);
          return (
            <div
              key={dad.id}
              className="flex flex-col items-center gap-2"
              style={{ animation: animate ? `momPodiumRise 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay} both` : "none" }}
            >
              {/* Floating medal with glow */}
              <div className="relative">
                <span className="text-2xl" style={{
                  filter: pos === 1 ? "drop-shadow(0 0 12px hsl(var(--mom-accent) / 0.6))" : "drop-shadow(0 2px 6px rgba(0,0,0,0.15))",
                }}>{medal}</span>
                {pos === 1 && (
                  <Sparkles className="absolute -top-2 -right-3 w-4 h-4 text-mom animate-pulse" />
                )}
              </div>

              {/* Avatar with rose ring */}
              <div className={`relative ${pos === 1 ? "scale-110" : ""}`} style={{
                transform: pos === 1 ? "scale(1.1) translateZ(20px)" : undefined,
              }}>
                <div className="absolute -inset-1.5 rounded-full blur-md" style={{
                  background: pos === 1
                    ? "linear-gradient(135deg, hsl(var(--mom-accent) / 0.4), hsl(340 80% 70% / 0.3))"
                    : "linear-gradient(135deg, hsl(var(--mom-accent) / 0.15), transparent)",
                }} />
                <Avatar className={`relative h-14 w-14 ring-2 border-2 border-card shadow-lg`} style={{
                  boxShadow: pos === 1 ? "0 4px 20px hsl(var(--mom-accent) / 0.3)" : undefined,
                  borderColor: pos === 1 ? "hsl(var(--mom-accent) / 0.3)" : undefined,
                }}>
                  <AvatarImage src={dad.avatar_url || undefined} />
                  <AvatarFallback className="font-display font-bold text-lg" style={{
                    background: "hsl(var(--mom-bg))",
                    color: "hsl(var(--mom-text))",
                  }}>{(dad.display_name || "P")[0]}</AvatarFallback>
                </Avatar>
              </div>

              <p className="font-display font-bold text-xs text-center truncate max-w-[80px]">
                {(dad.display_name || "Pai").split(" ")[0]}
              </p>

              <Badge className="text-[10px] font-display border-0" style={{
                background: pos === 1
                  ? "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(340 80% 65%))"
                  : "hsl(var(--mom-bg))",
                color: pos === 1 ? "white" : "hsl(var(--mom-text))",
                boxShadow: pos === 1 ? "0 2px 10px hsl(var(--mom-accent) / 0.3)" : undefined,
              }}>
                {dad.points}pts
              </Badge>

              {/* Elegant podium bar */}
              <div className={`w-20 ${height} rounded-t-2xl relative overflow-hidden`} style={{
                background: pos === 1
                  ? "linear-gradient(180deg, hsl(var(--mom-accent) / 0.25), hsl(var(--mom-accent) / 0.08))"
                  : "linear-gradient(180deg, hsl(var(--mom-border) / 0.3), hsl(var(--mom-bg) / 0.5))",
                border: `1px solid hsl(var(--mom-border) / 0.4)`,
                boxShadow: "inset 0 2px 10px rgba(255,255,255,0.15), 0 -4px 20px rgba(0,0,0,0.05)",
              }}>
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(90deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(255,255,255,0.06) 100%)",
                }} />
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="font-display font-bold text-base" style={{ color: "hsl(var(--mom-text) / 0.5)" }}>{pos}°</span>
                </div>
                {dad.streak_days > 0 && (
                  <div className="absolute top-2 left-0 right-0 text-center"><span className="text-[10px]">🔥{dad.streak_days}</span></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Dad stats bar (Clean style)
function MyStatsBar({ profile, position, total }: { profile: any; position: number; total: number }) {
  if (!profile || position < 0) return null;
  const percentile = total > 1 ? Math.round(((total - position) / total) * 100) : 100;
  const title = getDadTitle(profile.points);

  return (
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, hsl(var(--dad-accent) / 0.06), hsl(var(--card)))",
      boxShadow: "0 8px 32px hsl(var(--dad-accent) / 0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
      border: "1px solid hsl(var(--dad-border) / 0.4)",
    }}>
      <div className="relative flex items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-1.5 rounded-full blur-md" style={{
            background: "linear-gradient(135deg, hsl(var(--dad-accent) / 0.2), transparent)",
          }} />
          <Avatar className="relative h-12 w-12 ring-2 shadow-lg" style={{
            boxShadow: "0 4px 12px hsl(var(--dad-accent) / 0.15)",
          }}>
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="font-display font-bold" style={{
              background: "hsl(var(--dad-bg))", color: "hsl(var(--dad-text))",
            }}>{(profile.display_name || "P")[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-display font-bold text-lg" style={{ color: "hsl(var(--dad-accent))" }}>#{position + 1}</span>
            <span className="text-sm text-muted-foreground font-body">de {total}</span>
            {position <= 2 && <Crown className="w-4 h-4" style={{ color: "hsl(var(--dad-accent))" }} />}
          </div>
          <p className="text-xs font-body italic truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
            {title.emoji} {title.title} • Top {percentile}% dos pais
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" style={{ color: "hsl(var(--dad-accent))" }} />
            <span className="font-display font-bold text-xl" style={{ color: "hsl(var(--dad-accent))" }}>{profile.points}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">pontos</p>
        </div>
      </div>
      {position > 0 && (
        <div className="relative mt-3 pt-3" style={{ borderTop: "1px solid hsl(var(--dad-border) / 0.3)" }}>
          <div className="flex items-center justify-between text-[10px] mb-1 text-muted-foreground">
            <span className="flex items-center gap-1">
              <ChevronUp className="w-3 h-3" />
              Pra subir: +{Math.max(1, ranking_diff(profile, position))}pts
            </span>
            <span className="font-display">{profile.streak_days > 0 ? `🔥 ${profile.streak_days} dias` : ""}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{
              width: `${Math.min(95, Math.max(5, percentile))}%`,
              background: "linear-gradient(90deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))",
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

// Mom observer stats
function MomObserverBar({ ranking, partnerProfile }: { ranking: any[]; partnerProfile: any }) {
  if (!partnerProfile) return null;
  const partnerPos = ranking.findIndex(r => r.id === partnerProfile.id);
  if (partnerPos < 0) return null;

  const total = ranking.length;
  const title = getDadTitle(partnerProfile.points);
  const percentile = total > 1 ? Math.round(((total - partnerPos) / total) * 100) : 100;

  const momComments = [
    "Poderia ser pior. Mas poderia ser BEM melhor.",
    "Ele tá tentando. Eu acho.",
    "Pelo menos ele abriu o app hoje.",
    "Melhor que ontem. O mínimo.",
    "Surpreendentemente, não é o último.",
  ];
  const comment = momComments[partnerPos % momComments.length];

  return (
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.06), hsl(var(--card)))",
      boxShadow: "0 8px 32px hsl(var(--mom-accent) / 0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
      border: "1px solid hsl(var(--mom-border) / 0.4)",
    }}>
      {/* Subtle elegant pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--mom-accent)) 0.5px, transparent 0)",
        backgroundSize: "20px 20px"
      }} />

      <div className="relative">
        <div className="flex items-center gap-1 mb-3">
          <Eye className="w-4 h-4" style={{ color: "hsl(var(--mom-accent))" }} />
          <span className="text-xs font-display font-bold" style={{ color: "hsl(var(--mom-text))" }}>
            Monitorando seu marido
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1.5 rounded-full blur-md" style={{
              background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.2), hsl(340 80% 70% / 0.15))",
            }} />
            <Avatar className="relative h-12 w-12 ring-2" style={{
              boxShadow: "0 4px 12px hsl(var(--mom-accent) / 0.15)",
            }}>
              <AvatarImage src={partnerProfile.avatar_url || undefined} />
              <AvatarFallback className="font-display font-bold" style={{
                background: "hsl(var(--mom-bg))", color: "hsl(var(--mom-text))"
              }}>{(partnerProfile.display_name || "P")[0]}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-display font-bold text-lg" style={{ color: "hsl(var(--mom-accent))" }}>
                #{partnerPos + 1}
              </span>
              <span className="text-sm text-muted-foreground font-body">de {total}</span>
              {partnerPos <= 2 && <Crown className="w-4 h-4" style={{ color: "hsl(var(--mom-accent))" }} />}
            </div>
            <p className="text-xs font-body italic truncate" style={{ color: "hsl(var(--mom-text) / 0.7)" }}>
              {title.emoji} {title.title} • Top {percentile}%
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--mom-accent))" }} />
              <span className="font-display font-bold text-xl" style={{ color: "hsl(var(--mom-accent))" }}>
                {partnerProfile.points}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">pontos</p>
          </div>
        </div>

        <div className="mt-3 pt-3" style={{ borderTop: "1px solid hsl(var(--mom-border) / 0.3)" }}>
          <p className="text-[11px] font-body italic text-center" style={{ color: "hsl(var(--mom-text) / 0.6)" }}>
            "{comment}"
          </p>
        </div>
      </div>
    </div>
  );
}

function ranking_diff(profile: any, pos: number) {
  return Math.max(1, 10 - (pos * 2));
}

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

  const myPos = ranking.findIndex(r => r.id === myProfile?.id);

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

  const getPositionStyle = (pos: number) => {
    if (isMom) {
      if (pos === 0) return { borderLeft: "4px solid hsl(var(--mom-accent))", background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.1), hsl(var(--card)))" };
      if (pos === 1) return { borderLeft: "4px solid hsl(var(--mom-border))", background: "linear-gradient(135deg, hsl(var(--mom-bg) / 0.5), hsl(var(--card)))" };
      if (pos === 2) return { borderLeft: "4px solid hsl(var(--mom-accent) / 0.5)", background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.05), hsl(var(--card)))" };
      return {};
    }
    if (pos === 0) return { borderLeft: "4px solid hsl(var(--dad-accent))", background: "linear-gradient(135deg, hsl(var(--dad-accent) / 0.1), hsl(var(--card)))" };
    if (pos === 1) return { borderLeft: "4px solid hsl(var(--dad-border))", background: "linear-gradient(135deg, hsl(var(--dad-bg) / 0.5), hsl(var(--card)))" };
    if (pos === 2) return { borderLeft: "4px solid hsl(var(--dad-accent) / 0.5)", background: "linear-gradient(135deg, hsl(var(--dad-accent) / 0.05), hsl(var(--card)))" };
    return {};
  };

  const renderRankingList = (list: typeof ranking, startIdx = 3) => (
    <div className="space-y-2">
      {list.slice(startIdx).map((dad, i) => {
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
            className={`rounded-xl border p-3 cursor-pointer transition-all duration-300 ${
              isMe ? "ring-2 ring-primary/30" : ""
            }`}
            style={{
              ...getPositionStyle(index),
              borderColor: isMe ? "hsl(var(--dad-accent) / 0.3)" : isLast && list.length > 3 ? "hsl(var(--destructive) / 0.3)" : undefined,
              boxShadow: isExpanded
                ? "0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)"
                : undefined,
              transform: isExpanded ? "translate(-2px, -2px)" : "scale(1)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0`} style={{
                background: isLast && list.length > 3
                  ? "hsl(var(--destructive) / 0.1)"
                  : isMom ? "hsl(var(--mom-bg))" : "hsl(var(--dad-bg))",
                color: isLast && list.length > 3
                  ? "hsl(var(--destructive))"
                  : isMom ? "hsl(var(--mom-text))" : "hsl(var(--dad-text))",
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

  // =============== RENDER ===============
  return (
    <div className="pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-5">
      {/* Header - different for mom/dad */}
      <div className="text-center relative">
        {isMom ? (
          <>
            {/* Mom elegant header */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl" style={{
              background: "radial-gradient(circle, hsl(var(--mom-accent) / 0.1), transparent)",
            }} />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-lg" style={{
                background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.15), hsl(var(--mom-bg)))",
                boxShadow: "0 8px 32px hsl(var(--mom-accent) / 0.12), inset 0 2px 0 rgba(255,255,255,0.2)",
                border: "1px solid hsl(var(--mom-border) / 0.3)",
              }}>
                <Eye className="w-8 h-8" style={{
                  color: "hsl(var(--mom-accent))",
                  filter: "drop-shadow(0 2px 4px hsl(var(--mom-accent) / 0.3))",
                }} />
              </div>
              <h1 className="font-display text-2xl font-bold mb-1" style={{
                background: "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(340 60% 45%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Painel de Vigilância
              </h1>
              <p className="text-sm font-body italic" style={{ color: "hsl(var(--mom-text) / 0.6)" }}>
                Observando, julgando e avaliando. Como sempre.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Clean Dad header */}
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
                  <Trophy className="w-8 h-8" style={{
                    color: "hsl(var(--dad-accent))",
                    filter: "drop-shadow(0 2px 4px hsl(var(--dad-accent) / 0.3))",
                  }} />
                </div>
                <h1 className="font-display text-2xl font-bold mb-1" style={{
                  background: "linear-gradient(135deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  ⚔️ O Mural da Vergonha
                </h1>
                <p className="text-sm font-body italic text-muted-foreground">
                  {myPos >= 0
                    ? myPos <= 2
                      ? "🔥 Você tá no pódio. Não estraga agora."
                      : `⚡ Posição #${myPos + 1}. Hora de escalar.`
                    : "Entre na arena fazendo alguma coisa, pai."}
                </p>
              </div>
            </div>
          </>
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
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{
                  background: isMom ? "hsl(var(--mom-bg))" : "hsl(var(--muted))",
                }} />
              ))}
            </div>
          ) : ranking.length === 0 ? (
            <Card className="border-dashed" style={isMom ? { borderColor: "hsl(var(--mom-border))" } : undefined}>
              <CardContent className="py-10 text-center">
                {isMom ? (
                  <>
                    <Eye className="w-12 h-12 mx-auto mb-3" style={{ color: "hsl(var(--mom-accent) / 0.4)" }} />
                    <p className="font-display text-lg font-bold mb-1">Ninguém pra vigiar ainda</p>
                    <p className="text-sm font-body italic" style={{ color: "hsl(var(--mom-text) / 0.6)" }}>
                      Convide o pai pra entrar. Ele precisa ser monitorado.
                    </p>
                  </>
                ) : (
                  <>
                    <Skull className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-display text-lg font-bold mb-1">Você é o único pai aqui</p>
                    <p className="text-sm text-muted-foreground font-body italic mb-4">
                      1° e último ao mesmo tempo. Convida alguém.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => {
                      const text = "Entrei no 'Estou de Olho', app que tira sarro de pai ausente 😂\nVamos ver quem é o pior pai.\nhttps://estoudeolho.lovable.app";
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
              {/* Podium */}
              {isMom ? <MomPodiumSection ranking={ranking} /> : <PodiumSection ranking={ranking} myProfile={myProfile} />}

              {/* Rest of ranking */}
              {ranking.length > 3 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1" style={{ background: isMom ? "hsl(var(--mom-border) / 0.3)" : "hsl(var(--border))" }} />
                    <span className="text-[10px] font-body uppercase tracking-wider" style={{
                      color: isMom ? "hsl(var(--mom-text) / 0.5)" : "hsl(var(--muted-foreground))",
                    }}>
                      {isMom ? "Os demais suspeitos" : "Restante da galera"}
                    </span>
                    <div className="h-px flex-1" style={{ background: isMom ? "hsl(var(--mom-border) / 0.3)" : "hsl(var(--border))" }} />
                  </div>
                  {renderRankingList(ranking)}
                </div>
              )}

              {/* Bottom card */}
              {ranking.length > 3 && (
                <div className="rounded-2xl p-3 text-center relative overflow-hidden" style={isMom ? {
                  background: "linear-gradient(135deg, hsl(var(--mom-accent) / 0.05), hsl(var(--card)))",
                  border: "1px solid hsl(var(--mom-border) / 0.2)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                } : {
                  background: "linear-gradient(135deg, hsl(var(--destructive) / 0.05), hsl(var(--card)))",
                  border: "1px solid hsl(var(--destructive) / 0.2)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                }}>
                  <p className="text-2xl mb-1 relative">{isMom ? "👀" : "💀"}</p>
                  <p className="font-display font-bold text-xs relative" style={{
                    color: isMom ? "hsl(var(--mom-accent))" : "hsl(var(--destructive))",
                  }}>{isMom ? "Caso Perdido" : "⚰️ Hall da Vergonha Eterna"}</p>
                  <p className="text-[10px] font-body italic relative" style={{
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
                  {isMom ? "Crie um grupo de mães ou monitore outros pais." : "Crie um grupo ou entre com um código. A vergonha é melhor compartilhada."}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" onClick={() => setShowGroupSheet(true)} style={isMom ? {
                    background: "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(340 65% 50%))",
                    color: "white",
                    boxShadow: "0 4px 12px hsl(var(--mom-accent) / 0.3)",
                  } : undefined}>
                    <Plus className="w-4 h-4 mr-1" /> Criar grupo
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowJoinSheet(true)} style={isMom ? {
                    borderColor: "hsl(var(--mom-border))",
                    color: "hsl(var(--mom-text))",
                  } : undefined}>
                    Entrar com código
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowGroupSheet(true)} style={isMom ? {
                  borderColor: "hsl(var(--mom-border))",
                  color: "hsl(var(--mom-text))",
                } : undefined}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Novo grupo
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowJoinSheet(true)} style={isMom ? {
                  borderColor: "hsl(var(--mom-border))",
                  color: "hsl(var(--mom-text))",
                } : undefined}>
                  Entrar com código
                </Button>
              </div>
              {myGroups.map((group: any) => (
                <div
                  key={group.id}
                  className="rounded-xl p-4"
                  style={{
                    border: `1px solid ${isMom ? "hsl(var(--mom-border) / 0.3)" : "hsl(var(--border))"}`,
                    boxShadow: isMom ? "0 4px 16px hsl(var(--mom-accent) / 0.06)" : "0 4px 16px rgba(0,0,0,0.04)",
                  }}
                >
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
                          background: member.id === myProfile?.id
                            ? isMom ? "hsl(var(--mom-accent) / 0.05)" : "hsl(var(--primary) / 0.05)"
                            : undefined,
                          border: member.id === myProfile?.id
                            ? `1px solid ${isMom ? "hsl(var(--mom-accent) / 0.15)" : "hsl(var(--primary) / 0.2)"}`
                            : "1px solid transparent",
                        }}>
                          <span className="font-display font-bold text-xs w-5 text-center text-muted-foreground">
                            {idx === 0 ? "👑" : `${idx + 1}`}
                          </span>
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback className="text-xs font-display font-bold">{(member.display_name || "P")[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-display font-bold truncate">
                              {(member.display_name || "Pai").split(" ")[0]}
                              {member.id === myProfile?.id && (
                                <span className="ml-1" style={{ color: isMom ? "hsl(var(--mom-accent))" : "hsl(var(--secondary))" }}>
                                  (você)
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-display font-bold text-xs" style={{
                              color: isMom ? "hsl(var(--mom-accent))" : "hsl(var(--primary))",
                            }}>{member.points}pts</p>
                            {member.streak_days > 0 && <p className="text-[9px]" style={{
                              color: isMom ? "hsl(var(--mom-accent) / 0.7)" : "hsl(var(--secondary))",
                            }}>🔥{member.streak_days}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] font-body italic" style={{
                      color: isMom ? "hsl(var(--mom-text) / 0.5)" : "hsl(var(--muted-foreground))",
                    }}>
                      Sem membros ainda. Compartilha o código.
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="familia" className="mt-4 space-y-4">
          {/* Rating Card */}
          <div className="rounded-2xl overflow-hidden" style={{
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            background: "linear-gradient(160deg, hsl(var(--card)), hsl(var(--background)))",
          }}>
            {/* Header strip */}
            <div className="px-6 py-4 relative overflow-hidden" style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.06))",
              borderBottom: "1px solid hsl(var(--border) / 0.5)",
            }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl" style={{
                background: "radial-gradient(circle, hsl(var(--secondary) / 0.1), transparent)",
              }} />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))",
                  border: "1px solid hsl(var(--primary) / 0.15)",
                }}>
                  <Star className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">{isMom ? "Seu Veredito Semanal" : "Avaliação da Família"}</h3>
                  <p className="text-[11px] font-body" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Semana de {weekStart.split("-").reverse().slice(0, 2).join("/")}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              {(() => {
                const rating = myProfile ? getRatingForUser(myProfile.user_id) : null;
                if (rating) {
                  const label = RATING_LABELS[rating.stars] || "";
                  return (
                    <div className="space-y-4">
                      {/* Stars display */}
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
                        }}>
                          {rating.stars}/5
                        </span>
                      </div>

                      {/* Label badge */}
                      <div className="flex justify-center">
                        <span className="px-4 py-1.5 rounded-full text-xs font-display font-bold" style={{
                          background: rating.stars >= 4
                            ? "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05))"
                            : rating.stars >= 3
                              ? "hsl(var(--secondary) / 0.1)"
                              : "hsl(var(--destructive) / 0.08)",
                          color: rating.stars >= 4
                            ? "hsl(var(--primary))"
                            : rating.stars >= 3
                              ? "hsl(var(--secondary))"
                              : "hsl(var(--destructive))",
                          border: `1px solid ${rating.stars >= 4
                            ? "hsl(var(--primary) / 0.15)"
                            : rating.stars >= 3
                              ? "hsl(var(--secondary) / 0.2)"
                              : "hsl(var(--destructive) / 0.15)"}`,
                        }}>
                          {label}
                        </span>
                      </div>

                      {/* Comment if exists */}
                      {rating.comment && (
                        <div className="rounded-xl p-3 text-center" style={{
                          background: "hsl(var(--muted) / 0.4)",
                          border: "1px solid hsl(var(--border) / 0.5)",
                        }}>
                          <p className="text-xs font-body italic" style={{ color: "hsl(var(--muted-foreground))" }}>
                            "{rating.comment}"
                          </p>
                        </div>
                      )}

                      {/* Footer */}
                      <p className="text-[10px] text-center font-body" style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}>
                        {isMom ? "Você avaliou esta semana ✓" : "Avaliação publicada pela mãe ✓"}
                      </p>
                    </div>
                  );
                }

                // No rating yet
                return (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-7 h-7" style={{
                          color: "hsl(var(--muted-foreground) / 0.15)",
                          fill: "none",
                        }} />
                      ))}
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-display font-bold text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {isMom ? "Avaliação pendente" : "Aguardando nota"}
                      </p>
                      <p className="text-xs font-body italic" style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}>
                        {isMom
                          ? "Vá em Avaliar para dar sua nota semanal. 📝"
                          : "A mãe avalia toda semana. Torça pelo melhor. Ou por um 3."}
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
        <Button
          className="w-full font-display gap-2 border-0"
          style={{
            background: "linear-gradient(135deg, hsl(var(--dad-accent)), hsl(var(--dad-cta)))",
            color: "white",
            boxShadow: "0 4px 16px hsl(var(--dad-accent) / 0.3)",
          }}
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
          Compartilhar meu ranking
        </Button>
      )}

      {isMom && ranking.length > 0 && (
        <Button
          className="w-full font-display gap-2 border-0"
          style={{
            background: "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(340 65% 50%))",
            color: "white",
            boxShadow: "0 4px 16px hsl(var(--mom-accent) / 0.3)",
          }}
          onClick={() => {
            const text = `👁️ Estou de Olho no ranking dos pais!\n${ranking.length} pais monitorados.\nO melhor: ${ranking[0]?.display_name?.split(" ")[0]} com ${ranking[0]?.points}pts\nO pior: ${ranking[ranking.length - 1]?.display_name?.split(" ")[0]} com ${ranking[ranking.length - 1]?.points}pts\n\n😏 Baixe: https://estoudeolho.lovable.app`;
            navigator.clipboard.writeText(text);
            toast.success("Copiado! Compartilhe no WhatsApp. 📋");
          }}
        >
          <Share2 className="w-4 h-4" />
          Compartilhar vigilância
        </Button>
      )}

      {/* Sheets */}
      <Sheet open={showGroupSheet} onOpenChange={setShowGroupSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Criar Grupo</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground font-body mb-2">Sugestões:</p>
              <div className="flex flex-wrap gap-2">
                {(isMom
                  ? ["Mães Vigilantes", "Clube das Mães", "Grupo do Zap das Mães", "As Fiscais"]
                  : ["Pais da Escola", "Pais do Bairro", "Os Pais da Firma", "Turma do Futebol"]
                ).map(s => (
                  <Badge key={s} variant="outline" className="cursor-pointer hover:bg-accent text-xs" style={isMom ? {
                    borderColor: "hsl(var(--mom-border))",
                    color: "hsl(var(--mom-text))",
                  } : undefined} onClick={() => setGroupName(s)}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <Input placeholder="Nome do grupo" value={groupName} onChange={e => setGroupName(e.target.value)} />
            <Button className="w-full font-display" style={isMom ? {
              background: "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(340 65% 50%))",
              color: "white",
            } : { background: "hsl(var(--primary))" }} onClick={() => createGroupMutation.mutate()} disabled={!groupName || createGroupMutation.isPending}>
              {createGroupMutation.isPending ? "Criando..." : "Criar Grupo"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showJoinSheet} onOpenChange={setShowJoinSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Entrar em um Grupo</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Código do grupo (ex: a1b2c3d4)" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
            <Button className="w-full font-display" style={isMom ? {
              background: "linear-gradient(135deg, hsl(var(--mom-accent)), hsl(340 65% 50%))",
              color: "white",
            } : { background: "hsl(var(--primary))" }} onClick={() => joinGroupMutation.mutate()} disabled={!joinCode || joinGroupMutation.isPending}>
              {joinGroupMutation.isPending ? "Entrando..." : "Entrar no Grupo"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Animations */}
      <style>{`
        @keyframes podiumRise {
          from { opacity: 0; transform: translateY(40px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes arenaPodiumRise {
          0% { opacity: 0; transform: translateY(50px) scale(0.8) rotateY(15deg); }
          60% { opacity: 1; transform: translateY(-8px) scale(1.05) rotateY(-3deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotateY(0deg); }
        }
        @keyframes momPodiumRise {
          from { opacity: 0; transform: translateY(30px) scale(0.85) rotateX(10deg); }
          to { opacity: 1; transform: translateY(0) scale(1) rotateX(0deg); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 200px; }
        }
      `}</style>
    </div>
  );
}
