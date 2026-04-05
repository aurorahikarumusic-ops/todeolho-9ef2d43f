import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const HEART_COLORS = ["hsl(340,72%,57%)", "hsl(15,90%,63%)", "hsl(153,42%,30%)"];

export default function SendConfirmation({ onClose }: { onClose: () => void }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6">
      {/* CSS Confetti hearts */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-xl"
              style={{
                left: `${5 + Math.random() * 90}%`,
                color: HEART_COLORS[i % 3],
                animation: `heartFall ${3 + Math.random() * 2}s ease-in forwards`,
                animationDelay: `${Math.random() * 1.5}s`,
                top: "-20px",
              }}
            >
              ♥
            </div>
          ))}
        </div>
      )}

      {/* Envelope animation */}
      <div className="relative w-24 h-16 mb-8">
        <div className="w-24 h-16 rounded bg-[hsl(340,72%,57%)] relative overflow-hidden"
          style={{ animation: "envelopePulse 2s ease-in-out infinite" }}>
          <div className="absolute inset-0 bg-white/20" style={{
            clipPath: "polygon(0 0, 50% 55%, 100% 0)",
          }} />
          {/* Heart float */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl"
            style={{ animation: "heartFloatUp 2s ease-in-out infinite" }}>
            ♥
          </div>
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold text-[hsl(153,42%,30%)] mb-2">
        Carta enviada! 💌
      </h1>

      <p className="font-body text-sm italic text-muted-foreground text-center mb-2">
        Ela vai receber agora no app.
      </p>

      <p className="text-[10px] text-muted-foreground text-center mb-8">
        Você escreveu. Com suas palavras. Isso é o que importa.
      </p>

      {/* Points toast */}
      <div className="bg-[hsl(153,42%,30%)] text-white rounded-full px-4 py-2 text-sm font-display font-bold mb-8 animate-bounce">
        +20 pontos ⭐
      </div>

      <Button
        onClick={onClose}
        className="w-full max-w-xs rounded-full bg-[hsl(153,42%,30%)] hover:bg-[hsl(153,42%,25%)] text-white font-display font-bold h-12"
      >
        Voltar ao início
      </Button>

      <style>{`
        @keyframes heartFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes envelopePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes heartFloatUp {
          0% { transform: translate(-50%, 10px) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -20px) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -40px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
