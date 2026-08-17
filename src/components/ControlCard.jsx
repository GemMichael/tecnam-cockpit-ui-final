import GlassCard from "./GlassCard";

function ControlCard({
  control,
  value,
  onChange,
}) {
  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {control.label}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Current:{" "}
            <span className="font-semibold text-blue-600">
              {value ?? "—"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {control.options.map((option) => {
          const isActive =
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
              className={[
                "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                isActive
                  ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default ControlCard;