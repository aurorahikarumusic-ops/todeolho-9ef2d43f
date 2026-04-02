import { supabase } from "@/integrations/supabase/client";

let onesignalInitialized = false;

/**
 * Carrega o SDK do OneSignal e inicializa.
 * O ONESIGNAL_APP_ID é injetado via Edge Function para segurança,
 * mas como é uma chave pública, usamos diretamente no frontend.
 */
export async function initOneSignal(appId: string) {
  if (onesignalInitialized) return;
  if (typeof window === "undefined") return;

  // Carrega o SDK do OneSignal
  await loadOneSignalScript();

  const OneSignal = (window as any).OneSignalDeferred || [];
  (window as any).OneSignalDeferred = OneSignal;

  OneSignal.push(async function (os: any) {
    await os.init({
      appId,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: { enable: false }, // usamos nosso próprio UI
    });
    onesignalInitialized = true;
  });
}

function loadOneSignalScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("onesignal-sdk")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "onesignal-sdk";
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("OneSignal SDK failed to load"));
    document.head.appendChild(script);
  });
}

/**
 * Captura o OneSignal userId e salva no perfil Supabase.
 */
export async function syncOneSignalUserId(supabaseUserId: string) {
  try {
    const OneSignal = (window as any).OneSignalDeferred;
    if (!OneSignal) return;

    OneSignal.push(async function (os: any) {
      const playerId = await os.User?.PushSubscription?.id;
      if (playerId) {
        await supabase
          .from("profiles")
          .update({ push_subscription: { onesignal_player_id: playerId } as any })
          .eq("user_id", supabaseUserId);
      }

      // Também seta external_id para segmentação
      await os.login(supabaseUserId);
    });
  } catch (err) {
    console.error("OneSignal sync failed:", err);
  }
}
