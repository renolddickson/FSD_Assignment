interface ViewToggleProps {
  activeView: "camera" | "map";
  onViewChange: (view: "camera" | "map") => void;
}

export const ViewToggle = ({ activeView, onViewChange }: ViewToggleProps) => {
  const handleClick = () => {
    onViewChange(activeView === "camera" ? "map" : "camera");
  };

  return (
    <button
      onClick={handleClick}
      className="px-6 py-2 bg-[#1A2333]/90 hover:bg-[#25324A]/90 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-xl text-xs font-black tracking-widest text-slate-200 uppercase transition-all duration-300 cursor-pointer select-none"
    >
      {activeView === "camera" ? "Camera View" : "Map View"}
    </button>
  );
};

