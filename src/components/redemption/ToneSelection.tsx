import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
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
    iconBg: "bg-[hsl(153,40%,92%)]",
  },
  {
    key: "leveza" as Tone,
    emoji: "😄",
    title: "Com Leveza",
    desc: "Com um sorriso. Do jeito que vocês se entendem.",
    prompt: "Escreva com o seu humor. Ela vai reconhecer.",
    gradient: "from-[hsl(25,90%,55%)] to-[hsl(15,85%,50%)]",
    glow: "hsl(25,90%,60%)",
    iconBg: "bg-[hsl(35,80%,92%)]",
  },
  {
    key: "romantico" as Tone,
    emoji: "💜",
    title: "Romântico",
    desc: "Do jeito que você sente mas não costuma falar.",
    prompt: "Escreva o que você nunca conseguiu dizer pessoalmente.",
    gradient: "from-[hsl(270,60%,50%)] to-[hsl(290,50%,45%)]",
    glow: "hsl(270,60%,55%)",
    iconBg: "bg-[hsl(270,50%,94%)]",
  },
  {
    key: "gratidao" as Tone,
    emoji: "🌻",
    title: "Gratidão",
    desc: "Reconhecendo tudo que ela faz.",
    prompt: "Escreva o que você vê nela e raramente fala em voz alta.",
    gradient: "from-[hsl(35,85%,50%)] to-[hsl(28,90%,45%)]",
    glow: "hsl(40,85%,55%)",
    iconBg: "bg-[hsl(45,80%,92%)]",
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
      background: "linear-gradient(165deg, hsl(340,30%,12%) 0%, hsl(300,20%,8%) 40%, hsl(260,25%,10%) 100%)",
    }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{
          background: "radial-gradient(circle, hsl(340,72%,57%), transparent 70%)",
          top: "-150px", right: "-100px",
        }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{
          background: "radial-gradient(circle, hsl(270,60%,50%), transparent 70%)",
          bottom: "-100px", left: "-100px",
        }} />
      </div>

      {/* Header */}
      <div className="relative flex items-center px-5 py-5">
        <button onClick={onBack} className="p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 transition-colors hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-display text-lg font-bold text-white/95 tracking-tight">
            Modo Redenção
          </h1>
          <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">Premium</p>
        </div>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {/* Intro */}
        <div className="mt-2 mb-6">
          <h2 className="font-display text-xl font-bold text-white/90 leading-tight">
            Que tipo de carta<br />você quer escrever?
          </h2>
          <p className="text-xs text-white/40 mt-2 leading-relaxed">
            Ela vai receber como uma carta animada. As palavras são suas.
          </p>
        </div>

        {/* Tone cards - 3D perspective grid */}
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
                  transformStyle: "preserve-3d",
                  transform: isSelected
                    ? "translateZ(12px) scale(1.02)"
                    : hoveredIdx === i
                      ? "translateZ(6px)"
                      : "translateZ(0)",
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isSelected ? "ring-2 ring-white/30" : ""
                }`}
                  style={{
                    background: isSelected
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(20px)",
                    border: isSelected
                      ? "1px solid rgba(255,255,255,0.2)"
                      : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: isSelected
                      ? `0 8px 32px rgba(0,0,0,0.3), 0 0 60px ${t.glow}15`
                      : "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {/* Gradient accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${t.gradient} transition-opacity duration-300 ${
                    isSelected ? "opacity-100" : "opacity-40"
                  }`} />

                  <div className="flex items-center gap-4 p-4 pl-5">
                    {/* Emoji container */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isSelected ? "scale-110" : ""
                    }`}
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${t.glow}30, ${t.glow}10)`
                          : "rgba(255,255,255,0.05)",
                        boxShadow: isSelected ? `0 4px 20px ${t.glow}20` : "none",
                      }}
                    >
                      <span className="text-2xl">{t.emoji}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-display text-sm font-bold transition-colors duration-300 ${
                        isSelected ? "text-white" : "text-white/70"
                      }`}>{t.title}</p>
                      <p className="text-[11px] text-white/35 mt-0.5 leading-snug">{t.desc}</p>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                        <div className="w-3 h-3 rounded-full bg-white" />
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
        background: "linear-gradient(to top, hsl(340,30%,12%), transparent)",
      }}>
        <Button
          onClick={onContinue}
          disabled={!selected}
          className="w-full rounded-2xl h-14 text-base font-display font-bold transition-all duration-300 border-0 disabled:opacity-30"
          style={{
            background: selected
              ? "linear-gradient(135deg, hsl(340,72%,57%), hsl(340,65%,48%))"
              : "rgba(255,255,255,0.08)",
            color: selected ? "white" : "rgba(255,255,255,0.3)",
            boxShadow: selected ? "0 8px 32px hsla(340,72%,57%,0.3), 0 2px 8px rgba(0,0,0,0.2)" : "none",
          }}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Continuar
        </Button>
      </div>

      <style>{`
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(20px) translateZ(-20px); }
          to { opacity: 1; transform: translateY(0) translateZ(0); }
        }
      `}</style>
    </div>
  );
}

export { TONES };
