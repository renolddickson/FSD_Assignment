import { useRef, useState } from "react";
import { Topbar } from "./Topbar";
import { QuickActions } from "./QuickActions";
import { PipWindow } from "./PipWindow";
import { EmergencyStop } from "./EmergencyStop";
import { DpadController } from "./DpadController";
import { ViewToggle } from "./ViewToggle";
import { TelemetryPanel } from "./TelemetryPanel";
import { ModeSelector } from "./ModeSelector";
import { CameraFeed } from "./CameraFeed";
import { PointCloudMap } from "./PointCloudMap";

export const MainViewport = () => {
  const [activeView, setActiveView] = useState<"camera" | "map">("camera");
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [isMissionPaused, setIsMissionPaused] = useState(false);
  const [isEmergencyStopped, setIsEmergencyStopped] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isZoomDragging, setIsZoomDragging] = useState(false);
  const bottomSheetTrackRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const handleBottomSheetTrackInteraction = (clientY: number) => {
    if (!bottomSheetTrackRef.current) return;
    const rect = bottomSheetTrackRef.current.getBoundingClientRect();
    const y = rect.bottom - clientY;
    const ratio = Math.max(0, Math.min(1, y / rect.height));
    const newZoom = 1 + ratio * 4;
    setZoom(Math.round(newZoom * 10) / 10);
  };

  const handleBottomSheetZoomMouseDown = (e: React.MouseEvent) => {
    setIsZoomDragging(true);
    handleBottomSheetTrackInteraction(e.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleBottomSheetTrackInteraction(moveEvent.clientY);
    };

    const handleMouseUp = () => {
      setIsZoomDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleBottomSheetZoomTouchStart = (e: React.TouchEvent) => {
    setIsZoomDragging(true);
    handleBottomSheetTrackInteraction(e.touches[0].clientY);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      handleBottomSheetTrackInteraction(moveEvent.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      setIsZoomDragging(false);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
  };

  const handleSwapView = () => {
    setActiveView((prev) => (prev === "camera" ? "map" : "camera"));
  };

  const handleEmergencyStop = () => {
    setIsEmergencyStopped((prev) => !prev);
  };

  // Renders live camera video or a real WebGL point-cloud map.
  const renderViewContent = (view: "camera" | "map", isPip: boolean) => {
    if (view === "camera") {
      return (
        <CameraFeed
          isPip={isPip}
          zoom={zoom}
          isEmergencyStopped={isEmergencyStopped}
          activeDirection={activeDirection}
        />
      );
    }

    return <PointCloudMap isPip={isPip} isEmergencyStopped={isEmergencyStopped} zoom={zoom} onZoomChange={setZoom} />;
  };

  return (
    <main className="relative flex-1 h-screen bg-[#040814] overflow-hidden select-none">
      {/* 1. Global HUD Header Panel */}
      <Topbar
        mode={mode}
        onModeChange={setMode}
        isMissionPaused={isMissionPaused}
        onPauseToggle={() => setIsMissionPaused((prev) => !prev)}
        disabled={isEmergencyStopped}
      />

      {/* 1.5. Pressed Top Telemetry Panel */}
      <TelemetryPanel />

      {/* 2. Floating View Toggle Bar - desktop only */}
      <div className="hidden md:block absolute top-36 md:top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto transition-all duration-300">
        <ViewToggle activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* 3. Outer Left/Right Action capsules - desktop only */}
      <div className="hidden md:block">
        <QuickActions
          onQuickGoal={() => alert("Quick Goal trigger activated")}
          onInitiate={() => alert("Initiate procedure activated")}
          disabled={isEmergencyStopped}
        />
      </div>

      {/* 4. Active Background Layer */}
      <div className="w-full h-full z-10">{renderViewContent(activeView, false)}</div>

      {/* 5. Inactive Pip Window Layer */}
      <PipWindow
        inactiveView={activeView === "camera" ? "map" : "camera"}
        onSwapView={handleSwapView}
        zoom={zoom}
        onZoomChange={setZoom}
        renderViewContent={renderViewContent}
        hideZoomOnMobile={true}
      />

      {/* 6. Emergency Shutdown Controller - desktop only */}
      <div className="hidden md:block">
        <EmergencyStop onStop={handleEmergencyStop} isTriggered={isEmergencyStopped} />
      </div>

      {/* 7. Directional Dpad Steer Panel - desktop only */}
      <div className="hidden md:block">
        <DpadController
          onDirectionChange={setActiveDirection}
          disabled={mode === "auto" || isEmergencyStopped}
        />
      </div>

      {/* 8. Mobile Floating Controls Trigger (only visible on mobile, hidden on desktop) */}
      {!isControlsOpen && (
        <div className="flex md:hidden absolute right-6 bottom-20 z-30 flex-col gap-3 items-end pointer-events-auto transition-all duration-300">
          {/* Floating E-Stop */}
          <button
            onClick={handleEmergencyStop}
            className={`w-12 h-12 bg-red-600 rounded-full flex flex-col items-center justify-center text-[8px] font-black tracking-wider text-white border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer active:scale-90 transition-all ${
              isEmergencyStopped ? "bg-red-800" : ""
            }`}
          >
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            ESTOP
          </button>

          {/* Floating Steer Panel Toggle */}
          <button
            onClick={() => setIsControlsOpen(true)}
            className="w-12 h-12 bg-sky-600 rounded-full flex flex-col items-center justify-center text-[8px] font-black tracking-wider text-white border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer active:scale-90 transition-all"
          >
            <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 00-10 10c0 4.42 2.87 8.17 6.84 9.47l.55-.41A2 2 0 0110.55 20h2.9a2 2 0 011.16.66l.55.41A10 10 0 0022 12a10 10 0 00-10-10z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            STEER
          </button>
        </div>
      )}

      {/* 8.5. Click-outside Backdrop for Mobile Bottom Sheet */}
      {isControlsOpen && (
        <div
          onClick={() => setIsControlsOpen(false)}
          className="fixed inset-0 z-30 bg-transparent md:hidden pointer-events-auto"
        />
      )}

      {/* 9. Mobile Glassmorphic Bottom Sheet */}
      <div className={`fixed inset-x-0 bottom-0 bg-[#090D1A]/98 border-t border-slate-800/80 rounded-t-[24px] shadow-[0_-15px_30px_rgba(0,0,0,0.65)] z-40 transition-all duration-300 md:hidden flex flex-col px-6 pt-4 pb-20 pointer-events-auto ${
        isControlsOpen ? "translate-y-0" : "translate-y-full"
      } ${
        isZoomDragging ? "opacity-25 backdrop-blur-none" : "opacity-100 backdrop-blur-lg"
      }`}>
        {/* Drag handle */}
        <div 
          onClick={() => setIsControlsOpen(false)}
          className="w-12 h-1 bg-slate-700/60 rounded-full mx-auto mb-4 cursor-pointer hover:bg-slate-500 transition-colors"
        />

        {/* Title row */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-black tracking-widest text-slate-300">SYSTEM CONTROLS & SETTINGS</h2>
          <button 
            onClick={() => setIsControlsOpen(false)}
            className="text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* System & Status Config Rows */}
        <div className="w-full flex flex-col gap-3.5 border-b border-slate-800/40 pb-4 mb-4 select-none">
          {/* Mode Selector Row (Centered, matching desktop style perfectly) */}
          <div className="w-full flex items-center justify-center pointer-events-auto">
            <ModeSelector mode={mode} onModeChange={setMode} />
          </div>

          {/* Mission Status / Pause Row */}
          <div className="w-full flex items-center justify-between bg-white border border-slate-200/50 pl-4 pr-1.5 py-1 rounded-full shadow-lg pointer-events-auto transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                STATUS
              </span>
              <span className="text-xs font-black text-slate-800 tracking-wide">
                On Mission 1234
              </span>
            </div>
            <button
              onClick={() => setIsMissionPaused((prev) => !prev)}
              className="w-7 h-7 bg-[#090D1A] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-slate-800 active:scale-95 transition-all shadow-md"
            >
              {isMissionPaused ? (
                <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Content row (Dpad and Zoom side by side, QuickActions and ESTOP in columns) */}
        <div className="flex flex-col gap-4 items-center w-full">
          {/* Drive & Zoom segment */}
          <div className="flex items-center justify-center w-full gap-12">
            
            {/* HIGH-FIDELITY DESKTOP-CLASS ZOOM SLIDER */}
            <div className="flex flex-col items-center gap-2 p-1.5 bg-[#090D1A]/95 backdrop-blur-md border border-slate-800/40 rounded-full shadow-2xl h-44 justify-between select-none">
              {/* Zoom In Button */}
              <button
                onClick={() => setZoom(Math.min(5, zoom + 0.5))}
                title="Zoom In"
                className="w-6 h-6 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer active:scale-90 transition-all font-black text-sm leading-none"
              >
                +
              </button>

              {/* Vertical Track / Thumb with Interactive Drag Listeners */}
              <div
                ref={bottomSheetTrackRef}
                onMouseDown={handleBottomSheetZoomMouseDown}
                onTouchStart={handleBottomSheetZoomTouchStart}
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
                onClick={() => setZoom(Math.max(1, zoom - 0.5))}
                title="Zoom Out"
                className="w-6 h-6 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer active:scale-90 transition-all font-black text-sm leading-none"
              >
                -
              </button>
            </div>

            {/* Dpad steer panel - rendered inline with symmetrical height to match the zoom slider */}
            <div className="relative w-[130px] h-44 flex items-center justify-center">
              <DpadController
                onDirectionChange={setActiveDirection}
                disabled={mode === "auto" || isEmergencyStopped}
                isInline={true}
              />
            </div>
          </div>

          {/* Quick Actions inside sheet */}
          <div className="w-full flex flex-col gap-3 border-t border-slate-800/40 pt-4">
            {/* Quick Actions Row */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  alert("Quick Goal trigger activated");
                  setIsControlsOpen(false);
                }}
                disabled={isEmergencyStopped}
                className={`pointer-events-auto flex items-center gap-2 p-1 bg-white border border-slate-200/50 rounded-full shadow-lg pl-4 pr-1 hover:shadow-xl active:scale-98 transition-all group cursor-pointer ${
                  isEmergencyStopped ? "opacity-35 pointer-events-none cursor-not-allowed" : ""
                }`}
              >
                <span className="text-[10px] font-black tracking-widest text-slate-800 uppercase">
                  Quick Goal
                </span>
                <div className="w-6 h-6 bg-[#090D1A] rounded-full flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5">
                  <svg className="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </button>
              <button
                onClick={() => {
                  alert("Initiate procedure activated");
                  setIsControlsOpen(false);
                }}
                disabled={isEmergencyStopped}
                className={`pointer-events-auto flex items-center gap-2 p-1 bg-white border border-slate-200/50 rounded-full shadow-lg pl-4 pr-1 hover:shadow-xl active:scale-98 transition-all group cursor-pointer ${
                  isEmergencyStopped ? "opacity-35 pointer-events-none cursor-not-allowed" : ""
                }`}
              >
                <span className="text-[10px] font-black tracking-widest text-slate-800 uppercase">
                  Initiate
                </span>
                <div className="w-6 h-6 bg-[#090D1A] rounded-full flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5">
                  <svg className="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
