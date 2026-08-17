import {
    Check,
    Circle,
    ClipboardList,
} from "lucide-react";

import GlassCard from "./GlassCard";
import { useSimulator } from "../context/SimulatorContext";
import CommsTrainingPanel from "./CommsTrainingPanel";

function ChecklistPanel() {
    const {
        currentChecklist,
        currentStep,
        currentStepIndex,
        completedStepIds,
        progressPercentage,
        markManualStepComplete,
        markCommsStepComplete,
        isChecklistComplete,
        feedback,
        sequenceProgress,
    } = useSimulator();

    return (
        <GlassCard className="p-6">
            <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <ClipboardList size={20} />
                </div>

                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                        Active Checklist
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">
                        {currentChecklist.title}
                    </h2>
                </div>
            </div>

            <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-500">
                        Progress
                    </span>

                    <span className="font-bold text-blue-600">
                        {progressPercentage}%
                    </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-blue-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all"
                        style={{
                            width: `${progressPercentage}%`,
                        }}
                    />
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Current Step
                </p>

                {isChecklistComplete ? (
                    <div className="mt-3">
                        <p className="text-lg font-bold text-emerald-700">
                            Checklist Complete
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            You have completed all steps in this checklist.
                        </p>
                    </div>
                ) : (
                    <>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">
                            {currentStepIndex + 1}.{" "}
                            {currentStep?.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {currentStep?.instruction}
                        </p>

                        {currentStep?.type === "control" && (
                            <p className="mt-3 text-xs font-semibold text-slate-500">
                                Expected:{" "}
                                <span className="text-blue-700">
                                    {currentStep.expectedLabel}
                                </span>
                            </p>
                        )}

                        {currentStep?.type === "sequence" && (
                            <div className="mt-3">
                                <p className="text-xs font-semibold text-slate-500">
                                    Expected sequence:{" "}
                                    <span className="text-blue-700">
                                        {currentStep.expectedLabel}
                                    </span>
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Current sequence progress:{" "}
                                    {sequenceProgress}
                                </p>
                            </div>
                        )}

                        {(currentStep?.type === "manual" ||
                            currentStep?.type === "future") && (
                                <button
                                    onClick={markManualStepComplete}
                                    className="mt-4 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    {currentStep.actionLabel}
                                </button>
                            )}
                        {currentStep?.type === "comms" && (
                            <CommsTrainingPanel
                                scenarioId={
                                    currentStep.scenario
                                }
                                onComplete={
                                    markCommsStepComplete
                                }
                            />
                        )}

                        {currentStep?.note && (
                            <p className="mt-3 text-xs leading-5 text-slate-400">
                                Note: {currentStep.note}
                            </p>
                        )}
                    </>
                )}
            </div>

            <div className="mt-5 rounded-2xl bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Feedback
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feedback}
                </p>
            </div>

            <div className="mt-6 space-y-3">
                {currentChecklist.steps.map(
                    (step, index) => {
                        const completed =
                            completedStepIds.includes(
                                step.id
                            );

                        const current =
                            index === currentStepIndex &&
                            !isChecklistComplete;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-start gap-3 rounded-2xl border p-3 ${current
                                    ? "border-blue-300 bg-blue-50/80"
                                    : "border-slate-100 bg-white/70"
                                    }`}
                            >
                                <div
                                    className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${completed
                                        ? "bg-emerald-500 text-white"
                                        : current
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-400"
                                        }`}
                                >
                                    {completed ? (
                                        <Check size={16} />
                                    ) : current ? (
                                        index + 1
                                    ) : (
                                        <Circle size={14} />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {step.title}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {step.instruction}
                                    </p>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </GlassCard>
    );
}

export default ChecklistPanel;