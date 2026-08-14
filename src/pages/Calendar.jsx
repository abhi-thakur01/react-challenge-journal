import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Clock, BookOpen, CalendarDays } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function CalendarPage() {
  const { challenge, stats, entries } = useApp();
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);

  const entryByDate = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [entries]);

  const { weeks, monthLabels, activeDays, bestDay } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = challenge.startDate
      ? new Date(challenge.startDate)
      : new Date(today);
    if (!challenge.startDate) start.setDate(start.getDate() - 90);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());

    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const all = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const date = new Date(d);
      const ds = date.toISOString().slice(0, 10);
      const dayEntries = entryByDate[ds] || [];
      const hours = dayEntries.reduce((s, e) => s + (Number(e.studyTime) || 0), 0);
      all.push({
        date: ds,
        hours,
        count: dayEntries.length,
        future: date > today,
        month: date.getMonth(),
        label: date.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        entries: dayEntries,
      });
    }

    const weeks = [];
    for (let i = 0; i < all.length; i += 7) weeks.push(all.slice(i, i + 7));

    const monthLabels = weeks.map((week, wi) => {
      const first = week[0];
      const prev = weeks[wi - 1]?.[0];
      if (!prev || prev.month !== first.month) {
        return new Date(first.date + "T12:00:00").toLocaleDateString("en-IN", {
          month: "short",
        });
      }
      return "";
    });

    const activeDays = Object.keys(entryByDate).length;
    let bestDay = null;
    all.forEach((d) => {
      if (!bestDay || d.hours > bestDay.hours) bestDay = d;
    });

    return { weeks, monthLabels, activeDays, bestDay };
  }, [challenge.startDate, entryByDate]);

  const level = (hours, future) => {
    if (future) return "bg-transparent";
    if (!hours) return "bg-slate-100 dark:bg-slate-800";
    if (hours < 1) return "bg-emerald-200 dark:bg-emerald-900/50";
    if (hours < 2) return "bg-emerald-400";
    if (hours < 4) return "bg-emerald-500";
    return "bg-emerald-600";
  };

  // Weekly / monthly completion approx
  const last7 = stats.last7 || [];
  const weekDone = last7.filter((d) => d.hours > 0).length;
  const weekPct = Math.round((weekDone / 7) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="section-title">Learning Calendar</h1>
        <p className="section-sub">
          Day auto: {stats.currentDay} / {stats.totalDays} · Start{" "}
          {challenge.startDate || "—"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Flame, label: "Current Streak", value: `${stats.streak}d` },
          { icon: Flame, label: "Longest", value: `${stats.longestStreak}d` },
          { icon: BookOpen, label: "Learning days", value: activeDays },
          { icon: Clock, label: "Total hours", value: stats.totalHours },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-4 text-center">
            <Icon className="w-4 h-4 text-brand-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-[11px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="card p-4">
          <p className="text-slate-500 text-xs mb-1">This week</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {weekPct}% days active ({weekDone}/7)
          </p>
        </div>
        <div className="card p-4">
          <p className="text-slate-500 text-xs mb-1">Best day</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {bestDay?.hours
              ? `${bestDay.label} · ${bestDay.hours}h`
              : "—"}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-slate-500 text-xs mb-1">Challenge day</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            Day {stats.currentDay} / {stats.totalDays}
          </p>
        </div>
      </div>

      <div className="card p-5 overflow-x-auto">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-brand-500" /> Heatmap
          </h3>
          {hover && (
            <p className="text-xs text-slate-500">
              {hover.label} · {hover.count} entries · {hover.hours}h
            </p>
          )}
        </div>
        <div className="flex gap-3 min-w-max">
          <div className="flex flex-col gap-1 pt-5 text-[9px] text-slate-400">
            {["", "M", "", "W", "", "F", ""].map((d, i) => (
              <div key={i} className="h-3.5 flex items-center w-3">
                {d}
              </div>
            ))}
          </div>
          <div>
            <div className="flex gap-1 mb-1">
              {monthLabels.map((m, i) => (
                <div key={i} className="w-3.5 text-[9px] text-slate-400">
                  {m}
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      title={`${day.label}: ${day.hours}h`}
                      onMouseEnter={() => !day.future && setHover(day)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => !day.future && setSelected(day)}
                      className={`w-3.5 h-3.5 rounded-sm ${level(
                        day.hours,
                        day.future
                      )} ${selected?.date === day.date ? "ring-2 ring-brand-500" : ""}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600" />
          <span>More</span>
        </div>
      </div>

      {selected && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            {selected.label}
          </h3>
          {selected.entries.length === 0 ? (
            <div className="text-sm text-slate-500">
              No entry.{" "}
              <Link to="/journal/new" className="text-brand-600 font-medium">
                Add journal →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {selected.entries.map((e) => (
                <Link
                  key={e.id}
                  to={`/journal/${e.id}`}
                  className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <p className="text-xs text-slate-400">Day {e.day}</p>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {e.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
