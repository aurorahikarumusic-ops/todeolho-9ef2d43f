import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { getRandomItem } from "@/lib/constants";

const SEND_PHRASES = [
  "Não seja mão de vaca e mande flores pra ela 💐",
  "Essa carta salva? Depende. Você esqueceu o aniversário dela? 🎂",
  "O anjinho tá lendo sua carta... e rindo. 😏",
  "Será que ela vai chorar ou revirar os olhos? Aposta? 🎰",
  "Última vez que você foi romântico foi em 2016. Parabéns pelo esforço. 👏",
  "Ela merece mais que uma carta. Mas é um começo. 🤷",
  "O anjinho disse que o texto tá fraco. Mas vai levar mesmo assim. 📬",
  "Dica: depois da carta, lava a louça. Combo imbatível. 🍽️",
  "Essa carta vale mais que mil desculpas no WhatsApp. 📱",
  "Se ela não chorar, pelo menos vai rir de você. Win-win. 😂",
  "O cupido tá de folga. Mandamos o anjinho desconfiado mesmo. 💘",
  "Lembrete: carta bonita não substitui presença. Mas ajuda. 🫶",
  "Estatística: 87% das mães choram com cartas. Os outros 13% já desistiram. 📊",
  "O anjinho perguntou se você também vai cozinhar hoje. 🍳",
  "Sua sogra mandou dizer que ela sabia que você ia precisar disso. 👵",
  "Modo redenção ativado. Nível de desespero: alto. 🚨",
  "Ela lembra de tudo que você esqueceu. Essa carta é só o começo. 🧠",
  "O anjinho checou seu histórico. Ele tá desconfiado com razão. 🕵️",
  "Dica de ouro: leia a carta em voz alta pra ela. Pontos extras. 🎤",
  "Se a carta não funcionar, tente chocolate. Nunca falha. 🍫",
  "O anjinho disse que sua letra é feia. Ainda bem que é digital. ⌨️",
  "Alerta: demonstração de afeto detectada. Isso é raro vindo de você. ⚠️",
  "Sua esposa merece um Oscar por aguentar você. Essa carta é o mínimo. 🏆",
  "O anjinho voou, mas deixou um recado: 'compra flores também'. 🌹",
  "Você sabia que 'desculpa' tem 8 letras? Sua carta tem mais. Progresso. 📈",
  "Ela vai mostrar essa carta pras amigas. Prepare-se. 👀",
  "O anjinho tá com cara de quem não acredita em você. Prove que ele tá errado. 😤",
  "Carta enviada. Agora reza. 🙏",
  "Dica: surpreenda ela com café amanhã de manhã. Reforço tático. ☕",
  "O anjinho disse que sua pontuação de pai precisa de ajuda. Concordamos. 📉",
  "Isso é coragem ou desespero? Tanto faz, mandou bem. 💪",
  "A carta tá indo... junto com suas desculpas atrasadas de 3 meses. 📅",
  "Se ela responder com emoji de coração, você tá salvo. Por enquanto. ❤️",
  "O anjinho fez uma oração por você. Sinal de que precisa mesmo. 😇",
  "Lembrete amigável: depois da carta, desligue a TV e converse. 📺",
  "Sua mãe ficaria orgulhosa. Sua sogra, desconfiada. Como sempre. 🤨",
  "O anjinho verificou: sua última demonstração de carinho foi há 47 dias. 📆",
  "Carta a caminho. Desculpa a caminho. Flores... compra logo. 🏃",
  "Ela já sabe que você fez besteira. A carta só confirma. 🎯",
  "O anjinho deu uma nota 6/10 pra sua carta. Mas entregou mesmo assim. 📝",
  "Modo pai romântico: ativado pela primeira vez este ano. 🫡",
  "Dica: não estrague tudo perguntando 'e aí, gostou?' cinco minutos depois. ⏰",
  "O anjinho tá levando sua carta e seu orgulho junto. Leve. 🪶",
  "Se ela ignorar a carta, mande outra. Persistência é tudo. 🔁",
  "Parabéns! Você fez algo romântico. Print tirado como prova. 📸",
  "O anjinho apostou com os amigos que ela vai chorar. Veremos. 🎲",
  "Sua carta tem mais sentimento que seu último Dia dos Namorados inteiro. 💝",
  "Lembrete: amar é verbo. Carta é substantivo. Faça os dois. 📖",
  "O anjinho levou a carta... e um pouco da sua masculinidade frágil. Tá tudo bem. 🦋",
  "Ela merece o mundo. Você mandou uma carta. É um começo honesto. 🌍",
] as const;

