export const TelemetryPanel = () => {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-11 bg-[#0A0F1E] border-b border-x border-[#1E293B]/60 rounded-b-[20px] shadow-2xl flex items-center justify-between px-8 select-none z-50">
      
      {/* Battery Indicator: "100% [battery icon]" */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-white tracking-wide">100%</span>
        
        {/* Battery Container */}
        <div className="relative w-6 h-3.5 border border-[#4ADE80] rounded-[3px] p-[1.5px] flex items-center bg-[#070B16]">
          {/* Green battery fill block */}
          <div className="w-full h-full bg-[#4ADE80] rounded-[1px]" />
          
          {/* White/Green Battery Nipple */}
          <div className="absolute -right-[2.5px] top-[3.5px] w-[1px] h-[5px] bg-[#4ADE80] rounded-r-[0.5px]" />
        </div>
      </div>

      {/* Signal Strength: "[signal bars] Strong" */}
      <div className="flex items-center gap-2">
        {/* Custom Signal Bars SVG */}
        <svg className="w-5 h-3.5" viewBox="0 0 20 16" fill="none">
          {/* Bar 1 (Shortest - Active Amber) */}
          <rect x="1" y="11" width="2.5" height="5" rx="0.5" fill="#EAB308" />
          {/* Bar 2 (Active Amber/Green) */}
          <rect x="5.5" y="7" width="2.5" height="9" rx="0.5" fill="#EAB308" />
          {/* Bar 3 (Muted Gray) */}
          <rect x="10" y="3" width="2.5" height="13" rx="0.5" fill="#475569" fillOpacity="0.6" />
          {/* Bar 4 (Tallest - Muted Gray) */}
          <rect x="14.5" y="0" width="2.5" height="16" rx="0.5" fill="#475569" fillOpacity="0.6" />
        </svg>
        <span className="text-[11px] font-bold text-white tracking-wide">Strong</span>
      </div>

      {/* Failsafe Check: "Failsafe Okay [green dot]" */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-[#8F9CAE] font-medium">Failsafe</span>
        <span className="text-[11px] text-white font-bold">Okay</span>
        {/* Small glowing green status indicator */}
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]"></span>
        </span>
      </div>

      {/* System Check: "System Okay [green dot]" */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-[#8F9CAE] font-medium">System</span>
        <span className="text-[11px] text-white font-bold">Okay</span>
        {/* Small glowing green status indicator */}
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]"></span>
        </span>
      </div>

    </div>
  );
};
