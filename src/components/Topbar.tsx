import { TelemetryPanel } from "./TelemetryPanel";
import { ModeSelector } from "./ModeSelector";

interface TopbarProps {
  mode: "auto" | "manual";
  onModeChange: (mode: "auto" | "manual") => void;
  isMissionPaused: boolean;
  onPauseToggle: () => void;
}

export const Topbar = ({
  mode,
  onModeChange,
  isMissionPaused,
  onPauseToggle,
}: TopbarProps) => {
  return (
    <header className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between z-40 pointer-events-none select-none">
      {/* Left: Mission Status Pill */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/50 rounded-full shadow-lg pointer-events-auto pl-4 pr-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Status
          </span>
          <span className="text-xs font-black text-slate-800 tracking-wide">
            On Mission 1234
          </span>
        </div>
        <button
          onClick={onPauseToggle}
          title={isMissionPaused ? "Resume Mission" : "Pause Mission"}
          className="w-7 h-7 bg-[#090D1A] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-slate-800 active:scale-95 transition-all shadow-md ml-2"
        >
          {isMissionPaused ? (
            /* Play Icon */
            <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            /* Pause Icon */
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>
      </div>

      {/* Center: Telemetry Panel */}
      <div className="pointer-events-auto flex flex-col items-center gap-4">
        <TelemetryPanel />
      </div>

      {/* Right: Mode Selector */}
      <div className="pointer-events-auto">
        <ModeSelector mode={mode} onModeChange={onModeChange} />
      </div>
    </header>
  );
};
