import { useEffect, useState } from "react";
import { Paperclip, ExternalLink, Video } from "lucide-react";

/**
 * CardDetailSection – rendered inside a Trello card-detail iframe.
 * Lists attachments with clickable links; optionally shows video previews.
 * Also offers an "Add attachment" button that opens a popup for
 * uploading local files directly to this card.
 */
export default function CardDetailSection() {
  const [attachments, setAttachments] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!window.TrelloPowerUp) return;
    const t = window.TrelloPowerUp.iframe();

    const loadData = () => {
      Promise.all([
        t.card("attachments"),
        t.get("board", "shared", "smartAttachmentSettings"),
      ]).then(([card, savedSettings]) => {
        setAttachments(card.attachments || []);
        setSettings(savedSettings || {});
      });
    };

    loadData();

    // Re-fetch attachments whenever Trello asks this iframe to re-render,
    // e.g. after the "Add attachment" popup closes.
    t.render(loadData);
  }, []);

  const handleAddAttachment = () => {
    if (!window.TrelloPowerUp) return;
    const t = window.TrelloPowerUp.iframe();

    t.popup({
      title: "Add Attachment",
      url: "./index.html?view=add-attachment",
      height: 320,
    });
  };

  if (!settings) {
    return (
      <div className="p-3 text-xs text-gray-500 animate-pulse">
        Loading attachments…
      </div>
    );
  }

  const isVideo = (name = "") => /\.(mp4|webm|mov|avi|mkv)$/i.test(name);

  const visible = attachments.filter((att) => {
    const ext = (att.name.split(".").pop() || "").toLowerCase();
    if ((settings.hiddenTypes || []).includes(ext)) return false;
    if (settings.showVideoInside === false && isVideo(att.name)) return false;
    return true;
  });

  return (
    <div className="p-2 space-y-1.5">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">
        Smart Attachments
      </p>

      {visible.length === 0 ? (
        <div className="px-2.5 py-1.5 text-xs text-gray-500 italic">
          No matching attachments.
        </div>
      ) : (
        visible.map((att) => (
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
        ))
      )}

      <button
        onClick={handleAddAttachment}
        className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 mt-1 rounded border border-dashed border-white/15 text-gray-400 hover:text-gray-200 hover:border-white/30 text-xs transition-colors"
      >
        <Paperclip size={12} />
        Add attachment
      </button>
    </div>
  );
}
