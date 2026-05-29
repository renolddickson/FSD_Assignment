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
      {/* Outer Controller Circular Panel */}
      <div className="relative w-28 h-28 bg-[#090D1A]/95 backdrop-blur-md rounded-full border border-slate-800/40 shadow-2xl flex items-center justify-center">
        
        {/* Center Panel (Display key combo hint) */}
        <div className="absolute w-12 h-12 rounded-full bg-[#141A2E]/80 border border-slate-800/50 flex flex-col items-center justify-center shadow-inner z-20">
          <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest leading-none">
            ⌘ + key
          </span>
        </div>

        {/* W (Up / North) */}
        <button
          onMouseDown={() => handleMouseDown("w")}
          onMouseUp={() => handleMouseUp("w")}
          onMouseLeave={() => handleMouseUp("w")}
          onTouchStart={() => handleMouseDown("w")}
          onTouchEnd={() => handleMouseUp("w")}
          className={`absolute top-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
            activeKeys.w
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-95"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black leading-none mb-0.5 text-slate-500">W</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </div>
        </button>

        {/* S (Down / South) */}
        <button
          onMouseDown={() => handleMouseDown("s")}
          onMouseUp={() => handleMouseUp("s")}
          onMouseLeave={() => handleMouseUp("s")}
          onTouchStart={() => handleMouseDown("s")}
          onTouchEnd={() => handleMouseUp("s")}
          className={`absolute bottom-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
            activeKeys.s
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-95"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <div className="flex flex-col items-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <span className="text-[7px] font-black leading-none mt-0.5 text-slate-500">S</span>
          </div>
        </button>

        {/* A (Left / West) */}
        <button
          onMouseDown={() => handleMouseDown("a")}
          onMouseUp={() => handleMouseUp("a")}
          onMouseLeave={() => handleMouseUp("a")}
          onTouchStart={() => handleMouseDown("a")}
          onTouchEnd={() => handleMouseUp("a")}
          className={`absolute left-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
            activeKeys.a
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-95"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <div className="flex items-center gap-0.5">
            <span className="text-[7px] font-black text-slate-500">A</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>
        </button>

        {/* D (Right / East) */}
        <button
          onMouseDown={() => handleMouseDown("d")}
          onMouseUp={() => handleMouseUp("d")}
          onMouseLeave={() => handleMouseUp("d")}
          onTouchStart={() => handleMouseDown("d")}
          onTouchEnd={() => handleMouseUp("d")}
          className={`absolute right-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
            activeKeys.d
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-95"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <div className="flex items-center gap-0.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-[7px] font-black text-slate-500">D</span>
          </div>
        </button>

      </div>
    </div>
  );
};
