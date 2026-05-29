export const TelemetryPanel = () => {
  return (
    <div className="flex items-center gap-6 px-6 py-2.5 bg-[#090D1A]/90 backdrop-blur-md border border-slate-800/40 rounded-2xl shadow-2xl select-none">
      {/* Battery Indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-300">100%</span>
        <div className="relative w-7 h-4 border border-emerald-500/60 rounded-[4px] p-[2px] flex items-center">
          <div className="w-full h-full bg-emerald-500 rounded-[2px]" />
          {/* Battery Nipple */}
          <div className="absolute -right-[3px] top-[4px] w-[2px] h-[6px] bg-emerald-500 rounded-r-[1px]" />
        </div>
      </div>

      {/* Vertical divider */}
      <div className="w-[1px] h-4 bg-slate-800" />

      {/* Signal Strength */}
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 20h.01M8 20h.01M4 20h.01M16 20h.01M20 20h.01" />
          <path d="M20 20a16 16 0 0 0-16 0" />
          <path d="M16 20a10 10 0 0 0-8 0" />
          <path d="M12 20a4 4 0 0 0 0 0" />
        </svg>
        <span className="text-xs font-semibold text-slate-300">Strong</span>
      </div>

      {/* Vertical divider */}
      <div className="w-[1px] h-4 bg-slate-800" />

      {/* Failsafe */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Failsafe</span>
        <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-md">
          <span className="text-xs font-semibold text-emerald-400">Okay</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="w-[1px] h-4 bg-slate-800" />

      {/* System Status */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">System</span>
        <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-md">
          <span className="text-xs font-semibold text-emerald-400">Okay</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>
    </div>
  );
};
