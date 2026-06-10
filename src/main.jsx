import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Initialize Trello Power-Up capabilities
// This runs in the context of the connector iframe loaded by Trello
if (window.TrelloPowerUp) {
  window.TrelloPowerUp.initialize({
    // ── Navbar button (link icon shown in Trello's top bar) ──────────────────
    "board-buttons": (t) => {
      return [
        {
          icon: {
            dark: window.location.origin + "/images/link-icon-light.svg",
            light: window.location.origin + "/images/link-icon-dark.svg",
          },
          text: "Smart Attachments",
          callback: (t) =>
            t.popup({
              title: "Attachment Display Settings",
              url: "./index.html?view=settings",
              height: 500,
            }),
        },
      ];
    },

    // ── Badge on each card showing attachment count ───────────────────────────
    "card-badges": (t) => {
      return t.card("attachments").then((card) => {
        const count = card.attachments ? card.attachments.length : 0;
        if (count === 0) return [];
        return [
          {
            icon: window.location.origin + "/images/link-icon-dark.svg",
            text: String(count),
            color: "orange",
          },
        ];
      });
    },

    // ── Front-of-card detail: show attachment names ───────────────────────────
    "card-detail-badges": (t) => {
      return t.card("attachments").then((card) => {
        const attachments = card.attachments || [];
        if (attachments.length === 0) return [];
        return attachments.map((att) => ({
          title: att.name,
          text: att.name,
          callback: (t) => t.navigate({ url: att.url }),
        }));
      });
    },
  });
}

// Mount React UI for iframe views (settings modal, etc.)
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
