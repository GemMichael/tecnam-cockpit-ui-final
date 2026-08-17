import {
  Activity,
  Fuel,
  Gauge,
  Lightbulb,
} from "lucide-react";

import GlassCard from "./GlassCard";
import { useSimulator } from "../context/SimulatorContext";

function InstrumentBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
      <div className="mb-3 flex items-center gap-2 text-blue-600">
        <Icon size={18} />
        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function InstrumentPanel() {
  const { instruments } =
    useSimulator();

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-slate-900">
        Simulated Instruments
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Frontend-only simulated values for now.
        Later these can come from Python and GPIO logic.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InstrumentBox
          icon={Gauge}
          label="Voltmeter"
          value={instruments.voltmeter}
        />

        <InstrumentBox
          icon={Activity}
          label="Ammeter"
          value={instruments.ammeter}
        />

        <InstrumentBox
          icon={Fuel}
          label="Fuel Pressure"
          value={instruments.fuelPressure}
        />

        <InstrumentBox
          icon={Gauge}
          label="Oil Pressure"
          value={instruments.oilPressure}
        />

        <InstrumentBox
          icon={Lightbulb}
          label="Landing Light"
          value={instruments.landingLight}
        />

        <InstrumentBox
          icon={Gauge}
          label="Transponder"
          value={instruments.transponder}
        />
      </div>

      <div className="mt-5 rounded-2xl bg-blue-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Engine State
        </p>

        <p className="mt-2 text-sm font-bold text-slate-900">
          {instruments.engineRunning
            ? "ENGINE RUNNING"
            : "ENGINE OFF"}
        </p>
      </div>
    </GlassCard>
  );
}

export default InstrumentPanel;