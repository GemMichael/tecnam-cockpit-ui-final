import GlassCard from "./GlassCard";

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  accent = "blue",
}) {
  const accentClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-violet-50 text-violet-600",
  };

  return (
    <GlassCard className="p-5 transition hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div
          className={`rounded-2xl p-3 ${
            accentClasses[accent] || accentClasses.blue
          }`}
        >
          <Icon size={22} />
        </div>
      </div>
    </GlassCard>
  );
}

export default StatCard;