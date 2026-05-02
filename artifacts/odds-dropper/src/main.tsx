import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for PWA + push notifications
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/app/sw.js", { scope: "/app/" })
      .catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
