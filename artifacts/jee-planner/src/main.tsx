import { createRoot } from "react-dom/client";
import { setCustomFetcher } from "@workspace/api-client-react";
import { syncFetch } from "./lib/sync-fetch";
import { startSyncEngine, getPendingCount } from "./lib/sync-engine";
import App from "./App";
import "./index.css";

// Register the custom fetcher for offline support
setCustomFetcher(syncFetch);

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("SW registered:", reg.scope);
      })
      .catch((err) => {
        console.error("SW registration failed:", err);
      });
  });
}

// Start sync engine
startSyncEngine();

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
