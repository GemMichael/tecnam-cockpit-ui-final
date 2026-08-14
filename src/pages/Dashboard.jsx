import {
  Activity,
  CheckCircle2,
  Clock3,
  Gauge,
  Play,
  Radio,
} from "lucide-react";

import { Link } from "react-router";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";

import { categoryScores } from "../data/mockData";

function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem("tecnamUser") ||
      '{"name":"Guest Student"}'
  );

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name}`}
        subtitle="Continue your Tecnam P2002JF cockpit familiarization and procedure training."
        rightContent={
          <Link
            to="/checklists"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Play size={17} />
            Start Training
          </Link>
        }
      />

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Gauge}
          label="Overall Score"
          value="92%"
          description="Current training average"
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value="14"
          description="Checklist sessions"
          accent="green"
        />

        <StatCard
          icon={Clock3}
          label="Training Time"
          value="4.8h"
          description="Total walkthrough time"
          accent="purple"
        />

        <StatCard
          icon={Radio}
          label="Comms Score"
          value="89%"
          description="AI module placeholder"
          accent="orange"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        {/* Progress */}
        <GlassCard className="p-6 md:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Training Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your score by training category.
              </p>
            </div>

            <Activity className="text-blue-600" />
          </div>

          <div className="mt-7 space-y-5">
            {categoryScores.map((category) => (
              <div key={category.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {category.name}
                  </span>

                  <span className="font-bold text-blue-600">
                    {category.score}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-500"
                    style={{
                      width: `${category.score}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Quick start */}
        <GlassCard className="overflow-hidden">
          <div
            className="min-h-56 bg-cover bg-center p-7 text-white"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(8,35,63,.92), rgba(37,99,235,.55)), url('/images/tecnam-cockpit.jpg')",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">
              Quick Start
            </p>

            <h2 className="mt-3 max-w-sm text-2xl font-bold">
              Continue Engine Starting
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-blue-100">
              Resume the procedure and continue from
              your latest training point.
            </p>

            <Link
              to="/checklists/engine-starting"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-700"
            >
              <Play size={17} />
              Continue Walkthrough
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* System readiness */}
      <GlassCard className="mt-6 p-6">
        <h2 className="text-xl font-bold">
          Simulator Readiness
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          These values are simulated for now. Python
          will provide the real status later.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            ["Touchscreen", "Connected"],
            ["Cockpit Controls", "Demo Mode"],
            ["Headset / Mic", "Ready"],
            ["AI Guidance", "Frontend Mode"],
          ].map(([name, status]) => (
            <div
              key={name}
              className="rounded-2xl border border-slate-100 bg-white/70 p-4"
            >
              <div className="mb-2 h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-sm font-semibold">
                {name}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {status}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );
}

export default Dashboard;