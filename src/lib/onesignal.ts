import { supabase } from "@/integrations/supabase/client";

let onesignalInitialized = false;

/**
 * Carrega o SDK do OneSignal e inicializa com suporte a Android WebView.
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
      notifyButton: { enable: false },
      serviceWorkerParam: { scope: "/push/onesignal/" },
      serviceWorkerPath: "push/onesignal/OneSignalSDKWorker.js",
    });

    // Request permission automatically on Android WebView
    const permission = await os.Notifications?.permission;
    if (!permission) {
      try {
        await os.Notifications?.requestPermission();
      } catch (e) {
        console.warn("OneSignal permission request failed:", e);
      }
    }

    onesignalInitialized = true;
    console.log("OneSignal initialized successfully");
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
 * Também configura o external_id para segmentação de push.
 */
export async function syncOneSignalUserId(supabaseUserId: string) {
  try {
    const OneSignal = (window as any).OneSignalDeferred;
    if (!OneSignal) return;

    OneSignal.push(async function (os: any) {
      // Set external_id for targeting
      try {
        await os.login(supabaseUserId);
        console.log("OneSignal login with external_id:", supabaseUserId);
      } catch (e) {
        console.warn("OneSignal login failed:", e);
      }

      // Get player ID and save
      const playerId = await os.User?.PushSubscription?.id;
      if (playerId) {
        await supabase
          .from("profiles")
          .update({ push_subscription: { onesignal_player_id: playerId } as any })
          .eq("user_id", supabaseUserId);
        console.log("OneSignal player ID saved:", playerId);
      }
    });
  } catch (err) {
    console.error("OneSignal sync failed:", err);
  }
}

/**
 * Inicializa OneSignal buscando o App ID do servidor.
 */
export async function autoInitOneSignal(supabaseUserId?: string) {
  try {
    const { data, error } = await supabase.functions.invoke("get-onesignal-config");
    if (error || !data?.appId) {
      console.warn("Could not get OneSignal config:", error);
      return;
    }

    await initOneSignal(data.appId);

    if (supabaseUserId) {
      await syncOneSignalUserId(supabaseUserId);
    }
  } catch (err) {
    console.error("Auto-init OneSignal failed:", err);
  }
}
