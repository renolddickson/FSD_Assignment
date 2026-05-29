interface ModeSelectorProps {
  mode: "auto" | "manual";
  onModeChange: (mode: "auto" | "manual") => void;
}

export const ModeSelector = ({ mode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex items-center p-1 bg-white border border-slate-200/50 rounded-full shadow-md select-none pl-3.5 pr-1 py-1">
      {/* Outer Left Text Label: MODE */}
      <span className="text-[10px] font-black tracking-[0.2em] text-[#182030] uppercase mr-3">
        MODE
      </span>

      {/* Nested Light-Gray Capsule Track */}
      <div className="flex items-center bg-[#E5E7EB] rounded-full p-0.5">
        {/* AUTO Button Option */}
        <button
          onClick={() => onModeChange("auto")}
          className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-wider transition-all duration-300 cursor-pointer ${
            mode === "auto"
              ? "bg-[#101726] text-white shadow-md"
              : "text-[#4F5B73] hover:text-slate-800"
          }`}
        >
          AUTO
        </button>

        {/* MANUAL Button Option */}
        <button
          onClick={() => onModeChange("manual")}
          className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-wider transition-all duration-300 cursor-pointer ${
            mode === "manual"
              ? "bg-[#101726] text-white shadow-md"
              : "text-[#4F5B73] hover:text-slate-800"
          }`}
        >
          MANUAL
        </button>
      </div>
    </div>
  );
};
