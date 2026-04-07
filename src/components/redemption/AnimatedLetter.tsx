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

export default function AnimatedLetter({ letter, onClose }: Props) {
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const paragraphs = letter.content.split("\n").filter(p => p.trim());

  // Mark as opened
  useEffect(() => {
    supabase.from("love_letters").update({ opened_at: new Date().toISOString() }).eq("id", letter.id);
  }, [letter.id]);

  const handleSave = async () => {
    await supabase.from("love_letters").update({ saved_by_recipient: true }).eq("id", letter.id);
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#FFFEF9] overflow-y-auto"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.03) 27px, rgba(0,0,0,0.03) 28px)",
      }}
    >
      <div className="max-w-md mx-auto px-7 pt-12 pb-24">
        {/* Date */}
        {letter.date_label && (
          <p className="font-body text-[11px] text-muted-foreground mb-6">
            {letter.date_label}
          </p>
        )}

        {/* Salutation */}
        <p className="text-[22px] font-bold text-[hsl(20,30%,15%)] mb-5"
          style={{ fontFamily: "'Caveat', cursive" }}>
          {letter.recipient_name || "Amor"},
        </p>

        {/* Body */}
        {paragraphs.map((p, i) => (
          <p key={i} className="text-xl leading-[2] text-[hsl(20,30%,15%)] mb-3"
            style={{ fontFamily: "'Caveat', cursive" }}>
            {p}
          </p>
        ))}

        {/* Closing */}
        <p className="text-lg italic text-[hsl(20,30%,15%)] mt-6"
          style={{ fontFamily: "'Caveat', cursive" }}>
          Com amor,
        </p>
        <p className="text-2xl font-bold text-[hsl(20,30%,12%)]"
          style={{ fontFamily: "'Caveat', cursive" }}>
          {letter.sender_name || "Pai"}
        </p>

        {letter.include_signature && (
          <p className="text-[10px] text-[hsl(340,72%,57%)] opacity-70 mt-3 font-body">
            enviado pelo Estou de Olho 👁️
          </p>
        )}
      </div>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border px-4 py-4 space-y-2">
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
    </div>
  );
}
