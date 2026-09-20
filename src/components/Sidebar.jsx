import {
  BarChart3,
  BookOpen,
  CircleHelp,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Plane,
  Settings,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router";

export const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },

  // NEW: Virtual cockpit controls
  // Later, these controls will also receive states from Raspberry Pi GPIO.
  {
    label: "Cockpit Controls",
    path: "/controls",
    icon: SlidersHorizontal,
  },

 // {
    //label: "Choose Checklist",
    //path: "/checklists",
   // icon: ClipboardList,
 // }, 
  {
    label: "Manual",
    path: "/manual",
    icon: BookOpen,
  },
  {
    label: "Performance",
    path: "/performance",
    icon: BarChart3,
  },
  {
    label: "History",
    path: "/history",
    icon: History,
  },
  {
    label: "Leaderboard",
    path: "/leaderboard",
    icon: Trophy,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    label: "Help & Guide",
    path: "/help",
    icon: CircleHelp,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("tecnamUser");
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-white/10 bg-[#08233f] text-white lg:flex">
      {/* =========================================================
          BRANDING
          ========================================================= */}
      <div className="border-b border-white/10 p-7">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-500/20 p-3 text-blue-300">
            <Plane size={28} />
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-blue-200">
              TECNAM
            </p>

            <h2 className="text-2xl font-black italic tracking-tight">
              P2002 JF
            </h2>
          </div>
        </div>

        <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-slate-400">
          Interactive Cockpit Trainer
        </p>
      </div>

      {/* =========================================================
          NAVIGATION
          ========================================================= */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              <Icon size={19} />

              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* =========================================================
          AIRCRAFT IMAGE

          Later put your image here:

          public/images/tecnam-hero.jpg
          ========================================================= */}
      <div className="px-5 pb-4">
        <div
          className="h-32 rounded-3xl border border-white/10 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(8,35,63,.25), rgba(8,35,63,.85)), url('/images/tecnam-hero.jpg')",
          }}
        >
          <div className="flex h-full items-end p-4">
            <div>
              <p className="text-xs font-semibold">
                WCC Aeronautical &
              </p>

              <p className="text-xs text-slate-300">
                Technological College
              </p>

              <p className="text-xs text-slate-400">
                Binalonan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          LOGOUT

          We are not working on authentication yet.
          This can stay here for now.
          ========================================================= */}
      <button
        onClick={logout}
        className="m-4 flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut size={18} />
        Log out
      </button>
    </aside>
  );
}

export default Sidebar;