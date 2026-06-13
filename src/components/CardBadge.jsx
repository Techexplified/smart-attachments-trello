import { useEffect, useState } from "react";
import { Paperclip } from "lucide-react";

/**
 * CardBadge – rendered inside a Trello card-badge iframe.
 * Reads attachment data from the Trello iframe context and
 * displays a coloured pill matching the user's saved settings.
 */
export default function CardBadge() {
  const [attachments, setAttachments] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!window.TrelloPowerUp) return;
    const t = window.TrelloPowerUp.iframe();

    Promise.all([
      t.card("attachments"),
      t.get("board", "shared", "smartAttachmentSettings"),
    ]).then(([card, savedSettings]) => {
      setAttachments(card.attachments || []);
      setSettings(savedSettings || {});
    });
  }, []);

  if (!settings || attachments.length === 0) return null;

  const COLOR_MAP = {
    blue: "#0079BF",
    green: "#61BD4F",
    orange: "#FF9F1A",
    purple: "#C377E0",
    teal: "#00C2E0",
    red: "#EB5A46",
    gray: "#838C91",
  };

  const hex = COLOR_MAP[settings.bgColor] ?? "#FF9F1A";
  const showIcon = settings.showIcon !== false;
  const showName = settings.showName !== false;
  const showCount = settings.showCount === true;

  // Only show file types that haven't been hidden in the settings.
  // By default (hiddenTypes empty/undefined) every file type is visible.
  const hiddenTypes = settings.hiddenTypes || [];
  const visibleAttachments = attachments.filter((att) => {
    const ext = (att.name.split(".").pop() || "").toLowerCase();
    return !hiddenTypes.includes(ext);
  });

  if (visibleAttachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 p-1">
      {showCount ? (
        <span
          className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded"
          style={{ backgroundColor: hex + "33", color: hex }}
        >
          {showIcon && <Paperclip size={11} />}
          {visibleAttachments.length}
        </span>
      ) : (
        visibleAttachments.map((att) => (
          <span
            key={att.id}
            className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded truncate max-w-[160px]"
            style={{ backgroundColor: hex + "33", color: hex }}
            title={att.name}
          >
            {showIcon && <Paperclip size={11} className="shrink-0" />}
            {showName && <span className="truncate">{att.name}</span>}
          </span>
        ))
      )}
    </div>
  );
}