export default function SendConfirmation({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);

  // Pick 6 random phrases for the animation sequence
  const randomPhrases = useMemo(() => {
    const shuffled = [...SEND_PHRASES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, []);
  // 0: letter folding into envelope
  // 1: angel appears and grabs
  // 2: angel flies away
  // 3: confirmation screen

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2200),
      setTimeout(() => setPhase(2), 3800),
      setTimeout(() => setPhase(3), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Cycle phrases every 1.8s during animation
  useEffect(() => {
    if (phase >= 3) return;
    const interval = setInterval(() => {
      setPhraseIdx(prev => (prev + 1) % randomPhrases.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [phase, randomPhrases.length]);

  // Phase 0-2: Animation sequence
  if (phase < 3) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" style={{
        background: "linear-gradient(165deg, hsl(340,30%,12%) 0%, hsl(300,20%,8%) 50%, hsl(260,25%,10%) 100%)",
      }}>
        {/* Background particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                background: i % 2 === 0 ? "hsl(340,72%,57%)" : "hsl(270,60%,55%)",
                opacity: 0.2,
                animation: `sparkleFloat ${3 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Main animation container */}
        <div className="relative" style={{ perspective: "800px" }}>
          
          {/* === ENVELOPE BASE (always visible during phases 0-2) === */}
          <div
            className="relative"
            style={{
              width: 260,
              height: 170,
              transformStyle: "preserve-3d",
              animation: phase >= 2 ? "envelopeFlyAway 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards" : undefined,
            }}
          >
            {/* Envelope body */}
            <div
              className="absolute inset-0 rounded-md"
              style={{
                background: "linear-gradient(145deg, hsl(340,60%,92%), hsl(340,50%,85%))",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
                border: "1px solid hsl(340,40%,80%)",
              }}
            >
              {/* Inner V fold decoration */}
              <div className="absolute inset-0" style={{
                clipPath: "polygon(0 100%, 50% 50%, 100% 100%)",
                background: "hsl(340,55%,88%)",
              }} />
              <div className="absolute inset-0" style={{
                clipPath: "polygon(0 0, 0 100%, 45% 55%)",
                background: "hsl(340,50%,90%)",
              }} />
              <div className="absolute inset-0" style={{
                clipPath: "polygon(100% 0, 100% 100%, 55% 55%)",
                background: "hsl(340,50%,90%)",
              }} />

              {/* Heart seal */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-lg z-10"
                style={{ animation: phase >= 1 ? "sealPop 0.5s ease forwards" : undefined }}>
                ❤️
              </div>
            </div>

            {/* Letter paper - folds into envelope */}
            <div
              className="absolute z-10"
              style={{
                width: 220,
                height: 280,
                left: 20,
                top: phase === 0 ? -140 : -20,
                background: "#FFFEF9",
                borderRadius: 4,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(0,0,0,0.04) 23px, rgba(0,0,0,0.04) 24px)",
                transformOrigin: "bottom center",
                animation: phase === 0 ? "letterFoldIn 2s cubic-bezier(0.4, 0, 0.2, 1) forwards" : undefined,
                transform: phase >= 1 ? "translateY(0px) rotateX(90deg) scaleY(0)" : undefined,
              }}
            >
              {/* Fake text lines */}
              <div className="p-5 space-y-2.5">
                <div className="h-2 bg-muted-foreground/15 rounded w-16" />
                <div className="h-1.5 bg-muted-foreground/10 rounded w-full mt-4" />
                <div className="h-1.5 bg-muted-foreground/10 rounded w-4/5" />
                <div className="h-1.5 bg-muted-foreground/10 rounded w-full" />
                <div className="h-1.5 bg-muted-foreground/10 rounded w-3/5" />
                <div className="h-1.5 bg-muted-foreground/10 rounded w-4/5 mt-3" />
                <div className="h-2 bg-muted-foreground/15 rounded w-20 mt-4" />
              </div>
            </div>

            {/* Envelope flap - closes after letter is inside */}
            <div
              className="absolute top-0 left-0 right-0 z-20"
              style={{
                width: 260,
                height: 120,
                clipPath: "polygon(0 0, 50% 65%, 100% 0)",
                background: "linear-gradient(180deg, hsl(340,55%,82%), hsl(340,50%,85%))",
                transformOrigin: "top center",
                transformStyle: "preserve-3d",
                animation: phase === 0 ? "flapClose 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.6s forwards" : undefined,
                transform: phase >= 1 ? "rotateX(0deg)" : "rotateX(-180deg)",
              }}
            />
          </div>

          {/* === ANGEL CHARACTER === */}
          {phase >= 1 && (
            <div
              className="absolute z-30"
              style={{
                top: -60,
                right: phase === 1 ? -80 : undefined,
                left: phase === 1 ? undefined : "50%",
                transform: phase === 1 ? "translateX(0)" : "translateX(-50%)",
                animation: phase === 1
                  ? "angelEnter 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                  : phase === 2
                    ? "angelFlyAway 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards"
                    : undefined,
              }}
            >
              {/* Angel body */}
              <div className="relative" style={{ width: 80, height: 90 }}>
                {/* Wings */}
                <div className="absolute" style={{
                  top: 15,
                  left: -18,
                  width: 30,
                  height: 40,
                  background: "radial-gradient(ellipse, rgba(255,255,255,0.9), rgba(200,220,255,0.5))",
                  borderRadius: "50% 20% 50% 50%",
                  transform: "rotate(-15deg)",
                  animation: "wingFlap 0.4s ease-in-out infinite alternate",
                  boxShadow: "0 0 10px rgba(255,255,255,0.5)",
                }} />
                <div className="absolute" style={{
                  top: 15,
                  right: -18,
                  width: 30,
                  height: 40,
                  background: "radial-gradient(ellipse, rgba(255,255,255,0.9), rgba(200,220,255,0.5))",
                  borderRadius: "20% 50% 50% 50%",
                  transform: "rotate(15deg)",
                  animation: "wingFlap 0.4s ease-in-out infinite alternate-reverse",
                  boxShadow: "0 0 10px rgba(255,255,255,0.5)",
                }} />

                {/* Halo */}
                <div className="absolute" style={{
                  top: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 32,
                  height: 10,
                  border: "2px solid hsl(45,90%,65%)",
                  borderRadius: "50%",
                  animation: "haloGlow 1.5s ease-in-out infinite",
                }} />

                {/* Head */}
                <div className="absolute" style={{
                  top: 2,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(145deg, hsl(35,80%,88%), hsl(25,60%,80%))",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}>
                  {/* Suspicious eyes */}
                  <div className="absolute flex gap-2" style={{ top: 12, left: 6 }}>
                    <div style={{
                      width: 8, height: phase >= 2 ? 4 : 6,
                      background: "#2C1810",
                      borderRadius: phase >= 2 ? "0 0 50% 50%" : "50%",
                      transition: "all 0.3s",
                    }}>
                      <div style={{
                        width: 3, height: 3,
                        background: "white",
                        borderRadius: "50%",
                        marginTop: 1,
                        marginLeft: phase >= 2 ? 4 : 2,
                        transition: "all 0.3s",
                      }} />
                    </div>
                    <div style={{
                      width: 8, height: phase >= 2 ? 4 : 6,
                      background: "#2C1810",
                      borderRadius: phase >= 2 ? "0 0 50% 50%" : "50%",
                      transition: "all 0.3s",
                    }}>
                      <div style={{
                        width: 3, height: 3,
                        background: "white",
                        borderRadius: "50%",
                        marginTop: 1,
                        marginLeft: phase >= 2 ? 4 : 2,
                        transition: "all 0.3s",
                      }} />
                    </div>
                  </div>
                  {/* Suspicious eyebrow */}
                  <div className="absolute" style={{
                    top: 8,
                    left: 6,
                    width: 8,
                    height: 2,
                    background: "#5C3A20",
                    borderRadius: 2,
                    transform: "rotate(-10deg)",
                  }} />
                  <div className="absolute" style={{
                    top: 9,
                    right: 6,
                    width: 8,
                    height: 2,
                    background: "#5C3A20",
                    borderRadius: 2,
                    transform: "rotate(5deg)",
                  }} />
                  {/* Smirk mouth */}
                  <div className="absolute" style={{
                    bottom: 8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 10,
                    height: 5,
                    borderBottom: "2px solid #8B4513",
                    borderRight: "1px solid #8B4513",
                    borderRadius: "0 0 8px 2px",
                  }} />
                </div>

                {/* Body */}
                <div className="absolute" style={{
                  top: 36,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 28,
                  height: 34,
                  background: "linear-gradient(180deg, white, hsl(200,60%,95%))",
                  borderRadius: "8px 8px 14px 14px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }} />

                {/* Tiny arms reaching for envelope */}
                {phase >= 1 && (
                  <>
                    <div className="absolute" style={{
                      top: 45,
                      left: 12,
                      width: 16,
                      height: 4,
                      background: "hsl(35,80%,85%)",
                      borderRadius: 4,
                      transform: "rotate(30deg)",
                      transformOrigin: "right center",
                      animation: "armGrab 0.6s ease forwards",
                    }} />
                    <div className="absolute" style={{
                      top: 45,
                      right: 12,
                      width: 16,
                      height: 4,
                      background: "hsl(35,80%,85%)",
                      borderRadius: 4,
                      transform: "rotate(-30deg)",
                      transformOrigin: "left center",
                      animation: "armGrab 0.6s ease forwards",
                    }} />
                  </>
                )}

                {/* Tiny feet */}
                <div className="absolute flex gap-2" style={{ bottom: -4, left: "50%", transform: "translateX(-50%)" }}>
                  <div style={{ width: 8, height: 6, background: "hsl(35,80%,85%)", borderRadius: "0 0 4px 4px" }} />
                  <div style={{ width: 8, height: 6, background: "hsl(35,80%,85%)", borderRadius: "0 0 4px 4px" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status text */}
        <div className="absolute bottom-12 left-0 right-0 text-center px-6">
          <p className="font-display text-sm font-bold text-[hsl(340,40%,25%)] min-h-[3rem] flex items-center justify-center" 
            style={{ animation: "fadeIn 0.5s ease" }}
            key={phraseIdx}>
            {randomPhrases[phraseIdx]}
          </p>
          <p className="font-body text-[10px] italic text-muted-foreground mt-1">
            {phase === 0 && "Dobrando a carta com carinho... 📃"}
            {phase === 1 && "Um anjinho apareceu... 🤨"}
            {phase === 2 && "Ele pegou e saiu voando! 😏✈️"}
          </p>
        </div>

        <style>{`
          @keyframes letterFoldIn {
            0% { transform: translateY(-60px) rotateX(0deg) scaleY(1); opacity: 1; }
            40% { transform: translateY(20px) rotateX(0deg) scaleY(1); opacity: 1; }
            70% { transform: translateY(30px) rotateX(45deg) scaleY(0.7); opacity: 0.9; }
            100% { transform: translateY(0px) rotateX(90deg) scaleY(0); opacity: 0; }
          }
          @keyframes flapClose {
            0% { transform: rotateX(-180deg); }
            60% { transform: rotateX(-10deg); }
            80% { transform: rotateX(-5deg); }
            100% { transform: rotateX(0deg); }
          }
          @keyframes sealPop {
            0% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.4); }
            100% { transform: translateX(-50%) scale(1); }
          }
          @keyframes angelEnter {
            0% { transform: translateX(120px) translateY(-30px) rotate(15deg); opacity: 0; }
            40% { transform: translateX(20px) translateY(0px) rotate(-5deg); opacity: 1; }
            60% { transform: translateX(-10px) translateY(5px) rotate(3deg); }
            80% { transform: translateX(5px) translateY(-5px) rotate(-2deg); }
            100% { transform: translateX(0px) translateY(0px) rotate(0deg); opacity: 1; }
          }
          @keyframes angelFlyAway {
            0% { transform: translateX(0) translateY(0) rotate(0deg) scale(1); }
            20% { transform: translateX(0) translateY(10px) rotate(-5deg) scale(1.05); }
            100% { transform: translateX(0) translateY(-120vh) rotate(-15deg) scale(0.3); opacity: 0; }
          }
          @keyframes envelopeFlyAway {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            20% { transform: translateY(5px) scale(1.02); }
            100% { transform: translateY(-120vh) scale(0.4); opacity: 0; }
          }
          @keyframes wingFlap {
            0% { transform: rotate(-15deg) scaleX(1); }
            100% { transform: rotate(-25deg) scaleX(0.8); }
          }
          @keyframes haloGlow {
            0%, 100% { box-shadow: 0 0 6px hsl(45,90%,65%), 0 0 12px hsla(45,90%,65%,0.3); }
            50% { box-shadow: 0 0 12px hsl(45,90%,65%), 0 0 24px hsla(45,90%,65%,0.5); }
          }
          @keyframes armGrab {
            0% { transform: rotate(30deg); }
            100% { transform: rotate(5deg); }
          }
          @keyframes sparkleFloat {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
            50% { transform: translateY(-15px) scale(1.3); opacity: 0.4; }
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(5px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // Phase 3: Confirmation
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ 
        background: "linear-gradient(165deg, hsl(340,30%,12%) 0%, hsl(300,20%,8%) 50%, hsl(260,25%,10%) 100%)",
        animation: "fadeIn 0.8s ease",
      }}>
      
      {/* Confetti hearts */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-xl"
            style={{
              left: `${5 + Math.random() * 90}%`,
              color: ["hsl(340,72%,57%)", "hsl(270,60%,55%)", "hsl(153,42%,45%)"][i % 3],
              animation: `heartFall ${3 + Math.random() * 2}s ease-in forwards`,
              animationDelay: `${Math.random() * 1.5}s`,
              top: "-20px",
            }}
          >
            ♥
          </div>
        ))}
      </div>

      {/* Ambient glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.08]" style={{
        background: "radial-gradient(circle, hsl(340,72%,57%), transparent 70%)",
      }} />

      {/* Angel delivered icon */}
      <div className="relative text-6xl mb-4" style={{ animation: "bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        😇✉️
      </div>

      <h1 className="font-display text-2xl font-bold text-white/95 mb-2">
        Carta enviada! 💌
      </h1>

      <p className="text-sm italic text-white/40 text-center mb-1">
        {getRandomItem(SEND_PHRASES)}
      </p>

      <p className="text-[10px] text-white/25 text-center mb-8">
        Ela vai receber agora no app. Você escreveu com suas palavras. Isso é coragem.
      </p>

      {/* Points badge */}
      <div className="rounded-full px-5 py-2.5 text-sm font-display font-bold mb-8 animate-bounce" style={{
        background: "linear-gradient(135deg, hsl(153,42%,35%), hsl(153,50%,28%))",
        boxShadow: "0 6px 24px hsla(153,42%,30%,0.3)",
        color: "white",
      }}>
        +20 pontos ⭐
      </div>

      <Button
        onClick={onClose}
        className="w-full max-w-xs rounded-2xl h-14 font-display font-bold border-0"
        style={{
          background: "linear-gradient(135deg, hsl(340,72%,57%), hsl(340,65%,48%))",
          boxShadow: "0 8px 32px hsla(340,72%,57%,0.3)",
          color: "white",
        }}
      >
        Voltar ao início
      </Button>

      <style>{`
        @keyframes heartFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
