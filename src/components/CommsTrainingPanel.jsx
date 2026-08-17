import {
  Check,
  CheckCircle2,
  Mic,
  Radio,
  RotateCcw,
  Send,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCommsScenario,
} from "../data/commsScenarios";


function CommsTrainingPanel({
  scenarioId,
  onComplete,
}) {

  /* ==========================================================
     LOAD SCENARIO
     ========================================================== */

  const scenario =
    useMemo(
      () =>
        getCommsScenario(
          scenarioId
        ),
      [scenarioId]
    );


  /* ==========================================================
     STATE
     ========================================================== */

  const [
    stageIndex,
    setStageIndex,
  ] = useState(0);

  const [
    transcript,
    setTranscript,
  ] = useState("");

  const [
    result,
    setResult,
  ] = useState(null);

  const [
    lastAtcResponse,
    setLastAtcResponse,
  ] = useState(null);

  const [
    complete,
    setComplete,
  ] = useState(false);


  /* ==========================================================
     RESET WHEN SCENARIO CHANGES
     ========================================================== */

  useEffect(() => {

    setStageIndex(0);

    setTranscript("");

    setResult(null);

    setLastAtcResponse(
      null
    );

    setComplete(false);

  }, [scenarioId]);


  /* ==========================================================
     INVALID SCENARIO
     ========================================================== */

  if (!scenario) {
    return (
      <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">

        <p className="text-sm font-bold text-red-700">
          Communication scenario not found.
        </p>

        <p className="mt-1 text-xs text-red-500">
          Scenario: {scenarioId}
        </p>

      </div>
    );
  }


  const stages =
    scenario.stages;

  const currentStage =
    stages[
      stageIndex
    ];


  /* ==========================================================
     EVALUATE TRANSMISSION
     ========================================================== */

  function evaluateTransmission() {

    if (
      !transcript.trim()
    ) {
      return;
    }


    const checks =
      currentStage.evaluate(
        transcript
      );


    const correct =
      checks.every(
        (check) =>
          check.correct
      );


    setResult({
      checks,
      correct,
    });


    if (!correct) {
      setLastAtcResponse(
        null
      );

      return;
    }


    /* ========================================================
       FINAL STAGE
       ======================================================== */

    if (
      stageIndex ===
      stages.length - 1
    ) {

      setComplete(true);

      return;
    }


    /* ========================================================
       DISPLAY ATC RESPONSE
       ======================================================== */

    setLastAtcResponse(
      currentStage.atcResponse
    );
  }


  /* ==========================================================
     CONTINUE
     ========================================================== */

  function continueCommunication() {

    setStageIndex(
      (previous) =>
        previous + 1
    );

    setTranscript("");

    setResult(null);

    setLastAtcResponse(
      null
    );
  }


  /* ==========================================================
     RESET
     ========================================================== */

  function resetCommunication() {

    setStageIndex(0);

    setTranscript("");

    setResult(null);

    setLastAtcResponse(
      null
    );

    setComplete(false);
  }


  /* ==========================================================
     UI
     ========================================================== */

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="bg-gradient-to-r from-[#08233f] to-[#103d68] px-5 py-4 text-white">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-white/10 p-2.5">
              <Radio
                size={20}
              />
            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-200">
                Communications
              </p>

              <h3 className="text-base font-bold">
                {scenario.title}
              </h3>

            </div>

          </div>


          <button
            onClick={
              resetCommunication
            }
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            title="Restart communication"
          >
            <RotateCcw
              size={16}
            />
          </button>

        </div>

      </div>


      {/* ======================================================
          PROGRESS
          ====================================================== */}

      <div className="border-b border-slate-100 px-5 py-4">

        <div className="flex gap-2">

          {stages.map(
            (stage, index) => {

              const done =
                index <
                stageIndex;

              const active =
                index ===
                  stageIndex &&
                !complete;


              return (
                <div
                  key={
                    stage.id
                  }
                  className="flex-1"
                >

                  <div
                    className={`
                      h-1.5
                      rounded-full

                      ${
                        done ||
                        complete
                          ? "bg-emerald-500"
                          : active
                          ? "bg-blue-600"
                          : "bg-slate-200"
                      }
                    `}
                  />


                  <p
                    className={`
                      mt-2
                      hidden
                      text-[9px]
                      font-semibold
                      sm:block

                      ${
                        active
                          ? "text-blue-600"
                          : done ||
                            complete
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }
                    `}
                  >
                    {stage.title}
                  </p>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* ======================================================
          CONTENT
          ====================================================== */}

      <div className="p-5">

        {!complete ? (
          <>

            {/* =================================================
                CURRENT STAGE
                ================================================= */}

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Transmission{" "}
                {stageIndex + 1}
                {" "}
                of{" "}
                {stages.length}
              </p>


              <h4 className="mt-2 text-lg font-bold text-slate-900">
                {
                  currentStage.title
                }
              </h4>


              <p className="mt-2 text-sm leading-6 text-slate-500">
                {
                  currentStage.prompt
                }
              </p>

            </div>


            {/* =================================================
                TEXT INPUT
                ================================================= */}

            <div className="mt-5">

              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Student Transmission
              </label>


              <textarea
                value={
                  transcript
                }
                onChange={(
                  event
                ) =>
                  setTranscript(
                    event.target
                      .value
                  )
                }
                rows={4}
                placeholder="Enter the student's radio transmission..."
                className="
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-slate-800
                  outline-none
                  transition

                  focus:border-blue-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-100
                "
              />

            </div>


            {/* =================================================
                ACTIONS
                ================================================= */}

            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">

              {/* MICROPHONE DISABLED FOR NOW */}

              <button
                disabled
                className="
                  flex
                  cursor-not-allowed
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-300
                  bg-slate-50
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-400
                "
              >
                <Mic
                  size={17}
                />

                Speech Later
              </button>


              <button
                onClick={
                  evaluateTransmission
                }
                disabled={
                  !transcript.trim()
                }
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-blue-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition

                  hover:bg-blue-700

                  disabled:cursor-not-allowed
                  disabled:bg-slate-300
                "
              >
                <Send
                  size={16}
                />

                Check
              </button>

            </div>


            {/* =================================================
                RESULTS
                ================================================= */}

            {result && (
              <div
                className={`
                  mt-5
                  rounded-2xl
                  border
                  p-4

                  ${
                    result.correct
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }
                `}
              >

                <div className="flex items-center gap-2">

                  {result.correct ? (
                    <CheckCircle2
                      size={19}
                      className="text-emerald-600"
                    />
                  ) : (
                    <X
                      size={19}
                      className="text-red-500"
                    />
                  )}


                  <p
                    className={`
                      text-sm
                      font-bold

                      ${
                        result.correct
                          ? "text-emerald-700"
                          : "text-red-700"
                      }
                    `}
                  >
                    {result.correct
                      ? "Transmission Correct"
                      : "Transmission Incomplete"}
                  </p>

                </div>


                <div className="mt-4 space-y-2">

                  {result.checks.map(
                    (check) => (

                      <div
                        key={
                          check.label
                        }
                        className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2"
                      >

                        <span className="text-xs font-medium text-slate-600">
                          {
                            check.label
                          }
                        </span>


                        {check.correct ? (
                          <Check
                            size={17}
                            className="text-emerald-600"
                          />
                        ) : (
                          <X
                            size={17}
                            className="text-red-500"
                          />
                        )}

                      </div>

                    )
                  )}

                </div>

              </div>
            )}


            {/* =================================================
                ATC
                ================================================= */}

            {result?.correct &&
              lastAtcResponse && (

                <div className="mt-5 overflow-hidden rounded-2xl border border-blue-200 bg-[#07192b]">

                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-blue-200">

                    <Radio
                      size={16}
                    />

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                      Binalonan Radio
                    </span>

                  </div>


                  <div className="p-4">

                    <p className="text-sm leading-6 text-white">
                      {
                        lastAtcResponse
                      }
                    </p>

                  </div>

                </div>

              )}


            {/* =================================================
                CONTINUE
                ================================================= */}

            {result?.correct &&
              stageIndex <
                stages.length -
                  1 && (

                <button
                  onClick={
                    continueCommunication
                  }
                  className="mt-4 w-full rounded-2xl bg-[#08233f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#103d68]"
                >
                  Continue Communication
                </button>

              )}

          </>
        ) : (

          /* ===================================================
             COMPLETE
             =================================================== */

          <div className="py-5 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

              <CheckCircle2
                size={28}
              />

            </div>


            <h4 className="mt-4 text-xl font-bold text-slate-900">
              Communication Complete
            </h4>


            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              The communication procedure and
              required readback have been
              completed correctly.
            </p>


            <button
              onClick={
                onComplete
              }
              className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Complete Checklist Step
            </button>

          </div>

        )}

      </div>

    </div>
  );
}

export default CommsTrainingPanel;