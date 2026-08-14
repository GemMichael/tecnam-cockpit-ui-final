import {
  BookOpen,
  Gauge,
  Search,
  SlidersHorizontal,
  ToggleLeft,
} from "lucide-react";

import { useMemo, useState } from "react";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";

const manualItems = [
  {
    title: "Master Switch",
    category: "Electrical",
    icon: ToggleLeft,
    description:
      "Controls primary electrical power for the cockpit systems.",
  },
  {
    title: "Electric Fuel Pump",
    category: "Fuel System",
    icon: ToggleLeft,
    description:
      "Electric fuel pump control used during specified checklist procedures.",
  },
  {
    title: "Fuel Selector Valve",
    category: "Fuel System",
    icon: SlidersHorizontal,
    description:
      "Allows the pilot to select the appropriate fuel tank or OFF position.",
  },
  {
    title: "Throttle",
    category: "Engine",
    icon: SlidersHorizontal,
    description:
      "Controls engine power and RPM.",
  },
  {
    title: "Oil Pressure Gauge",
    category: "Instruments",
    icon: Gauge,
    description:
      "Displays engine oil pressure during operation.",
  },
  {
    title: "Airspeed Indicator",
    category: "Flight Instruments",
    icon: Gauge,
    description:
      "Displays the aircraft's indicated airspeed.",
  },
];

function Manual() {
  const [search, setSearch] =
    useState("");

  const filteredItems = useMemo(() => {
    return manualItems.filter((item) =>
      `${item.title} ${item.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <>
      <PageHeader
        title="Cockpit Manual"
        subtitle="Explore cockpit instruments, switches and controls before performing the walkthrough."
      />

      <GlassCard className="mb-6 p-4">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search instruments or controls..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 outline-none focus:border-blue-500"
          />
        </div>
      </GlassCard>

      {/* Cockpit overview placeholder */}
      <GlassCard className="mb-6 overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_.6fr]">
          <div
            className="flex min-h-80 items-center justify-center bg-gradient-to-br from-blue-900 to-sky-500 bg-cover bg-center p-8"
            style={{
              backgroundImage:
                "linear-gradient(135deg,rgba(8,35,63,.8),rgba(37,99,235,.45)),url('/images/tecnam-cockpit.jpg')",
            }}
          >
            <div className="text-center text-white">
              <BookOpen
                size={46}
                className="mx-auto"
              />

              <h2 className="mt-4 text-2xl font-bold">
                Cockpit Diagram
              </h2>

              <p className="mt-2 text-sm text-blue-100">
                Your labeled cockpit image will be
                placed here later.
              </p>
            </div>
          </div>

          <div className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              How to use
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Learn before interacting
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Select an instrument or control below
              to review its name and purpose. Later,
              clicking a control can highlight its
              position in the cockpit image.
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => {
          const Icon = item.icon;

          return (
            <GlassCard
              key={item.title}
              className="cursor-pointer p-5 transition hover:-translate-y-1 hover:border-blue-200"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <Icon size={21} />
                </div>

                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                    {item.category}
                  </span>

                  <h3 className="mt-1 font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </>
  );
}

export default Manual;