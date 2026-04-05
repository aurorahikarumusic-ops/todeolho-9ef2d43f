import { useState } from "react";
import { useReceivedLetters } from "@/hooks/useRedemption";
import AnimatedLetter from "./AnimatedLetter";

export default function MomLetterNotification() {
  const { data: letters } = useReceivedLetters();
  const [showLetter, setShowLetter] = useState(false);

  const unread = letters?.find(l => !l.opened_at);
  if (!unread) return null;

  if (showLetter) {
    return (
      <AnimatedLetter
        letter={{
          id: unread.id,
          tone: unread.tone,
          content: unread.content,
          date_label: unread.date_label,
          sender_name: unread.sender_name,
          recipient_name: unread.recipient_name,
          include_signature: unread.include_signature ?? false,
        }}
        onClose={() => setShowLetter(false)}
      />
    );
  }

  return (
    <button
      onClick={() => setShowLetter(true)}
      className="w-full rounded-2xl border-[1.5px] border-[hsl(340,60%,82%)] overflow-hidden transition-all hover:shadow-lg"
      style={{
        background: "linear-gradient(135deg, hsl(340,60%,97%), hsl(340,70%,93%))",
        animation: "pulseGlow 2s infinite",
      }}
    >
      <div className="p-4 flex items-center gap-3">
        <span className="text-3xl" style={{ animation: "envelopeRock 1.5s ease-in-out infinite" }}>
          ✉️
        </span>
        <div className="text-left flex-1">
          <p className="font-display text-sm font-bold text-[hsl(340,40%,25%)]">
            💌 {unread.sender_name || "Pai"} te mandou uma carta
          </p>
          <p className="font-body text-[11px] italic text-[hsl(340,50%,55%)]">
            Toca pra abrir
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 hsla(340,60%,82%,0.4); }
          50% { box-shadow: 0 0 0 6px hsla(340,60%,82%,0); }
        }
        @keyframes envelopeRock {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>
    </button>
  );
}
