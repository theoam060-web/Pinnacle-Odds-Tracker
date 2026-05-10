import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const buildVersion = import.meta.env.VITE_BUILD_VERSION ?? String(Date.now());

// Register service worker for PWA + push notifications
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`/app/sw.js?v=${buildVersion}`, { scope: "/app/" })
      .catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
