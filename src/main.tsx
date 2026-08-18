import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      await navigator.serviceWorker.ready;
      const urls = [
        "/",
        "/manifest.webmanifest",
        "/radar.svg",
        ...Array.from(document.querySelectorAll<HTMLScriptElement | HTMLLinkElement | HTMLImageElement>("script[src], link[rel='stylesheet'][href], img[src]"))
          .map((element) => element.getAttribute("src") || element.getAttribute("href") || "")
          .filter(Boolean),
      ];
      registration.active?.postMessage({ type: "PRECACHE", urls });
    });
  });
}
