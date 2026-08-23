import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Headphones,
  Plane,
  Radio,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router";

import GlassCard from "../components/GlassCard";

import {
  getChecklistById,
} from "../data/checklists";

import {
  simulatorBridge,
} from "../services/simulatorBridge";

function ChecklistExecution() {
  const { checklistId } = useParams();

  const checklist = useMemo(
    () => getChecklistById(checklistId),
    [checklistId]
  );

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [completedSteps, setCompletedSteps] =
    useState([]);

  const [aiEnabled, setAiEnabled] =
    useState(true);

  const [aiMessage, setAiMessage] =
    useState(
      "AI guidance is ready. Complete the current step."
    );

  /*
  |--------------------------------------------------------------------------
  | LATER: HARDWARE EVENTS
  |--------------------------------------------------------------------------
  |
  | This is where events from Raspberry Pi/Python will arrive.
  |
  | Example event:
  |
  | {
  |   component: "fuel_pump",
  |   state: "ON",
  |   correct: true
  | }
  |
  */

  useEffect(() => {
    const disconnect =
      simulatorBridge.connectHardwareEvents(
        (hardwareEvent) => {
          console.log(
            "Hardware event:",
            hardwareEvent
          );

          /*
          Example future logic:

          if (
            hardwareEvent.correct &&
            hardwareEvent.stepId ===
              checklist.steps[currentIndex].id
          ) {
            markCurrentComplete();
          }
          */
        }
      );

    return disconnect;
  }, [checklist, currentIndex]);

  if (!checklist) {
    return (
      <GlassCard className="p-10 text-center">
        <h2 className="text-2xl font-bold">
          Checklist not found
        </h2>

        <Link
          to="/checklists"
          className="mt-5 inline-block text-blue-600"
        >
          Return to checklists
        </Link>
      </GlassCard>
    );
  }

  const currentStep =
    checklist.steps[currentIndex];

  const progress =
    Math.round(
      (completedSteps.length /
        checklist.steps.length) *
        100
    );

  const currentCompleted =
    completedSteps.includes(currentStep.id);

  const markCurrentComplete = async () => {
    if (
      !completedSteps.includes(
        currentStep.id
      )
    ) {
      setCompletedSteps((previous) => [
        ...previous,
        currentStep.id,
      ]);
    }

    /*
    |--------------------------------------------------------------------------
    | FRONTEND DEMO
    |--------------------------------------------------------------------------
    |
    | Later REMOVE this simulated command.
    |
    | The real physical switch will send the event
    | FROM Python TO React.
    |
    */

    await simulatorBridge.sendControlCommand({
      stepId: currentStep.id,
      component: currentStep.control,
      simulated: true,
    });

    setAiMessage(
      `Correct. "${currentStep.title}" has been completed.`
    );
  };

  const nextStep = () => {
    if (
      !currentCompleted ||
      currentIndex >=
        checklist.steps.length - 1
    ) {
      return;
    }

    setCurrentIndex(
      (previous) => previous + 1
    );

    setAiMessage(
      "Proceed to the next checklist item."
    );
  };

  const previousStep = () => {
    setCurrentIndex((previous) =>
      Math.max(0, previous - 1)
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Link
            to="/checklists"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Checklists
          </Link>

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
            {checklist.phase}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
            {checklist.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Complete each procedure in the
            correct order.
          </p>
        </div>

        <div className="glass-card flex items-center gap-4 rounded-2xl px-5 py-4">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-40" />
          </div>

          <div>
            <p className="text-sm font-semibold">
              AI Guidance Active
            </p>

            <p className="text-xs text-slate-400">
              Frontend simulation
            </p>
          </div>

          <button
            onClick={() =>
              setAiEnabled(
                (previous) => !previous
              )
            }
            className={`ml-2 h-7 w-12 rounded-full p-1 transition ${
              aiEnabled
                ? "bg-blue-600"
                : "bg-slate-300"
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white transition ${
                aiEnabled
                  ? "translate-x-5"
                  : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Progress */}
      <GlassCard className="mb-6 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Checklist Progress
            </p>

            <p className="mt-1 font-bold">
              Step {currentIndex + 1} of{" "}
              {checklist.steps.length}
            </p>
          </div>

          <p className="text-2xl font-black text-blue-600">
            {progress}%
          </p>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-blue-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          {/* Cockpit display placeholder */}
          <GlassCard className="overflow-hidden">
            <div
              className="relative flex min-h-[360px] items-center justify-center bg-gradient-to-br from-[#08233f] via-[#0c4d84] to-[#47a2e8] p-8"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(8,35,63,.88), rgba(18,111,197,.50)), url('/images/tecnam-cockpit.jpg')",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <div className="text-center text-white">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-xl">
                  <Plane size={38} />
                </div>

                <h2 className="mt-5 text-2xl font-bold">
                  Cockpit Visualization
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-blue-100">
                  Put your Tecnam cockpit image,
                  interactive diagram or future 3D
                  model here.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Steps */}
          <GlassCard className="p-4 md:p-5">
            <div className="space-y-2">
              {checklist.steps.map(
                (step, index) => {
                  const completed =
                    completedSteps.includes(
                      step.id
                    );

                  const current =
                    index === currentIndex;

                  return (
                    <button
                      key={step.id}
                      onClick={() =>
                        setCurrentIndex(index)
                      }
                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                        current
                          ? "border-blue-300 bg-blue-50/80"
                          : "border-transparent hover:bg-white/70"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                          completed
                            ? "bg-emerald-500 text-white"
                            : current
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {completed ? (
                          <Check size={18} />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold">
                          {step.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {step.instruction}
                        </p>
                      </div>

                      {completed && (
                        <span className="text-xs font-bold text-emerald-600">
                          Completed
                        </span>
                      )}

                      {current &&
                        !completed && (
                          <span className="text-xs font-bold text-blue-600">
                            Current
                          </span>
                        )}
                    </button>
                  );
                }
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          <GlassCard className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Current Step
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              {currentStep.title}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              {currentStep.instruction}
            </p>

            <div className="mt-6 rounded-2xl bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                Expected Result
              </p>

              <p className="mt-2 font-semibold text-blue-950">
                {currentStep.expected}
              </p>
            </div>
          </GlassCard>

          {/* Physical control */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <Cpu className="text-blue-600" />

              <div>
                <p className="font-bold">
                  Physical Control
                </p>

                <p className="text-xs text-slate-400">
                  Raspberry Pi connection point
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-5 text-center">
              <p className="text-sm text-slate-500">
                Hardware ID
              </p>

              <p className="mt-1 font-mono font-bold text-blue-700">
                {currentStep.control}
              </p>
            </div>

            {/* DEMO BUTTON
                LATER this will be removed.
                The GPIO/switch will trigger completion. */}
            <button
              onClick={markCurrentComplete}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700"
            >
              <CheckCircle2 size={19} />
              Simulate Correct Control
            </button>

            {currentCompleted && (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                 Switch / action detected
              </div>
            )}
          </GlassCard>

          {/* AI */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="text-violet-600" />

              <div>
                <p className="font-bold">
                  AI Guidance
                </p>

                <p className="text-xs text-slate-400">
                  Python AI will connect here
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-violet-50 p-4">
              <p className="text-sm leading-6 text-violet-950">
                {aiMessage}
              </p>
            </div>

            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-white py-3 text-sm font-semibold text-violet-700">
              <Headphones size={18} />
              Play Instruction
            </button>

            {currentStep.control ===
              "ai_comms" && (
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white">
                <Radio size={18} />
                Start Communication
              </button>
            )}
          </GlassCard>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={previousStep}
              disabled={currentIndex === 0}
              className="rounded-2xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-600 disabled:opacity-40"
            >
              Previous
            </button>

            <button
              onClick={nextStep}
              disabled={
                !currentCompleted ||
                currentIndex ===
                  checklist.steps.length - 1
              }
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChecklistExecution;