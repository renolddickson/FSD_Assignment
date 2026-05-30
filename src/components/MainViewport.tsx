import { useState } from "react";
import { Topbar } from "./Topbar";
import { QuickActions } from "./QuickActions";
import { PipWindow } from "./PipWindow";
import { EmergencyStop } from "./EmergencyStop";
import { DpadController } from "./DpadController";
import { ViewToggle } from "./ViewToggle";
import { TelemetryPanel } from "./TelemetryPanel";
import heroImg from "../assets/hero.png";

export const MainViewport = () => {
  const [activeView, setActiveView] = useState<"camera" | "map">("camera");
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [isMissionPaused, setIsMissionPaused] = useState(false);
  const [isEmergencyStopped, setIsEmergencyStopped] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [activeDirection, setActiveDirection] = useState<string | null>(null);

  const handleSwapView = () => {
    setActiveView((prev) => (prev === "camera" ? "map" : "camera"));
  };

  const handleEmergencyStop = () => {
    setIsEmergencyStopped((prev) => !prev);
  };

  // Renders the realistic warehouse camera feed or the 2D floor-plan map
  const renderViewContent = (view: "camera" | "map", isPip: boolean) => {
    if (view === "camera") {
      return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center select-none">
          {/* Warehouse Background Feed */}
          <img
            src={heroImg}
            alt="Robotics Camera Feed"
            className="w-full h-full object-cover opacity-90 transition-transform duration-300"
            style={{
              transform: isPip ? "scale(1.05)" : `scale(${zoom})`,
              filter: isEmergencyStopped ? "contrast(1.2) sepia(0.3) hue-rotate(-50deg)" : "none",
            }}
          />

          {/* Dynamic HUD Grid Overlay */}
          {!isPip && (
            <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-950/20">
              {/* Scanlines / Static Filter */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[size:100%_4px] opacity-10" />

              {/* Crosshair HUD indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                </div>
                <div className="absolute w-16 h-[1px] bg-white/10" />
                <div className="absolute h-16 w-[1px] bg-white/10" />
              </div>

              {/* Safe area corners */}
              <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-white/30" />
              <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-white/30" />
              <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-white/30" />
              <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-white/30" />

              {/* Emergency Stopped Overlay banner */}
              {isEmergencyStopped && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 bg-slate-950/85 backdrop-blur-md border border-red-500/80 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.35)] flex flex-col items-center gap-2 select-none min-w-[340px]">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_8px_#EF4444]"></span>
                    </span>
                    <span className="text-red-500 text-xs font-black tracking-[0.2em] uppercase leading-none">
                      EMERGENCY SHUTDOWN
                    </span>
                  </div>
                  <div className="w-full h-[1px] bg-red-500/20 my-1" />
                  <span className="text-white text-[10px] font-mono tracking-widest uppercase opacity-90 text-center">
                    ALL ACTUATORS AND MOTORS INHIBITED
                  </span>
                </div>
              )}

              {/* Zoom display badge */}
              <div className="absolute bottom-6 left-32 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-[9px] font-black text-slate-400 tracking-wider">
                LENS ZOOM: {zoom.toFixed(1)}x
              </div>

              {/* Dpad steer output display */}
              {activeDirection && (
                <div className="absolute bottom-6 right-40 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-[9px] font-black text-emerald-400 tracking-wider uppercase animate-pulse">
                  DRIVE: STEERING {
                    activeDirection.toLowerCase() === "w" ? "FORWARD" :
                    activeDirection.toLowerCase() === "s" ? "BACKWARD" :
                    activeDirection.toLowerCase() === "a" ? "LEFT" :
                    activeDirection.toLowerCase() === "d" ? "RIGHT" :
                    activeDirection
                  }
                </div>
              )}
            </div>
          )}

          {/* Pip-only display tags */}
          {isPip && (
            <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2 py-0.5 rounded text-[8px] font-black text-slate-400 tracking-wider uppercase">
              CAM VIEW
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="relative w-full h-full bg-[#E5E7EB] overflow-hidden flex items-center justify-center select-none p-4">
          {/* High-Fidelity Vector Map Grid Floor */}
          <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60" />

          {/* SVG Map Layout representing Warehouse Floor-Plan */}
          <svg className="w-[85%] h-[85%] text-slate-700 max-w-4xl max-h-[80vh] transition-transform duration-300" viewBox="0 0 800 600" fill="none" style={{ transform: isPip ? "scale(0.95)" : "scale(1)" }}>
            {/* Outline of building structure */}
            <rect x="50" y="50" width="700" height="500" rx="12" stroke="#334155" strokeWidth="4" fill="#F1F5F9" fillOpacity="0.8" />
            
            {/* Shaded pink obstacle zones */}
            <g id="obstacle-zones">
              {/* Zone A - Left Top storage */}
              <rect x="100" y="80" width="180" height="120" rx="6" fill="#FCA5A5" fillOpacity="0.4" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="190" y="145" textAnchor="middle" fill="#991B1B" className="text-xs font-black tracking-widest uppercase opacity-70">Zone Alpha</text>
              
              {/* Zone B - Middle Bottom storage */}
              <rect x="120" y="320" width="200" height="160" rx="6" fill="#FCA5A5" fillOpacity="0.4" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="220" y="405" textAnchor="middle" fill="#991B1B" className="text-xs font-black tracking-widest uppercase opacity-70">Storage Beta</text>

              {/* Zone C - Right Middle storage */}
              <rect x="460" y="240" width="240" height="280" rx="6" fill="#FCA5A5" fillOpacity="0.4" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="580" y="385" textAnchor="middle" fill="#991B1B" className="text-xs font-black tracking-widest uppercase opacity-70">Main Lab</text>
            </g>

            {/* Grid Coordinates Lines */}
            <g stroke="#E2E8F0" strokeWidth="1">
              <line x1="50" y1="200" x2="750" y2="200" />
              <line x1="50" y1="400" x2="750" y2="400" />
              <line x1="300" y1="50" x2="300" y2="550" />
              <line x1="550" y1="50" x2="550" y2="550" />
            </g>

            {/* Path Tracking lines */}
            <path d="M 200 240 L 400 240 L 400 480" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 6" className="animate-[dash_20s_linear_infinite]" />

            {/* Scanner target ranges (Green circles) */}
            <circle cx="400" cy="240" r="16" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="400" cy="480" r="16" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Telemetry Target nodes */}
            <g className="cursor-pointer hover:scale-105 transition-transform duration-200">
              <circle cx="400" cy="240" r="6" fill="#10B981" stroke="#F1F5F9" strokeWidth="2" />
              <circle cx="400" cy="480" r="6" fill="#10B981" stroke="#F1F5F9" strokeWidth="2" />
            </g>

            {/* Robot AGV Icon representing Eric */}
            <g id="robot-icon" transform="translate(385, 222)" className="transition-transform duration-500">
              {/* Outer frame */}
              <rect x="0" y="0" width="30" height="36" rx="6" fill="#090D1A" stroke="#38BDF8" strokeWidth="2" />
              {/* Wheels */}
              <rect x="-4" y="4" width="4" height="8" rx="2" fill="#475569" />
              <rect x="30" y="4" width="4" height="8" rx="2" fill="#475569" />
              <rect x="-4" y="24" width="4" height="8" rx="2" fill="#475569" />
              <rect x="30" y="24" width="4" height="8" rx="2" fill="#475569" />
              {/* Status Indicator LED */}
              <circle cx="15" cy="12" r="3.5" fill="#38BDF8" className="animate-pulse" />
              {/* Antenna */}
              <line x1="15" y1="12" x2="15" y2="4" stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="15" cy="3" r="1.5" fill="#38BDF8" />
            </g>
          </svg>

          {/* Interactive controls hints */}
          {!isPip && (
            <div className="absolute top-24 left-6 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-xl text-[9px] font-black text-slate-300 tracking-wider">
              MAP BOUNDARY: [800m x 600m]
            </div>
          )}

          {/* Pip-only display tag */}
          {isPip && (
            <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2 py-0.5 rounded text-[8px] font-black text-slate-400 tracking-wider uppercase">
              MAP VIEW
            </div>
          )}
        </div>
      );
    }
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

      {/* 2. Floating View Toggle Bar */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <ViewToggle activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* 3. Outer Left/Right Action capsules */}
      <QuickActions
        onQuickGoal={() => alert("Quick Goal trigger activated")}
        onInitiate={() => alert("Initiate procedure activated")}
        disabled={isEmergencyStopped}
      />

      {/* 4. Active Background Layer */}
      <div className="w-full h-full z-10">{renderViewContent(activeView, false)}</div>

      {/* 5. Inactive Pip Window Layer */}
      <PipWindow
        inactiveView={activeView === "camera" ? "map" : "camera"}
        onSwapView={handleSwapView}
        zoom={zoom}
        onZoomChange={setZoom}
        renderViewContent={renderViewContent}
      />

      {/* 6. Emergency Shutdown Controller */}
      <EmergencyStop onStop={handleEmergencyStop} isTriggered={isEmergencyStopped} />

      {/* 7. Directional Dpad Steer Panel */}
      <DpadController
        onDirectionChange={setActiveDirection}
        disabled={mode === "auto" || isEmergencyStopped}
      />
    </main>
  );
};
