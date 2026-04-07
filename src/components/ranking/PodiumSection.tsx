import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function PodiumSection({ ranking, myProfile }: { ranking: any[]; myProfile: any }) {
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

export const MomPodiumSection = ({ ranking }: { ranking: any[] }) => (
  <PodiumSection ranking={ranking} myProfile={null} />
);
