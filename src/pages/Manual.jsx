import {
  BookOpen,
  CheckCircle2,
  Cpu,
  Gauge,
  Lightbulb,
  ListChecks,
  Radio,
  Search,
  SlidersHorizontal,
  Timer,
  ToggleLeft,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import GlassCard from "../components/GlassCard";
import PageHeader from "../components/PageHeader";


/* ============================================================
   GUIDANCE LED CONTROLS
   ============================================================ */

const guidanceControls = [
  "Ignition Switch",
  "Master Switch",
  "Generator",
  "Electric Fuel Pump",
  "Throttle Friction",
  "Throttle",
  "Flaps",
  "Avionic Master",
  "Strobe Light",
  "Landing Light",
  "Navigation Light",
  "Chronometer",
  "Choke",
  "Carburetor Heat",
];


/* ============================================================
   MANUAL ITEMS
   ============================================================ */

const manualItems = [
  {
    title: "Ignition Switch",
    category: "Engine",
    icon: ToggleLeft,
    hasGuidance: true,
    description:
      "Controls the ignition and magneto positions used during engine starting, run-up checks and engine securing procedures.",
    usage:
      "Follow the exact ignition position or sequence shown in the Current Step. The Ignition guidance LED illuminates whenever the checklist requires this control.",
  },

  {
    title: "Master Switch",
    category: "Electrical",
    icon: ToggleLeft,
    hasGuidance: true,
    description:
      "Controls the primary electrical power for the cockpit systems.",
    usage:
      "Operate the physical Master Switch when instructed by the checklist. The Master guidance LED identifies the control that must be used.",
  },

  {
    title: "Generator",
    category: "Electrical",
    icon: ToggleLeft,
    hasGuidance: true,
    description:
      "Controls the aircraft generator or alternator electrical system.",
    usage:
      "Switch the Generator ON or OFF according to the current checklist instruction. Run-up procedures may also require an OFF-to-ON check.",
  },

  {
    title: "Electric Fuel Pump",
    category: "Fuel System",
    icon: ToggleLeft,
    hasGuidance: true,
    description:
      "Electric fuel pump control used during specified checklist procedures.",
    usage:
      "Operate the physical Fuel Pump switch only when instructed. The system detects the switch state and the Fuel Pump guidance LED identifies the control.",
  },

  {
    title: "Fuel Selector Valve",
    category: "Fuel System",
    icon: SlidersHorizontal,
    hasGuidance: false,
    description:
      "Allows the appropriate fuel tank or fuel-selector position to be selected.",
    usage:
      "Follow the Current Step instruction and select the required tank using the available simulator control.",
  },

  {
    title: "Throttle Friction",
    category: "Engine",
    icon: SlidersHorizontal,
    hasGuidance: true,
    description:
      "Adjusts the amount of resistance applied to throttle movement.",
    usage:
      "Use the physical Throttle Friction control when the checklist requests RELEASE, ADJUST or SET. Its dedicated guidance LED will illuminate.",
  },

  {
    title: "Throttle",
    category: "Engine",
    icon: SlidersHorizontal,
    hasGuidance: true,
    description:
      "Controls simulated engine power and RPM settings.",
    usage:
      "Set the throttle according to the checklist, such as IDLE, 1,000–1,200 RPM, 1,640 RPM or FULL POWER. The Throttle guidance LED identifies the control.",
  },

  {
    title: "Choke",
    category: "Engine",
    icon: SlidersHorizontal,
    hasGuidance: true,
    description:
      "Used during the engine-start procedure when choke operation is required.",
    usage:
      "When the Engine Start checklist reaches the Choke step, the Choke guidance LED illuminates. Set the choke as instructed, then confirm the manual checklist step.",
  },

  {
    title: "Carburetor Heat",
    category: "Engine",
    icon: SlidersHorizontal,
    hasGuidance: true,
    description:
      "Used for carburetor heat checks and specified flight configuration procedures.",
    usage:
      "The Carb Heat guidance LED illuminates during the relevant checklist item. Some Carb Heat procedures require manual confirmation while others use a simulator control.",
  },

  {
    title: "Flaps",
    category: "Flight Controls",
    icon: SlidersHorizontal,
    hasGuidance: true,
    description:
      "Controls the simulated flap positions used for inspection, takeoff and landing procedures.",
    usage:
      "Move the physical flap control to the required position such as UP, TAKEOFF or FULL. The Flaps guidance LED identifies the control.",
  },

  {
    title: "Avionic Master",
    category: "Electrical",
    icon: ToggleLeft,
    hasGuidance: true,
    description:
      "Controls electrical power to the aircraft avionics equipment.",
    usage:
      "Operate the physical Avionic Master switch when instructed. The corresponding guidance LED illuminates during the step.",
  },

  {
    title: "Strobe Light",
    category: "Lighting",
    icon: Lightbulb,
    hasGuidance: true,
    description:
      "Controls the aircraft strobe-light system.",
    usage:
      "Use the physical Strobe switch when the checklist calls for ON or OFF. The Strobe guidance LED identifies the switch.",
  },

  {
    title: "Navigation Light",
    category: "Lighting",
    icon: Lightbulb,
    hasGuidance: true,
    description:
      "Controls the simulated aircraft navigation-light system.",
    usage:
      "Use the physical Navigation Light switch according to the checklist. Its guidance LED illuminates whenever the current step requires it.",
  },

  {
    title: "Landing Light",
    category: "Lighting",
    icon: Lightbulb,
    hasGuidance: true,
    description:
      "Controls the landing-light system for applicable ground, takeoff and landing procedures.",
    usage:
      "Operate the physical Landing Light switch according to the Current Step. The Landing Light guidance LED identifies the control.",
  },

  {
    title: "Chronometer",
    category: "Instruments",
    icon: Timer,
    hasGuidance: true,
    description:
      "Provides simulated elapsed-time operation using physical START and STOP buttons.",
    usage:
      "When the Chronometer step is active, its guidance LED illuminates. Use the physical START or STOP button required by the procedure.",
  },

  {
    title: "Intercom",
    category: "Avionics",
    icon: Radio,
    hasGuidance: false,
    description:
      "Physical cockpit intercom control monitored by the Raspberry Pi system.",
    usage:
      "Set the physical Intercom control when required by the training procedure.",
  },

  {
    title: "Radio",
    category: "Avionics",
    icon: Radio,
    hasGuidance: false,
    description:
      "Physical radio control used together with the communication training system.",
    usage:
      "Follow the communication or checklist procedure shown on the touchscreen and operate the physical radio control when required.",
  },

  {
    title: "Transponder",
    category: "Avionics",
    icon: Radio,
    hasGuidance: false,
    description:
      "Physical transponder control with OFF, STBY and ALT positions.",
    usage:
      "Move the physical transponder control to the position requested by the checklist.",
  },

  {
    title: "Oil Pressure Gauge",
    category: "Engine Instruments",
    icon: Gauge,
    hasGuidance: false,
    description:
      "Displays simulated engine oil-pressure information during applicable training procedures.",
    usage:
      "Read the displayed value whenever the Current Step requires an oil-pressure check.",
  },

  {
    title: "Airspeed Indicator",
    category: "Flight Instruments",
    icon: Gauge,
    hasGuidance: false,
    description:
      "Displays simulated indicated airspeed for cockpit familiarization and checklist procedures.",
    usage:
      "Use the instrument display when the current training procedure requires an airspeed reference.",
  },
];


/* ============================================================
   HOW TO USE
   ============================================================ */

const trainingSteps = [
  {
    number: "01",
    title: "Select a training procedure",
    description:
      "Use the Training Procedure selector on the cockpit screen to choose the checklist you want to perform.",
  },

  {
    number: "02",
    title: "Read the Current Step",
    description:
      "The Current Step card shows the action that must be completed next and the expected condition or result.",
  },

  {
    number: "03",
    title: "Look for a guidance LED",
    description:
      "If the step uses one of the supported physical cockpit controls, its guidance LED automatically turns ON.",
  },

  {
    number: "04",
    title: "Operate the required control",
    description:
      "Use the physical switch, button or control indicated by the checklist and guidance LED. Touchscreen controls remain available for simulated controls.",
  },

  {
    number: "05",
    title: "Follow the correct sequence",
    description:
      "The trainer checks checklist order and control settings. Sequence-type procedures must be completed in the required order.",
  },

  {
    number: "06",
    title: "Complete manual items",
    description:
      "Some procedures cannot be sensed electronically. Use the Confirm button shown on the Current Step card after completing those actions.",
  },

  {
    number: "07",
    title: "Continue until complete",
    description:
      "After a successful action, continue through the checklist. When no supported physical control is required, all guidance LEDs remain OFF.",
  },
];


/* ============================================================
   MANUAL PAGE
   ============================================================ */

function Manual() {
  const [search, setSearch] =
    useState("");


  const filteredItems =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      if (!query) {

        return manualItems;

      }


      return manualItems.filter(
        (item) =>

          `${item.title} ${item.category} ${item.description} ${item.usage}`
            .toLowerCase()
            .includes(query)

      );

    }, [search]);


  return (
    <>

      {/* ======================================================
          HEADER
          ====================================================== */}

      <PageHeader
        title="Tecnam P2002JF Cockpit Manual"
        subtitle="Operator guide for the physical cockpit trainer, touchscreen interface, checklists and guidance LEDs."
      />


      {/* ======================================================
          QUICK START
          ====================================================== */}

      <GlassCard className="mb-6 overflow-hidden">

        <div className="grid lg:grid-cols-[1fr_.85fr]">

          <div
            className="flex min-h-80 items-center justify-center bg-gradient-to-br from-blue-900 to-sky-500 bg-cover bg-center p-8"
            style={{
              backgroundImage:
                "linear-gradient(135deg,rgba(8,35,63,.84),rgba(37,99,235,.48)),url('/images/tecnam-cockpit.jpg')",
            }}
          >

            <div className="max-w-lg text-center text-white">

              <BookOpen
                size={48}
                className="mx-auto"
              />


              <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-blue-200">
                Tecnam P2002JF
              </p>


              <h2 className="mt-2 text-3xl font-black">
                Cockpit Training System
              </h2>


              <p className="mt-4 text-sm leading-7 text-blue-100">
                Follow the checklist shown on the
                touchscreen. When a physical cockpit
                control is required, the corresponding
                guidance LED identifies the control
                that should be operated.
              </p>

            </div>

          </div>


          <div className="p-7">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Basic operation
            </p>


            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              How to use the trainer
            </h2>


            <p className="mt-4 text-sm leading-7 text-slate-500">
              Select a checklist, read the Current Step
              and perform the requested action. Physical
              cockpit controls are detected by the
              Raspberry Pi while simulated controls,
              instruments and communication procedures
              are handled through the touchscreen.
            </p>


            <div className="mt-6 space-y-3">

              <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-3">

                <Lightbulb
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <p className="text-xs leading-5 text-blue-900">
                  <strong>
                    Guidance LED ON:
                  </strong>{" "}
                  operate the corresponding physical
                  cockpit control.
                </p>

              </div>


              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">

                <Cpu
                  size={18}
                  className="mt-0.5 shrink-0 text-slate-600"
                />

                <p className="text-xs leading-5 text-slate-700">
                  <strong>
                    No guidance LED:
                  </strong>{" "}
                  follow the touchscreen instruction,
                  instrument procedure, communication
                  exercise or manual checklist action.
                </p>

              </div>

            </div>

          </div>

        </div>

      </GlassCard>


      {/* ======================================================
          TRAINING WORKFLOW
          ====================================================== */}

      <GlassCard className="mb-6 p-5 md:p-6">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">

            <ListChecks size={22} />

          </div>


          <div>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Training workflow
            </p>


            <h2 className="mt-1 text-xl font-black text-slate-900">
              From checklist selection to completion
            </h2>

          </div>

        </div>


        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">

          {trainingSteps.map(
            (step) => (

              <div
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  {step.number}
                </div>


                <h3 className="mt-4 font-bold text-slate-900">
                  {step.title}
                </h3>


                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {step.description}
                </p>

              </div>

            )
          )}

        </div>

      </GlassCard>


      {/* ======================================================
          GUIDANCE LED SYSTEM
          ====================================================== */}

      <GlassCard className="mb-6 p-5 md:p-6">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">

            <Lightbulb size={22} />

          </div>


          <div>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">
              Physical guidance
            </p>


            <h2 className="mt-1 text-xl font-black text-slate-900">
              Guidance LED System
            </h2>

          </div>

        </div>


        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-500">
          The cockpit has 14 guidance LEDs. Only the
          LED associated with the current supported
          checklist control should illuminate. When the
          checklist advances, the previous LED turns OFF
          and the next required control is highlighted.
          For checklist items without a mapped physical
          control, the guidance LEDs remain OFF.
        </p>


        <div className="mt-5 flex flex-wrap gap-2">

          {guidanceControls.map(
            (control) => (

              <span
                key={control}
                className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"
              >
                {control}
              </span>

            )
          )}

        </div>


        <div className="mt-5 grid gap-3 md:grid-cols-3">

          <div className="rounded-xl bg-emerald-50 p-4">

            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
              One LED ON
            </p>

            <p className="mt-2 text-xs leading-5 text-emerald-900">
              That physical control is required by the
              Current Step.
            </p>

          </div>


          <div className="rounded-xl bg-slate-50 p-4">

            <p className="text-xs font-black uppercase tracking-wide text-slate-600">
              All LEDs OFF
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-700">
              No supported physical guidance control is
              required for the current step.
            </p>

          </div>


          <div className="rounded-xl bg-blue-50 p-4">

            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
              Checklist Complete
            </p>

            <p className="mt-2 text-xs leading-5 text-blue-900">
              Guidance LEDs turn OFF after the procedure
              has been completed.
            </p>

          </div>

        </div>

      </GlassCard>


      {/* ======================================================
          SEARCH
          ====================================================== */}

      <GlassCard className="mb-6 p-4">

        <div className="relative">

          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />


          <input
            value={search}

            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }

            placeholder="Search switches, controls or instruments..."

            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-blue-500"
          />

        </div>

      </GlassCard>


      {/* ======================================================
          CONTROLS
          ====================================================== */}

      <div className="mb-4 flex items-end justify-between">

        <div>

          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Cockpit reference
          </p>


          <h2 className="mt-1 text-xl font-black text-slate-900">
            Controls and Instruments
          </h2>

        </div>


        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
          {filteredItems.length} items
        </span>

      </div>


      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {filteredItems.map(
          (item) => {

            const Icon =
              item.icon;


            return (

              <GlassCard
                key={item.title}
                className="p-5 transition hover:-translate-y-1 hover:border-blue-200"
              >

                <div className="flex items-start gap-4">

                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">

                    <Icon size={21} />

                  </div>


                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                        {item.category}
                      </span>


                      {item.hasGuidance && (

                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700">
                          Guidance LED
                        </span>

                      )}

                    </div>


                    <h3 className="mt-1 font-bold text-slate-900">
                      {item.title}
                    </h3>


                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>


                    <div className="mt-4 rounded-xl bg-slate-50 p-3">

                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                        How to use
                      </p>


                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {item.usage}
                      </p>

                    </div>

                  </div>

                </div>

              </GlassCard>

            );

          }
        )}

      </div>


      {/* ======================================================
          NO SEARCH RESULT
          ====================================================== */}

      {filteredItems.length === 0 && (

        <GlassCard className="p-10 text-center">

          <Search
            size={32}
            className="mx-auto text-slate-300"
          />


          <h3 className="mt-4 font-bold text-slate-700">
            No manual item found
          </h3>


          <p className="mt-2 text-sm text-slate-400">
            Try searching for another cockpit control
            or instrument.
          </p>

        </GlassCard>

      )}


      {/* ======================================================
          REMINDER
          ====================================================== */}

      <GlassCard className="mt-6 p-5">

        <div className="flex items-start gap-4">

          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">

            <CheckCircle2 size={22} />

          </div>


          <div>

            <h3 className="font-bold text-slate-900">
              Training reminder
            </h3>


            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">
              Always follow the Current Step displayed
              by the training system. The guidance LEDs
              are navigation aids that show which
              supported physical control should be used;
              the checklist instruction remains the
              primary reference for the required
              position, setting or sequence.
            </p>

          </div>

        </div>

      </GlassCard>

    </>
  );
}


export default Manual;