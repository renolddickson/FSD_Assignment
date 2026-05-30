import { useEffect, useState } from "react";

interface BatteryManager {
  level: number;
  charging: boolean;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

export const TelemetryPanel = () => {
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [signalStrength, setSignalStrength] = useState<string>("Strong");
  const [activeBars, setActiveBars] = useState<number>(4);

  useEffect(() => {
    // 1. Live Battery Status query and subscription
    let activeBattery: BatteryManager | null = null;
    let batteryListener: (() => void) | null = null;

    if (typeof navigator !== "undefined" && navigator.getBattery) {
      navigator.getBattery().then((battery) => {
        activeBattery = battery;
        setBatteryLevel(Math.round(battery.level * 100));
        
        batteryListener = () => {
          setBatteryLevel(Math.round(battery.level * 100));
        };
        battery.addEventListener("levelchange", batteryListener);
      }).catch(() => {});
    }

    // 2. Live Connection Status query and subscription
    const updateConnection = () => {
      if (typeof navigator !== "undefined") {
        if (!navigator.onLine) {
          setSignalStrength("Offline");
          setActiveBars(0);
          return;
        }

        const conn = (navigator as any).connection;
        if (conn) {
          const type = conn.effectiveType;
          if (type === "4g") {
            setSignalStrength("Strong");
            setActiveBars(4);
          } else if (type === "3g") {
            setSignalStrength("Moderate");
            setActiveBars(3);
          } else if (type === "2g" || type === "slow-2g") {
            setSignalStrength("Weak");
            setActiveBars(1);
          } else {
            setSignalStrength("Strong");
            setActiveBars(4);
          }
        } else {
          setSignalStrength("Strong");
          setActiveBars(4);
        }
      }
    };

    updateConnection();

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);

    const conn = (navigator as any).connection;
    if (conn) {
      conn.addEventListener("change", updateConnection);
    }

    return () => {
      if (activeBattery && batteryListener) {
        activeBattery.removeEventListener("levelchange", batteryListener);
      }
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
      if (conn) {
        conn.removeEventListener("change", updateConnection);
      }
    };
  }, []);

  const isBatteryLow = batteryLevel <= 20;
  const batteryColorClass = isBatteryLow ? "#EF4444" : "#4ADE80";
  const batteryBorderClass = isBatteryLow ? "border-[#EF4444]" : "border-[#4ADE80]";
  const batteryBgClass = isBatteryLow ? "bg-[#EF4444]" : "bg-[#4ADE80]";

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-11 bg-[#0A0F1E] border-b border-x border-[#1E293B]/60 rounded-b-[20px] shadow-2xl flex items-center justify-between px-8 select-none z-50">
      
      {/* Battery Indicator: dynamic device charge level */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-white tracking-wide">{batteryLevel}%</span>
        
        {/* Battery Container */}
        <div className={`relative w-6 h-3.5 border rounded-[3px] p-[1.5px] flex items-center bg-[#070B16] ${batteryBorderClass}`}>
          {/* battery fill block */}
          <div 
            className={`h-full rounded-[1px] transition-all duration-300 ${batteryBgClass}`} 
            style={{ width: `${batteryLevel}%` }}
          />
          
          {/* Battery Nipple */}
          <div 
            className="absolute -right-[2.5px] top-[3.5px] w-[1px] h-[5px] rounded-r-[0.5px]" 
            style={{ backgroundColor: batteryColorClass }}
          />
        </div>
      </div>

      {/* Signal Strength: dynamic connection type */}
      <div className="flex items-center gap-2">
        {/* Custom Signal Bars SVG */}
        <svg className="w-5 h-3.5" viewBox="0 0 20 16" fill="none">
          {/* Bar 1 */}
          <rect x="1" y="11" width="2.5" height="5" rx="0.5" fill={activeBars >= 1 ? "#10B981" : "#475569"} fillOpacity={activeBars >= 1 ? 1 : 0.6} />
          {/* Bar 2 */}
          <rect x="5.5" y="7" width="2.5" height="9" rx="0.5" fill={activeBars >= 2 ? "#10B981" : "#475569"} fillOpacity={activeBars >= 2 ? 1 : 0.6} />
          {/* Bar 3 */}
          <rect x="10" y="3" width="2.5" height="13" rx="0.5" fill={activeBars >= 3 ? "#10B981" : "#475569"} fillOpacity={activeBars >= 3 ? 1 : 0.6} />
          {/* Bar 4 */}
          <rect x="14.5" y="0" width="2.5" height="16" rx="0.5" fill={activeBars >= 4 ? "#10B981" : "#475569"} fillOpacity={activeBars >= 4 ? 1 : 0.6} />
        </svg>
        <span className="text-[11px] font-bold text-white tracking-wide">{signalStrength}</span>
      </div>

      {/* Failsafe Check */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-[#8F9CAE] font-medium">Failsafe</span>
        <span className="text-[11px] text-white font-bold">Okay</span>
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]"></span>
        </span>
      </div>

      {/* System Check */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-[#8F9CAE] font-medium">System</span>
        <span className="text-[11px] text-white font-bold">Okay</span>
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]"></span>
        </span>
      </div>

    </div>
  );
};
