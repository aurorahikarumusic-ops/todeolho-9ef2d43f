import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { activateWaitingSW } from "@/lib/pushNotifications";

export default function SwUpdateToast() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      setRegistration((e as CustomEvent).detail);
    };
    window.addEventListener("sw-update-available", handler);
    return () => window.removeEventListener("sw-update-available", handler);
  }, []);

  if (!registration) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[99999] max-w-lg mx-auto animate-in slide-in-from-top-4">
      <div className="bg-card border border-primary/30 rounded-xl shadow-lg p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <RefreshCw className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold">Nova versão disponível 👁️</p>
          <p className="text-xs font-body text-muted-foreground italic">
            Tem zoeira nova. Atualiza aí.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-primary text-xs font-display shrink-0"
          onClick={() => activateWaitingSW(registration)}
        >
          Atualizar
        </Button>
      </div>
    </div>
  );
}
