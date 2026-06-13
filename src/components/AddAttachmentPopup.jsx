import { useEffect, useRef, useState } from "react";
import { Paperclip, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// Replace with your Power-Up's API key from trello.com/power-ups/admin
const TRELLO_API_KEY = "YOUR_TRELLO_API_KEY";

function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * AddAttachmentPopup – rendered inside a Trello popup opened from
 * the card-detail "Smart Attachments" section.
 * Lets the user pick local files and uploads each one directly
 * to the current card's attachments via the Trello REST API.
 */
export default function AddAttachmentPopup() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [cardId, setCardId] = useState(null);
  const fileInputRef = useRef(null);

  const t = window.TrelloPowerUp ? window.TrelloPowerUp.iframe() : null;

  useEffect(() => {
    if (!t) return;

    const context = t.getContext();
    setCardId(context.card);
  }, []);

  useEffect(() => {
    if (!t) return;

    setTimeout(() => {
      t.sizeTo(document.body);
    }, 100);
  }, [files]);

  const getAuthToken = async () => {
    const restApi = t.getRestApi();
    const authorized = await restApi.isAuthorized();

    if (!authorized) {
      await restApi.authorize({ scope: "read,write", expiration: "never" });
    }

    return restApi.getToken();
  };

  const uploadFile = async (entry, currentCardId) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === entry.id ? { ...f, status: "uploading" } : f)),
    );

    try {
      const token = await getAuthToken();

      const formData = new FormData();
      formData.append("file", entry.raw, entry.raw.name);

      const res = await fetch(
        `https://api.trello.com/1/cards/${currentCardId}/attachments?key=${TRELLO_API_KEY}&token=${token}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`);
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: "done" } : f)),
      );
    } catch (err) {
      console.error(err);
      setFiles((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: "error" } : f)),
      );
    }
  };

  const addFiles = (fileList) => {
    if (!cardId) return;

    const newEntries = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      raw: file,
      name: file.name,
      size: file.size,
      status: "pending",
    }));

    setFiles((prev) => [...newEntries, ...prev]);

    newEntries.forEach((entry) => uploadFile(entry, cardId));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDone = () => {
    if (t) t.closePopup();
  };

  const hasPendingUploads = files.some(
    (f) => f.status === "pending" || f.status === "uploading",
  );

  return (
    <div className="w-full bg-[#1d2125] text-gray-100 font-sans p-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-md py-6 px-4 text-center transition-colors ${
          isDragging ? "border-[#0c66e4] bg-[#0c66e4]/10" : "border-white/15"
        }`}
      >
        <Paperclip size={20} className="text-gray-400" />

        <p className="text-xs text-gray-300">Drag and drop files here</p>
        <p className="text-[10px] text-gray-500">or</p>

        <button
          onClick={handleBrowseClick}
          className="px-3 py-1.5 text-xs font-medium bg-[#2c3540] hover:bg-[#38424d] rounded"
        >
          Browse files
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <p className="text-[10px] text-gray-500 mt-1">
          Files are added directly to this card's attachments.
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#2c3540] text-xs"
            >
              <Paperclip size={13} className="text-blue-400 shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="truncate text-gray-200">{f.name}</p>
                <p className="text-[10px] text-gray-500">
                  {formatFileSize(f.size)}
                </p>
              </div>

              {f.status === "uploading" && (
                <Loader2
                  size={14}
                  className="text-gray-400 animate-spin shrink-0"
                />
              )}

              {f.status === "done" && (
                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
              )}

              {f.status === "error" && (
                <AlertCircle
                  size={14}
                  className="text-red-400 shrink-0"
                  title="Upload failed"
                />
              )}

              {f.status === "pending" && (
                <button
                  onClick={() => removeFile(f.id)}
                  className="text-gray-500 hover:text-gray-300 shrink-0"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-3">
        <button
          onClick={handleDone}
          disabled={hasPendingUploads}
          className="px-3 py-1.5 text-xs font-medium bg-[#0c66e4] hover:bg-[#0055cc] disabled:opacity-50 disabled:cursor-not-allowed rounded"
        >
          Done
        </button>
      </div>
    </div>
  );
}
