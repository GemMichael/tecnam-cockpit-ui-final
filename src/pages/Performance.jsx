import {
  Activity,
  Award,
  CheckCircle2,
  Gauge,
} from "lucide-react";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";

import {
  categoryScores,
} from "../data/mockData";

function Performance() {
  const recentScores = [
    74, 81, 85, 88, 91, 92, 94,
  ];

  return (
    <>
      <PageHeader
        title="Performance"
        subtitle="Review your training accuracy, progress and category scores."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Gauge}
          label="Overall Score"
          value="92%"
        />

        <StatCard
          icon={CheckCircle2}
          label="Procedure Accuracy"
          value="94%"
          accent="green"
        />

        <StatCard
          icon={Award}
          label="Current Grade"
          value="A"
          accent="purple"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" />

            <div>
              <h2 className="font-bold">
                Category Performance
              </h2>
              <p className="text-sm text-slate-400">
                Current average
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {categoryScores.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{item.name}</span>
                  <strong>{item.score}%</strong>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${item.score}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-bold">
            Recent Training Trend
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Last seven sessions
          </p>

          <div className="mt-8 flex h-64 items-end gap-3">
            {recentScores.map(
              (score, index) => (
                <div
                  key={index}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-xs font-bold text-blue-600">
                    {score}
                  </span>

                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-sky-300"
                    style={{
                      height: `${score * 2}px`,
                    }}
                  />

                  <span className="text-[10px] text-slate-400">
                    S{index + 1}
                  </span>
                </div>
              )
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 p-6">
        <h2 className="text-lg font-bold">
          Areas for Improvement
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Run-Up Procedure",
              text: "Review ignition and engine parameter checks.",
            },
            {
              title: "Radio Readback",
              text: "Practice complete ATC readback communication.",
            },
            {
              title: "Shutdown Sequence",
              text: "Improve checklist sequence accuracy.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5"
            >
              <h3 className="font-bold">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );
}

export default Performance;