import { useState, useEffect } from "react";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
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
  const [hasSentBefore, setHasSentBefore] = useState<boolean | null>(null);

  const senderName = profile?.display_name || "Pai";
  const recipient = recipientName || partner?.display_name || "Amor";
  const recipId = recipientId || partner?.user_id;
  const today = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR });

  // Check sent letters once
  useEffect(() => {
    if (!user) return;
    supabase
      .from("love_letters")
      .select("id")
      .eq("sender_id", user.id)
      .limit(1)
      .then(({ data }) => setHasSentBefore(!!(data && data.length > 0)));
  }, [user]);

  const handleSend = async () => {
    if (!user || !profile) return;
    setSending(true);
    try {
      const { data: prevLetters } = await supabase
        .from("love_letters")
        .select("id")
        .eq("sender_id", user.id)
        .limit(1);

      const isFirstLetter = !prevLetters || prevLetters.length === 0;

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
          paid: isFirstLetter,
        })
        .select("id")
        .single();

      if (letterErr) throw letterErr;

      if (!isFirstLetter) {
        const { data: checkoutData, error: checkoutErr } = await supabase.functions.invoke(
          "create-pix-checkout",
          { body: { letterId: letterData.id } }
        );
        if (checkoutErr) throw checkoutErr;
        if (checkoutData?.url) {
          window.location.href = checkoutData.url;
          return;
        }
        throw new Error("Não foi possível iniciar o pagamento");
      }

      const pointsOp = supabase
        .from("profiles")
        .update({ points: profile.points + 50 })
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{
      background: "linear-gradient(165deg, hsl(340,30%,12%) 0%, hsl(300,20%,8%) 50%, hsl(260,25%,10%) 100%)",
    }}>
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.06]" style={{
          background: "radial-gradient(circle, hsl(340,72%,57%), transparent 70%)",
          top: "-100px", left: "-100px",
        }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04]" style={{
          background: "radial-gradient(circle, hsl(45,90%,65%), transparent 70%)",
          bottom: "100px", right: "-80px",
        }} />
      </div>

      {/* Header */}
      <div className="relative flex items-center px-5 py-4 border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        <h1 className="flex-1 text-center font-display text-base font-bold text-white/90">Pré-visualização</h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-36">
        {/* 3D Letter card */}
        <div className="relative mx-auto max-w-md" style={{ perspective: "1200px" }}>
          <div className="relative rounded-2xl overflow-hidden transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(2deg) rotateY(-1deg)",
              background: "linear-gradient(145deg, hsl(45,60%,97%), hsl(40,50%,94%))",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            {/* Paper texture lines */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(180,160,140,0.15) 27px, rgba(180,160,140,0.15) 28px)",
            }} />

            {/* Red margin line */}
            <div className="absolute left-12 top-0 bottom-0 w-px bg-red-300/20" />

            <div className="relative p-7 pl-14">
              {includeDate && (
                <p className="text-[11px] text-[hsl(25,30%,55%)] mb-5 font-body">
                  Hoje, dia {today}
                </p>
              )}

              <p className="text-xl font-bold text-[hsl(20,30%,15%)] mb-3" style={{ fontFamily: "'Caveat', cursive" }}>
                {recipient},
              </p>

              <div className="text-lg leading-[2] text-[hsl(20,30%,15%)] whitespace-pre-line" style={{ fontFamily: "'Caveat', cursive" }}>
                {content}
              </div>

              <div className="mt-8">
                <p className="text-lg italic text-[hsl(20,30%,20%)]" style={{ fontFamily: "'Caveat', cursive" }}>
                  Com amor,
                </p>
                <p className="text-xl font-bold text-[hsl(20,30%,12%)]" style={{ fontFamily: "'Caveat', cursive" }}>
                  {senderName}
                </p>
              </div>

              {includeSignature && (
                <p className="text-[10px] text-[hsl(340,50%,50%)] opacity-60 mt-4 font-body">
                  enviado pelo Estou de Olho 👁️
                </p>
              )}
            </div>

            {/* Wax seal */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle at 35% 35%, hsl(0,70%,50%), hsl(0,65%,30%))",
                boxShadow: "0 4px 16px rgba(139,26,26,0.5), inset 0 1px 3px rgba(255,255,255,0.2)",
              }}>
              <span className="text-sm">👁️</span>
            </div>
          </div>

          {/* Paper shadow */}
          <div className="absolute -bottom-2 left-4 right-4 h-6 rounded-b-2xl" style={{
            background: "rgba(0,0,0,0.15)",
            filter: "blur(8px)",
          }} />
        </div>

        {/* Toggles */}
        <div className="mt-12 space-y-3 max-w-md mx-auto">
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span className="text-xs text-white/50">Incluir data automaticamente</span>
            <Switch checked={includeDate} onCheckedChange={setIncludeDate} />
          </div>
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span className="text-xs text-white/50">Incluir assinatura 'Estou de Olho'</span>
            <Switch checked={includeSignature} onCheckedChange={onToggleSignature} />
          </div>
        </div>

        {/* Price info */}
        {hasSentBefore !== null && (
          <div className="mt-5 max-w-md mx-auto text-center">
            {hasSentBefore ? (
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2" style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <Sparkles className="w-3.5 h-3.5 text-[hsl(340,72%,57%)]" />
                <span className="text-xs text-white/50">
                  Esta carta custa <span className="font-bold text-[hsl(340,72%,65%)]">R$ 4,99</span>
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2" style={{
                background: "rgba(100,220,100,0.06)",
                border: "1px solid rgba(100,220,100,0.12)",
              }}>
                <span className="text-xs text-white/50">
                  🎁 Sua primeira carta é <span className="font-bold text-emerald-400">grátis!</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-4" style={{
        background: "linear-gradient(to top, hsl(340,30%,12%) 60%, transparent)",
      }}>
        <Button
          onClick={handleSend}
          disabled={sending}
          className="w-full rounded-2xl h-14 text-base font-display font-bold border-0 disabled:opacity-40 transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, hsl(340,72%,57%), hsl(340,65%,48%))",
            boxShadow: "0 8px 32px hsla(340,72%,57%,0.3), 0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enviando...
            </span>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {hasSentBefore ? "Pagar e enviar 💳" : "Enviar carta 💌"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
