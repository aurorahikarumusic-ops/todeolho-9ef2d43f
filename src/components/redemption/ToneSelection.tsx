import { useState } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tone } from "./ModoRedencao";

const TONES = [
  {
    key: "coracao" as Tone,
    emoji: "💚",
    title: "Do Coração",
    desc: "Sincero e direto. Sem floreio.",
    prompt: "Escreva o que você sente de verdade.\nNão precisa ser perfeito — precisa ser seu.",
    gradient: "from-[hsl(153,50%,30%)] to-[hsl(160,60%,40%)]",
    glow: "hsl(153,50%,40%)",
  },
  {
    key: "leveza" as Tone,
    emoji: "😄",
    title: "Com Leveza",
    desc: "Com um sorriso. Do jeito que vocês se entendem.",
    prompt: "Escreva com o seu humor. Ela vai reconhecer.",
    gradient: "from-[hsl(25,90%,55%)] to-[hsl(15,85%,50%)]",
    glow: "hsl(25,90%,60%)",
  },
  {
    key: "romantico" as Tone,
    emoji: "💜",
    title: "Romântico",
    desc: "Do jeito que você sente mas não costuma falar.",
    prompt: "Escreva o que você nunca conseguiu dizer pessoalmente.",
    gradient: "from-[hsl(330,60%,50%)] to-[hsl(340,70%,45%)]",
    glow: "hsl(330,60%,55%)",
  },
  {
    key: "gratidao" as Tone,
    emoji: "🌻",
    title: "Gratidão",
    desc: "Reconhecendo tudo que ela faz.",
    prompt: "Escreva o que você vê nela e raramente fala em voz alta.",
    gradient: "from-[hsl(35,85%,50%)] to-[hsl(28,90%,45%)]",
    glow: "hsl(40,85%,55%)",
  },
];

interface Props {
  selected: Tone | null;
  onSelect: (t: Tone) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function ToneSelection({ selected, onSelect, onContinue, onBack }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{
      background: "linear-gradient(175deg, hsl(345,35%,14%) 0%, hsl(350,25%,9%) 40%, hsl(340,20%,7%) 100%)",
    }}>
      {/* Romantic ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.08]" style={{
          background: "radial-gradient(circle, hsl(340,70%,55%), transparent 65%)",
          top: "-200px", right: "-150px",
        }} />
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05]" style={{
          background: "radial-gradient(circle, hsl(20,80%,55%), transparent 65%)",
          bottom: "-150px", left: "-150px",
        }} />
        {/* Subtle floating hearts */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="absolute text-[10px] opacity-[0.06]" style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `floatHeart ${6 + i * 1.2}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}>♥</div>
        ))}
      </div>

      {/* Header */}
      <div className="relative flex items-center px-5 py-5">
        <button onClick={onBack} className="p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/8 transition-colors hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-display text-lg font-bold text-white/90 tracking-tight flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-[hsl(340,70%,60%)] fill-[hsl(340,70%,60%)]" />
            Modo Redenção
          </h1>
          <p className="text-[10px] text-[hsl(340,50%,55%)] tracking-[0.2em] uppercase mt-0.5">com amor</p>
        </div>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {/* Intro */}
        <div className="mt-2 mb-6">
          <h2 className="font-display text-xl font-bold text-white/85 leading-tight">
            Que tipo de carta<br />você quer escrever?
          </h2>
          <p className="text-xs text-white/30 mt-2 leading-relaxed italic">
            Ela vai receber como uma carta animada. As palavras são suas.
          </p>
        </div>

        {/* Tone cards */}
        <div className="space-y-3" style={{ perspective: "1000px" }}>
          {TONES.map((t, i) => {
            const isSelected = selected === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onSelect(t.key)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="w-full text-left transition-all duration-300 ease-out"
                style={{
                  transform: isSelected ? "scale(1.02)" : hoveredIdx === i ? "scale(1.01)" : "scale(1)",
                }}
              >
                <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isSelected ? "ring-1 ring-[hsl(340,50%,45%)]" : ""
                }`}
                  style={{
                    background: isSelected
                      ? "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,220,220,0.04))"
                      : "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(16px)",
                    border: isSelected
                      ? "1px solid rgba(255,180,180,0.15)"
                      : "1px solid rgba(255,255,255,0.04)",
                    boxShadow: isSelected
                      ? `0 8px 32px rgba(0,0,0,0.25), 0 0 40px ${t.glow}10`
                      : "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  {/* Gradient accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${t.gradient} transition-opacity duration-300 ${
                    isSelected ? "opacity-100" : "opacity-30"
                  }`} />

                  <div className="flex items-center gap-4 p-4 pl-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isSelected ? "scale-110" : ""
                    }`}
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${t.glow}20, ${t.glow}08)`
                          : "rgba(255,255,255,0.03)",
                        boxShadow: isSelected ? `0 4px 16px ${t.glow}15` : "none",
                      }}
                    >
                      <span className="text-2xl">{t.emoji}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-display text-sm font-bold transition-colors duration-300 ${
                        isSelected ? "text-white/95" : "text-white/60"
                      }`}>{t.title}</p>
                      <p className="text-[11px] text-white/25 mt-0.5 leading-snug">{t.desc}</p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{
                        background: "linear-gradient(135deg, hsl(340,70%,55%), hsl(340,60%,45%))",
                        boxShadow: "0 2px 8px hsla(340,70%,55%,0.3)",
                      }}>
                        <Heart className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-4" style={{
        background: "linear-gradient(to top, hsl(345,35%,10%), transparent)",
      }}>
        <Button
          onClick={onContinue}
          disabled={!selected}
          className="w-full rounded-2xl h-14 text-base font-display font-bold transition-all duration-300 border-0 disabled:opacity-20"
          style={{
            background: selected
              ? "linear-gradient(135deg, hsl(340,70%,52%), hsl(350,60%,42%))"
              : "rgba(255,255,255,0.05)",
            color: selected ? "white" : "rgba(255,255,255,0.2)",
            boxShadow: selected ? "0 8px 32px hsla(340,70%,50%,0.3), 0 0 60px hsla(340,70%,50%,0.08)" : "none",
          }}
        >
          <Heart className="w-4 h-4 mr-2 fill-current" />
          Continuar
        </Button>
      </div>

      <style>{`
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.06; }
          50% { transform: translateY(-20px) scale(1.3); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}

export { TONES };
