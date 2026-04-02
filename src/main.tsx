import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/pushNotifications";

// Register SW only in production (not in preview/iframe)
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
