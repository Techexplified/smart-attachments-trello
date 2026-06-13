import { useEffect, useState } from "react";
import { Paperclip, ExternalLink, Video } from "lucide-react";

/**
 * CardDetailSection – rendered inside a Trello card-detail iframe.
 * Lists attachments with clickable links; optionally shows video previews.
 */
export default function CardDetailSection() {
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

  if (!settings) {
    return (
      <div className="p-3 text-xs text-gray-500 animate-pulse">
        Loading attachments…
      </div>
    );
  }

  const isVideo = (name = "") => /\.(mp4|webm|mov|avi|mkv)$/i.test(name);

  const visible = attachments.filter((att) => {
    const ext = att.name.split(".").pop().toLowerCase();
    if ((settings.hiddenTypes || []).includes(ext)) return false;
    if (settings.showVideoInside === false && isVideo(att.name)) return false;
    return true;
  });

  if (visible.length === 0) {
    return (
      <div className="p-3 text-xs text-gray-500 italic">
        No matching attachments.
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1.5">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">
        Smart Attachments
      </p>
      {visible.map((att) => (
        <a
          key={att.id}
          href={att.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#2c3540] hover:bg-[#38424d] text-gray-200 text-xs transition-colors group"
        >
          {isVideo(att.name) ? (
            <Video size={13} className="text-blue-400 shrink-0" />
          ) : (
            <Paperclip size={13} className="text-blue-400 shrink-0" />
          )}
          <span className="flex-1 truncate">{att.name}</span>
          <ExternalLink
            size={11}
            className="text-gray-600 group-hover:text-gray-300 transition-colors shrink-0"
          />
        </a>
      ))}
    </div>
  );
}
