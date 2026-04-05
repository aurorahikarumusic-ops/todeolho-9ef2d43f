import { useState, useEffect } from "react";
import { ArrowLeft, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemedLetterCard from "./ThemedLetterCard";
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
      background: "linear-gradient(175deg, hsl(345,35%,14%) 0%, hsl(350,25%,9%) 50%, hsl(340,20%,7%) 100%)",
    }}>
      {/* Romantic ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{
          background: "radial-gradient(circle, hsl(340,70%,50%), transparent 60%)",
          top: "-100px", left: "-100px",
        }} />
        <div className="absolute w-[350px] h-[350px] rounded-full opacity-[0.04]" style={{
          background: "radial-gradient(circle, hsl(30,70%,50%), transparent 60%)",
          bottom: "50px", right: "-80px",
        }} />
        {/* Floating hearts */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="absolute text-[8px] opacity-[0.05]" style={{
            left: `${10 + i * 18}%`,
            top: `${15 + (i % 3) * 30}%`,
            animation: `floatHeart ${7 + i}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
          }}>♥</div>
        ))}
      </div>

      {/* Header */}
      <div className="relative flex items-center px-5 py-4 border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-full bg-white/5 border border-white/8 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <h1 className="flex-1 text-center font-display text-base font-bold text-white/85">Pré-visualização</h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-36">
        {/* 3D Letter card - romantic parchment */}
        <div className="relative mx-auto max-w-md" style={{ perspective: "1200px" }}>
          <div className="relative rounded-2xl overflow-hidden"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(2deg) rotateY(-1deg)",
              background: "linear-gradient(155deg, hsl(35,50%,95%), hsl(30,40%,90%), hsl(25,35%,88%))",
              boxShadow: "0 25px 60px rgba(80,20,20,0.25), 0 5px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            {/* Subtle paper texture */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(160,120,100,0.12) 27px, rgba(160,120,100,0.12) 28px)",
            }} />

            {/* Red margin line */}
            <div className="absolute left-12 top-0 bottom-0 w-px" style={{
              background: "linear-gradient(to bottom, rgba(200,100,100,0.08), rgba(200,100,100,0.15), rgba(200,100,100,0.08))",
            }} />

            {/* Decorative corner flowers */}
            <div className="absolute top-3 right-3 text-[10px] opacity-20">✿</div>
            <div className="absolute bottom-10 left-3 text-[10px] opacity-15">❀</div>

            <div className="relative p-7 pl-14">
              {includeDate && (
                <p className="text-[11px] text-[hsl(25,30%,50%)] mb-5 font-body italic">
                  Hoje, dia {today}
                </p>
              )}

              <p className="text-xl font-bold text-[hsl(15,35%,18%)] mb-3" style={{ fontFamily: "'Caveat', cursive" }}>
                {recipient},
              </p>

              <div className="text-lg leading-[2] text-[hsl(15,30%,20%)] whitespace-pre-line" style={{ fontFamily: "'Caveat', cursive" }}>
                {content}
              </div>

              <div className="mt-8">
                <p className="text-lg italic text-[hsl(340,30%,30%)]" style={{ fontFamily: "'Caveat', cursive" }}>
                  Com amor,
                </p>
                <p className="text-xl font-bold text-[hsl(15,35%,15%)]" style={{ fontFamily: "'Caveat', cursive" }}>
                  {senderName}
                </p>
              </div>

              {includeSignature && (
                <p className="text-[10px] text-[hsl(340,40%,45%)] opacity-50 mt-4 font-body">
                  enviado pelo Estou de Olho 👁️
                </p>
              )}
            </div>

            {/* Wax seal - romantic red */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle at 35% 35%, hsl(350,65%,48%), hsl(345,60%,30%))",
                boxShadow: "0 4px 16px rgba(139,26,26,0.4), inset 0 1px 4px rgba(255,200,200,0.2), 0 0 20px rgba(180,40,40,0.15)",
              }}>
              <Heart className="w-4 h-4 text-white/70 fill-white/70" />
            </div>
          </div>

          {/* Paper shadow */}
          <div className="absolute -bottom-2 left-6 right-6 h-6 rounded-b-2xl" style={{
            background: "rgba(80,20,20,0.12)",
            filter: "blur(10px)",
          }} />
        </div>

        {/* Toggles */}
        <div className="mt-12 space-y-3 max-w-md mx-auto">
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,200,200,0.05)",
          }}>
            <span className="text-xs text-white/40">Incluir data automaticamente</span>
            <Switch checked={includeDate} onCheckedChange={setIncludeDate} />
          </div>
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,200,200,0.05)",
          }}>
            <span className="text-xs text-white/40">Incluir assinatura 'Estou de Olho'</span>
            <Switch checked={includeSignature} onCheckedChange={onToggleSignature} />
          </div>
        </div>

        {/* Price info */}
        {hasSentBefore !== null && (
          <div className="mt-5 max-w-md mx-auto text-center">
            {hasSentBefore ? (
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2" style={{
                background: "rgba(255,200,200,0.04)",
                border: "1px solid rgba(255,180,180,0.08)",
              }}>
                <Heart className="w-3 h-3 text-[hsl(340,60%,60%)] fill-[hsl(340,60%,60%)]" />
                <span className="text-xs text-white/45">
                  Esta carta custa <span className="font-bold text-[hsl(340,60%,65%)]">R$ 4,99</span>
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2" style={{
                background: "rgba(180,255,180,0.04)",
                border: "1px solid rgba(150,220,150,0.08)",
              }}>
                <span className="text-xs text-white/45">
                  🎁 Sua primeira carta é <span className="font-bold text-emerald-400">grátis!</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-4" style={{
        background: "linear-gradient(to top, hsl(345,35%,10%) 60%, transparent)",
      }}>
        <Button
          onClick={handleSend}
          disabled={sending}
          className="w-full rounded-2xl h-14 text-base font-display font-bold border-0 disabled:opacity-30 transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, hsl(340,70%,52%), hsl(350,60%,42%))",
            boxShadow: "0 8px 32px hsla(340,70%,50%,0.3), 0 0 50px hsla(340,70%,50%,0.08)",
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

      <style>{`
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.05; }
          50% { transform: translateY(-18px) scale(1.2); opacity: 0.09; }
        }
      `}</style>
    </div>
  );
}
