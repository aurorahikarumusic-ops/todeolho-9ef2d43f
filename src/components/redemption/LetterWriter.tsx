import { ArrowLeft } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-50 bg-[hsl(35,80%,97%)] flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="flex-1 text-center font-display text-base font-bold">Sua carta</h1>
        <Button
          variant="ghost"
          size="sm"
          disabled={!canPreview}
          onClick={onPreview}
          className="text-xs font-display text-[hsl(153,42%,30%)]"
        >
          Pré-visualizar →
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        {/* Prompt card */}
        {showPrompt && (
          <div className="rounded-xl bg-[hsl(340,60%,97%)] p-3 mb-4 relative">
            <p className="font-body text-xs italic text-[hsl(340,50%,55%)] whitespace-pre-line">
              {PROMPTS[tone]}
            </p>
            <button
              onClick={() => setShowPrompt(false)}
              className="absolute top-2 right-2 text-[10px] text-muted-foreground"
            >
              ✕
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= 800) onChange(e.target.value);
          }}
          placeholder={PLACEHOLDERS[tone]}
          className="w-full min-h-[300px] bg-transparent border-none outline-none resize-none font-body text-base leading-[1.9] text-foreground placeholder:text-muted-foreground/50"
          autoFocus
        />
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <span className={`text-xs font-body ${charCount >= 50 ? "text-muted-foreground" : "text-secondary"}`}>
              {charCount}/800 caracteres
            </span>
            <span className="text-xs font-body text-muted-foreground">{wordCount} palavras</span>
          </div>
          {charCount >= 150 && charCount < 300 && (
            <span className="text-xs font-body text-[hsl(153,42%,30%)]">✓ Tá ficando bonita</span>
          )}
          {charCount < 50 && charCount > 0 && (
            <span className="text-[10px] font-body text-secondary">mínimo 50 caracteres</span>
          )}
        </div>
        <Button
          onClick={onPreview}
          disabled={!canPreview}
          className="w-full rounded-full bg-[hsl(340,72%,57%)] hover:bg-[hsl(340,72%,50%)] text-white font-display font-bold h-12 text-base disabled:opacity-40"
        >
          {canPreview ? "✉️ Pré-visualizar e enviar carta" : `✉️ Escreva mais ${50 - charCount} caracteres`}
        </Button>
      </div>
    </div>
  );
}
