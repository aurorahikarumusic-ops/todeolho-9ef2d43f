import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tone } from "./ModoRedencao";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useFamilyPartner } from "@/hooks/useFamily";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  tone: Tone;
  content: string;
  recipientName?: string;
  recipientId?: string;
  includeSignature: boolean;
  onToggleSignature: (v: boolean) => void;
  onSend: (letterId: string) => void;
  onBack: () => void;
}

export default function LetterPreview({
  tone, content, recipientName, recipientId,
  includeSignature, onToggleSignature, onSend, onBack,
}: Props) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: partner } = useFamilyPartner();
  const qc = useQueryClient();
  const [sending, setSending] = useState(false);
  const [includeDate, setIncludeDate] = useState(true);

  const senderName = profile?.display_name || "Pai";
  const recipient = recipientName || partner?.display_name || "Amor";
  const recipId = recipientId || partner?.user_id;
  const today = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR });

  const handleSend = async () => {
    if (!user || !profile) return;
    setSending(true);
    try {
      // Check previous letters to determine if this is the first (free) one
      const { data: prevLetters } = await supabase
        .from("love_letters")
        .select("id")
        .eq("sender_id", user.id)
        .limit(1);

      const isFirstLetter = !prevLetters || prevLetters.length === 0;

      // Insert the letter (always insert, mark as paid if free)
      const { data: letterData, error: letterErr } = await supabase
        .from("love_letters")
        .insert({
          sender_id: user.id,
          recipient_id: recipId || null,
          family_id: profile.family_id,
          tone,
          content,
          date_label: includeDate ? today : null,
          sender_name: senderName,
          recipient_name: recipient,
          include_signature: includeSignature,
          paid: isFirstLetter, // First letter is free = already paid
        })
        .select("id")
        .single();

      if (letterErr) throw letterErr;

      if (!isFirstLetter) {
        // Need payment via Pix - redirect to Stripe Checkout
        const { data: checkoutData, error: checkoutErr } = await supabase.functions.invoke(
          "create-pix-checkout",
          { body: { letterId: letterData.id } }
        );

        if (checkoutErr) throw checkoutErr;

        if (checkoutData?.url) {
          // Open Stripe Checkout in same tab
          window.location.href = checkoutData.url;
          return;
        }
        throw new Error("Não foi possível iniciar o pagamento");
      }

      // First letter: free! Award points and badge
      const pointsToAdd = 50;
      const pointsOp = supabase
        .from("profiles")
        .update({ points: profile.points + pointsToAdd })
        .eq("user_id", user.id);

      const badgeOp = supabase.from("achievements").insert({
        user_id: user.id,
        badge_key: "redimido",
        badge_name: "Redimido",
        badge_emoji: "💌",
      });

      await Promise.all([pointsOp, badgeOp]);

      onSend(letterData.id);
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["sent-letters"] });
      qc.invalidateQueries({ queryKey: ["received-letters"] });
    } catch (err: any) {
      toast.error("Erro ao enviar carta: " + (err.message || "tente novamente"));
    } finally {
      setSending(false);
    }
  };

  // Check if user already has sent letters (for UI hint)
  const [hasSentBefore, setHasSentBefore] = useState<boolean | null>(null);
  if (hasSentBefore === null && user) {
    supabase
      .from("love_letters")
      .select("id")
      .eq("sender_id", user.id)
      .limit(1)
      .then(({ data }) => setHasSentBefore(!!(data && data.length > 0)));
  }

  return (
    <div className="fixed inset-0 z-50 bg-[hsl(35,80%,97%)] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-display text-base font-bold">Pré-visualização</h1>
        <div className="w-7" />
      </div>

      <div className="flex-1 px-4 py-6">
        {/* Letter card */}
        <div className="relative bg-[hsl(45,100%,99%)] rounded-lg p-7 mx-auto max-w-md shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.03) 27px, rgba(0,0,0,0.03) 28px)",
          }}
        >
          {includeDate && (
            <p className="font-body text-[11px] text-muted-foreground mb-4">
              Hoje, dia {today}
            </p>
          )}

          <p className="text-xl font-bold text-[hsl(20,30%,15%)] mb-3" style={{ fontFamily: "'Caveat', cursive" }}>
            {recipient},
          </p>

          <div className="text-lg leading-[2] text-[hsl(20,30%,15%)] whitespace-pre-line" style={{ fontFamily: "'Caveat', cursive" }}>
            {content}
          </div>

          <div className="mt-6">
            <p className="text-lg italic text-[hsl(20,30%,15%)]" style={{ fontFamily: "'Caveat', cursive" }}>
              Com amor,
            </p>
            <p className="text-xl font-bold text-[hsl(20,30%,12%)]" style={{ fontFamily: "'Caveat', cursive" }}>
              {senderName}
            </p>
          </div>

          {includeSignature && (
            <p className="text-[10px] text-[hsl(340,72%,57%)] opacity-70 mt-3 font-body">
              enviado pelo Estou de Olho 👁️
            </p>
          )}

          {/* Wax seal */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[50px] h-[50px] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(139,26,26,0.4)]"
            style={{ background: "radial-gradient(circle at 35% 35%, hsl(0,75%,45%), hsl(0,70%,30%))" }}>
            <span className="text-xs">👁️</span>
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-10 space-y-3 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-body text-muted-foreground">Incluir data automaticamente</span>
            <Switch checked={includeDate} onCheckedChange={setIncludeDate} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-body text-muted-foreground">Incluir assinatura 'Estou de Olho'</span>
            <Switch checked={includeSignature} onCheckedChange={onToggleSignature} />
          </div>
        </div>

        {/* Price info */}
        {hasSentBefore && (
          <div className="mt-4 max-w-md mx-auto text-center">
            <p className="text-xs text-muted-foreground">
              💳 Esta carta custa <span className="font-bold text-[hsl(340,72%,57%)]">R$ 4,99</span> via Pix
            </p>
          </div>
        )}
        {hasSentBefore === false && (
          <div className="mt-4 max-w-md mx-auto text-center">
            <p className="text-xs text-muted-foreground">
              🎁 Sua primeira carta é <span className="font-bold text-green-600">grátis!</span>
            </p>
          </div>
        )}
      </div>

      {/* Send button */}
      <div className="px-4 pb-6 pt-2">
        <Button
          onClick={handleSend}
          disabled={sending}
          className="w-full rounded-full bg-[hsl(340,72%,57%)] hover:bg-[hsl(340,72%,50%)] text-white font-display font-bold h-12 text-base"
        >
          {sending ? "Enviando..." : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {hasSentBefore ? "Pagar e enviar via Pix 💳" : "Enviar carta 💌"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
