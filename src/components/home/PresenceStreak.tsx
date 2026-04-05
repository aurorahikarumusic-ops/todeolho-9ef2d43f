import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PresenceStreakProps {
  streakDays: number;
  weekActivity: boolean[];
  lastActiveAt?: string | null;
}

const CHECKIN_ROASTS: string[] = [
  "Uau, você lembrou que tem família. Parabéns. 👏",
  "Check-in feito. A mãe vai fingir que não viu.",
  "Presença registrada. O mínimo do mínimo.",
  "Olha só quem apareceu! Achamos que tinha fugido.",
  "Dia marcado. Ainda falta fazer algo útil, mas ok.",
  "Check-in! Agora faz alguma coisa antes que a mãe descubra que você só abriu o app.",
  "Ei, você voltou! A mãe já estava preparando o discurso.",
  "Registrado. Não se acostume com elogios.",
  "Presente! Agora mantém esse ritmo, pelo amor.",
  "Você abriu o app. Isso já é mais do que a média.",
];

const ALREADY_CHECKED: string[] = [
  "Já fez check-in hoje. Quer um troféu por isso?",
  "Calma, ansioso. Já tá registrado.",
  "Você já apareceu hoje. Relaxa.",
  "Check-in duplo não dá pontos extras, esperto.",
  "Já marcou presença. Agora vai fazer algo útil.",
];

const MILESTONES: Record<number, string> = {
  0: "Zero dias. A mãe nem tá surpresa.",
  1: "Dia 1. Não se emocione. É só o começo.",
  3: "3 dias seguidos. Isso tá diferente...",
  5: "5 dias! Quem é você e o que fez com o pai?",
  7: "Uma semana INTEIRA. Isso entra pro Guinness.",
  14: "Duas semanas. A mãe notou. Fingiu que não, mas notou.",
  21: "3 semanas. Você virou outra pessoa ou tá fingindo?",
  30: "30 dias. Lenda. Mito. Provavelmente mentira.",
};

function getStreakMessage(days: number): string {
  if (days >= 30) return MILESTONES[30];
  if (days >= 21) return MILESTONES[21];
  if (days >= 14) return MILESTONES[14];
  if (days >= 7) return MILESTONES[7];
  if (days >= 5) return MILESTONES[5];
  if (days >= 3) return MILESTONES[3];
  if (days >= 1) return MILESTONES[1];
  return MILESTONES[0];
}

function getFireEmoji(days: number): string {
  if (days >= 30) return "🌋";
  if (days >= 14) return "🔥";
  if (days >= 7) return "🔥";
  if (days >= 3) return "🕯️";
  if (days >= 1) return "✨";
  return "💀";
}

function getStatusLabel(days: number): string {
  if (days >= 30) return "LENDA ABSOLUTA";
  if (days >= 14) return "IMPRESSIONANTE";
  if (days >= 7) return "NÃO ACREDITO";
  if (days >= 3) return "EVOLUINDO";
  if (days >= 1) return "TENTANDO";
  return "SUMIDO";
}

function isCheckedToday(lastActiveAt?: string | null): boolean {
  if (!lastActiveAt) return false;
  const last = new Date(lastActiveAt);
  const now = new Date();
  return last.toDateString() === now.toDateString();
}

