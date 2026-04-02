import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/pushNotifications";
import { initOneSignal, syncOneSignalUserId } from "./lib/onesignal";
import { supabase } from "./integrations/supabase/client";

// Register SW only in production (not in preview/iframe)
registerServiceWorker();

// Initialize OneSignal
supabase.functions.invoke("get-onesignal-config").then(({ data }) => {
  if (data?.appId) {
    initOneSignal(data.appId).then(() => {
      // Sync OneSignal userId when user is logged in
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) syncOneSignalUserId(user.id);
      });
    });
  }
});

createRoot(document.getElementById("root")!).render(<App />);
