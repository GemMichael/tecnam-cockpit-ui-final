import {
  CheckCircle2,
  Clock3,
  Gauge,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useSimulator,
} from "../context/SimulatorContext";


/* ============================================================
   HELPERS
   ============================================================ */

function clamp(
  value,
  min,
  max
) {
  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}


/* ============================================================
   ROUND ANALOG GAUGE
   ============================================================ */

function RoundGauge({
  label,
  value,
  unit,
  min,
  max,
}) {
  const numericValue =
    Number(
      value
    );


  const safeValue =
    clamp(
      numericValue,
      Number(
        min
      ),
      Number(
        max
      )
    );


  const ratio =
    max === min
      ? 0
      : (
          safeValue -
          min
        ) /
        (
          max -
          min
        );


  /*
   * Needle sweep:
   *
   * minimum = -120°
   * maximum = +120°
   */

  const angle =
    -120 +
    ratio *
      240;


  const radians =
    (
      (
        angle -
        90
      ) *
      Math.PI
    ) /
    180;


  const needleX =
    50 +
    28 *
      Math.cos(
        radians
      );


  const needleY =
    50 +
    28 *
      Math.sin(
        radians
      );


  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-700
        bg-gradient-to-b
        from-[#20262d]
        to-[#0b0e12]
        p-3
        text-white
        shadow-xl
      "
    >

      {/* HEADER */}

      <div className="mb-1 flex items-center justify-between">

        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-300">
          {label}
        </p>


        <Gauge
          size={13}
          className="text-sky-400"
        />

      </div>


      {/* GAUGE */}

      <div className="mx-auto w-full max-w-[145px]">

        <svg
          viewBox="0 0 100 78"
          className="w-full"
        >

          {/* OUTER */}

          <circle
            cx="50"
            cy="50"
            r="38"
            fill="#11161b"
            stroke="#64748b"
            strokeWidth="2"
          />


          {/* INNER */}

          <circle
            cx="50"
            cy="50"
            r="33"
            fill="#090c0f"
            stroke="#334155"
            strokeWidth="1"
          />


          {/* TICK MARKS */}

          {Array.from({
            length:
              9,
          }).map(
            (
              _,
              index
            ) => {

              const tickAngle =
                -120 +
                index *
                  30;


              const tickRadians =
                (
                  (
                    tickAngle -
                    90
                  ) *
                  Math.PI
                ) /
                180;


              const x1 =
                50 +
                31 *
                  Math.cos(
                    tickRadians
                  );


              const y1 =
                50 +
                31 *
                  Math.sin(
                    tickRadians
                  );


              const x2 =
                50 +
                36 *
                  Math.cos(
                    tickRadians
                  );


              const y2 =
                50 +
                36 *
                  Math.sin(
                    tickRadians
                  );


              return (
                <line
                  key={
                    index
                  }

                  x1={
                    x1
                  }

                  y1={
                    y1
                  }

                  x2={
                    x2
                  }

                  y2={
                    y2
                  }

                  stroke="#94a3b8"

                  strokeWidth="1.5"
                />
              );
            }
          )}


          {/* NEEDLE */}

          <line
            x1="50"
            y1="50"

            x2={
              needleX
            }

            y2={
              needleY
            }

            stroke="#ef4444"

            strokeWidth="2.5"

            strokeLinecap="round"
          />


          {/* CENTER HUB */}

          <circle
            cx="50"
            cy="50"
            r="4"
            fill="#cbd5e1"
          />

        </svg>


        {/* DIGITAL VALUE */}

        <div className="-mt-2 text-center">

          <p className="font-mono text-xl font-black tracking-tight text-white">

            {numericValue.toFixed(
              Math.abs(
                numericValue -
                  Math.round(
                    numericValue
                  )
              ) <
                0.05
                ? 0
                : 1
            )}


            <span className="ml-1 text-[10px] font-bold text-slate-400">
              {unit}
            </span>

          </p>


          <div className="mt-1 flex justify-between font-mono text-[8px] text-slate-500">

            <span>
              {min}
            </span>

            <span>
              {max}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   INSTRUMENT STEP
   ============================================================ */

function InstrumentStep({
  step,
}) {
  const {
    confirmInstrumentStep,
  } = useSimulator();


  const startValue =
    Number(
      step.startValue ??
        0
    );


  const targetValue =
    Number(
      step.normalValue ??
        0
    );


  const duration =
    Number(
      step.settleSeconds ??
        3
    ) *
    1000;


  const [
    displayedValue,
    setDisplayedValue,
  ] = useState(
    startValue
  );


  const [
    stable,
    setStable,
  ] = useState(
    false
  );


  const animationRef =
    useRef(
      null
    );


  /* ==========================================================
     NEEDLE ANIMATION

     Needle moves smoothly from startValue to normalValue.

     A small damped movement is added while travelling so
     it feels more like an analog instrument.

     Final value is ALWAYS the correct configured value.
     ========================================================== */

  useEffect(
    () => {
      setDisplayedValue(
        startValue
      );

      setStable(
        false
      );


      const startTime =
        performance.now();


      function animate(
        now
      ) {
        const elapsed =
          now -
          startTime;


        const progress =
          Math.min(
            1,
            elapsed /
              duration
          );


        /*
         * Smooth ease-out movement
         */

        const eased =
          1 -
          Math.pow(
            1 -
              progress,
            3
          );


        /*
         * Very small analog-style needle movement.
         *
         * The wobble disappears completely when
         * the gauge reaches its final reading.
         */

        const range =
          Number(
            step.gaugeMax
          ) -
          Number(
            step.gaugeMin
          );


        const wobble =
          Math.sin(
            progress *
              Math.PI *
              5
          ) *
          (
            1 -
            progress
          ) *
          range *
          0.004;


        const nextValue =
          startValue +
          (
            targetValue -
            startValue
          ) *
            eased +
          wobble;


        setDisplayedValue(
          nextValue
        );


        if (
          progress <
          1
        ) {
          animationRef.current =
            requestAnimationFrame(
              animate
            );

          return;
        }


        /*
         * Always finish exactly at
         * the normal checklist value.
         */

        setDisplayedValue(
          targetValue
        );


        setStable(
          true
        );
      }


      /*
       * Small delay makes the appearance
       * feel more natural.
       */

      const delay =
        setTimeout(
          () => {
            animationRef.current =
              requestAnimationFrame(
                animate
              );
          },
          200
        );


      return () => {
        clearTimeout(
          delay
        );


        if (
          animationRef.current
        ) {
          cancelAnimationFrame(
            animationRef.current
          );
        }
      };
    },
    [
      step.id,
      startValue,
      targetValue,
      duration,
      step.gaugeMin,
      step.gaugeMax,
    ]
  );


  function confirm() {
    /*
     * The button is disabled until the simulated
     * instrument has reached its stable target value.
     *
     * Once stable, confirming only needs to complete
     * the current instrument checklist step.
     */

    if (
      !stable
    ) {
      return;
    }


    confirmInstrumentStep();
  }


  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >

      {/* HEADER */}

      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">
              Simulated Instrument
            </p>


            <p className="mt-1 text-xs font-bold text-slate-800">
              {stable
                ? "Reading Stable"
                : "Instrument Stabilizing"}
            </p>

          </div>


          <div
            className={`
              rounded-lg
              p-2

              ${
                stable
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-blue-50 text-blue-600"
              }
            `}
          >

            {stable ? (
              <CheckCircle2
                size={17}
              />
            ) : (
              <Gauge
                size={17}
              />
            )}

          </div>

        </div>

      </div>


      {/* BODY */}

      <div className="p-4">

        <RoundGauge
          label={
            step.instrumentLabel ||
            step.title
          }

          value={
            displayedValue
          }

          unit={
            step.unit
          }

          min={
            step.gaugeMin
          }

          max={
            step.gaugeMax
          }
        />


        {/* STATUS */}

        <div
          className={`
            mt-4
            rounded-xl
            border
            p-3
            text-center

            ${
              stable
                ? "border-emerald-100 bg-emerald-50"
                : "border-blue-100 bg-blue-50"
            }
          `}
        >

          <p
            className={`
              text-[10px]
              font-bold

              ${
                stable
                  ? "text-emerald-700"
                  : "text-blue-700"
              }
            `}
          >
            {stable
              ? "✓ Instrument indication stable"
              : `Stabilizing... approximately ${step.settleSeconds || 3} seconds`}
          </p>

        </div>


        {/* CONFIRM */}

        <button
          type="button"

          disabled={
            !stable
          }

          onClick={
            confirm
          }

          className="
            mt-3
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-blue-600
            px-4
            py-3
            text-xs
            font-bold
            text-white
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:bg-slate-200
            disabled:text-slate-400
          "
        >

          <CheckCircle2
            size={15}
          />

          {stable
            ? "Confirm Reading"
            : "Wait for Stable Reading"}

        </button>


        <p className="mt-3 text-center text-[9px] leading-4 text-slate-400">
          Wait for the simulated instrument to stabilize before confirming the checklist indication.
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   ONE-MINUTE TIMER
   ============================================================ */

function TimedChecklistStep({
  step,
}) {
  const {
    controls,
    markTimedStepComplete,
    recordTimedStepViolation,
  } = useSimulator();


  const duration =
    step.durationSeconds ||
    60;


  const [
    secondsRemaining,
    setSecondsRemaining,
  ] = useState(
    duration
  );


  const completedRef =
    useRef(
      false
    );


  const hadProgressRef =
    useRef(
      false
    );


  const violationRef =
    useRef(
      false
    );


  const currentValue =
    controls[
      step.requiredControlId
    ];


  const conditionMet =
    currentValue ===
    step.requiredValue;


  /* RESET WHEN STEP CHANGES */

  useEffect(
    () => {
      setSecondsRemaining(
        duration
      );


      completedRef.current =
        false;


      hadProgressRef.current =
        false;


      violationRef.current =
        false;
    },
    [
      step.id,
      duration,
    ]
  );


  /* COUNTDOWN */

  useEffect(
    () => {
      if (
        !conditionMet ||
        secondsRemaining <=
          0
      ) {
        return;
      }


      const timer =
        setTimeout(
          () => {
            setSecondsRemaining(
              (
                previous
              ) => {
                hadProgressRef.current =
                  true;


                return Math.max(
                  0,
                  previous -
                    1
                );
              }
            );
          },
          1000
        );


      return () =>
        clearTimeout(
          timer
        );
    },
    [
      conditionMet,
      secondsRemaining,
    ]
  );


  /* RESET IF RPM IS LOST */

  useEffect(
    () => {
      if (
        conditionMet
      ) {
        violationRef.current =
          false;

        return;
      }


      if (
        !hadProgressRef.current
      ) {
        return;
      }


      setSecondsRemaining(
        duration
      );


      hadProgressRef.current =
        false;


      if (
        !violationRef.current
      ) {
        violationRef.current =
          true;


        recordTimedStepViolation({
          reason:
            `Maintain ${step.requiredLabel} continuously for the full ${duration} seconds.`,

          value:
            currentValue,
        });
      }
    },
    [
      conditionMet,
      currentValue,
      duration,
      recordTimedStepViolation,
      step.requiredLabel,
    ]
  );


  /* AUTO COMPLETE AT ZERO */

  useEffect(
    () => {
      if (
        secondsRemaining !==
          0 ||
        completedRef.current
      ) {
        return;
      }


      completedRef.current =
        true;


      markTimedStepComplete();
    },
    [
      secondsRemaining,
      markTimedStepComplete,
    ]
  );


  const elapsed =
    duration -
    secondsRemaining;


  const progress =
    (
      elapsed /
      duration
    ) *
    100;


  const minutes =
    Math.floor(
      secondsRemaining /
        60
    );


  const seconds =
    secondsRemaining %
    60;


  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">
              Timed Procedure
            </p>


            <p className="mt-1 text-xs font-bold text-slate-800">
              {step.title}
            </p>

          </div>


          <Clock3
            size={18}

            className={
              conditionMet
                ? "text-emerald-600"
                : "text-amber-500"
            }
          />

        </div>

      </div>


      <div className="p-4 text-center">

        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
          Time Remaining
        </p>


        <p className="mt-2 font-mono text-4xl font-black text-slate-900">

          {String(
            minutes
          ).padStart(
            2,
            "0"
          )}

          :

          {String(
            seconds
          ).padStart(
            2,
            "0"
          )}

        </p>


        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"

            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>


        <div
          className={`
            mt-4
            rounded-xl
            border
            p-3

            ${
              conditionMet
                ? "border-emerald-100 bg-emerald-50"
                : "border-amber-100 bg-amber-50"
            }
          `}
        >

          <p
            className={`
              text-[10px]
              font-bold

              ${
                conditionMet
                  ? "text-emerald-700"
                  : "text-amber-700"
              }
            `}
          >

            {conditionMet
              ? `✓ ${step.requiredLabel} maintained`
              : `Set and maintain ${step.requiredLabel}`}

          </p>

        </div>


        <p className="mt-3 text-[9px] leading-4 text-slate-400">
          The timer resets if the required RPM condition is interrupted.
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   MAIN
   ============================================================ */

function SimulatedInstrumentPanel() {
  const {
    currentStep,
  } = useSimulator();


  if (
    !currentStep
  ) {
    return null;
  }


  if (
    currentStep.type ===
    "instrument"
  ) {
    return (
      <InstrumentStep
        key={
          currentStep.id
        }

        step={
          currentStep
        }
      />
    );
  }


  if (
    currentStep.type ===
    "timed"
  ) {
    return (
      <TimedChecklistStep
        key={
          currentStep.id
        }

        step={
          currentStep
        }
      />
    );
  }


  /*
   * Once instrument/timer step is finished,
   * currentStep changes and this disappears.
   */

  return null;
}


export default SimulatedInstrumentPanel;