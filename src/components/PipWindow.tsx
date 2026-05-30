import { useEffect, useRef } from "react";

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
  const trackRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const direction = e.deltaY < 0 ? 1 : -1;
        const step = 0.2;
        onZoomChange(Math.max(1, Math.min(5, Math.round((zoomRef.current + direction * step) * 10) / 10)));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
        onZoomChange(1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onZoomChange]);

  const handleZoomIn = () => {
    onZoomChange(Math.min(5, zoom + 0.5));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(1, zoom - 0.5));
  };

  // Maps vertical slider offsets directly to lens zoom level (1x - 5x)
  const handleTrackInteraction = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const y = rect.bottom - clientY;
    const ratio = Math.max(0, Math.min(1, y / rect.height));
    const newZoom = 1 + ratio * 4;
    onZoomChange(Math.round(newZoom * 10) / 10);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleTrackInteraction(e.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleTrackInteraction(moveEvent.clientY);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleTrackInteraction(e.touches[0].clientY);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      handleTrackInteraction(moveEvent.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
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

        {/* Vertical Track / Thumb with Interactive Drag Listeners */}
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative flex-1 w-4 flex items-center justify-center cursor-ns-resize"
        >
          {/* Visual thin track line */}
          <div className="absolute w-[2px] h-full bg-slate-800 rounded-full pointer-events-none" />
          
          {/* Dynamic Fill Bar */}
          <div
            className="absolute w-[2px] bg-sky-500 rounded-full bottom-0 pointer-events-none"
            style={{ height: `${((zoom - 1) / 4) * 100}%` }}
          />

          {/* Slider Thumb */}
          <div
            className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-md shadow-sky-500/20 border border-sky-500 pointer-events-none"
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
        className="relative w-56 h-32 rounded-xl overflow-hidden border border-white/20 shadow-2xl cursor-pointer group hover:scale-[1.03] transition-all duration-300"
      >
        {/* Actual Preview Stream */}
        <div className="w-full h-full pointer-events-none scale-100 group-hover:scale-105 transition-transform duration-500">
          {renderViewContent(inactiveView, true)}
        </div>

        {/* HUD Translucent Overlay Banner (Only when map is in PiP, matching screenshots exactly) */}
        {inactiveView === "map" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
            <div className="px-4 py-2 rounded-md bg-[#090D1A]/85 border border-slate-700/40 text-[10px] font-semibold text-slate-200 tracking-wide select-none shadow-2xl">
              Click to enter camera view
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
