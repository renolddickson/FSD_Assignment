interface EmergencyStopProps {
  onStop: () => void;
  isTriggered: boolean;
}

export const EmergencyStop = ({ onStop, isTriggered }: EmergencyStopProps) => {
  return (
    <div className="absolute right-6 bottom-44 flex flex-col items-center justify-center select-none z-30">
      <button
        onClick={onStop}
        className="relative group focus:outline-none flex items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95"
      >
        {/* Glowing Pulsing Ring */}
        <div
          className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-300 opacity-60 group-hover:opacity-100 ${
            isTriggered
              ? "bg-red-600 animate-pulse"
              : "bg-amber-500/20 group-hover:bg-red-500/40"
          }`}
          style={{ width: "96px", height: "96px" }}
        />

        {/* Industrial Emergency Button Body */}
        <div className="relative w-24 h-24 rounded-full bg-[#EAB308] border-[3px] border-slate-950 flex flex-col items-center justify-between p-1.5 shadow-xl select-none">
          {/* Top Label */}
          <span className="text-[7.5px] font-black text-slate-950 tracking-[0.1em] mt-0.5 select-none leading-none">
            EMERGENCY
          </span>

          {/* Red Actuator Center Button */}
          <div
            className={`w-14 h-14 rounded-full border-[3px] border-slate-950 flex items-center justify-center transition-all duration-300 shadow-inner ${
              isTriggered
                ? "bg-red-800 scale-90"
                : "bg-[#DC2626] group-hover:bg-[#EF4444] hover:shadow-lg"
            }`}
          >
            {/* White Circular Arrows */}
            <svg
              className={`w-9 h-9 text-white transition-transform duration-1000 ${
                isTriggered ? "rotate-180" : "group-hover:rotate-45"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </div>

          {/* Bottom Label */}
          <span className="text-[8.5px] font-black text-slate-950 tracking-[0.2em] mb-0.5 select-none leading-none">
            STOP
          </span>
        </div>
      </button>
    </div>
  );
};
