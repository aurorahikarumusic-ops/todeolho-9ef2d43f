import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, X } from "lucide-react";
import {
  isPushSupported,
  getNotificationPermission,
  requestPushSubscription,
} from "@/lib/pushNotifications";

export default function PushPermissionBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!isPushSupported()) return;

    getNotificationPermission().then((perm) => {
      if (perm === "default") {
        // Check if dismissed recently
        const dismissed = localStorage.getItem("push_banner_dismissed");
        if (dismissed) {
          const dismissedAt = new Date(dismissed).getTime();
          const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
          if (dismissedAt > dayAgo) return;
        }
        setVisible(true);
      }
    });
  }, [user]);

  const handleAllow = async () => {
    if (!user) return;
    setLoading(true);
    const success = await requestPushSubscription(user.id);
    setLoading(false);
    setVisible(false);
    if (!success) {
      localStorage.setItem("push_banner_dismissed", new Date().toISOString());
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("push_banner_dismissed", new Date().toISOString());
  };

  if (!visible) return null;

  return (
    <Card className="border-secondary bg-secondary/10 overflow-hidden relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary/20 transition-colors"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div className="flex-1 pr-4">
            <p className="font-display font-bold text-sm mb-1">
              🔔 Ative as notificações
            </p>
            <p className="text-xs font-body text-muted-foreground italic mb-3">
              Ou você acha que vai lembrar de tudo sozinho?{" "}
              <span className="font-semibold">Spoiler: Não vai.</span>
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-primary text-xs font-display"
                onClick={handleAllow}
                disabled={loading}
              >
                <Bell className="w-3.5 h-3.5 mr-1.5" />
                {loading ? "Ativando..." : "Ativar alertas"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs font-display text-muted-foreground"
                onClick={handleDismiss}
              >
                <BellOff className="w-3.5 h-3.5 mr-1.5" />
                Eu lembro sozinho
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
