import {
  Compass,
  Fuel,
  Lightbulb,
  Plane,
  Power,
  Radio,
  RefreshCcw,
  RotateCcw,
  Settings2,
} from "lucide-react";

import ChecklistPanel from "../components/ChecklistPanel";

import { controlSections } from "../data/controlDefinitions";
import { checklists } from "../data/checklists";

import { useSimulator } from "../context/SimulatorContext";

/* ============================================================
   COCKPIT CONTROL BUTTONS

   CURRENT:
   React button -> setControl()

   LATER:
   GPIO -> Python -> WebSocket -> setControl()

   This means the checklist logic will NOT need to change
   when physical controls are connected later.
   ============================================================ */

function CockpitControl({
  control,
  value,
  onChange,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-black/40
        bg-gradient-to-b
        from-[#373c42]
        to-[#171a1e]
        p-3
        shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_5px_12px_rgba(0,0,0,.35)]
      "
    >
      {/* CONTROL NAME */}
      <div className="mb-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">
          {control.label}
        </p>

        <p className="mt-1 text-[10px] font-bold text-emerald-400">
          {value ?? "—"}
        </p>
      </div>

      {/* BUTTON OPTIONS */}
      <div
        className={`grid gap-1.5 ${
          control.options.length >= 3
            ? "grid-cols-3"
            : "grid-cols-2"
        }`}
      >
        {control.options.map((option) => {
          const active =
            value === option.value;

          return (
            <button
              key={option.value}
              onClick={() =>
                onChange(
                  control.id,
                  option.value,
                  "ui"
                )
              }
              className={`
                min-h-[42px]
                rounded-lg
                border
                px-2
                py-2
                text-[9px]
                font-black
                uppercase
                tracking-wide
                transition-all
                duration-150
                active:translate-y-[1px]

                ${
                  active
                    ? `
                      border-emerald-300
                      bg-gradient-to-b
                      from-emerald-400
                      to-emerald-700
                      text-white
                      shadow-[0_0_14px_rgba(52,211,153,.4)]
                    `
                    : `
                      border-black/60
                      bg-gradient-to-b
                      from-[#50565d]
                      to-[#24272b]
                      text-slate-300
                      shadow-[inset_0_1px_0_rgba(255,255,255,.12)]
                      hover:border-slate-300
                      hover:text-white
                    `
                }
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   COCKPIT PANEL SECTION
   ============================================================ */

function PanelSection({
  title,
  icon: Icon,
  children,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#4d321d]/60
        bg-black/10
        p-4
        shadow-[inset_0_1px_1px_rgba(255,255,255,.18)]
      "
    >
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <div className="rounded-lg bg-[#332315]/80 p-1.5 text-amber-200">
            <Icon size={14} />
          </div>
        )}

        <h3 className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3d2a19]">
          {title}
        </h3>
      </div>

      {children}
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
    selectChecklist,

    resetChecklistProgress,
    resetAllControls,
    hardResetAll,

    lastEvent,
  } = useSimulator();

  /* ==========================================================
     GET CONTROL GROUPS
     ========================================================== */

  const electrical =
    controlSections.find(
      (section) =>
        section.id === "electrical"
    );

  const engine =
    controlSections.find(
      (section) =>
        section.id === "fuel-engine"
    );

  const lights =
    controlSections.find(
      (section) =>
        section.id === "lights"
    );

  const avionics =
    controlSections.find(
      (section) =>
        section.id === "avionics"
    );

  const flight =
    controlSections.find(
      (section) =>
        section.id === "flight-cabin"
    );

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-600">
            TECNAM P2002JF
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Cockpit Controls
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Interactive cockpit switch and control
            training panel
          </p>
        </div>

        {/* RESET BUTTONS */}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={
              resetChecklistProgress
            }
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-semibold
              text-slate-600
              shadow-sm
              transition
              hover:border-blue-300
              hover:text-blue-600
            "
          >
            <RotateCcw size={15} />
            Reset Checklist
          </button>

          <button
            onClick={resetAllControls}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-semibold
              text-slate-600
              shadow-sm
              transition
              hover:border-blue-300
              hover:text-blue-600
            "
          >
            <RefreshCcw size={15} />
            Reset Controls
          </button>

          <button
            onClick={hardResetAll}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              shadow-lg
              shadow-blue-500/20
              transition
              hover:bg-blue-700
            "
          >
            <Settings2 size={15} />
            Full Reset
          </button>
        </div>
      </div>

      {/* ======================================================
          CHECKLIST SELECTION
          ====================================================== */}

      <div className="glass-panel rounded-2xl p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Training Procedure
            </label>

            <select
              value={activeChecklistId}
              onChange={(event) =>
                selectChecklist(
                  event.target.value
                )
              }
              className="
                w-full
                max-w-xl
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                font-semibold
                text-slate-700
                outline-none
                focus:border-blue-500
              "
            >
              {checklists.map(
                (checklist) => (
                  <option
                    key={checklist.id}
                    value={checklist.id}
                  >
                    {checklist.title}
                  </option>
                )
              )}
            </select>
          </div>

          {/* STATUS */}

          <div className="flex items-center gap-3">
            <div className="relative h-3 w-3">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-40" />

              <div className="relative h-3 w-3 rounded-full bg-emerald-500" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700">
                Simulator Active
              </p>

              <p className="text-[10px] text-slate-400">
                Virtual control mode
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN LAYOUT
          ====================================================== */}

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_390px]">

        {/* ====================================================
            COCKPIT CONTROL PANEL
            ==================================================== */}

        <div
          className="
            overflow-hidden
            rounded-[32px]
            border-[8px]
            border-[#24282d]
            bg-[#171a1e]
            shadow-[0_24px_70px_rgba(15,23,42,.25)]
          "
        >

          {/* TOP COCKPIT BAR */}

          <div className="border-b border-black bg-gradient-to-b from-[#31363b] to-[#111417] px-5 py-3">
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">
                <Plane
                  size={18}
                  className="text-sky-400"
                />

                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-white">
                    TECNAM
                  </p>

                  <p className="text-xs font-black italic tracking-wide text-slate-300">
                    P2002 JF
                  </p>
                </div>
              </div>

              {/* INDICATOR LIGHTS */}

              <div className="flex gap-2">
                <div className="h-3 w-6 rounded-sm bg-red-500 shadow-[0_0_8px_rgba(239,68,68,.4)]" />

                <div className="h-3 w-6 rounded-sm bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,.35)]" />

                <div className="h-3 w-6 rounded-sm bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,.35)]" />
              </div>

            </div>
          </div>

          {/* ==================================================
              WOOD COCKPIT PANEL
              ================================================== */}

          <div
            className="relative overflow-hidden p-5 md:p-7"
            style={{
              background: `
                linear-gradient(
                  90deg,
                  rgba(255,255,255,.08),
                  transparent 25%,
                  rgba(0,0,0,.07) 50%,
                  transparent 75%,
                  rgba(255,255,255,.05)
                ),
                repeating-linear-gradient(
                  8deg,
                  #b67b43 0px,
                  #b67b43 3px,
                  #a66a35 4px,
                  #b97e44 8px,
                  #9c6231 11px
                )
              `,
            }}
          >

            {/* PANEL SCREWS */}

            <div className="absolute left-4 top-4 h-2 w-2 rounded-full bg-[#5c4028] shadow-inner" />

            <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#5c4028] shadow-inner" />

            {/* =================================================
                ELECTRICAL PANEL
                ================================================= */}

            <PanelSection
              title="Electrical System"
              icon={Power}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {electrical?.controls.map(
                  (control) => (
                    <CockpitControl
                      key={control.id}
                      control={control}
                      value={
                        controls[
                          control.id
                        ]
                      }
                      onChange={setControl}
                    />
                  )
                )}
              </div>
            </PanelSection>

            {/* =================================================
                ENGINE / FUEL + LIGHTS
                ================================================= */}

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_.8fr]">

              {/* ENGINE */}

              <PanelSection
                title="Engine & Fuel"
                icon={Fuel}
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {engine?.controls.map(
                    (control) => (
                      <CockpitControl
                        key={control.id}
                        control={control}
                        value={
                          controls[
                            control.id
                          ]
                        }
                        onChange={setControl}
                      />
                    )
                  )}
                </div>
              </PanelSection>

              {/* LIGHTS */}

              <PanelSection
                title="Aircraft Lights"
                icon={Lightbulb}
              >
                <div className="grid gap-3">
                  {lights?.controls.map(
                    (control) => (
                      <CockpitControl
                        key={control.id}
                        control={control}
                        value={
                          controls[
                            control.id
                          ]
                        }
                        onChange={setControl}
                      />
                    )
                  )}
                </div>
              </PanelSection>

            </div>

            {/* =================================================
                AVIONICS
                ================================================= */}

            <div className="mt-4">
              <PanelSection
                title="Communication & Navigation"
                icon={Radio}
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {avionics?.controls.map(
                    (control) => (
                      <CockpitControl
                        key={control.id}
                        control={control}
                        value={
                          controls[
                            control.id
                          ]
                        }
                        onChange={setControl}
                      />
                    )
                  )}
                </div>
              </PanelSection>
            </div>

            {/* =================================================
                FLIGHT / CABIN
                ================================================= */}

            <div className="mt-4">
              <PanelSection
                title="Flight & Cabin Controls"
                icon={Compass}
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {flight?.controls.map(
                    (control) => (
                      <CockpitControl
                        key={control.id}
                        control={control}
                        value={
                          controls[
                            control.id
                          ]
                        }
                        onChange={setControl}
                      />
                    )
                  )}
                </div>
              </PanelSection>
            </div>

          </div>

          {/* ===================================================
              BOTTOM STATUS
              =================================================== */}

          <div className="border-t border-black bg-[#14171a] px-5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">

              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_7px_rgba(34,197,94,.7)]" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Cockpit Controls Active
                </span>
              </div>

              {lastEvent && (
                <p className="font-mono text-[10px] text-slate-400">
                  INPUT:{" "}
                  <span className="text-sky-400">
                    {lastEvent.controlId}
                  </span>

                  {" → "}

                  <span className="text-emerald-400">
                    {lastEvent.value}
                  </span>
                </p>
              )}

            </div>
          </div>
        </div>

        {/* ====================================================
            CHECKLIST
            ==================================================== */}

        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">

            <ChecklistPanel />

            {/* GPIO INFORMATION */}



          </div>
        </div>

      </div>
    </div>
  );
}

export default CockpitControlsPage;