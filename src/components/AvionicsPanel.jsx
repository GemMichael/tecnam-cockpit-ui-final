import {
  useEffect,
  useState,
} from "react";


// ============================================================
// RADIO FREQUENCY HELPERS
// ============================================================

const MIN_COM_FREQUENCY = 118.000;
const MAX_COM_FREQUENCY = 136.975;
const COM_CHANNEL_STEP = 0.025;

const COM_CHANNEL_COUNT =
  Math.round(
    (
      MAX_COM_FREQUENCY -
      MIN_COM_FREQUENCY
    ) /
      COM_CHANNEL_STEP
  ) + 1;


function formatFrequency(value) {
  return Number(value).toFixed(3);
}


function frequencyToChannelIndex(
  frequency
) {
  return Math.round(
    (
      Number(frequency) -
      MIN_COM_FREQUENCY
    ) /
      COM_CHANNEL_STEP
  );
}


function channelIndexToFrequency(
  index
) {
  const wrappedIndex =
    (
      index %
        COM_CHANNEL_COUNT +
      COM_CHANNEL_COUNT
    ) %
    COM_CHANNEL_COUNT;

  return (
    MIN_COM_FREQUENCY +
    wrappedIndex *
      COM_CHANNEL_STEP
  );
}


function shiftFrequency(
  frequency,
  channelSteps
) {
  const currentIndex =
    frequencyToChannelIndex(
      frequency
    );

  const nextIndex =
    currentIndex +
    channelSteps;

  return channelIndexToFrequency(
    nextIndex
  );
}


// ============================================================
// RADIO UNIT
// ============================================================

