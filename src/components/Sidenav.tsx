import { useState } from "react";

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
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: "map",
      label: "Map View",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
      ),
    },
    {
      id: "location",
      label: "Telemetry Locations",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      id: "selection",
      label: "Area Selector",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      ),
    },
    {
      id: "crosshair",
      label: "Target Calibrator",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6" y1="12" x2="2" y2="12" />
          <line x1="12" y1="6" x2="12" y2="2" />
          <line x1="12" y1="22" x2="12" y2="18" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="flex flex-col items-center justify-between w-20 h-screen py-6 bg-[#040814] border-r border-slate-900 select-none z-50">
      {/* Top Section: Branding */}
      <div className="flex flex-col items-center">
        <h1 className="text-xl font-black tracking-wider text-white">ERIC</h1>
        <span className="text-[7px] tracking-[0.3em] font-medium text-slate-400 -mt-1">ROBOTICS</span>
      </div>

      {/* Middle Section: Navigation Icons */}
      <nav className="flex flex-col gap-8 w-full">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`relative flex items-center justify-center w-12 h-12 mx-auto transition-all duration-300 group cursor-pointer ${
                isActive ? "text-white" : "text-[#4F5B73] hover:text-slate-200"
              }`}
            >
              <div className="transition-transform duration-300 group-hover:scale-105">
                {item.icon}
              </div>

              {/* Tooltip */}
              <div className="absolute left-16 px-2.5 py-1.5 rounded-lg bg-slate-950 text-slate-200 text-xs font-medium border border-slate-800 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section: User Profile */}
      <div className="group relative flex items-center justify-center w-12 h-12 text-[#4F5B73] hover:text-slate-200 transition-all duration-300 cursor-pointer">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {/* Tooltip */}
        <div className="absolute left-16 px-2.5 py-1.5 rounded-lg bg-slate-950 text-slate-200 text-xs font-medium border border-slate-800 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50">
          Operator Profile
        </div>
      </div>
    </aside>
  );
};