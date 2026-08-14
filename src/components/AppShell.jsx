import {
  Bell,
  Cpu,
  Plane,
  User,
} from "lucide-react";

import { NavLink, Outlet } from "react-router";

import Sidebar, {
  navigationItems,
} from "./Sidebar";

function AppShell() {
  const storedUser = JSON.parse(
    localStorage.getItem("tecnamUser") ||
      '{"name":"Guest Student"}'
  );

  return (
    <div className="min-h-screen bg-[#eef6ff] text-slate-900">
      {/* Background grid */}
      <div className="aviation-grid pointer-events-none fixed inset-0" />

      <Sidebar />

      <main className="relative min-h-screen lg:pl-72">
        {/* Desktop / tablet top bar */}
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/65 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-4 md:px-7 lg:px-10">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-600 p-2 text-white lg:hidden">
                <Plane size={20} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Walkthrough Mode
                </p>

                <p className="text-sm font-semibold text-slate-700">
                  Interactive Training System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Hardware status.
                  LATER: this will come from Python/Raspberry Pi */}
              <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 md:flex">
                <Cpu size={15} />
                Simulator Ready
              </div>

              <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:text-blue-600">
                <Bell size={19} />
              </button>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <User size={18} className="text-blue-600" />

                <span className="hidden text-sm font-semibold md:inline">
                  {storedUser.name}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile/tablet navigation */}
          <div className="overflow-x-auto border-t border-slate-100 lg:hidden">
            <div className="flex min-w-max gap-1 px-3 py-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-500",
                      ].join(" ")
                    }
                  >
                    <Icon size={15} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </header>

        <div className="relative mx-auto max-w-[1600px] p-4 md:p-7 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppShell;