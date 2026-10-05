import {

  CheckCircle2,

  Plane,

  RefreshCcw,

  RotateCcw,

  Settings2,

} from "lucide-react";



import {
  useEffect,
  useMemo,
} from "react";



import CommsTrainingPanel from "../components/CommsTrainingPanel";

import SimulatedInstrumentPanel from "../components/SimulatedInstrumentPanel";



import { controlSections } from "../data/controlDefinitions";

import { checklists } from "../data/checklists";



import { useSimulator } from "../context/SimulatorContext";

import {
  simulatorBridge,
} from "../services/simulatorBridge";





/* ============================================================

   PHYSICAL CONTROLS



   These stay in SimulatorContext / checklist logic,

   but are never rendered as touchscreen buttons. Intercom, Radio, and Transponder are also physical.

   ============================================================ */



const HARDWARE_CONTROL_IDS = new Set([

  "master_switch",

  "generator",

  "fuel_pump",

  "friction_lock",

  "flaps",

  "chronometer",

  "avionics_master",

  "strobe_light",

  "landing_light",

  "nav_light",

  "intercom",

  "radio",

  "transponder",

]);





/* ============================================================

   HELPERS

   ============================================================ */



function getStepControlId(step) {

  if (!step) {

    return null;

  }



  if (

    step.type === "control" ||

    step.type === "sequence"

  ) {

    return step.controlId || null;

  }



  if (step.type === "timed") {

    return step.requiredControlId || null;

  }



  return null;

}





const GUIDANCE_LED_CONTROL_IDS =
  new Set([
    "ignition",
    "master_switch",
    "generator",
    "fuel_pump",
    "friction_lock",
    "throttle",
    "flaps",
    "avionics_master",
    "strobe_light",
    "landing_light",
    "nav_light",
    "chronometer",
    "choke",
    "carb_heat",
  ]);


function getGuidanceControlId(step) {

  if (!step) {

    return null;

  }


  // Manual Engine Start Choke step.
  if (step.id === "es-5") {

    return "choke";

  }


  // Manual Run-Up Carburetor Heat Check.
  if (step.id === "ru-11") {

    return "carb_heat";

  }


  const controlId =
    getStepControlId(step);


  if (
    controlId &&
    GUIDANCE_LED_CONTROL_IDS.has(
      controlId
    )
  ) {

    return controlId;

  }


  return null;

}





function getChecklistControlIds(checklist) {

  if (!checklist?.steps) {

    return [];

  }



  const ids = [];



  checklist.steps.forEach((step) => {

    const controlId =

      getStepControlId(step);



    if (

      controlId &&

      !ids.includes(controlId)

    ) {

      ids.push(controlId);

    }

  });



  return ids;

}





/*

  LANDSCAPE GRID



  The touchscreen controls are deliberately packed into a fixed

  number of rows so the control area itself never needs vertical

  scrolling.



  Examples:

  1-4 controls   -> 4 columns / 1 row

  5-8 controls   -> 4 columns / 2 rows

  9-10 controls  -> 5 columns / 2 rows

  11-12 controls -> 4 columns / 3 rows

  13-15 controls -> 5 columns / 3 rows

*/

function getControlGridLayout(count) {

  if (count <= 4) {

    return {

      columns: Math.max(count, 1),

      rows: 1,

      dense: false,

    };

  }



  if (count <= 8) {

    return {

      columns: 4,

      rows: 2,

      dense: false,

    };

  }



  if (count <= 10) {

    return {

      columns: 5,

      rows: 2,

      dense: true,

    };

  }



  if (count <= 12) {

    return {

      columns: 4,

      rows: 3,

      dense: true,

    };

  }



  if (count <= 15) {

    return {

      columns: 5,

      rows: 3,

      dense: true,

    };

  }



  return {

    columns: 5,

    rows: Math.ceil(count / 5),

    dense: true,

  };

}





/* ============================================================

   TOUCHSCREEN CONTROL CARD

   ============================================================ */



