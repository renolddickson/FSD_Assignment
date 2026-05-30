import { ModeSelector } from "./ModeSelector";

interface TopbarProps {
  mode: "auto" | "manual";
  onModeChange: (mode: "auto" | "manual") => void;
  isMissionPaused: boolean;
  onPauseToggle: () => void;
  disabled?: boolean;
}

export const Topbar = ({
  mode,
  onModeChange,
  isMissionPaused,
  onPauseToggle,
  disabled,
}: TopbarProps) => {
  return (
    <header className="absolute top-12 md:top-0 left-0 right-0 p-4 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-0 z-40 pointer-events-none select-none transition-all duration-300">
      {/* Mobile top bar row */}
      <div className="w-full flex items-center justify-between md:contents pointer-events-auto">
        {/* Brand logo: visible on mobile top-left, hidden on desktop since desktop Sidenav has it */}
        <div className="flex flex-col md:hidden select-none">
          <h1 className="text-sm font-bold tracking-wider text-white leading-none">ERIC</h1>
          <span className="text-[5.5px] tracking-[0.25em] font-semibold text-slate-400 -mt-0.5">ROBOTICS</span>
        </div>

        {/* Mode Selector (right side on desktop, hidden on mobile) */}
        <div className={`hidden md:block md:order-3 pointer-events-auto transition-all duration-300 ${
          disabled ? "opacity-35 pointer-events-none" : ""
        }`}>
          <ModeSelector mode={mode} onModeChange={onModeChange} />
        </div>
      </div>

      {/* Mission Status Pill (left side on desktop, hidden on mobile) */}
      <div className={`hidden md:flex items-center gap-1.5 p-1 bg-white border border-slate-200/50 rounded-full shadow-lg pointer-events-auto pl-4 pr-1.5 transition-all duration-300 md:order-1 self-start ${
        disabled ? "opacity-35 pointer-events-none" : ""
      }`}>
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
          disabled={disabled}
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
    </header>
  );
};

