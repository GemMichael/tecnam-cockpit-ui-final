import {
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Save,
} from "lucide-react";

import { useTrainingAssessment } from "../hooks/useTrainingAssessment";

import {
  finishTrainingSession,
  startNewTrainingSession,
  syncTrainingSessionNow,
} from "../services/trainingAssessment";

function Metric({ label, value, max }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-slate-900">
        {value}
        {typeof max === "number" && (
          <span className="text-xs font-semibold text-slate-400">
            {" "}/ {max}
          </span>
        )}
      </p>
    </div>
  );
}

function TrainingScoreCard() {
  const { session, summary } = useTrainingAssessment();

  if (!session) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
          Training Assessment
        </p>

        <h3 className="mt-2 font-bold text-slate-900">
          Waiting for training activity
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          A grading session starts automatically when the first
          checklist control or communication attempt is recorded.
        </p>

        <button
          type="button"
          onClick={() => startNewTrainingSession()}
          className="mt-4 rounded-xl bg-[#08233f] px-4 py-2.5 text-xs font-bold text-white"
        >
          Start New Session
        </button>
      </div>
    );
  }

  const safetyClear = summary.safetyStatus === "CLEAR";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="bg-[#08233f] px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
              Live Training Grade
            </p>

            <p className="mt-1 text-2xl font-black">
              {summary.overall} / 100
            </p>

            <p className="text-xs text-blue-100">
              {summary.rating}
            </p>
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
              safetyClear
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-amber-500/20 text-amber-200"
            }`}
          >
            {safetyClear ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}

            {safetyClear ? "Safety Clear" : "Review Required"}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <Metric
            label="Checklist"
            value={summary.checklist.total}
            max={summary.checklist.max}
          />

          <Metric
            label="Communications"
            value={summary.communications.total}
            max={summary.communications.max}
          />

          <Metric
            label="Critical Errors"
            value={summary.criticalErrors}
          />

          <Metric
            label="Clarifications"
            value={summary.communications.clarificationCount}
          />
        </div>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">
          Checklist completion: {summary.checklist.completion.completed} / {summary.checklist.completion.totalSteps}
          <br />
          Communication stages: {summary.communications.completedStages} / {summary.communications.totalStages}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => syncTrainingSessionNow()}
            className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-2 py-2 text-[10px] font-bold text-slate-600"
          >
            <Save size={13} />
            Save
          </button>

          <button
            type="button"
            onClick={() => finishTrainingSession()}
            disabled={session.status === "completed"}
            className="rounded-xl bg-emerald-600 px-2 py-2 text-[10px] font-bold text-white disabled:opacity-50"
          >
            Finalize
          </button>

          <button
            type="button"
            onClick={() => startNewTrainingSession()}
            className="flex items-center justify-center gap-1 rounded-xl bg-[#08233f] px-2 py-2 text-[10px] font-bold text-white"
          >
            <RotateCcw size={13} />
            New
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrainingScoreCard;