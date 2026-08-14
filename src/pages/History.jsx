import {
  CalendarDays,
  Clock3,
  History as HistoryIcon,
} from "lucide-react";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";

import {
  historyData,
} from "../data/mockData";

function HistoryPage() {
  return (
    <>
      <PageHeader
        title="Training History"
        subtitle="Review your previously completed cockpit training sessions."
      />

      <GlassCard className="overflow-hidden">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <HistoryIcon className="text-blue-600" />

            <div>
              <h2 className="font-bold">
                Recent Sessions
              </h2>

              <p className="text-sm text-slate-400">
                Frontend demonstration data
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-blue-50/70 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">
                  Checklist
                </th>
                <th className="px-6 py-4">
                  Date
                </th>
                <th className="px-6 py-4">
                  Time
                </th>
                <th className="px-6 py-4">
                  Duration
                </th>
                <th className="px-6 py-4">
                  Score
                </th>
                <th className="px-6 py-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {historyData.map((session) => (
                <tr
                  key={session.id}
                  className="border-t border-slate-100 transition hover:bg-blue-50/30"
                >
                  <td className="px-6 py-5 font-semibold">
                    {session.checklist}
                  </td>

                  <td className="px-6 py-5 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={15} />
                      {session.date}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm text-slate-500">
                    {session.time}
                  </td>

                  <td className="px-6 py-5 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <Clock3 size={15} />
                      {session.duration}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <strong className="text-blue-600">
                      {session.score}%
                    </strong>
                  </td>

                  <td className="px-6 py-5">
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <p className="mt-4 text-xs text-slate-400">
        Later, Python + SQLite will provide real
        training history instead of this mock data.
      </p>
    </>
  );
}

export default HistoryPage;