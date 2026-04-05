import { ArrowLeft, Eye, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tone } from "./ModoRedencao";
import { useState } from "react";

const PLACEHOLDERS: Record<Tone, string> = {
  coracao: "Começa assim: 'Eu sei que...'",
  leveza: "Começa assim: 'Olha, o app me disse que eu tô indo mal...'",
  romantico: "Começa assim: 'Tem coisas que eu sinto mas que travo...'",
  gratidao: "Começa assim: 'Eu vejo o que você faz. Mesmo quando não mostro...'",
};

const PROMPTS: Record<Tone, string> = {
  coracao: "Escreva o que você sente de verdade.\nNão precisa ser perfeito — precisa ser seu.",
  leveza: "Escreva com o seu humor. Ela vai reconhecer.",
  romantico: "Escreva o que você nunca conseguiu dizer pessoalmente.",
  gratidao: "Escreva o que você vê nela e raramente fala em voz alta.",
};

const TONE_COLORS: Record<Tone, { accent: string; glow: string }> = {
  coracao: { accent: "hsl(153,50%,40%)", glow: "hsl(153,50%,40%)" },
  leveza: { accent: "hsl(25,90%,55%)", glow: "hsl(25,90%,60%)" },
  romantico: { accent: "hsl(270,60%,55%)", glow: "hsl(270,60%,55%)" },
  gratidao: { accent: "hsl(40,85%,50%)", glow: "hsl(40,85%,55%)" },
};

interface Props {
  tone: Tone;
  content: string;
  onChange: (v: string) => void;
  onPreview: () => void;
  onBack: () => void;
}

export default function LetterWriter({ tone, content, onChange, onPreview, onBack }: Props) {
  const [showPrompt, setShowPrompt] = useState(true);
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const canPreview = charCount >= 50;
  const colors = TONE_COLORS[tone];
  const progress = Math.min(charCount / 50, 1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{
      background: "linear-gradient(165deg, hsl(340,30%,12%) 0%, hsl(300,20%,8%) 50%, hsl(260,25%,10%) 100%)",
    }}>
      {/* Ambient glow based on tone */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.04] transition-all duration-1000" style={{
          background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
          top: "-200px", right: "-200px",
        }} />
      </div>

      {/* Header */}
      <div className="relative flex items-center px-5 py-4 border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-display text-base font-bold text-white/90 flex items-center justify-center gap-2">
            <Feather className="w-4 h-4 text-white/50" />
            Sua carta
          </h1>
        </div>
        <button
          onClick={onPreview}
          disabled={!canPreview}
          className="p-2 rounded-full transition-all duration-300"
          style={{
            background: canPreview ? `${colors.accent}25` : "transparent",
            border: canPreview ? `1px solid ${colors.accent}40` : "1px solid transparent",
          }}
        >
          <Eye className={`w-5 h-5 transition-colors ${canPreview ? "text-white/80" : "text-white/20"}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-40">
        {/* Prompt card */}
        {showPrompt && (
          <div className="rounded-2xl p-4 mb-5 relative overflow-hidden" style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${colors.accent}20`,
            backdropFilter: "blur(12px)",
          }}>
            <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: colors.accent, opacity: 0.5 }} />
            <p className="text-xs text-white/50 italic whitespace-pre-line leading-relaxed pl-3">
              {PROMPTS[tone]}
            </p>
            <button
              onClick={() => setShowPrompt(false)}
              className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 text-[10px] transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Writing area with paper aesthetic */}
        <div className="relative rounded-2xl p-5 min-h-[350px]" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,0.02) 31px, rgba(255,255,255,0.02) 32px)",
        }}>
          <textarea
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= 800) onChange(e.target.value);
            }}
            placeholder={PLACEHOLDERS[tone]}
            className="w-full min-h-[300px] bg-transparent border-none outline-none resize-none text-base leading-[2] text-white/85 placeholder:text-white/15"
            style={{ fontFamily: "'Caveat', cursive", fontSize: "18px" }}
            autoFocus
          />
        </div>
      </div>

      {/* Bottom bar - glassmorphic */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-4 space-y-3" style={{
        background: "linear-gradient(to top, hsl(340,30%,12%) 60%, transparent)",
      }}>
        {/* Progress + stats */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <span className="text-[11px] text-white/30">{charCount}/800</span>
            <span className="text-[11px] text-white/20">{wordCount} palavras</span>
          </div>
          {charCount >= 150 && charCount < 300 && (
            <span className="text-[11px] text-white/50">✓ Tá ficando bonita</span>
          )}
          {charCount > 0 && charCount < 50 && (
            <span className="text-[10px] text-white/30">mínimo 50 caracteres</span>
          )}
        </div>

        {/* Progress bar */}
        {!canPreview && charCount > 0 && (
          <div className="h-0.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 ease-out" style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${colors.accent}, ${colors.glow})`,
            }} />
          </div>
        )}

        <Button
          onClick={onPreview}
          disabled={!canPreview}
          className="w-full rounded-2xl h-14 text-base font-display font-bold border-0 disabled:opacity-20 transition-all duration-300"
          style={{
            background: canPreview
              ? "linear-gradient(135deg, hsl(340,72%,57%), hsl(340,65%,48%))"
              : "rgba(255,255,255,0.06)",
            color: canPreview ? "white" : "rgba(255,255,255,0.2)",
            boxShadow: canPreview ? "0 8px 32px hsla(340,72%,57%,0.3)" : "none",
          }}
        >
          {canPreview ? "✉️ Pré-visualizar e enviar" : `✉️ Mais ${50 - charCount} caracteres`}
        </Button>
      </div>
    </div>
  );
}
