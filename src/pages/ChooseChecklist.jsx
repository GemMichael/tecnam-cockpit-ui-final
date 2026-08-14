import {
  ChevronRight,
  Clock3,
  Search,
} from "lucide-react";

import { useMemo, useState } from "react";
import { Link } from "react-router";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";

import { checklists } from "../data/checklists";

function ChooseChecklist() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return checklists.filter((checklist) =>
      `${checklist.title} ${checklist.phase}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <>
      <PageHeader
        title="Choose Checklist"
        subtitle="Select a training procedure and complete each step in sequence."
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
            placeholder="Search checklist..."
            className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </GlassCard>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((checklist, index) => (
          <GlassCard
            key={checklist.id}
            className="group overflow-hidden transition duration-300 hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                  {checklist.phase}
                </span>
              </div>

              <h2 className="mt-6 text-xl font-bold">
                {checklist.title}
              </h2>

              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                {checklist.description}
              </p>

              <div className="mt-5 flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock3 size={15} />
                  {checklist.duration}
                </div>

                <span>
                  {checklist.steps.length} steps
                </span>
              </div>

              <Link
                to={`/checklists/${checklist.id}`}
                className="mt-6 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition group-hover:bg-blue-600"
              >
                Start Checklist
                <ChevronRight size={18} />
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>
    </>
  );
}

export default ChooseChecklist;