function RadioUnit({
  title = "COM 1",
  model = "GARMIN",
  powered = true,
  initialActive = 118.000,
  initialStandby = 121.500,
  interactive = true,
  onFrequencyTransferred = null,
}) {
  const [
    activeFrequency,
    setActiveFrequency,
  ] = useState(
    initialActive
  );

  const [
    standbyFrequency,
    setStandbyFrequency,
  ] = useState(
    initialStandby
  );


  function tuneStandbyMHz(
    direction
  ) {
    if (
      !powered ||
      !interactive
    ) {
      return;
    }

    setStandbyFrequency(
      (previous) =>
        shiftFrequency(
          previous,
          direction * 40
        )
    );
  }


  function tuneStandbyKHz(
    direction
  ) {
    if (
      !powered ||
      !interactive
    ) {
      return;
    }

    setStandbyFrequency(
      (previous) =>
        shiftFrequency(
          previous,
          direction
        )
    );
  }


  function swapFrequency() {
    if (
      !powered ||
      !interactive
    ) {
      return;
    }

    const oldActive =
      activeFrequency;

    const nextActive =
      standbyFrequency;

    setActiveFrequency(
      nextActive
    );

    setStandbyFrequency(
      oldActive
    );

    if (
      typeof onFrequencyTransferred ===
      "function"
    ) {
      onFrequencyTransferred(
        formatFrequency(
          nextActive
        )
      );
    }
  }


  const visualButtons = [
    "C/N",
    "OBS",
    "T/F",
    "FUNC",
    "CLR",
    "ENT",
  ];


  return (
    <div
      className="
        overflow-hidden
        rounded-lg
        border-[3px]
        border-[#202020]
        bg-[#303030]
        shadow-xl
      "
    >
      <div
        className="
          grid
grid-cols-[54px_minmax(0,1fr)_72px]
items-center
gap-1
p-1
        "
      >

        {/* LEFT SIDE */}

        <div
          className="
            flex
            h-full
            flex-col
            items-center
            justify-between
            gap-0.5
          "
        >
          <div
            className="
              text-[6px]
              font-black
              uppercase
              tracking-wider
              text-white
            "
          >
            {model}
          </div>


          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              border-[3px]
              border-[#111]
              bg-gradient-to-br
              from-[#555]
              to-[#111]
              shadow-lg
            "
          >
            <div
              className="
                h-3
                w-[2px]
                -rotate-12
                rounded-full
                bg-[#888]
              "
            />
          </div>


          <p
            className="
              text-center
              text-[5px]
              font-bold
              uppercase
              leading-tight
              text-slate-300
            "
          >
            PWR
            <br />
            VOL
          </p>
        </div>


        {/* CENTER */}

        <div>
          <div
            className="
              grid
              min-h-[44px]
              grid-cols-[1fr_auto_1fr]
              items-center
              gap-1
              rounded
              border-[3px]
              border-black
              bg-[#07100b]
              px-2
              shadow-inner
            "
          >

            {/* ACTIVE */}

            <div>
              <p
                className="
                  text-[7px]
                  font-black
                  uppercase
                  tracking-widest
                  text-[#679956]
                "
              >
                Active
              </p>

              <p
                className="
                  font-mono
                  text-[17px]
                  font-black
                  tracking-wide
                  text-[#b8ff7c]
                "
              >
                {powered
                  ? formatFrequency(
                      activeFrequency
                    )
                  : "---.---"}
              </p>
            </div>


            {/* TRANSFER */}

            <button
              type="button"
              disabled={
                !powered ||
                !interactive
              }
              onClick={
                swapFrequency
              }
              className="
                flex
                h-7
                w-8
                items-center
                justify-center
                rounded
                border
                border-[#666]
                bg-[#262626]
                text-lg
                font-black
                text-white
                shadow-md
                active:scale-95
                disabled:opacity-30
              "
              title="Transfer standby frequency to active"
            >
              ↔
            </button>


            {/* STANDBY */}

            <div
              className="
                text-right
              "
            >
              <p
                className="
                  text-[7px]
                  font-black
                  uppercase
                  tracking-widest
                  text-[#679956]
                "
              >
                Standby
              </p>

              <p
                className="
                  font-mono
                  text-[17px]
                  font-black
                  tracking-wide
                  text-[#b8ff7c]
                "
              >
                {powered
                  ? formatFrequency(
                      standbyFrequency
                    )
                  : "---.---"}
              </p>
            </div>

          </div>


          {/* VISUAL FACEPLATE BUTTONS */}

          <div
            className="
              mt-0.5
              grid
              grid-cols-6
              gap-0.5
            "
          >
            {visualButtons.map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  className="
                    rounded
                    border
                    border-[#777]
                    bg-[#252525]
                    py-0.5
                    text-[5px]
                    font-black
                    text-white
                    opacity-55
                  "
                >
                  {label}
                </button>
              )
            )}
          </div>

        </div>


        {/* TUNING */}

        <div
          className="
            flex
            h-full
            flex-col
            items-center
            justify-center
            gap-1
          "
        >
          <p
            className="
              text-[7px]
              font-black
              uppercase
              tracking-wider
              text-slate-300
            "
          >
            Tune
          </p>


          <div
            className="
              grid
              grid-cols-2
              gap-1
            "
          >
            <button
              type="button"
              disabled={
                !powered ||
                !interactive
              }
              onClick={() =>
                tuneStandbyMHz(
                  -1
                )
              }
              className="
                h-6
                w-6
                rounded-full
                border-2
                border-[#111]
                bg-[#444]
                text-xs
                font-black
                text-white
                active:scale-95
                disabled:opacity-30
              "
            >
              −
            </button>


            <button
              type="button"
              disabled={
                !powered ||
                !interactive
              }
              onClick={() =>
                tuneStandbyMHz(
                  1
                )
              }
              className="
                h-6
                w-6
                rounded-full
                border-2
                border-[#111]
                bg-[#444]
                text-xs
                font-black
                text-white
                active:scale-95
                disabled:opacity-30
              "
            >
              +
            </button>
          </div>


          <div
            className="
              mt-1
              grid
              grid-cols-2
              gap-1
            "
          >
            <button
              type="button"
              disabled={
                !powered ||
                !interactive
              }
              onClick={() =>
                tuneStandbyKHz(
                  -1
                )
              }
              className="
                rounded
                border
                border-[#666]
                bg-[#222]
                px-1
                py-0.5
                text-[5px]
                font-black
                text-white
                active:scale-95
                disabled:opacity-30
              "
            >
              kHz −
            </button>


            <button
              type="button"
              disabled={
                !powered ||
                !interactive
              }
              onClick={() =>
                tuneStandbyKHz(
                  1
                )
              }
              className="
                rounded
                border
                border-[#666]
                bg-[#222]
                px-1
                py-0.5
                text-[5px]
                font-black
                text-white
                active:scale-95
                disabled:opacity-30
              "
            >
              kHz +
            </button>
          </div>


          <p
            className="
              mt-0
              text-[5px]
              font-black
              text-slate-400
            "
          >
            {title}
          </p>
        </div>

      </div>
    </div>
  );
}


// ============================================================
// GTX 330 TRANSPONDER
// ============================================================

function TransponderUnit({
  mode = "STBY",
  initialSquawk = "0000",
  interactive = true,
  onSquawkEntered = null,
}) {
  const [
    squawk,
    setSquawk,
  ] = useState(
    initialSquawk
  );

  const [
    editCode,
    setEditCode,
  ] = useState("");


  const powered =
    mode !== "OFF";


  function enterDigit(
    digit
  ) {
    if (
      !powered ||
      !interactive
    ) {
      return;
    }

    if (
      digit < 0 ||
      digit > 7
    ) {
      return;
    }


    const base =
      editCode.length >= 4
        ? ""
        : editCode;


    const next =
      `${base}${digit}`
        .slice(0, 4);


    setEditCode(
      next
    );


    if (
      next.length === 4
    ) {
      setSquawk(
        next
      );

      if (
        typeof onSquawkEntered ===
        "function"
      ) {
        onSquawkEntered(
          next
        );
      }

      window.setTimeout(
        () => {
          setEditCode("");
        },
        250
      );
    }
  }


  function clearDigit() {
    if (
      !powered ||
      !interactive
    ) {
      return;
    }

    if (
      editCode.length === 0
    ) {
      return;
    }

    setEditCode(
      editCode.slice(
        0,
        -1
      )
    );
  }


  function cancelEntry() {
    if (
      !powered ||
      !interactive
    ) {
      return;
    }

    setEditCode("");
  }


  const displayCode =
    editCode.length > 0
      ? editCode.padEnd(
          4,
          "-"
        )
      : squawk;


  return (
    <div
      className="
        overflow-hidden
        rounded-lg
        border-[3px]
        border-[#202020]
        bg-[#303030]
        shadow-xl
      "
    >
      <div
        className="
          grid
          grid-cols-[64px_minmax(0,1fr)_74px]
          items-center
          gap-1
          p-1
        "
      >

        {/* LEFT */}

        <div
          className="
            flex
            flex-col
            gap-0.5
          "
        >
          <p
            className="
              text-center
              text-[6px]
              font-black
              text-white
            "
          >
            GARMIN
          </p>


          <button
            type="button"
            disabled
            className="
              rounded
              border
              border-[#777]
              bg-[#252525]
              py-0.5
              text-[5px]
              font-black
              text-white
              opacity-55
            "
          >
            IDENT
          </button>


          <button
            type="button"
            disabled
            className="
              rounded
              border
              border-[#777]
              bg-[#252525]
              py-0.5
              text-[5px]
              font-black
              text-white
              opacity-55
            "
          >
            VFR
          </button>


          <div
            className="
              rounded
              border
              border-[#555]
              bg-[#161616]
              px-1
              py-0.5
              text-center
            "
          >
            <p
              className="
                text-[6px]
                font-black
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              Physical Mode
            </p>

            <p
              className={`
                mt-1
                font-mono
                text-xs
                font-black

                ${
                  mode === "ALT"
                    ? "text-emerald-400"
                    : mode === "STBY"
                      ? "text-amber-300"
                      : "text-slate-500"
                }
              `}
            >
              {mode}
            </p>
          </div>
        </div>


        {/* CENTER */}

        <div>

          <div
            className="
              min-h-[44px]
              rounded
              border-[3px]
              border-black
              bg-[#07100b]
              px-2
              py-1
              shadow-inner
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
              "
            >
              <div>
                <p
                  className="
                    text-[7px]
                    font-black
                    uppercase
                    tracking-widest
                    text-[#679956]
                  "
                >
                  Squawk
                </p>

                <p
                  className="
                    mt-1
                    font-mono
                    text-[22px]
                    font-black
                    tracking-[0.18em]
                    text-[#b8ff7c]
                  "
                >
                  {powered
                    ? displayCode
                    : "----"}
                </p>
              </div>


              <div
                className="
                  text-right
                "
              >
                <p
                  className="
                    text-[6px]
                    font-bold
                    uppercase
                    tracking-widest
                    text-[#679956]
                  "
                >
                  Mode
                </p>

                <p
                  className="
                    mt-1
                    font-mono
                    text-[8px]
                    font-black
                    text-[#b8ff7c]
                  "
                >
                  {powered
                    ? mode
                    : "OFF"}
                </p>
              </div>
            </div>
          </div>


          <div
            className="
              mt-0.5
              grid
              grid-cols-10
              gap-0.5
            "
          >
            {[
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
            ].map(
              (digit) => (
                <button
                  key={digit}
                  type="button"
                  disabled={
                    !powered ||
                    !interactive ||
                    digit > 7
                  }
                  onClick={() =>
                    enterDigit(
                      digit
                    )
                  }
                  className="
                    h-6
                    rounded
                    border
                    border-[#666]
                    bg-[#252525]
                    font-mono
                    text-sm
                    font-black
                    text-white
                    shadow
                    active:scale-95
                    disabled:opacity-25
                  "
                >
                  {digit}
                </button>
              )
            )}
          </div>

        </div>


        {/* RIGHT */}

        <div
          className="
            grid
            grid-cols-2
            gap-2
          "
        >
          <button
            type="button"
            disabled
            className="
              rounded
              border
              border-[#777]
              bg-[#252525]
              py-1
              text-[5px]
              font-black
              text-white
              opacity-55
            "
          >
            FUNC
          </button>


          <button
            type="button"
            disabled={
              !powered ||
              !interactive ||
              editCode.length === 0
            }
            onClick={
              cancelEntry
            }
            className="
              rounded
              border
              border-[#777]
              bg-[#252525]
              py-1
              text-[5px]
              font-black
              text-white
              active:scale-95
              disabled:opacity-30
            "
          >
            CRSR
          </button>


          <button
            type="button"
            disabled
            className="
              rounded
              border
              border-[#777]
              bg-[#252525]
              py-1
              text-[5px]
              font-black
              leading-tight
              text-white
              opacity-55
            "
          >
            START
            <br />
            STOP
          </button>


          <button
            type="button"
            disabled={
              !powered ||
              !interactive ||
              editCode.length === 0
            }
            onClick={
              clearDigit
            }
            className="
              rounded
              border
              border-[#777]
              bg-[#252525]
              py-1
              text-[5px]
              font-black
              text-white
              active:scale-95
              disabled:opacity-30
            "
          >
            CLR
          </button>


          <div
            className="
              col-span-2
              mt-1
              text-center
              text-[5px]
              font-black
              uppercase
              tracking-wider
              text-slate-300
            "
          >
            GTX 330
          </div>
        </div>

      </div>
    </div>
  );
}


// ============================================================
// COMPLETE AVIONICS STACK
// ============================================================

function AvionicsPanel({
  /*
    FINAL INTEGRATION

    task:
      "radio"
      "transponder"
      "all"  -> preview

    radioPowered:
      later use controls.radio === "ON"

    transponderMode:
      later use controls.transponder

    onDone:
      called when the required UI task is finished
      and the student presses Done.
  */
  radioPowered = true,
  transponderMode = "STBY",
  task = "all",
  onDone = null,
}) {
  const [
    taskReady,
    setTaskReady,
  ] = useState(false);

  const [
    taskValue,
    setTaskValue,
  ] = useState(null);


  useEffect(() => {
    setTaskReady(false);
    setTaskValue(null);
  }, [task]);


  const radioInteractive =
    task === "all" ||
    task === "radio";

  const transponderInteractive =
    task === "all" ||
    task === "transponder";


  function handleFrequencyTransferred(
    frequency
  ) {
    if (
      task !== "radio"
    ) {
      return;
    }

    setTaskValue(
      frequency
    );

    setTaskReady(
      true
    );
  }


  function handleSquawkEntered(
    code
  ) {
    if (
      task !==
      "transponder"
    ) {
      return;
    }

    setTaskValue(
      code
    );

    setTaskReady(
      true
    );
  }


  function handleDone() {
    if (
      !taskReady ||
      typeof onDone !==
        "function"
    ) {
      return;
    }

    onDone({
      task,
      value:
        taskValue,
    });
  }


  const trainingTask =
    task === "radio" ||
    task === "transponder";


  return (
    <div
className="
  flex
  h-full
  w-full
  items-center
  justify-center
  overflow-hidden
  rounded-xl
  bg-[#d8d3c5]
  p-1
"
    >
      <div
className="
  mx-auto
  flex
  w-full
  max-w-[900px]
  flex-col
  gap-1
  overflow-hidden
  rounded-[14px]
  bg-[#111]
  p-1.5
  shadow-2xl
"
      >

        {/* TRAINING TASK HEADER */}

        {trainingTask && (
          <div
            className="
              flex
              items-center
              justify-between
              gap-2
              rounded-md
              border
              border-slate-700
              bg-slate-900
              px-2
              py-1
            "
          >
            <div>
              <p
                className="
                  text-[5px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-slate-400
                "
              >
                Avionics Task
              </p>

              <p
                className="
                  mt-0.5
                  text-[8px]
                  font-black
                  text-white
                "
              >
                {task === "radio"
                  ? "Tune the assigned radio frequency and transfer it to ACTIVE."
                  : task === "transponder"
                    ? "Enter the assigned four-digit transponder squawk."
                    : "Avionics preview: radio and transponder controls are available."}
              </p>
            </div>


            <div
              className={`
                rounded-lg
                px-2
                py-1
                font-mono
                text-[8px]
                font-black

                ${
                  taskReady
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/20 text-amber-300"
                }
              `}
            >
              {taskReady
                ? taskValue
                : "WAITING"}
            </div>
          </div>
        )}


        {/* RADIO */}

        {(
          task === "radio" ||
          task === "all"
        ) && (
          <RadioUnit
            title="COM 1"
            model="GARMIN"
            powered={
              radioPowered
            }
            interactive={
              radioInteractive
            }
            initialActive={
              118.000
            }
            initialStandby={
              121.500
            }
            onFrequencyTransferred={
              handleFrequencyTransferred
            }
          />
        )}


        {/* TRANSPONDER */}

        {(
          task === "transponder" ||
          task === "all"
        ) && (
          <TransponderUnit
            mode={
              transponderMode
            }
            interactive={
              transponderInteractive
            }
            initialSquawk="0000"
            onSquawkEntered={
              handleSquawkEntered
            }
          />
        )}


        {/* DONE */}

        {trainingTask && (
          <div
            className="
              flex
              items-center
              justify-between
              gap-2
              rounded-md
              bg-[#1b1b1b]
              px-2
              py-1
            "
          >
            <p
              className="
                text-[7px]
                font-semibold
                text-slate-400
              "
            >
              {taskReady
                ? "Input accepted. Press Done to continue."
                : task === "radio"
                  ? "Transfer a frequency to ACTIVE to enable Done."
                  : "Enter all four squawk digits to enable Done."}
            </p>


            <button
              type="button"
              disabled={
                !taskReady
              }
              onClick={
                handleDone
              }
              className="
                min-w-[78px]
                rounded-md
                bg-emerald-600
                px-3
                py-1.5
                text-[8px]
                font-black
                uppercase
                tracking-wider
                text-white
                shadow
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:bg-slate-700
                disabled:text-slate-500
              "
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}


export default AvionicsPanel;
