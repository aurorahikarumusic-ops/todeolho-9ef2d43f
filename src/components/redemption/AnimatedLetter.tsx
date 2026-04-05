import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface LetterData {
  id: string;
  tone: string;
  content: string;
  date_label?: string | null;
  sender_name?: string | null;
  recipient_name?: string | null;
  include_signature?: boolean;
}

interface Props {
  letter: LetterData;
  skipEnvelope?: boolean;
  onClose: () => void;
}

const PHASE_DURATIONS = {
  envelope: 2000,
  seal: 1500,
  flap: 1500,
  rise: 2000,
  expand: 1000,
  text: 0, // dynamic
};

export default function AnimatedLetter({ letter, skipEnvelope = false, onClose }: Props) {
  const [phase, setPhase] = useState(skipEnvelope ? 5 : 0);
  const navigate = useNavigate();

  // Mark as opened
  useEffect(() => {
    supabase.from("love_letters").update({ opened_at: new Date().toISOString() }).eq("id", letter.id);
  }, [letter.id]);

  // Phase progression
  useEffect(() => {
    if (phase >= 6) return;
    const delays = [2000, 1500, 1500, 2000, 1200, 0];
    if (phase < 5) {
      const timer = setTimeout(() => setPhase(p => p + 1), delays[phase]);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const paragraphs = letter.content.split("\n").filter(p => p.trim());
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    return <FullScreenLetter letter={letter} paragraphs={paragraphs} onClose={onClose} />;
  }

  // Phases 0-4: Envelope animation
  if (phase < 5) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center transition-colors duration-[2s]"
        style={{ backgroundColor: phase === 0 ? "#0F0A06" : "hsl(35,80%,97%)" }}
      >
        {/* Envelope container */}
        <div
          className="relative"
          style={{
            width: 280, height: 180,
            perspective: "800px",
            transformStyle: "preserve-3d",
            animation: phase === 0
              ? "envelopeArrive 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards"
              : phase >= 3 ? "gentleShake 0.3s ease" : undefined,
          }}
        >
          {/* Envelope body */}
          <div className="absolute inset-0 rounded" style={{
            background: "#D4956A",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)",
            border: "1px solid #B8794E",
          }}>
            {/* Inner V fold */}
            <div className="absolute inset-0" style={{
              clipPath: "polygon(0 100%, 50% 45%, 100% 100%)",
              background: "#BA7A50",
            }} />
            <div className="absolute inset-0" style={{
              clipPath: "polygon(0 0, 0 100%, 55% 50%)",
              background: "#C98A60",
            }} />
            <div className="absolute inset-0" style={{
              clipPath: "polygon(100% 0, 100% 100%, 45% 50%)",
              background: "#C98A60",
            }} />

            {/* Inner glow when flap opens */}
            {phase >= 3 && (
              <div className="absolute inset-4 rounded" style={{
                background: "radial-gradient(ellipse, rgba(255,248,240,0.9), transparent)",
                animation: "fadeIn 1s ease forwards",
              }} />
            )}
          </div>

          {/* Letter paper rising */}
          {phase >= 4 && (
            <div
              className="absolute left-5 right-5 bg-[#FFFEF9] rounded-sm shadow-lg"
              style={{
                height: 200,
                animation: "letterRise 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.03) 27px, rgba(0,0,0,0.03) 28px)",
              }}
            />
          )}

          {/* Flap */}
          <div
            className="absolute top-0 left-0 right-0 z-20"
            style={{
              width: 280, height: 140,
              clipPath: "polygon(0 0, 50% 55%, 100% 0)",
              background: "#C4855A",
              transformOrigin: "top center",
              animation: phase >= 3 ? "flapOpen 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards" : undefined,
            }}
          />

          {/* Wax seal */}
          {phase < 2 && (
            <div
              className="absolute z-30 flex items-center justify-center"
              style={{
                width: 44, height: 44,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #CC2222, #8B1A1A)",
                boxShadow: "0 3px 10px rgba(139,26,26,0.5), inset 0 1px 3px rgba(255,255,255,0.2)",
                top: "50%", left: "50%",
                transform: "translate(-50%, -70%)",
                animation: phase >= 1 ? "sealBreak 0.8s ease forwards" : undefined,
              }}
            >
              <span className="text-sm">👁️</span>
            </div>
          )}

          {/* Floating hearts */}
          {phase >= 4 && [0, 1, 2, 3].map(i => (
            <span
              key={i}
              className="absolute text-lg"
              style={{
                left: `${20 + i * 20}%`,
                bottom: "50%",
                color: i % 2 === 0 ? "#E8528A" : "#F4845F",
                animation: `heartFloat 1.5s ease-out forwards`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0,
              }}
            >
              ♥
            </span>
          ))}
        </div>

        {/* Phase indicator */}
        <div className="absolute bottom-8 text-white/50 text-xs font-body italic">
          {phase === 0 && "Uma carta chegou..."}
          {phase === 1 && "Quebrando o selo..."}
          {phase === 2 && "Abrindo..."}
          {phase >= 3 && "✨"}
        </div>
      </div>
    );
  }

  // Phase 5+: Full screen letter
  return <FullScreenLetter letter={letter} paragraphs={paragraphs} onClose={onClose} />;
}

