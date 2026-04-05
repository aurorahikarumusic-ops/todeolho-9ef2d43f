import { Heart, Leaf, Sun, Star } from "lucide-react";
import { Tone } from "./ModoRedencao";

interface Props {
  tone: Tone;
  content: string;
  recipient: string;
  senderName: string;
  includeDate: boolean;
  includeSignature: boolean;
  today: string;
}

export default function ThemedLetterCard({
  tone, content, recipient, senderName, includeDate, includeSignature, today,
}: Props) {
  if (tone === "coracao") return <CoracaoLetter {...{ content, recipient, senderName, includeDate, includeSignature, today }} />;
  if (tone === "leveza") return <LevezaLetter {...{ content, recipient, senderName, includeDate, includeSignature, today }} />;
  if (tone === "romantico") return <RomanticoLetter {...{ content, recipient, senderName, includeDate, includeSignature, today }} />;
  return <GratidaoLetter {...{ content, recipient, senderName, includeDate, includeSignature, today }} />;
}

type LetterProps = Omit<Props, "tone">;

/* ═══════════════════════════════════════════
   💚 DO CORAÇÃO — Clean, honest, kraft paper 
   ═══════════════════════════════════════════ */
function CoracaoLetter({ content, recipient, senderName, includeDate, includeSignature, today }: LetterProps) {
  return (
    <div className="relative mx-auto max-w-md" style={{ perspective: "1200px" }}>
      <div className="relative rounded-xl overflow-hidden"
        style={{
          transform: "rotateX(1deg)",
          background: "linear-gradient(170deg, hsl(35,35%,88%), hsl(30,30%,82%))",
          boxShadow: "0 20px 50px rgba(40,30,20,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        {/* Kraft paper texture */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(120,90,60,0.06) 30px, rgba(120,90,60,0.06) 31px),
            repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(120,90,60,0.03) 50px, rgba(120,90,60,0.03) 51px)
          `,
        }} />

        {/* Green accent stripe top */}
        <div className="h-1.5" style={{ background: "linear-gradient(90deg, hsl(153,50%,35%), hsl(160,45%,40%))" }} />

        <div className="relative p-6">
          {includeDate && (
            <p className="text-[10px] text-[hsl(30,25%,45%)] mb-4 font-body tracking-wide uppercase">
              {today}
            </p>
          )}

          <p className="text-xl font-bold text-[hsl(25,40%,15%)] mb-3" style={{ fontFamily: "'Caveat', cursive" }}>
            {recipient},
          </p>

          <div className="text-lg leading-[2] text-[hsl(25,35%,18%)] whitespace-pre-line" style={{ fontFamily: "'Caveat', cursive" }}>
            {content}
          </div>

          <div className="mt-8 flex items-end justify-between">
            <div>
              <p className="text-base text-[hsl(25,30%,30%)]" style={{ fontFamily: "'Caveat', cursive" }}>
                De coração,
              </p>
              <p className="text-xl font-bold text-[hsl(25,40%,15%)]" style={{ fontFamily: "'Caveat', cursive" }}>
                {senderName}
              </p>
            </div>
            {/* Green leaf seal */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
              background: "linear-gradient(135deg, hsl(153,45%,38%), hsl(153,50%,28%))",
              boxShadow: "0 3px 10px rgba(30,80,50,0.3)",
            }}>
              <Leaf className="w-4 h-4 text-white/80" />
            </div>
          </div>

          {includeSignature && (
            <p className="text-[9px] text-[hsl(153,30%,40%)] opacity-60 mt-4 font-body">
              enviado pelo Estou de Olho 👁️
            </p>
          )}
        </div>
      </div>
      <div className="absolute -bottom-2 left-6 right-6 h-5 rounded-b-xl" style={{
        background: "rgba(40,30,20,0.1)", filter: "blur(8px)",
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   😄 COM LEVEZA — Bright, playful, rounded 
   ═══════════════════════════════════════════ */
function LevezaLetter({ content, recipient, senderName, includeDate, includeSignature, today }: LetterProps) {
  return (
    <div className="relative mx-auto max-w-md" style={{ perspective: "1200px" }}>
      <div className="relative rounded-3xl overflow-hidden"
        style={{
          transform: "rotateX(1.5deg) rotateY(0.5deg)",
          background: "linear-gradient(155deg, hsl(45,80%,96%), hsl(40,70%,92%), hsl(35,60%,90%))",
          boxShadow: "0 20px 50px rgba(80,50,20,0.2), inset 0 2px 0 rgba(255,255,255,0.5)",
        }}
      >
        {/* Playful dots pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle, hsl(25,80%,50%) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />

        {/* Orange wavy top */}
        <div className="relative h-3 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-6" style={{
            background: "linear-gradient(90deg, hsl(25,85%,55%), hsl(15,80%,52%), hsl(30,90%,58%))",
            borderRadius: "0 0 50% 50%",
          }} />
        </div>

        {/* Emoji decorations */}
        <div className="absolute top-4 right-4 text-lg opacity-20 rotate-12">😄</div>
        <div className="absolute bottom-12 left-3 text-sm opacity-15 -rotate-6">🌟</div>

        <div className="relative p-6 pt-5">
          {includeDate && (
            <div className="inline-block rounded-full px-3 py-1 mb-4" style={{
              background: "rgba(255,150,50,0.1)",
              border: "1px solid rgba(255,150,50,0.15)",
            }}>
              <p className="text-[10px] text-[hsl(25,70%,40%)] font-body font-bold">
                📅 {today}
              </p>
            </div>
          )}

          <p className="text-xl font-bold text-[hsl(20,50%,18%)] mb-2" style={{ fontFamily: "'Caveat', cursive" }}>
            E aí, {recipient}! 👋
          </p>

          <div className="text-lg leading-[1.9] text-[hsl(20,40%,20%)] whitespace-pre-line" style={{ fontFamily: "'Caveat', cursive" }}>
            {content}
          </div>

          <div className="mt-6 p-3 rounded-2xl" style={{
            background: "rgba(255,150,50,0.06)",
            border: "1px dashed rgba(255,150,50,0.15)",
          }}>
            <p className="text-base text-[hsl(20,40%,25%)]" style={{ fontFamily: "'Caveat', cursive" }}>
              Com um sorriso (e um pouquinho de vergonha),
            </p>
            <p className="text-xl font-bold text-[hsl(20,50%,18%)]" style={{ fontFamily: "'Caveat', cursive" }}>
              {senderName} 😊
            </p>
          </div>

          {includeSignature && (
            <p className="text-[9px] text-[hsl(25,50%,45%)] opacity-60 mt-3 font-body text-center">
              enviado pelo Estou de Olho 👁️
            </p>
          )}
        </div>

        {/* Sun seal bottom-right */}
        <div className="absolute -bottom-3 right-8 w-12 h-12 rounded-full flex items-center justify-center" style={{
          background: "linear-gradient(135deg, hsl(35,90%,55%), hsl(25,85%,48%))",
          boxShadow: "0 4px 12px rgba(200,100,20,0.3)",
        }}>
          <Sun className="w-5 h-5 text-white/80" />
        </div>
      </div>
      <div className="absolute -bottom-2 left-6 right-6 h-5 rounded-b-xl" style={{
        background: "rgba(80,50,20,0.08)", filter: "blur(8px)",
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   💜 ROMÂNTICO — Elegant, dark, intimate 
   ═══════════════════════════════════════════ */
function RomanticoLetter({ content, recipient, senderName, includeDate, includeSignature, today }: LetterProps) {
  return (
    <div className="relative mx-auto max-w-md" style={{ perspective: "1200px" }}>
      <div className="relative rounded-2xl overflow-hidden"
        style={{
          transform: "rotateX(2deg) rotateY(-1deg)",
          background: "linear-gradient(160deg, hsl(340,30%,92%), hsl(335,25%,88%), hsl(330,20%,85%))",
          boxShadow: "0 25px 60px rgba(80,20,50,0.25), 0 5px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        {/* Elegant lined pattern */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(180,100,130,0.1) 28px, rgba(180,100,130,0.1) 29px)",
        }} />

        {/* Left margin with rose accent */}
        <div className="absolute left-12 top-0 bottom-0 w-px" style={{
          background: "linear-gradient(to bottom, rgba(200,80,120,0.05), rgba(200,80,120,0.12), rgba(200,80,120,0.05))",
        }} />

        {/* Decorative roses */}
        <div className="absolute top-3 right-4 text-xs opacity-15">🌹</div>
        <div className="absolute top-3 right-10 text-[10px] opacity-10">✿</div>
        <div className="absolute bottom-12 left-3 text-[10px] opacity-10">❀</div>

        {/* Top ribbon */}
        <div className="h-0.5" style={{
          background: "linear-gradient(90deg, transparent 10%, hsl(340,50%,60%) 30%, hsl(330,45%,55%) 70%, transparent 90%)",
        }} />

        <div className="relative p-7 pl-14">
          {includeDate && (
            <p className="text-[11px] text-[hsl(340,25%,50%)] mb-5 font-body italic">
              {today}
            </p>
          )}

          <p className="text-2xl font-bold text-[hsl(340,35%,18%)] mb-3" style={{ fontFamily: "'Caveat', cursive" }}>
            Meu amor, {recipient}...
          </p>

          <div className="text-lg leading-[2.1] text-[hsl(340,25%,22%)] whitespace-pre-line" style={{ fontFamily: "'Caveat', cursive" }}>
            {content}
          </div>

          <div className="mt-8">
            <p className="text-lg italic text-[hsl(340,35%,30%)]" style={{ fontFamily: "'Caveat', cursive" }}>
              Eternamente seu,
            </p>
            <p className="text-xl font-bold text-[hsl(340,35%,18%)]" style={{ fontFamily: "'Caveat', cursive" }}>
              {senderName} ♥
            </p>
          </div>

          {includeSignature && (
            <p className="text-[9px] text-[hsl(340,30%,45%)] opacity-40 mt-4 font-body">
              enviado pelo Estou de Olho 👁️
            </p>
          )}
        </div>

        {/* Heart wax seal */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at 35% 35%, hsl(350,60%,48%), hsl(345,55%,30%))",
            boxShadow: "0 4px 16px rgba(139,26,50,0.4), inset 0 1px 4px rgba(255,200,220,0.2), 0 0 20px rgba(180,40,60,0.12)",
          }}>
          <Heart className="w-4 h-4 text-white/70 fill-white/70" />
        </div>
      </div>
      <div className="absolute -bottom-2 left-6 right-6 h-6 rounded-b-2xl" style={{
        background: "rgba(80,20,40,0.1)", filter: "blur(10px)",
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   🌻 GRATIDÃO — Warm, golden, sunlit 
   ═══════════════════════════════════════════ */
function GratidaoLetter({ content, recipient, senderName, includeDate, includeSignature, today }: LetterProps) {
  return (
    <div className="relative mx-auto max-w-md" style={{ perspective: "1200px" }}>
      <div className="relative rounded-2xl overflow-hidden"
        style={{
          transform: "rotateX(1.5deg)",
          background: "linear-gradient(165deg, hsl(45,65%,94%), hsl(40,55%,89%), hsl(35,45%,86%))",
          boxShadow: "0 20px 50px rgba(80,60,10,0.2), inset 0 1px 0 rgba(255,255,240,0.5)",
        }}
      >
        {/* Warm lines texture */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 29px, rgba(180,140,60,0.08) 29px, rgba(180,140,60,0.08) 30px)",
        }} />

        {/* Golden left border */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{
          background: "linear-gradient(to bottom, hsl(40,80%,55%), hsl(35,75%,50%), hsl(30,70%,45%))",
        }} />

        {/* Sunflower decorations */}
        <div className="absolute top-4 right-4 text-lg opacity-20">🌻</div>
        <div className="absolute bottom-16 right-5 text-sm opacity-10">☀️</div>
        <div className="absolute top-20 left-3 text-[10px] opacity-10">✦</div>

        {/* Top golden gradient bar */}
        <div className="h-1" style={{
          background: "linear-gradient(90deg, transparent, hsl(40,80%,55%) 20%, hsl(35,85%,50%) 80%, transparent)",
        }} />

        <div className="relative p-7 pl-6">
          {includeDate && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-px bg-[hsl(35,60%,65%)]" />
              <p className="text-[10px] text-[hsl(35,40%,45%)] font-body tracking-wide">
                {today}
              </p>
              <div className="flex-1 h-px bg-[hsl(35,60%,65%)] opacity-30" />
            </div>
          )}

          <p className="text-xl font-bold text-[hsl(30,45%,15%)] mb-3" style={{ fontFamily: "'Caveat', cursive" }}>
            Querida {recipient},
          </p>

          <div className="text-lg leading-[2] text-[hsl(30,35%,18%)] whitespace-pre-line" style={{ fontFamily: "'Caveat', cursive" }}>
            {content}
          </div>

          <div className="mt-8 flex items-end gap-3">
            <div className="flex-1">
              <p className="text-base text-[hsl(30,35%,28%)]" style={{ fontFamily: "'Caveat', cursive" }}>
                Com gratidão infinita,
              </p>
              <p className="text-xl font-bold text-[hsl(30,45%,15%)]" style={{ fontFamily: "'Caveat', cursive" }}>
                {senderName}
              </p>
            </div>
          </div>

          {includeSignature && (
            <p className="text-[9px] text-[hsl(35,40%,45%)] opacity-50 mt-4 font-body">
              enviado pelo Estou de Olho 👁️
            </p>
          )}
        </div>

        {/* Star seal bottom center */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center" style={{
          background: "radial-gradient(circle at 35% 35%, hsl(40,80%,55%), hsl(30,70%,38%))",
          boxShadow: "0 4px 14px rgba(180,130,20,0.35), inset 0 1px 3px rgba(255,240,180,0.3)",
        }}>
          <Star className="w-4 h-4 text-white/80 fill-white/80" />
        </div>
      </div>
      <div className="absolute -bottom-2 left-6 right-6 h-5 rounded-b-xl" style={{
        background: "rgba(80,60,10,0.08)", filter: "blur(8px)",
      }} />
    </div>
  );
}
