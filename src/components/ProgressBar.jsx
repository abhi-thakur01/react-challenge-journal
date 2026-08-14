export default function ProgressBar({ value, max = 100, label, className = "" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-slate-600 dark:text-slate-400">{label}</span>
          <span className="font-medium text-slate-900 dark:text-white">{pct}%</span>
        </div>
      )}
      <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
