import { useEffect, useState } from "react";

interface DpadControllerProps {
  onDirectionChange?: (direction: string | null) => void;
}

export const DpadController = ({ onDirectionChange }: DpadControllerProps) => {
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        setActiveKeys((prev) => ({ ...prev, [key]: true }));
        if (onDirectionChange) onDirectionChange(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        setActiveKeys((prev) => ({ ...prev, [key]: false }));
        if (onDirectionChange) onDirectionChange(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onDirectionChange]);

  const handleMouseDown = (key: string) => {
    setActiveKeys((prev) => ({ ...prev, [key]: true }));
    if (onDirectionChange) onDirectionChange(key);
  };

  const handleMouseUp = (key: string) => {
    setActiveKeys((prev) => ({ ...prev, [key]: false }));
    if (onDirectionChange) onDirectionChange(null);
  };

  return (
    <div className="absolute right-6 bottom-6 select-none z-30 flex items-center justify-center">
      {/* Outer Dark Circular Steer Dial */}
      <div className="relative w-[124px] h-[124px] bg-[#182030] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center justify-center border border-slate-700/30">
        
        {/* Clickable Outer Top Chevron segment */}
        <button
          onMouseDown={() => handleMouseDown("w")}
          onMouseUp={() => handleMouseUp("w")}
          onMouseLeave={() => handleMouseUp("w")}
          onTouchStart={() => handleMouseDown("w")}
          onTouchEnd={() => handleMouseUp("w")}
          className={`absolute top-[4px] left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center cursor-pointer transition-all duration-150 select-none z-10 ${
            activeKeys.w ? "text-white scale-110 drop-shadow-[0_0_8px_#38BDF8]" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-label="Steer Up"
        >
          <svg className="w-4.5 h-4.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3.5" strokeLinecap="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>

        {/* Clickable Outer Bottom Chevron segment */}
        <button
          onMouseDown={() => handleMouseDown("s")}
          onMouseUp={() => handleMouseUp("s")}
          onMouseLeave={() => handleMouseUp("s")}
          onTouchStart={() => handleMouseDown("s")}
          onTouchEnd={() => handleMouseUp("s")}
          className={`absolute bottom-[4px] left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center cursor-pointer transition-all duration-150 select-none z-10 ${
            activeKeys.s ? "text-white scale-110 drop-shadow-[0_0_8px_#38BDF8]" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-label="Steer Down"
        >
          <svg className="w-4.5 h-4.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Clickable Outer Left Chevron segment */}
        <button
          onMouseDown={() => handleMouseDown("a")}
          onMouseUp={() => handleMouseUp("a")}
          onMouseLeave={() => handleMouseUp("a")}
          onTouchStart={() => handleMouseDown("a")}
          onTouchEnd={() => handleMouseUp("a")}
          className={`absolute left-[4px] top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-pointer transition-all duration-150 select-none z-10 ${
            activeKeys.a ? "text-white scale-110 drop-shadow-[0_0_8px_#38BDF8]" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-label="Steer Left"
        >
          <svg className="w-4.5 h-4.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Clickable Outer Right Chevron segment */}
        <button
          onMouseDown={() => handleMouseDown("d")}
          onMouseUp={() => handleMouseUp("d")}
          onMouseLeave={() => handleMouseUp("d")}
          onTouchStart={() => handleMouseDown("d")}
          onTouchEnd={() => handleMouseUp("d")}
          className={`absolute right-[4px] top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-pointer transition-all duration-150 select-none z-10 ${
            activeKeys.d ? "text-white scale-110 drop-shadow-[0_0_8px_#38BDF8]" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-label="Steer Right"
        >
          <svg className="w-4.5 h-4.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Central White Circular Panel containing W, A, S, D */}
        <div className="absolute w-[66px] h-[66px] rounded-full bg-white flex items-center justify-center shadow-lg border border-slate-200/50 pointer-events-none z-20">
          
          {/* Top: W */}
          <span className={`absolute top-1 text-[10.5px] font-black tracking-wide transition-all ${
            activeKeys.w ? "text-sky-500 scale-110" : "text-[#182030]"
          }`}>
            W
          </span>

          {/* Bottom: S */}
          <span className={`absolute bottom-1 text-[10.5px] font-black tracking-wide transition-all ${
            activeKeys.s ? "text-sky-500 scale-110" : "text-[#182030]"
          }`}>
            S
          </span>

          {/* Left: A */}
          <span className={`absolute left-2.5 text-[10.5px] font-black tracking-wide transition-all ${
            activeKeys.a ? "text-sky-500 scale-110" : "text-[#182030]"
          }`}>
            A
          </span>

          {/* Right: D */}
          <span className={`absolute right-2.5 text-[10.5px] font-black tracking-wide transition-all ${
            activeKeys.d ? "text-sky-500 scale-110" : "text-[#182030]"
          }`}>
            D
          </span>

          {/* Center text: ⌘ + key */}
          <div className="flex flex-col items-center justify-center pt-0.5 select-none leading-none opacity-80 scale-95">
            <span className="text-[7.5px] font-black text-slate-400">⌘ +</span>
            <span className="text-[7px] font-bold text-slate-400 mt-0.5">key</span>
          </div>

        </div>

      </div>
    </div>
  );
};
