import { useState, useEffect } from "react";
import { Paperclip, RotateCcw, Save } from "lucide-react";

const COLORS = [
  {
    name: "blue",
    bg: "#123263",
    text: "#b6cae9",
  },
  {
    name: "green",
    bg: "#164b35",
    text: "#a3dcc3",
  },
  {
    name: "orange",
    bg: "#693200",
    text: "#e3c68b",
  },
  {
    name: "purple",
    bg: "#48245d",
    text: "#edd6fb",
  },
  {
    name: "red",
    bg: "#5d1f1a",
    text: "#eec1bf",
  },
  {
    name: "pink",
    bg: "#943D73",
    text: "#FFDAF6",
  },
  {
    name: "lime",
    bg: "#4C6B1F",
    text: "#D3F1A7",
  },
  {
    name: "sky",
    bg: "#206A83",
    text: "#9DD9EE",
  },
  {
    name: "light-gray",
    bg: "#596773",
    text: "#DEE4EA",
  },
];

const FILE_TYPES = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "mp4",
  "mov",
  "avi",
  "webm",
  "zip",
  "txt",
];

const DEFAULT_SETTINGS = {
  showIcon: true,
  showName: true,
  showCount: false,
  bgColor: "orange",
  filterByUser: false,
  hiddenTypes: [], // empty array = all types visible by default
};

export default function AttachmentSettingsModal() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const t = window.TrelloPowerUp ? window.TrelloPowerUp.iframe() : null;

  useEffect(() => {
    if (!t) return;

    t.get("board", "shared", "smartAttachmentSettings")
      .then((stored) => {
        if (stored) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...stored,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!t) return;

    setTimeout(() => {
      t.sizeTo(document.body);
    }, 100);
  }, [settings]);

  const update = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleType = (ext) => {
    setSettings((prev) => {
      const hidden = prev.hiddenTypes.includes(ext)
        ? prev.hiddenTypes.filter((t) => t !== ext)
        : [...prev.hiddenTypes, ext];
      return { ...prev, hiddenTypes: hidden };
    });
  };

  const handleSave = async () => {
    try {
      if (t) {
        await t.set("board", "shared", "smartAttachmentSettings", settings);

        await t.closePopup();
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const handleClose = () => {
    if (t) {
      t.closePopup();
    }
  };

  const selectedColor =
    COLORS.find((c) => c.name === settings.bgColor) ||
    COLORS.find((c) => c.name === "orange");

  return (
    <div className="w-full bg-[#1d2125] text-gray-100 font-sans">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Paperclip size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold">Attachment Display Settings</h2>
        </div>

        <p className="text-xs text-gray-500 mt-1">
          Choose how attachments appear on your cards.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-[1fr_250px] gap-8 p-5">
        {/* Left Side */}
        <div className="space-y-8">
          {/* Front of card */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 mb-3">
              Front of the card
            </h3>

            <div className="space-y-2">
              <Checkbox
                id="showIcon"
                checked={settings.showIcon}
                onChange={(v) => update("showIcon", v)}
                label={
                  <span className="flex items-center gap-1.5">
                    Show
                    <Paperclip size={12} className="text-gray-400" />
                    icon
                  </span>
                }
              />

              <Checkbox
                id="showName"
                checked={settings.showName}
                onChange={(v) => update("showName", v)}
                label="Show attachment name"
              />

              <Checkbox
                id="showCount"
                checked={settings.showCount}
                onChange={(v) => update("showCount", v)}
                label="Show number of attachments"
              />
            </div>

            {/* Color */}
            <div className="mt-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-gray-400">Background color</span>

                <select
                  value={settings.bgColor}
                  onChange={(e) => update("bgColor", e.target.value)}
                  className="bg-[#2c3540] border border-white/10 rounded px-2 py-1 text-xs"
                >
                  {COLORS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => update("bgColor", c.name)}
                    style={{
                      backgroundColor: c.bg,
                    }}
                    className={`w-6 h-6 rounded transition-all ${
                      settings.bgColor === c.name
                        ? "ring-2 ring-white scale-110"
                        : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Filtering */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 mb-3">
              Filtering options
            </h3>

            <div className="space-y-2">
              <Checkbox
                id="filterByUser"
                checked={settings.filterByUser}
                onChange={(v) => update("filterByUser", v)}
                label="Show only on cards assigned to the current user"
              />
            </div>
          </section>

          {/* Inside card */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 mb-3">
              Filter what attachments are visible
            </h3>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {FILE_TYPES.map((ext) => (
                <Checkbox
                  key={ext}
                  id={`type-${ext}`}
                  checked={!settings.hiddenTypes.includes(ext)}
                  onChange={() => toggleType(ext)}
                  label={`.${ext}`}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Preview */}
        <div>
          <div className="border border-white/10 rounded-md p-4">
            <p className="text-xs text-gray-400 mb-3">Preview</p>

            <div className="border border-white/10 rounded p-3">
              {settings.showIcon || settings.showName ? (
                <div
                  className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded w-fit"
                  style={{
                    backgroundColor: selectedColor.bg,
                    color: selectedColor.text,
                  }}
                >
                  {settings.showIcon && <Paperclip size={11} />}

                  {settings.showName && <span>Product-Screenshot.png</span>}

                  {settings.showCount && (
                    <span className="bg-white/20 rounded px-1">2</span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-500 italic">
                  Nothing to show
                </span>
              )}
            </div>

            <p className="text-[10px] text-gray-500 mt-3">
              This is how it will look on your board.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
        >
          <RotateCcw size={13} />
          Reset to defaults
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-[#0c66e4] hover:bg-[#0055cc] rounded"
          >
            <Save size={13} />

            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Checkbox({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5"
      />

      <span className="text-xs text-gray-300">{label}</span>
    </label>
  );
}
