import { useState, useEffect } from "react";
import { X, Paperclip, RotateCcw, Save } from "lucide-react";

const COLORS = [
  { name: "blue", hex: "#0079BF" },
  { name: "green", hex: "#61BD4F" },
  { name: "orange", hex: "#FF9F1A" },
  { name: "purple", hex: "#C377E0" },
  { name: "teal", hex: "#00C2E0" },
  { name: "red", hex: "#EB5A46" },
  { name: "gray", hex: "#838C91" },
];

const DEFAULT_SETTINGS = {
  showIcon: true,
  showName: true,
  showCount: false,
  bgColor: "orange",
  filterByUser: false,
  filterByType: false,
  typeFilter: "*.jpg,*.png",
  showVideoInside: false,
};

export default function AttachmentSettingsModal() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const t = window.TrelloPowerUp ? window.TrelloPowerUp.iframe() : null;

  useEffect(() => {
    if (!t) return;

    t.render(() => {
      t.sizeTo(document.body);
    });
  }, []);

  // Load persisted settings from Trello storage
  useEffect(() => {
    if (!t) return;
    t.get("board", "shared", "smartAttachmentSettings")
      .then((stored) => {
        if (stored) setSettings({ ...DEFAULT_SETTINGS, ...stored });
      })
      .catch(() => {});
  }, []);

  const update = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (t) {
      await t.set("board", "shared", "smartAttachmentSettings", settings);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => setSettings(DEFAULT_SETTINGS);

  const handleClose = () => {
    if (t) t.closePopup();
  };

  const selectedColor =
    COLORS.find((c) => c.name === settings.bgColor)?.hex ?? "#FF9F1A";

  return (
    <div className="bg-[#1d2125] text-gray-100 font-sans">
      <div className="px-5 py-4 space-y-5">
        {/* ── Front of the card ──────────────────────────────────────── */}
        <Section title="Front of the card">
          <Checkbox
            id="showIcon"
            checked={settings.showIcon}
            onChange={(v) => update("showIcon", v)}
            label={
              <span className="flex items-center gap-1.5">
                Show
                <Paperclip size={13} className="text-gray-400" />
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

          {/* Color picker */}
          <div className="mt-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">
                Background color:
              </span>
              <div className="relative">
                <select
                  value={settings.bgColor}
                  onChange={(e) => update("bgColor", e.target.value)}
                  className="appearance-none bg-[#2c3540] border border-white/10 text-gray-200 text-xs rounded px-2.5 py-1 pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {COLORS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Swatch row */}
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => update("bgColor", c.name)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded transition-all ${
                    settings.bgColor === c.name
                      ? "ring-2 ring-white ring-offset-2 ring-offset-[#1d2125] scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {settings.bgColor === c.name && (
                    <svg
                      className="w-4 h-4 text-white mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview card */}
          <div className="mt-3 rounded-lg bg-[#101204] border border-white/10 p-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
              Preview
            </p>
            <div
              className="rounded border border-white/10 py-1 px-2"
              style={{ borderTopWidth: 3, borderTopColor: selectedColor }}
            >
              {settings.showIcon || settings.showName ? (
                <div
                  className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded w-fit"
                  style={{
                    backgroundColor: selectedColor + "33",
                    color: selectedColor,
                  }}
                >
                  {settings.showIcon && <Paperclip size={11} />}
                  {settings.showName && <span>Product-Screenshot.png</span>}
                  {settings.showCount && (
                    <span className="ml-1 bg-white/20 rounded px-1 text-[10px]">
                      2
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-600 italic">Nothing to show</p>
              )}
            </div>
            <p className="text-[10px] text-gray-600 mt-2">
              This is how it will look on your board.
            </p>
          </div>
        </Section>

        {/* ── Filtering options ──────────────────────────────────────── */}
        <Section title="Filtering options">
          <Checkbox
            id="filterByUser"
            checked={settings.filterByUser}
            onChange={(v) => update("filterByUser", v)}
            label="Show only on cards assigned to the current user"
          />
          <Checkbox
            id="filterByType"
            checked={settings.filterByType}
            onChange={(v) => update("filterByType", v)}
            label="Filter what attachments are visible"
          />
          {settings.filterByType && (
            <div className="ml-6 mt-1">
              <input
                type="text"
                value={settings.typeFilter}
                onChange={(e) => update("typeFilter", e.target.value)}
                placeholder="*.jpg,*.png"
                className="w-full bg-[#2c3540] border border-white/10 text-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Example: *.jpg,*.png
              </p>
            </div>
          )}
        </Section>

        {/* ── Inside the card ────────────────────────────────────────── */}
        <Section title="Inside the card">
          <Checkbox
            id="showVideoInside"
            checked={settings.showVideoInside}
            onChange={(v) => update("showVideoInside", v)}
            label="Show video attachments"
          />
        </Section>
      </div>

      {/* ── Footer actions ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-[#161a1d]">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          <RotateCcw size={13} />
          Reset to defaults
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] rounded transition-colors"
          >
            <Save size={13} />
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Checkbox({ id, checked, onChange, label }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2.5 cursor-pointer group"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded border-gray-500 bg-[#2c3540] text-[#4f46e5] cursor-pointer focus:ring-[#4f46e5] focus:ring-offset-[#1d2125]"
      />
      <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
}
