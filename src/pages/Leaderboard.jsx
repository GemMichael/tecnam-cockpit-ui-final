import {
  Medal,
  Trophy,
  User,
} from "lucide-react";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";

import {
  leaderboardData,
} from "../data/mockData";

function Leaderboard() {
  return (
    <>
      <PageHeader
        title="Leaderboard"
        subtitle="Compare training performance and encourage consistent checklist practice."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {leaderboardData
          .slice(0, 3)
          .map((student) => (
            <GlassCard
              key={student.rank}
              className="p-6 text-center"
            >
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                  student.rank === 1
                    ? "bg-amber-100 text-amber-600"
                    : student.rank === 2
                    ? "bg-slate-200 text-slate-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                <Medal size={30} />
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                Rank #{student.rank}
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {student.name}
              </h2>

              <p className="mt-3 text-4xl font-black text-blue-600">
                {student.score}%
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {student.sessions} sessions
              </p>
            </GlassCard>
          ))}
      </div>

      <GlassCard className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 p-6">
          <Trophy className="text-blue-600" />

          <h2 className="font-bold">
            Student Rankings
          </h2>
        </div>

        {leaderboardData.map((student) => (
          <div
            key={student.rank}
            className="flex items-center gap-4 border-b border-slate-100 px-6 py-5 last:border-0"
          >
            <div className="w-8 text-center text-lg font-black text-slate-400">
              {student.rank}
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <User size={19} />
            </div>

            <div className="flex-1">
              <p className="font-semibold">
                {student.name}
              </p>

              <p className="text-xs text-slate-400">
                {student.sessions} completed sessions
              </p>
            </div>

            <strong className="text-xl text-blue-600">
              {student.score}%
            </strong>
          </div>
        ))}
      </GlassCard>
    </>
  );
}

export default Leaderboard;