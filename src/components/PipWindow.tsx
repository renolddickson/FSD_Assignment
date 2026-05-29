interface PipWindowProps {
  inactiveView: "camera" | "map";
  onSwapView: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  renderViewContent: (view: "camera" | "map", isPip: boolean) => React.ReactNode;
}

export const PipWindow = ({
  inactiveView,
  onSwapView,
  zoom,
  onZoomChange,
  renderViewContent,
}: PipWindowProps) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(5, zoom + 0.5));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(1, zoom - 0.5));
  };

  return (
    <div className="absolute left-6 bottom-6 flex items-end gap-3 z-30 select-none pointer-events-auto">
      {/* Vertical Zoom Controller */}
      <div className="flex flex-col items-center gap-2 p-1.5 bg-[#090D1A]/95 backdrop-blur-md border border-slate-800/40 rounded-full shadow-2xl h-44 justify-between">
        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-6 h-6 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer active:scale-90 transition-all font-black text-sm leading-none"
        >
          +
        </button>

        {/* Vertical Track / Thumb */}
        <div className="relative flex-1 w-1 flex items-center justify-center">
          {/* Track background */}
          <div className="absolute w-[2px] h-full bg-slate-800 rounded-full" />
          
          {/* Dynamic Fill Bar */}
          <div
            className="absolute w-[2px] bg-sky-500 rounded-full bottom-0"
            style={{ height: `${((zoom - 1) / 4) * 100}%` }}
          />

          {/* Slider Thumb */}
          <div
            className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-md shadow-sky-500/20 border border-sky-500 transition-all"
            style={{ bottom: `calc(${((zoom - 1) / 4) * 100}% - 5px)` }}
          />
        </div>

        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-6 h-6 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer active:scale-90 transition-all font-black text-sm leading-none"
        >
          -
        </button>
      </div>

      {/* Picture-in-Picture View Container */}
      <div
        onClick={onSwapView}
        className="relative w-56 h-32 rounded-2xl overflow-hidden border border-white/20 shadow-2xl cursor-pointer group hover:scale-[1.03] transition-all duration-300"
      >
        {/* Actual Preview Stream */}
        <div className="w-full h-full pointer-events-none scale-100 group-hover:scale-105 transition-transform duration-500">
          {renderViewContent(inactiveView, true)}
        </div>

        {/* HUD Translucent Overlay Banner (Only when map is in PiP, matching screenshots exactly) */}
        {inactiveView === "map" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
            <div className="px-4 py-2 rounded-lg bg-[#090D1A]/85 border border-slate-700/40 text-[10px] font-semibold text-slate-200 tracking-wide select-none shadow-2xl">
              Click to enter camera view
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