function TouchControl({

  control,

  value,

  onChange,

  isCurrent,

  dense,

}) {

  const options =

    control?.options || [];



  const isSingleOption =

    options.length === 1;



  const singleOption =

    isSingleOption

      ? options[0]

      : null;



  const singleOptionActive =

    Boolean(

      singleOption &&

      value === singleOption.value

    );



  const displayedValue =

    isSingleOption

      ? singleOptionActive

        ? singleOption.label

        : "OFF"

      : value ?? "—";



  function handleOptionPress(

    option

  ) {

    /*

      Single-selector controls behave like a push-button toggle.



      Example:

      Circuit Breakers

        first press  -> ALL_IN

        second press -> OFF



      We keep this inside the UI layer so controlDefinitions.js

      and the checklist expected value (ALL_IN) do not need to

      change.

    */

    if (isSingleOption) {

      const nextValue =

        value === option.value

          ? "OFF"

          : option.value;



      onChange(

        control.id,

        nextValue,

        "ui"

      );



      return;

    }



    onChange(

      control.id,

      option.value,

      "ui"

    );

  }



  return (

    <div

      className={`

        flex

        h-full

        min-h-0

        flex-col

        overflow-hidden

        rounded-xl

        border

        transition



        ${

          dense

            ? "p-1.5"

            : "p-2"

        }



        ${

          isCurrent

            ? `

              border-blue-400

              bg-blue-50

              shadow-[0_0_0_2px_rgba(59,130,246,.10)]

            `

            : `

              border-slate-200

              bg-white

              shadow-sm

            `

        }

      `}

    >

      <div

        className={`

          flex

          shrink-0

          items-center

          justify-between

          gap-1.5



          ${

            dense

              ? "mb-1"

              : "mb-1.5"

          }

        `}

      >

        <p

          className={`

            min-w-0

            flex-1

            truncate

            font-black

            uppercase

            tracking-[0.10em]

            text-slate-700



            ${

              dense

                ? "text-[7px]"

                : "text-[8px]"

            }

          `}

        >

          {control.label}

        </p>



        <span

          className={`

            shrink-0

            rounded

            px-1.5

            py-0.5

            font-black



            ${

              isSingleOption &&

              singleOptionActive

                ? "bg-emerald-100 text-emerald-700"

                : "bg-slate-100 text-slate-500"

            }



            ${

              dense

                ? "text-[7px]"

                : "text-[8px]"

            }

          `}

        >

          {displayedValue}

        </span>

      </div>



      <div

        className={`

          grid

          min-h-0

          flex-1

          gap-1



          ${

            isSingleOption

              ? "grid-cols-1"

              : options.length >= 3

                ? "grid-cols-3"

                : "grid-cols-2"

          }

        `}

      >

        {options.map((option) => {

          const active =

            value === option.value;



          return (

            <button

              key={option.value}

              type="button"

              onClick={() =>

                handleOptionPress(

                  option

                )

              }

              aria-pressed={

                isSingleOption

                  ? active

                  : undefined

              }

              className={`

                h-full

                min-h-0

                min-w-0

                rounded-lg

                border

                px-1

                font-bold

                uppercase

                leading-tight

                tracking-wide

                transition

                active:scale-[0.98]



                ${

                  dense

                    ? "py-1 text-[8px]"

                    : "py-1.5 text-[9px]"

                }



                ${

                  active

                    ? `

                      border-emerald-400

                      bg-emerald-600

                      text-white

                      shadow-sm

                    `

                    : `

                      border-slate-200

                      bg-slate-50

                      text-slate-600

                      hover:border-blue-300

                      hover:bg-blue-50

                    `

                }

              `}

            >

              <span className="block truncate">

                {isSingleOption

                  ? `${option.label} · ${

                      active

                        ? "ON"

                        : "OFF"

                    }`

                  : option.label}

              </span>

            </button>

          );

        })}

      </div>

    </div>

  );

}





/* ============================================================

   TRAINING HEADER CARD

   ============================================================ */



