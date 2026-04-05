import { useState } from "react";
import { X, Mail } from "lucide-react";
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
    <div className="relative rounded-2xl border-[1.5px] border-[hsl(340,60%,88%)] bg-[hsl(340,60%,97%)] overflow-hidden">
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[hsl(340,72%,57%)]" />

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors z-10"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      <div className="p-4 pl-5">
        <span className="text-[10px] uppercase tracking-wider font-bold text-[hsl(340,72%,57%)]">
          💌 MODO REDENÇÃO
        </span>

        <h3 className="font-display text-[15px] font-bold text-[hsl(340,40%,25%)] mt-1.5 pr-6 leading-snug">
          {trigger.title}
        </h3>

        <p className="font-body text-[11px] italic text-[hsl(340,50%,55%)] mt-1">
          {trigger.subtitle}
        </p>

        <Button
          onClick={handleStart}
          className="w-full mt-3 rounded-full bg-[hsl(340,72%,57%)] hover:bg-[hsl(340,72%,50%)] text-white font-display font-bold text-sm h-10"
        >
          <Mail className="w-4 h-4 mr-2" /> Escrever carta 💌
        </Button>
      </div>
    </div>
  );
}
