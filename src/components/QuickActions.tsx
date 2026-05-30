interface QuickActionsProps {
  onQuickGoal: () => void;
  onInitiate: () => void;
  disabled?: boolean;
}

export const QuickActions = ({ onQuickGoal, onInitiate, disabled }: QuickActionsProps) => {
  return (
    <div className={`absolute top-[88px] left-6 right-6 flex items-center justify-between z-30 pointer-events-none select-none transition-all duration-300 ${
      disabled ? "opacity-35" : ""
    }`}>
      {/* Left Quick Goal */}
      <button
        onClick={onQuickGoal}
        disabled={disabled}
        className={`pointer-events-auto flex items-center gap-2 p-1 bg-white border border-slate-200/50 rounded-full shadow-lg pl-4 pr-1 hover:shadow-xl active:scale-98 transition-all group cursor-pointer ${
          disabled ? "pointer-events-none cursor-not-allowed" : ""
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

      {/* Right Initiate */}
      <button
        onClick={onInitiate}
        disabled={disabled}
        className={`pointer-events-auto flex items-center gap-2 p-1 bg-white border border-slate-200/50 rounded-full shadow-lg pl-4 pr-1 hover:shadow-xl active:scale-98 transition-all group cursor-pointer ${
          disabled ? "pointer-events-none cursor-not-allowed" : ""
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
  );
};