function TrainingHeaderCard({

  activeChecklistId,

  selectChecklist,

  progressPercentage,

  resetChecklistProgress,

  resetAllControls,

  hardResetAll,

}) {

  return (

    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex shrink-0 items-center gap-2.5 px-3 py-2.5">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#08233f] text-white">

          <Plane size={17} />

        </div>



        <div className="min-w-0 flex-1">

          <p className="text-[7px] font-black uppercase tracking-[0.18em] text-blue-600">

            TECNAM P2002JF

          </p>



          <p className="truncate text-sm font-black text-slate-900">

            Cockpit Training

          </p>

        </div>



        <button

          type="button"

          title="Reset checklist"

          aria-label="Reset checklist"

          onClick={

            resetChecklistProgress

          }

          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 active:bg-slate-100"

        >

          <RotateCcw size={14} />

        </button>



        <button

          type="button"

          title="Reset controls"

          aria-label="Reset controls"

          onClick={

            resetAllControls

          }

          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 active:bg-slate-100"

        >

          <RefreshCcw size={14} />

        </button>



        <button

          type="button"

          title="Full reset"

          aria-label="Full reset"

          onClick={

            hardResetAll

          }

          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white active:bg-slate-700"

        >

          <Settings2 size={14} />

        </button>

      </div>



      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_62px] items-center gap-2.5 border-t border-slate-100 bg-slate-50 px-3 py-2">

        <div className="min-w-0">

          <label className="mb-1 block text-[7px] font-black uppercase tracking-[0.16em] text-slate-400">

            Training Procedure

          </label>



          <select

            value={

              activeChecklistId

            }

            onChange={(event) =>

              selectChecklist(

                event.target.value

              )

            }

            className="

              h-[38px]

              w-full

              rounded-xl

              border

              border-slate-200

              bg-white

              px-3

              text-xs

              font-bold

              text-slate-800

              outline-none

              focus:border-blue-500

            "

          >

            {checklists.map(

              (checklist) => (

                <option

                  key={

                    checklist.id

                  }

                  value={

                    checklist.id

                  }

                >

                  {

                    checklist.title

                  }

                </option>

              )

            )}

          </select>

        </div>



        <div className="text-right">

          <p className="text-[7px] font-black uppercase tracking-wider text-slate-400">

            Progress

          </p>



          <p className="mt-0.5 text-2xl font-black text-slate-900">

            {progressPercentage}%

          </p>

        </div>

      </div>

    </div>

  );

}





/* ============================================================

   CURRENT STEP CARD

   ============================================================ */



function CurrentStepCard({

  currentStep,

  currentStepIndex,

  totalSteps,

  feedback,

  isChecklistComplete,

  isHardwareStep,

  markManualStepComplete,

}) {

  if (isChecklistComplete) {

    return (

      <div className="flex h-full items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">

            <CheckCircle2 size={18} />

          </div>



          <div>

            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">

              Checklist Complete

            </p>



            <p className="mt-0.5 text-[10px] font-semibold text-emerald-800">

              Select another training procedure whenever you are ready.

            </p>

          </div>

        </div>

      </div>

    );

  }



  if (!currentStep) {

    return null;

  }



  const expected =

    currentStep.expectedLabel ||

    currentStep.requiredLabel ||

    null;



  const manualStep =

    currentStep.type === "manual" ||

    currentStep.type === "future";



  return (

    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-1.5">

        <div>

          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-600">

            Current Step

          </p>



          <p className="text-[9px] font-bold text-slate-500">

            Step {currentStepIndex + 1} of {totalSteps}

          </p>

        </div>



        <p className="max-w-[35%] truncate text-right text-[8px] font-black uppercase tracking-wide text-slate-400">

          {currentStep.type}

        </p>

      </div>



      <div className="touch-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2">

        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0 flex-1">

            <h2 className="text-base font-black leading-tight text-slate-900">

              {currentStep.title}

            </h2>



            <p className="mt-1 text-[10px] leading-4 text-slate-600">

              {currentStep.instruction}

            </p>



            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">

              {expected && (

                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[7px] font-black uppercase tracking-wide text-slate-600">

                  Required: {expected}

                </span>

              )}



              {isHardwareStep && (

                <span className="rounded-lg bg-amber-100 px-2 py-1 text-[7px] font-black uppercase tracking-wide text-amber-700">

                  Use physical cockpit control

                </span>

              )}

            </div>

          </div>



          {manualStep && (

            <button

              type="button"

              onClick={

                markManualStepComplete

              }

              className="

                min-h-[38px]

                shrink-0

                rounded-lg

                bg-blue-600

                px-3

                text-[9px]

                font-black

                text-white

                shadow-sm

                active:scale-[0.98]

              "

            >

              {currentStep.actionLabel ||

                "Confirm"}

            </button>

          )}

        </div>



        <div className="mt-2 rounded-lg bg-slate-900 px-2.5 py-1.5">

          <p className="text-[7px] font-black uppercase tracking-[0.15em] text-slate-500">

            Feedback

          </p>



          <p className="mt-0.5 text-[8px] font-semibold leading-3 text-white">

            {feedback}

          </p>

        </div>

      </div>

    </div>

  );

}





