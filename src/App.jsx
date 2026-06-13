import { useEffect, useState } from "react";
import AttachmentSettingsModal from "./components/AttachmentSettingsModal";
import CardBadge from "./components/CardBadge";
import CardDetailSection from "./components/CardDetailSection";
import AddAttachmentPopup from "./components/AddAttachmentPopup";

// Trello Power-Up initializer
// The Trello.initialize() call must be in index.html or main.jsx
// App.jsx acts as a router between capability views

export default function App() {
  const [view, setView] = useState(null);

  useEffect(() => {
    // Determine which iframe/view we are in via URL hash or search param
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.replace("#", "");
    const currentView = params.get("view") || hash || "settings";
    setView(currentView);
  }, []);

  if (!view) return null;

  if (view === "settings") return <AttachmentSettingsModal />;
  if (view === "card-badge") return <CardBadge />;
  if (view === "card-detail") return <CardDetailSection />;
  if (view === "add-attachment") return <AddAttachmentPopup />;

  return (
    <div className="flex items-center justify-center h-screen bg-[#1d2125] text-white">
      <p className="text-gray-400">Unknown view: {view}</p>
    </div>
  );
}
