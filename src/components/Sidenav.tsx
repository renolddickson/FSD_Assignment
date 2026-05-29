import { useState } from "react";
import { LayoutGrid, Map, MapPin, BoxSelect, Crosshair, TrendingUp, User } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const Sidenav = () => {
      const [activeTab, setActiveTab] = useState("dashboard");

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      id: "map",
      label: "Map View",
      icon: <Map className="w-5 h-5" />,
    },
    {
      id: "location",
      label: "Telemetry Locations",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      id: "selection",
      label: "Area Selector",
      icon: <BoxSelect className="w-5 h-5" />,
    },
    {
      id: "crosshair",
      label: "Target Calibrator",
      icon: <Crosshair className="w-5 h-5" />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="flex flex-col items-center justify-between w-16 h-screen py-6 bg-[#0B101D] border-r border-[#1E293B]/30 select-none z-50">
      {/* Top Section: Logo & Nav items stacked closely */}
      <div className="flex flex-col items-center gap-10 w-full">
        {/* Logo Branding */}
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold tracking-wider text-white">ERIC</h1>
          <span className="text-[6.5px] tracking-[0.25em] font-semibold text-slate-400 -mt-1">ROBOTICS</span>
        </div>

        {/* Navigation list (Compact Stack) */}
        <nav className="flex flex-col gap-4 w-full">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`relative flex items-center justify-center w-12 h-12 mx-auto transition-all duration-300 group cursor-pointer ${
                  isActive ? "text-white scale-105" : "text-[#4F5B73] hover:text-slate-200"
                }`}
              >
                <div className="transition-transform duration-300 group-hover:scale-105">
                  {item.icon}
                </div>

                {/* Tooltip with Sharp Pointing Arrow shifted to the right */}
                <div className="absolute left-16 px-2.5 py-1.5 rounded-lg bg-slate-950 text-slate-200 text-xs font-semibold border border-slate-800 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-2xl whitespace-nowrap z-50">
                  {/* Left pointing arrow tip */}
                  <div className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-950 border-l border-b border-slate-800 rotate-45 z-40" />
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Profile */}
      <div className="group relative flex items-center justify-center w-12 h-12 text-[#4F5B73] hover:text-slate-200 transition-all duration-300 cursor-pointer">
        <User className="w-5 h-5" />
        {/* Tooltip with Sharp Pointing Arrow shifted to the right */}
        <div className="absolute left-16 px-2.5 py-1.5 rounded-lg bg-slate-950 text-slate-200 text-xs font-semibold border border-slate-800 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-2xl whitespace-nowrap z-50">
          {/* Left pointing arrow tip */}
          <div className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-950 border-l border-b border-slate-800 rotate-45 z-40" />
          Operator Profile
        </div>
      </div>
    </aside>
  );
};