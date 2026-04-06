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

  // Colors for streak level
  const streakColor = displayStreak >= 14
    ? { bg: "#FFD6D6", border: "#C0392B", shadow: "#922B21" }
    : displayStreak >= 7
    ? { bg: "#FFEAAE", border: "#D4A10A", shadow: "#B8890A" }
    : displayStreak >= 3
    ? { bg: "#D8F3DC", border: "#2D6A4F", shadow: "#1B4332" }
    : { bg: "#F0EDE8", border: "#6B7280", shadow: "#4B5563" };

  return (
    <div
      className="relative rounded-3xl overflow-hidden cursor-pointer select-none transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px]"
      style={{
        background: streakColor.bg,
        border: `4px solid ${streakColor.border}`,
        boxShadow: `8px 8px 0 ${streakColor.shadow}`,
      }}
      onClick={handleCheckIn}
    >
      <div className="relative z-10 p-5">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="dad-neo-badge" style={{
            background: streakColor.border,
            color: "white",
            borderColor: streakColor.shadow,
          }}>
            {statusLabel}
          </span>
          {checkedToday && (
            <span className="dad-neo-badge" style={{
              background: "#D8F3DC",
              color: "#1B4332",
              borderColor: "#2D6A4F",
              fontSize: "0.65rem",
              padding: "0.2rem 0.6rem",
            }}>
              ✓ PRESENTE HOJE
            </span>
          )}
        </div>

        {/* Main counter */}
        <div className="flex items-center gap-4 mb-5">
          <span className={`${displayStreak >= 14 ? "text-5xl" : displayStreak >= 7 ? "text-4xl" : "text-3xl"} inline-block ${animating ? "animate-bounce" : ""}`}>
            {fireEmoji}
          </span>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-black" style={{ color: streakColor.shadow }}>
                {displayStreak}
              </span>
              <span className="font-display text-base font-bold" style={{ color: streakColor.border }}>
                dia{displayStreak !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="font-body text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: streakColor.border }}>
              de sequência
            </span>
          </div>
        </div>

        {/* Week blocks — Neo style */}
        <div className="flex items-end justify-between gap-2 mb-5 px-0.5">
          {weekActivity.map((active, i) => {
            const todayIdx = (new Date().getDay() + 6) % 7;
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
                    background: blockActive
                      ? isToday ? streakColor.border : "#2D6A4F"
                      : "#E5E7EB",
                    border: `2px solid ${blockActive ? streakColor.shadow : "#D1D5DB"}`,
                    boxShadow: blockActive ? `3px 3px 0 ${streakColor.shadow}` : "2px 2px 0 #D1D5DB",
                    transform: isToday && animating ? "translateY(-6px) scale(1.08)" : "translateY(0)",
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {blockActive ? (
                      <span className="text-white font-bold text-xs">{isToday ? fireEmoji : "✓"}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">·</span>
                    )}
                  </div>
                </div>
                <span className={`text-[9px] font-display font-black tracking-wide`}
                  style={{ color: isToday ? streakColor.border : blockActive ? streakColor.shadow : "#9CA3AF" }}>
                  {days[i]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-display font-bold uppercase tracking-widest" style={{ color: streakColor.border }}>
              Próximo marco
            </span>
            <span className="text-[9px] font-display font-black" style={{ color: streakColor.shadow }}>
              {displayStreak >= 30 ? "🏆 MAX" : displayStreak >= 14 ? "30 dias" : displayStreak >= 7 ? "14 dias" : displayStreak >= 3 ? "7 dias" : "3 dias"}
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden relative" style={{
            background: "white",
            border: `2px solid ${streakColor.border}`,
          }}>
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(100, (() => {
                  if (displayStreak >= 30) return 100;
                  if (displayStreak >= 14) return ((displayStreak - 14) / 16) * 100;
                  if (displayStreak >= 7) return ((displayStreak - 7) / 7) * 100;
                  if (displayStreak >= 3) return ((displayStreak - 3) / 4) * 100;
                  return (displayStreak / 3) * 100;
                })())}%`,
                background: streakColor.border,
              }}
            />
          </div>
        </div>

        {/* Sarcastic message */}
        <div className="rounded-xl p-3 mt-2" style={{
          background: "rgba(255,255,255,0.6)",
          border: `2px solid ${streakColor.border}`,
          boxShadow: `3px 3px 0 ${streakColor.shadow}`,
        }}>
          <p className="font-body text-xs italic leading-relaxed" style={{ color: streakColor.shadow }}>
            "{msg}"
          </p>
        </div>

        {/* CTA */}
        <div className="mt-3 text-center">
          {!checkedToday ? (
            <span className="dad-neo-btn inline-flex" style={{
              background: streakColor.border,
              borderColor: streakColor.shadow,
              boxShadow: `6px 6px 0 ${streakColor.shadow}`,
            }}>
              <span className="text-base">{displayStreak === 0 ? "💀" : "👆"}</span>
              {displayStreak === 0 ? "Ressuscite sua sequência" : "Marcar presença agora"}
            </span>
          ) : (
            <p className="text-[10px] font-body italic font-bold" style={{ color: streakColor.border }}>
              ✓ Presença confirmada. Agora vai fazer algo útil ou só veio olhar?
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
