import { useState } from "react";
import { X, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RedemptionTrigger } from "@/hooks/useRedemption";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  trigger: RedemptionTrigger;
  onStartLetter: () => void;
}

export default function RedemptionCard({ trigger, onStartLetter }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = async () => {
    setDismissed(true);
    if (user) {
      await supabase.from("redemption_events").insert({
        user_id: user.id,
        trigger_type: trigger.type,
        dismissed_at: new Date().toISOString(),
      });
      qc.invalidateQueries({ queryKey: ["redemption-check"] });
    }
  };

  const handleStart = async () => {
    if (user) {
      await supabase.from("redemption_events").insert({
        user_id: user.id,
        trigger_type: trigger.type,
      });
    }
    onStartLetter();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{
      background: "linear-gradient(155deg, hsl(345,35%,15%), hsl(340,25%,10%))",
      border: "1px solid hsl(340,35%,20%)",
      boxShadow: "0 8px 32px rgba(60,10,10,0.25), 0 0 50px hsla(340,70%,50%,0.04)",
    }}>
      {/* Romantic glow accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-[0.07]" style={{
          background: "radial-gradient(circle, hsl(340,70%,55%), transparent 70%)",
        }} />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-[0.04]" style={{
          background: "radial-gradient(circle, hsl(20,70%,50%), transparent 70%)",
        }} />
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/4 border border-white/8 flex items-center justify-center hover:bg-white/8 transition-colors z-10"
      >
        <X className="w-3.5 h-3.5 text-white/30" />
      </button>

      <div className="relative p-5">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3" style={{
          background: "linear-gradient(135deg, hsla(340,70%,50%,0.12), hsla(340,70%,50%,0.04))",
          border: "1px solid hsla(340,60%,50%,0.15)",
        }}>
          <Heart className="w-3 h-3 text-[hsl(340,60%,60%)] fill-[hsl(340,60%,60%)]" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-[hsl(340,55%,62%)]">
            Modo Redenção
          </span>
        </div>

        <h3 className="font-display text-[15px] font-bold text-white/85 pr-6 leading-snug">
          {trigger.title}
        </h3>

        <p className="text-[11px] italic text-white/35 mt-1.5 leading-relaxed">
          {trigger.subtitle}
        </p>

        <Button
          onClick={handleStart}
          className="w-full mt-4 rounded-xl h-11 font-display font-bold text-sm border-0 transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, hsl(340,70%,52%), hsl(350,60%,42%))",
            boxShadow: "0 6px 24px hsla(340,70%,50%,0.2)",
            color: "white",
          }}
        >
          <Mail className="w-4 h-4 mr-2" /> Escrever carta 💌
        </Button>
      </div>
    </div>
  );
}
