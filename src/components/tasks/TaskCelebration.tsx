import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const IRONIC_MESSAGES = [
  { text: "Você fez! Sem a mãe mandar. Isso é histórico.", emoji: "💋" },
  { text: "Tarefa concluída. A gente quase não acreditou.", emoji: "😘" },
  { text: "Olha só. O pai fez sozinho. Registrando pro futuro.", emoji: "💋" },
  { text: "Concluiu no prazo? Vamos guardar esse momento.", emoji: "😘" },
  { text: "Feito! Seu filho vai saber que você tentou.", emoji: "💋" },
  { text: "A mãe vai conferir. Mas a gente confia em você. Quase.", emoji: "😘" },
  { text: "Parabéns. Você fez o mínimo. E isso já é muito.", emoji: "💋" },
  { text: "Tarefa feita. Sem desculpas. Sem 'esqueci'. Lindo.", emoji: "💋" },
];

function getRandomMessage() {
  return IRONIC_MESSAGES[Math.floor(Math.random() * IRONIC_MESSAGES.length)];
}

interface TaskCelebrationProps {
  points: number;
  onClose: () => void;
}

export default function TaskCelebration({ points, onClose }: TaskCelebrationProps) {
  const [message] = useState(getRandomMessage);
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      {/* Floating kiss emojis */}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute text-3xl pointer-events-none animate-kiss-float"
          style={{
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          💋
        </span>
      ))}

      {/* 3D Kiss */}
      <div className={`flex flex-col items-center gap-4 transition-all duration-700 ${show ? "scale-100 translate-y-0" : "scale-50 translate-y-20"}`}>
        <div className="kiss-3d-container">
          <div className="kiss-3d text-8xl">
            {message.emoji}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 mx-6 shadow-2xl text-center max-w-sm">
          <p className="font-display text-lg font-bold mb-2">
            +{points} pontos! 🏆
          </p>
          <p className="font-body text-sm text-muted-foreground italic">
            {message.text}
          </p>
          <Button
            className="mt-4 bg-primary font-display"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            Valeu! 😎
          </Button>
        </div>
      </div>
    </div>
  );
}
