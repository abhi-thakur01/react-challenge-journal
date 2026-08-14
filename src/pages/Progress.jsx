import { useMemo, useState } from "react";
import { Flame, Clock, BookOpen, Layers, Bookmark } from "lucide-react";
import { useApp } from "../context/AppContext";
import ProgressBar from "../components/ProgressBar";

export default function ProgressPage() {
  const { challenge, stats, entries, topics, bookmarks } = useApp();
  const [hover, setHover] = useState(null);

  // GitHub-style contribution calendar — prefer challenge start → today, else last 16 weeks
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = new Date(today);
    if (challenge.startDate) {
      start = new Date(challenge.startDate);
      start.setHours(0, 0, 0, 0);
      // align to Sunday
      start.setDate(start.getDate() - start.getDay());
    } else {
      start.setDate(start.getDate() - 15 * 7 - start.getDay());
    }

    // end = next Saturday after today
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const allDays = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const date = new Date(d);
      const ds = date.toISOString().slice(0, 10);
      const dayEntries = entries.filter((e) => e.date === ds);
      const hours = dayEntries.reduce((s, e) => s + (Number(e.studyTime) || 0), 0);
      allDays.push({
        date: ds,
        hours,
        count: dayEntries.length,
        future: date > today,
        month: date.getMonth(),
        label: date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      });
    }

    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    // Month labels under first week of each month
    const monthLabels = weeks.map((week, wi) => {
      const first = week.find((d) => !d.future) || week[0];
      if (!first) return "";
      const prev = weeks[wi - 1]?.[0];
      if (!prev || prev.month !== first.month) {
        return new Date(first.date + "T12:00:00").toLocaleDateString("en-IN", {
          month: "short",
        });
      }
      return "";
    });

    return { weeks, monthLabels };
  }, [entries, challenge.startDate]);

  const byCategory = useMemo(() => {
    const map = {};
    topics.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [topics]);

  const maxCat = Math.max(...byCategory.map(([, n]) => n), 1);
  const maxHours = Math.max(...stats.last7.map((d) => d.hours), 1);
  const avgDaily =
    entries.length > 0
      ? Math.round((stats.totalHours / entries.length) * 10) / 10
      : 0;

  const activeDays = entries.length
    ? new Set(entries.map((e) => e.date)).size
    : 0;

  const level = (hours, future) => {
    if (future) return "bg-transparent";
    if (!hours) return "bg-slate-100 dark:bg-slate-800";
    if (hours < 1) return "bg-emerald-200 dark:bg-emerald-900/60";
    if (hours < 2) return "bg-emerald-400 dark:bg-emerald-600";
    if (hours < 4) return "bg-emerald-500 dark:bg-emerald-500";
    return "bg-emerald-600 dark:bg-emerald-400";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <div>
        <h1 className="section-title">Progress</h1>
        <p className="section-sub">Visual analytics of your learning journey.</p>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {challenge.name}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              Day {stats.currentDay} of {stats.totalDays}
            </p>
          </div>
          <p className="text-3xl font-bold text-brand-600">{stats.progress}%</p>
        </div>
        <ProgressBar value={stats.currentDay} max={stats.totalDays} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: Flame, label: "Current Streak", value: `${stats.streak}d` },
          { icon: Flame, label: "Longest Streak", value: `${stats.longestStreak}d` },
          { icon: Clock, label: "Total Hours", value: stats.totalHours },
          { icon: BookOpen, label: "Entries", value: entries.length },
          { icon: Layers, label: "Active Days", value: activeDays },
          { icon: Bookmark, label: "Bookmarks", value: bookmarks?.length || 0 },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-4 text-center">
            <Icon className="w-5 h-5 text-brand-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Heat-map calendar */}
      <div className="card p-5 overflow-x-auto">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Learning Activity Calendar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              GitHub-style heat-map — darker = more study hours that day
            </p>
          </div>
          {hover && (
            <div className="text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 rounded-lg shadow">
              <span className="font-medium">{hover.label}</span>
              {" · "}
              {hover.count} entr{hover.count === 1 ? "y" : "ies"} · {hover.hours}h
            </div>
          )}
        </div>

        <div className="flex gap-3 min-w-max">
          {/* Weekday labels */}
          <div className="flex flex-col gap-1 pt-5 text-[9px] text-slate-400 pr-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="h-3.5 flex items-center">
                {i % 2 === 1 ? d : ""}
              </div>
            ))}
          </div>

          <div>
            <div className="flex gap-1 mb-1">
              {monthLabels.map((m, i) => (
                <div
                  key={i}
                  className="w-3.5 text-[9px] text-slate-400 text-left"
                  style={{ width: 14 }}
                >
                  {m}
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.label}: ${day.hours || 0}h`}
                      onMouseEnter={() => !day.future && setHover(day)}
                      onMouseLeave={() => setHover(null)}
                      className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-default ${level(
                        day.hours,
                        day.future
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400">
          <span>Less</span>
          <div className="w-3.5 h-3.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <div className="w-3.5 h-3.5 rounded-sm bg-emerald-200 dark:bg-emerald-900/60" />
          <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400" />
          <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500" />
          <div className="w-3.5 h-3.5 rounded-sm bg-emerald-600" />
          <span>More</span>
          <span className="ml-auto text-slate-500">
            {activeDays} day{activeDays === 1 ? "" : "s"} with activity
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
            Study Hours – Last 7 Days
          </h3>
          <p className="text-xs text-slate-400 mb-4">Avg {avgDaily}h per entry</p>
          <div className="flex items-end justify-between gap-2 h-36">
            {stats.last7.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {d.hours || ""}
                </span>
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    className="w-full max-w-[32px] bg-brand-500 rounded-t-lg"
                    style={{
                      height: `${Math.max(6, (d.hours / maxHours) * 100)}%`,
                      opacity: d.hours ? 1 : 0.15,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Topics by Category
          </h3>
          <div className="space-y-3">
            {byCategory.length === 0 && (
              <p className="text-sm text-slate-400">
                Load topics from the Roadmap to see categories here.
              </p>
            )}
            {byCategory.map(([cat, count]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-300">{cat}</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {count}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${(count / maxCat) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