export default function PresenceStreak({ streakDays, weekActivity, lastActiveAt }: PresenceStreakProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [animating, setAnimating] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const checkedToday = isCheckedToday(lastActiveAt) || justCheckedIn;
  const msg = getStreakMessage(streakDays + (justCheckedIn ? 1 : 0));
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const displayStreak = streakDays + (justCheckedIn ? 1 : 0);
  const fireEmoji = getFireEmoji(displayStreak);
  const statusLabel = getStatusLabel(displayStreak);

  const handleCheckIn = useCallback(async () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1200);

    if (checkedToday) {
      const phrase = ALREADY_CHECKED[Math.floor(Math.random() * ALREADY_CHECKED.length)];
      toast.info(phrase, { icon: "😒" });
      return;
    }

    if (!user) return;

    try {
      // Calculate new streak
      const now = new Date();
      const lastActive = lastActiveAt ? new Date(lastActiveAt) : null;
      let newStreak = 1;

      if (lastActive) {
        const diffMs = now.getTime() - lastActive.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours < 48) {
          newStreak = streakDays + 1;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          last_active_at: now.toISOString(),
          streak_days: newStreak,
          points: (await supabase.from("profiles").select("points").eq("user_id", user.id).single()).data?.points! + 5,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setJustCheckedIn(true);
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      const phrase = CHECKIN_ROASTS[Math.floor(Math.random() * CHECKIN_ROASTS.length)];
      toast.success(phrase, {
        icon: fireEmoji,
        description: `+5 pts • Sequência: ${newStreak} dia${newStreak > 1 ? "s" : ""}`,
      });
    } catch {
      toast.error("Erro ao fazer check-in. Tente de novo.");
    }
  }, [user, checkedToday, lastActiveAt, streakDays, queryClient, fireEmoji]);

  // Color theme based on streak
  const gradientFrom = displayStreak >= 14
    ? "#ef4444" : displayStreak >= 7
    ? "#f97316" : displayStreak >= 3
    ? "#eab308" : displayStreak >= 1
    ? "hsl(var(--primary))" : "#94a3b8";

  const gradientTo = displayStreak >= 14
    ? "#dc2626" : displayStreak >= 7
    ? "#ea580c" : displayStreak >= 3
    ? "#f97316" : displayStreak >= 1
    ? "hsl(var(--primary))" : "#64748b";

  const glowColor = displayStreak >= 7
    ? "rgba(249,115,22,0.4)" : displayStreak >= 3
    ? "rgba(234,179,8,0.3)" : "rgba(148,163,184,0.2)";

  return (
    <div
      className="relative rounded-3xl overflow-hidden cursor-pointer select-none"
      style={{
        perspective: "800px",
        background: "linear-gradient(135deg, hsl(var(--arena-dark) / 0.95), hsl(220 25% 16%))",
        boxShadow: `0 8px 32px -8px ${glowColor}, 0 4px 16px rgba(0,0,0,0.2)`, border: "1px solid hsl(var(--arena-gold) / 0.1)",
      }}
      onClick={handleCheckIn}
    >
      {/* Animated background glow */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${glowColor}, transparent)`,
          transform: animating ? "scale(1.5)" : "scale(1)",
          opacity: animating ? 0.8 : 0.5,
        }}
      />
      
      {/* Secondary glow bottom-left */}
      {displayStreak >= 7 && (
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${glowColor}, transparent)`, opacity: 0.3 }}
        />
      )}

      <div className="relative z-10 p-5">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="px-3 py-1 rounded-full text-[10px] font-display font-black uppercase tracking-wider text-white"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
              boxShadow: `0 2px 12px ${glowColor}`,
            }}
          >
            {statusLabel}
          </div>
          {checkedToday && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30">
              <span className="text-green-500 text-[10px]">✓</span>
              <span className="text-[9px] font-display font-bold text-green-600">PRESENTE HOJE</span>
            </div>
          )}
        </div>

        {/* Main counter + fire */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className={`relative transition-all duration-500 ${animating ? "scale-150" : "scale-100"}`}
            style={{
              transform: animating
                ? "translateZ(40px) scale(1.5) rotate(-12deg)"
                : "translateZ(15px)",
              filter: displayStreak >= 3
                ? `drop-shadow(0 0 ${8 + displayStreak}px ${glowColor})`
                : "none",
              transformStyle: "preserve-3d",
            }}
          >
            <span className={`${displayStreak >= 14 ? "text-5xl" : displayStreak >= 7 ? "text-4xl" : "text-3xl"} inline-block`}>
              {fireEmoji}
            </span>
            {displayStreak >= 14 && (
              <span className="absolute -top-2 -right-3 text-base animate-bounce">⚡</span>
            )}
            {displayStreak >= 30 && (
              <span className="absolute -bottom-1 -left-2 text-sm animate-pulse">👑</span>
            )}
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span
                className="font-display text-5xl font-black tabular-nums"
                style={{
                  background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: animating ? `drop-shadow(0 0 8px ${glowColor})` : "none",
                  transition: "filter 0.5s",
                }}
              >
                {displayStreak}
              </span>
              <span className="font-display text-base font-bold text-white/70">
                dia{displayStreak !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="font-body text-[10px] text-white/50 uppercase tracking-[0.2em]">
              de sequência
            </span>
          </div>
        </div>

        {/* 3D Week blocks */}
        <div className="flex items-end justify-between gap-2 mb-5 px-0.5">
        {weekActivity.map((active, i) => {
            const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0 ... Sun=6
            const isToday = i === todayIdx;
            const blockActive = active || (isToday && checkedToday);
            const height = blockActive ? 44 + (i * 3) : 24;

            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className="w-full rounded-xl relative overflow-hidden transition-all duration-500"
                  style={{
                    height: `${height}px`,
                    transitionDelay: `${i * 60}ms`,
                    transform: isToday && animating ? "translateY(-6px) scale(1.08)" : "translateY(0)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Block face */}
                  <div
                    className="absolute inset-0 rounded-xl transition-all duration-500"
                    style={{
                      background: blockActive
                        ? isToday
                          ? `linear-gradient(180deg, ${gradientFrom}, ${gradientTo})`
                          : "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))"
                        : "linear-gradient(180deg, hsl(var(--muted) / 0.8), hsl(var(--muted) / 0.4))",
                      boxShadow: blockActive
                        ? isToday
                          ? `0 4px 16px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.3)`
                          : "0 3px 8px hsl(var(--primary) / 0.25), inset 0 1px 0 rgba(255,255,255,0.15)"
                        : "0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.08)",
                    }}
                  />
                  {/* Top shine */}
                  <div
                    className="absolute top-0 left-0 right-0 h-2.5 rounded-t-xl"
                    style={{
                      background: blockActive
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(255,255,255,0.06)",
                    }}
                  />
                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {blockActive ? (
                      <span className="text-white font-bold text-xs drop-shadow-sm">
                        {isToday ? fireEmoji : "✓"}
                      </span>
                    ) : (
                      <span className="text-white/20 text-xs">·</span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[9px] font-display font-semibold tracking-wide ${
                    isToday
                      ? checkedToday ? "text-green-500 font-black" : "text-orange-500 font-black"
                      : blockActive ? "text-white/60" : "text-white/30"
                  }`}
                >
                  {days[i]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress to next milestone */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-display text-white/40 uppercase tracking-widest">
              Próximo marco
            </span>
            <span className="text-[9px] font-display font-bold" style={{ color: gradientFrom }}>
              {displayStreak >= 30 ? "🏆 MAX" : displayStreak >= 14 ? "30 dias" : displayStreak >= 7 ? "14 dias" : displayStreak >= 3 ? "7 dias" : "3 dias"}
            </span>
          </div>
          <div className="h-2 bg-muted/40 rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{
                width: `${Math.min(100, (() => {
                  if (displayStreak >= 30) return 100;
                  if (displayStreak >= 14) return ((displayStreak - 14) / 16) * 100;
                  if (displayStreak >= 7) return ((displayStreak - 7) / 7) * 100;
                  if (displayStreak >= 3) return ((displayStreak - 3) / 4) * 100;
                  return (displayStreak / 3) * 100;
                })())}%`,
                background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
                boxShadow: `0 0 12px ${glowColor}`,
              }}
            />
          </div>
        </div>

        {/* Sarcastic message */}
        <div
          className="rounded-xl p-3 mt-2"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}10, ${gradientTo}08)`,
            border: `1px solid ${gradientFrom}20`,
          }}
        >
          <p className="font-body text-xs italic text-white/80 leading-relaxed">
            "{msg}"
          </p>
        </div>

        {/* CTA */}
        <div className="mt-3 text-center">
          {!checkedToday ? (
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-display text-xs font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                boxShadow: `0 4px 20px ${glowColor}`,
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              <span className="text-base">{displayStreak === 0 ? "💀" : "👆"}</span>
              {displayStreak === 0
                ? "Ressuscite sua sequência"
                : "Marcar presença agora"}
            </div>
          ) : (
            <p className="text-[10px] text-green-500/60 font-body italic">
              ✓ Presença confirmada. Agora vai fazer algo útil ou só veio olhar?
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
