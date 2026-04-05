import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tone } from "./ModoRedencao";

const TONES = [
  {
    key: "coracao" as Tone,
    emoji: "💚",
    title: "Do Coração",
    bg: "bg-[hsl(140,60%,96%)]",
    border: "border-[hsl(160,40%,78%)]",
    activeBorder: "border-[hsl(153,42%,30%)]",
    desc: "Sincero e direto. Sem floreio.",
    prompt: "Escreva o que você sente de verdade.\nNão precisa ser perfeito — precisa ser seu.",
  },
  {
    key: "leveza" as Tone,
    emoji: "😄",
    title: "Com Leveza",
    bg: "bg-[hsl(35,80%,96%)]",
    border: "border-[hsl(35,70%,72%)]",
    activeBorder: "border-[hsl(15,90%,63%)]",
    desc: "Com um sorriso. Do jeito que vocês se entendem.",
    prompt: "Escreva com o seu humor. Ela vai reconhecer.",
  },
  {
    key: "romantico" as Tone,
    emoji: "💜",
    title: "Romântico",
    bg: "bg-[hsl(270,60%,97%)]",
    border: "border-[hsl(260,50%,80%)]",
    activeBorder: "border-[hsl(263,83%,58%)]",
    desc: "Do jeito que você sente mas não costuma falar.",
    prompt: "Escreva o que você nunca conseguiu dizer pessoalmente.",
  },
  {
    key: "gratidao" as Tone,
    emoji: "🌻",
    title: "Gratidão",
    bg: "bg-[hsl(45,90%,96%)]",
    border: "border-[hsl(45,70%,72%)]",
    activeBorder: "border-[hsl(28,95%,35%)]",
    desc: "Reconhecendo tudo que ela faz.",
    prompt: "Escreva o que você vê nela e raramente fala em voz alta.",
  },
];

interface Props {
  selected: Tone | null;
  onSelect: (t: Tone) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function ToneSelection({ selected, onSelect, onContinue, onBack }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="flex-1 text-center font-display text-lg font-bold text-[hsl(340,40%,25%)]">
          Modo Redenção 💌
        </h1>
        <div className="w-7" />
      </div>

      <div className="flex-1 px-4 py-6 space-y-5">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            Que tipo de carta você quer escrever?
          </h2>
          <p className="font-body text-xs italic text-muted-foreground mt-1">
            Ela vai receber como uma carta animada. As palavras são suas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TONES.map((t) => {
            const isSelected = selected === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onSelect(t.key)}
                className={`rounded-[14px] p-4 border-[1.5px] text-left transition-all ${t.bg} ${
                  isSelected ? `${t.activeBorder} border-2 shadow-md scale-[1.02]` : t.border
                }`}
              >
                <span className="text-2xl block mb-2">{t.emoji}</span>
                <p className="font-display text-sm font-bold text-foreground">{t.title}</p>
                <p className="font-body text-[11px] text-muted-foreground mt-1 leading-snug">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <div className="px-4 pb-6 pt-2">
        <Button
          onClick={onContinue}
          disabled={!selected}
          className="w-full rounded-full bg-[hsl(153,42%,30%)] hover:bg-[hsl(153,42%,25%)] text-white font-display font-bold h-12 text-base"
        >
          Continuar →
        </Button>
      </div>
    </div>
  );
}

export { TONES };
