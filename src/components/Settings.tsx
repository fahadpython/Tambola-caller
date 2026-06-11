import { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  ShieldAlert,
  Upload,
  Smartphone,
} from "lucide-react";
import { GameSettings, Theme } from "../types";
import { cn } from "../utils";

interface SettingsProps {
  settings: GameSettings;
  onUpdate: (newSettings: GameSettings) => void;
  disabled: boolean;
  onInjectNextNumber: (num: number) => void;
  roomId: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (id: string) => void;
}

export function Settings({
  settings,
  onUpdate,
  disabled,
  onInjectNextNumber,
  roomId,
  onCreateRoom,
  onJoinRoom,
}: SettingsProps) {
  const { theme, intervalSec, predefinedNumbers, ocrNumbers, voiceEnabled } =
    settings;
  const [predefinedText, setPredefinedText] = useState(
    predefinedNumbers.join(", ")
  );
  const [showHostMode, setShowHostMode] = useState(false);
  const [nextNumberInput, setNextNumberInput] = useState("");
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPredefinedText(settings.predefinedNumbers.join(", "));
  }, [settings.predefinedNumbers]);

  const handleThemeChange = (t: Theme) => {
    onUpdate({ ...settings, theme: t });
  };

  const handlePredefinedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPredefinedText(e.target.value);
  };

  const handlePredefinedBlur = () => {
    const nums = predefinedText
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 90);
    const uniqueNums = Array.from(new Set(nums));
    onUpdate({ ...settings, predefinedNumbers: uniqueNums });
    setPredefinedText(uniqueNums.join(", "));
  };

  const handleInject = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(nextNumberInput, 10);
    if (!isNaN(num) && num >= 1 && num <= 90) {
      onInjectNextNumber(num);
      setNextNumberInput("");
    }
  };

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingOcr(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const data = await res.json();
        if (data.numbers && Array.isArray(data.numbers)) {
          const valid = data.numbers.filter(
            (n: number) => !isNaN(n) && n >= 1 && n <= 90
          );
          const combined = Array.from(
            new Set([...settings.ocrNumbers, ...valid])
          );
          onUpdate({ ...settings, ocrNumbers: combined });
        }
        setIsProcessingOcr(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      setIsProcessingOcr(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const containerClass =
    theme === "neon"
      ? "bg-black border border-purple-800 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-gray-300"
      : theme === "dark"
      ? "bg-gray-800 border-gray-700 text-gray-200"
      : "bg-white border-gray-200 text-gray-700 shadow-sm";

  const inputClass =
    theme === "neon"
      ? "bg-gray-900 border-purple-800 text-purple-100 focus:border-purple-500 focus:ring-purple-500/50"
      : theme === "dark"
      ? "bg-gray-700 border-gray-600 text-white focus:border-teal-500 focus:ring-teal-500"
      : "bg-gray-50 border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500";

  return (
    <div className={cn("p-5 rounded-2xl border", containerClass)}>
      <div className="flex items-center justify-between mb-6">
        <div
          className="flex items-center gap-2 text-lg font-semibold cursor-pointer"
          onDoubleClick={() => setShowHostMode((v) => !v)}
        >
          <SettingsIcon className="w-5 h-5" />
          <h3>Game Settings</h3>
        </div>
        <button
          onClick={() => setShowHostMode((v) => !v)}
          className={cn(
            "p-1.5 rounded opacity-20 hover:opacity-100 transition-opacity",
            showHostMode && "opacity-100"
          )}
          title="Toggle Host Mode"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <div className="flex gap-2">
            {(["light", "dark", "neon"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border",
                  theme === t
                    ? t === "neon"
                      ? "bg-purple-900/50 border-purple-500 text-purple-300"
                      : t === "dark"
                      ? "bg-teal-900/50 border-teal-500 text-teal-300"
                      : "bg-teal-50 border-teal-500 text-teal-700"
                    : t === "neon"
                    ? "bg-black border-gray-800 text-gray-500 hover:border-purple-800"
                    : t === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Auto-Call Delay (Seconds)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={intervalSec}
              onChange={(e) =>
                onUpdate({ ...settings, intervalSec: Number(e.target.value) })
              }
              className="flex-1 accent-teal-500"
            />
            <span className="w-12 text-center font-mono font-medium">
              {intervalSec}s
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-200/20 mb-4">
          <label className="text-sm font-medium">Voice Announcements</label>
          <button
            onClick={() =>
              onUpdate({ ...settings, voiceEnabled: !voiceEnabled })
            }
            className={cn(
              "p-2 rounded-full transition-colors",
              voiceEnabled
                ? theme === "neon"
                  ? "bg-purple-900/50 text-purple-400"
                  : theme === "dark"
                  ? "bg-teal-900/50 text-teal-400"
                  : "bg-teal-100 text-teal-700"
                : theme === "neon"
                ? "bg-gray-900 text-gray-600"
                : theme === "dark"
                ? "bg-gray-800 text-gray-500"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {voiceEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        </div>

        {showHostMode && (
          <div
            className={cn(
              "p-4 rounded-xl space-y-5 border",
              theme === "neon"
                ? "bg-purple-950/20 border-purple-900/50"
                : theme === "dark"
                ? "bg-gray-900/50 border-gray-700/50"
                : "bg-gray-100/50 border-gray-200/50"
            )}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 m-0">
              Host Controls
            </h4>

            <form onSubmit={handleInject}>
              <label className="block text-sm font-medium mb-1">
                Force Next Number
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="90"
                  placeholder="e.g. 42"
                  value={nextNumberInput}
                  onChange={(e) => setNextNumberInput(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2",
                    inputClass
                  )}
                />
                <button
                  type="submit"
                  disabled={!nextNumberInput}
                  className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  Inject
                </button>
              </div>
            </form>

            <div className="pt-3 border-t border-gray-500/20">
              <label className="block text-sm font-medium mb-1">
                Upload Ticket (AI Scan)
              </label>
              <p className="text-xs opacity-70 mb-2">
                Extracts numbers from ticket picture and favors them.
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleOcrUpload}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingOcr}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors",
                    theme === "neon"
                      ? "bg-gray-900 border-purple-800 hover:bg-gray-800"
                      : theme === "dark"
                      ? "bg-gray-800 border-gray-600 hover:bg-gray-700"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  {isProcessingOcr ? "Scanning..." : "Scan Ticket"}
                </button>
                {ocrNumbers.length > 0 && (
                  <span className="flex items-center text-[10px] uppercase font-mono px-2 opacity-70 bg-purple-500/20 rounded py-1">
                    {ocrNumbers.length} FAV'D
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-500/20">
              <label className="block text-sm font-medium mb-1">
                Remote Control Sync
              </label>
              <p className="text-xs opacity-70 mb-2">
                Connect another phone to control numbers.
              </p>

              {!roomId ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={onCreateRoom}
                    className="w-full text-sm font-medium bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Create Room
                  </button>
                  <div className="flex w-full gap-2">
                    <input
                      type="text"
                      placeholder="Room Code"
                      maxLength={4}
                      value={joinRoomInput}
                      onChange={(e) =>
                        setJoinRoomInput(e.target.value.toUpperCase())
                      }
                      className={cn(
                        "flex-1 px-2 py-2 text-sm text-center rounded-lg border focus:outline-none uppercase font-mono",
                        inputClass
                      )}
                    />
                    <button
                      onClick={() =>
                        joinRoomInput.length === 4 && onJoinRoom(joinRoomInput)
                      }
                      disabled={joinRoomInput.length !== 4}
                      className="flex-1 flex items-center justify-center gap-1 text-sm font-medium bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                      <Smartphone className="w-4 h-4" /> Join
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "px-3 py-2 rounded-lg border text-center",
                    theme === "neon"
                      ? "bg-purple-900 border-purple-500"
                      : "bg-teal-50 border-teal-200 text-teal-800"
                  )}
                >
                  <span className="text-xs opacity-80 block mb-1">
                    Active Room Code
                  </span>
                  <span className="text-xl font-mono font-bold tracking-widest">
                    {roomId}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-500/20">
              <label className="block text-sm font-medium mb-1">
                Priority Sequence
              </label>
              <p className="text-xs opacity-70 mb-2">
                Comma separated (e.g. 7, 14, 21). Called first automatically.
              </p>
              <input
                type="text"
                placeholder="e.g. 7, 14, 21"
                value={predefinedText}
                onChange={handlePredefinedChange}
                onBlur={handlePredefinedBlur}
                disabled={disabled}
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed",
                  inputClass
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