function FullScreenLetter({ letter, paragraphs, onClose }: {
  letter: LetterData; paragraphs: string[]; onClose: () => void;
}) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showFlourish, setShowFlourish] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const totalLines = 2 + paragraphs.length + 2; // date + salutation + paras + closing + signature

  useEffect(() => {
    if (visibleLines >= totalLines) {
      setTimeout(() => setShowFlourish(true), 500);
      return;
    }
    const timer = setTimeout(() => setVisibleLines(v => v + 1), 700);
    return () => clearTimeout(timer);
  }, [visibleLines, totalLines]);

  const handleSave = async () => {
    await supabase.from("love_letters").update({ saved_by_recipient: true }).eq("id", letter.id);
    setSaved(true);
  };

  const lineStyle = (idx: number) => ({
    animation: visibleLines > idx ? "textReveal 0.8s ease forwards" : undefined,
    opacity: visibleLines > idx ? undefined : 0,
  });

  return (
    <div className="fixed inset-0 z-[100] bg-[#FFFEF9] overflow-y-auto"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.03) 27px, rgba(0,0,0,0.03) 28px)",
        animation: "letterExpand 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      }}
    >
      {/* Petals */}
      {showFlourish && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-20px",
                width: `${8 + Math.random() * 6}px`,
                height: `${8 + Math.random() * 6}px`,
                background: i % 2 === 0 ? "hsl(340,60%,82%)" : "hsl(340,72%,57%)",
                borderRadius: "60% 40% 60% 40%",
                animation: `petalFall ${4 + Math.random() * 2}s ease-in forwards`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-md mx-auto px-7 pt-12 pb-24">
        {/* Date */}
        {letter.date_label && (
          <p className="font-body text-[11px] text-muted-foreground mb-6" style={lineStyle(0)}>
            {letter.date_label}
          </p>
        )}

        {/* Salutation */}
        <p className="text-[22px] font-bold text-[hsl(20,30%,15%)] mb-5"
          style={{ fontFamily: "'Caveat', cursive", ...lineStyle(1) }}>
          {letter.recipient_name || "Amor"},
        </p>

        {/* Body */}
        {paragraphs.map((p, i) => (
          <p key={i} className="text-xl leading-[2] text-[hsl(20,30%,15%)] mb-3"
            style={{ fontFamily: "'Caveat', cursive", ...lineStyle(2 + i) }}>
            {p}
          </p>
        ))}

        {/* Closing */}
        <p className="text-lg italic text-[hsl(20,30%,15%)] mt-6"
          style={{ fontFamily: "'Caveat', cursive", ...lineStyle(2 + paragraphs.length) }}>
          Com amor,
        </p>
        <p className="text-2xl font-bold text-[hsl(20,30%,12%)]"
          style={{ fontFamily: "'Caveat', cursive", ...lineStyle(3 + paragraphs.length) }}>
          {letter.sender_name || "Pai"}
        </p>

        {letter.include_signature && (
          <p className="text-[10px] text-[hsl(340,72%,57%)] opacity-70 mt-3 font-body">
            enviado pelo Tô de Olho 👁️
          </p>
        )}
      </div>

      {/* Action bar */}
      {showFlourish && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border px-4 py-4 space-y-2"
          style={{ animation: "fadeIn 0.5s ease" }}>
          <Button
            onClick={() => { onClose(); navigate("/avaliacao"); }}
            className="w-full rounded-full bg-[hsl(340,72%,57%)] hover:bg-[hsl(340,72%,50%)] text-white font-display font-bold h-11"
          >
            💌 Responder com avaliação
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saved}
            className="w-full rounded-full border-[hsl(153,42%,30%)] text-[hsl(153,42%,30%)] font-display font-bold h-11"
          >
            {saved ? "✓ Carta guardada" : "Guardar carta"}
          </Button>
        </div>
      )}

      <style>{`
        @keyframes textReveal {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes petalFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes letterExpand {
          0% { transform: scale(0.4) translateY(-20px); opacity: 0.8; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes envelopeArrive {
          0% { transform: translateY(-120vh) rotate(-5deg); opacity: 0; }
          70% { transform: translateY(10px) rotate(1deg); opacity: 1; }
          85% { transform: translateY(-5px) rotate(-0.5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes sealBreak {
          0% { transform: translate(-50%, -70%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -70%) scale(1.1); }
          100% { transform: translate(-50%, -70%) scale(0) rotate(20deg); opacity: 0; }
        }
        @keyframes flapOpen {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(-180deg); }
        }
        @keyframes letterRise {
          0% { transform: translateY(140px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(-20px); }
        }
        @keyframes heartFloat {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          30% { opacity: 1; transform: translateY(-20px) scale(1); }
          100% { transform: translateY(-80px) scale(0.5); opacity: 0; }
        }
        @keyframes gentleShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}
