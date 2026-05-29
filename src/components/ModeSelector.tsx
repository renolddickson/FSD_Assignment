interface ModeSelectorProps {
  mode: "auto" | "manual";
  onModeChange: (mode: "auto" | "manual") => void;
}

export const ModeSelector = ({ mode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-white border border-slate-200/50 rounded-full shadow-lg select-none">
      <span className="text-[10px] font-black tracking-widest text-slate-400 px-3 uppercase">
        Mode
      </span>
      <button
        onClick={() => onModeChange("auto")}
        className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer ${
          mode === "auto"
            ? "bg-[#090D1A] text-white shadow-md"
            : "text-slate-600 hover:text-slate-800"
        }`}
      >
        AUTO
      </button>
      <button
        onClick={() => onModeChange("manual")}
        className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer ${
          mode === "manual"
            ? "bg-[#090D1A] text-white shadow-md"
            : "text-slate-600 hover:text-slate-800"
        }`}
      >
        MANUAL
      </button>
    </div>
  );
};