/* ============================================================

   MAIN PAGE

   ============================================================ */



function CockpitControlsPage() {

  const {

    controls,

    setControl,



    activeChecklistId,

    currentChecklist,

    selectChecklist,



    currentStepIndex,

    currentStep,

    progressPercentage,

    isChecklistComplete,



    markManualStepComplete,

    markCommsStepComplete,



    feedback,



    resetChecklistProgress,

    resetAllControls,

    hardResetAll,

  } = useSimulator();





  /* ==========================================================

     AUTOMATIC PHYSICAL GUIDANCE LED

     ========================================================== */

  useEffect(() => {

    const guidanceControlId =
      isChecklistComplete
        ? null
        : getGuidanceControlId(
            currentStep
          );


    console.log(
      "Physical guidance LED:",
      currentStep?.id,
      "->",
      guidanceControlId
    );


    const disconnect =
      simulatorBridge.connectHardwareEvents(
        null,
        guidanceControlId
      );


    return disconnect;

  }, [
    currentStep,
    isChecklistComplete,
  ]);





  /* ==========================================================

     CONTROL LOOKUP

     ========================================================== */



  const allControls =

    useMemo(

      () =>

        controlSections.flatMap(

          (section) =>

            section.controls ||

            []

        ),

      []

    );





  const controlById =

    useMemo(() => {

      const map =

        new Map();



      allControls.forEach(

        (control) => {

          map.set(

            control.id,

            control

          );

        }

      );



      return map;

    }, [allControls]);





  /* ==========================================================

     CURRENT CHECKLIST CONTROLS

     ========================================================== */



  const checklistControlIds =

    useMemo(

      () =>

        getChecklistControlIds(

          currentChecklist

        ),

      [currentChecklist]

    );





  /*

    IMPORTANT:

    Hardware controls are filtered out completely.

  */

  const touchscreenControls =

    useMemo(

      () =>

        checklistControlIds

          .filter(

            (id) =>

              !HARDWARE_CONTROL_IDS.has(

                id

              )

          )

          .map((id) =>

            controlById.get(id)

          )

          .filter(Boolean),

      [

        checklistControlIds,

        controlById,

      ]

    );





  const currentStepControlId =

    getStepControlId(

      currentStep

    );





  const isHardwareStep =

    Boolean(

      currentStepControlId &&

      HARDWARE_CONTROL_IDS.has(

        currentStepControlId

      )

    );





  const totalSteps =

    currentChecklist?.steps

      ?.length || 0;





  const specialWorkspace =

    currentStep?.type ===

      "comms" ||

    currentStep?.type ===

      "instrument" ||

    currentStep?.type ===

      "timed";





  /* ==========================================================

     FIXED LANDSCAPE GRID



     This is what removes the vertical scrollbar from the

     touchscreen-control area.

     ========================================================== */



  const gridLayout =

    useMemo(

      () =>

        getControlGridLayout(

          touchscreenControls.length

        ),

      [touchscreenControls.length]

    );





  /* ==========================================================

     UI

     ========================================================== */



  return (

    <div

      className="

        flex

        h-[calc(100dvh-92px)]

        min-h-0

        flex-col

        gap-2

        overflow-hidden

      "

    >

      {/* ======================================================

          TOP - SIDE BY SIDE

          ====================================================== */}



      <section

        className="

          grid

          h-[158px]

          shrink-0

          grid-cols-[0.93fr_1.07fr]

          items-stretch

          gap-2

        "

      >

        <TrainingHeaderCard

          activeChecklistId={

            activeChecklistId

          }

          selectChecklist={

            selectChecklist

          }

          progressPercentage={

            progressPercentage

          }

          resetChecklistProgress={

            resetChecklistProgress

          }

          resetAllControls={

            resetAllControls

          }

          hardResetAll={

            hardResetAll

          }

        />



        <CurrentStepCard

          currentStep={

            currentStep

          }

          currentStepIndex={

            currentStepIndex

          }

          totalSteps={

            totalSteps

          }

          feedback={

            feedback

          }

          isChecklistComplete={

            isChecklistComplete

          }

          isHardwareStep={

            isHardwareStep

          }

          markManualStepComplete={

            markManualStepComplete

          }

        />

      </section>





      {/* ======================================================

          LARGE WORKSPACE

          ====================================================== */}



      <section className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">



        {/* COMMUNICATION */}



        {currentStep?.type ===

          "comms" && (

          <div className="touch-scroll h-full min-h-0 overflow-y-auto p-2">

            <CommsTrainingPanel

              scenarioId={

                currentStep.scenario

              }

              onComplete={

                markCommsStepComplete

              }

            />

          </div>

        )}





        {/* INSTRUMENT / TIMER */}



        {(currentStep?.type ===

          "instrument" ||

          currentStep?.type ===

            "timed") && (

          <div className="touch-scroll h-full min-h-0 overflow-y-auto p-2">

            <SimulatedInstrumentPanel />

          </div>

        )}





        {/* ====================================================

            NORMAL TOUCHSCREEN CONTROLS



            NO vertical scroll here.

            ==================================================== */}



        {!specialWorkspace && (

          <div className="flex h-full min-h-0 flex-col overflow-hidden">

            <div className="flex h-[42px] shrink-0 items-center justify-between border-b border-slate-100 px-3">

              <div>

                <p className="text-[8px] font-black uppercase tracking-[0.17em] text-blue-600">

                  Touchscreen Controls

                </p>



                <p className="text-[7px] text-slate-400">

                  Controls available for this selected procedure

                </p>

              </div>



              <span className="rounded-lg bg-blue-50 px-2 py-1 text-[7px] font-black text-blue-700">

                {

                  touchscreenControls.length

                }{" "}

                controls

              </span>

            </div>



            <div className="min-h-0 flex-1 overflow-hidden p-2">

              {touchscreenControls.length >

              0 ? (

                <div

                  className="

                    grid

                    h-full

                    min-h-0

                    w-full

                    gap-1.5

                    overflow-hidden

                  "

                  style={{

                    gridTemplateColumns:

                      `repeat(${gridLayout.columns}, minmax(0, 1fr))`,



                    gridTemplateRows:

                      `repeat(${gridLayout.rows}, minmax(0, 1fr))`,

                  }}

                >

                  {touchscreenControls.map(

                    (control) => (

                      <TouchControl

                        key={

                          control.id

                        }

                        control={

                          control

                        }

                        value={

                          controls[

                            control.id

                          ]

                        }

                        onChange={

                          setControl

                        }

                        isCurrent={

                          currentStepControlId ===

                          control.id

                        }

                        dense={

                          gridLayout.dense

                        }

                      />

                    )

                  )}

                </div>

              ) : (

                <div className="flex h-full items-center justify-center text-center">

                  <div>

                    <CheckCircle2

                      size={26}

                      className="mx-auto text-slate-300"

                    />



                    <p className="mt-2 text-[10px] font-bold text-slate-500">

                      No touchscreen control is needed for this step.

                    </p>



                    <p className="mt-1 text-[8px] text-slate-400">

                      Follow the checklist instruction above.

                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

        )}

      </section>

    </div>

  );

}





export default CockpitControlsPage;