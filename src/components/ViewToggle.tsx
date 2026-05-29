interface ViewToggleProps {
  activeView: "camera" | "map";
  onViewChange: (view: "camera" | "map") => void;
}

export const ViewToggle = ({ activeView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center p-1 bg-[#090D1A]/95 backdrop-blur-md border border-slate-800/40 rounded-xl shadow-lg select-none">
      <button
        onClick={() => onViewChange("camera")}
        className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
          activeView === "camera"
            ? "bg-[#1A2333] text-white shadow-inner border border-slate-700/30"
            : "text-slate-500 hover:text-slate-300"
        }`}
      >
        Camera View
      </button>
      <button
        onClick={() => onViewChange("map")}
        className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
          activeView === "map"
            ? "bg-[#1A2333] text-white shadow-inner border border-slate-700/30"
            : "text-slate-500 hover:text-slate-300"
        }`}
      >
        Map View
      </button>
    </div>
  );
};
