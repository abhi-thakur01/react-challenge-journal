import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  BookOpen,
  FolderKanban,
  Clock,
  Layers,
  Plus,
  ArrowRight,
  Target,
  MessageSquareQuote,
  Pencil,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Stars from "../components/Stars";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const { challenge, updateChallenge, stats, todayEntry, entries } = useApp();
  const recent = entries.slice(0, 5);
  const maxHours = Math.max(...stats.last7.map((d) => d.hours), 1);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const openEdit = () => {
    setForm({
      name: challenge.name || "",
      totalDays: challenge.totalDays || 90,
      startDate: challenge.startDate || new Date().toISOString().slice(0, 10),
      manualDay: challenge.manualDay ?? "",
      dailyStudyGoal: challenge.dailyStudyGoal ?? 2,
      description: challenge.description || "",
      userName: challenge.userName || "",
    });
    setEditing(true);
  };

  const saveChallenge = (e) => {
    e.preventDefault();
    const totalDays = Math.max(1, Number(form.totalDays) || 90);
    let manualDay = form.manualDay;
    if (manualDay === "" || manualDay === null || manualDay === undefined) {
      manualDay = null; // auto mode
    } else {
      manualDay = Math.min(totalDays, Math.max(1, Number(manualDay) || 1));
    }
    updateChallenge({
      name: form.name.trim() || "My Challenge",
      totalDays,
      startDate: form.startDate,
      manualDay,
      dailyStudyGoal: Number(form.dailyStudyGoal) || 0,
      description: form.description,
      userName: form.userName.trim() || "Learner",
    });
    setEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {greeting()}, {challenge.userName || "Learner"} 👋
        </h1>
        <p className="section-sub">Keep learning. Keep building. Keep improving.</p>
      </div>

      {/* Challenge banner */}
      <div className="card p-5 sm:p-6 bg-gradient-to-br from-brand-500 to-brand-600 text-white border-0 relative">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-brand-100 text-sm font-medium">{challenge.name}</p>
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 text-xs font-medium bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-lg transition"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Challenge
          </button>
        </div>
        {challenge.description && (
          <p className="text-brand-100/80 text-xs mb-3 line-clamp-2">{challenge.description}</p>
        )}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-3xl font-bold">
              Day {stats.currentDay}
              <span className="text-brand-200 text-xl font-medium">
                {" "}
                / {stats.totalDays}
              </span>
            </p>
            <p className="text-brand-100 text-sm mt-1">
              {stats.daysRemaining} days remaining
              {challenge.manualDay == null && (
                <span className="opacity-70"> · auto from start date</span>
              )}
            </p>
          </div>
          <p className="text-4xl font-bold opacity-90">{stats.progress}%</p>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
        {challenge.dailyStudyGoal > 0 && (
          <p className="text-brand-100 text-xs mt-3">
            Daily study goal: {challenge.dailyStudyGoal}h · Streak {stats.streak}d ·{" "}
            {stats.totalHours}h total
          </p>
        )}
      </div>

      {/* Today's Focus */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
          Today&apos;s Focus
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {todayEntry
            ? `Journal done: ${todayEntry.title}`
            : "No journal entry for today yet — start with a short study session."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to="/journal/new" className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Journal
          </Link>
          <Link to="/pomodoro" className="btn-secondary text-sm">
            Pomodoro
          </Link>
          <Link to="/roadmap" className="btn-ghost text-sm">
            Roadmap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Edit Challenge Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white">Edit Challenge</h2>
              <button
                onClick={() => setEditing(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveChallenge} className="p-5 space-y-4">
              <div>
                <label className="label">Your Name</label>
                <input
                  className="input"
                  value={form.userName}
                  onChange={(e) => setForm({ ...form, userName: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Challenge Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[70px]"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this challenge about?"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Total Days</label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={form.totalDays}
                    onChange={(e) => setForm({ ...form, totalDays: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Daily Study Goal (hrs)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    className="input"
                    value={form.dailyStudyGoal}
                    onChange={(e) => setForm({ ...form, dailyStudyGoal: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  className="input"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Current day auto-calculates from this date (Day 1 = start date).
                </p>
              </div>
              <div>
                <label className="label">Current Day (optional override)</label>
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={form.manualDay}
                  onChange={(e) => setForm({ ...form, manualDay: e.target.value })}
                  placeholder="Leave empty for auto"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Empty = auto from start date + journal progress. Set a number to lock the day manually.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Save Challenge
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            icon: Flame,
            label: "Streak",
            value: `${stats.streak}d`,
            color: "text-orange-500 bg-orange-50",
          },
          {
            icon: Flame,
            label: "Longest",
            value: `${stats.longestStreak}d`,
            color: "text-amber-500 bg-amber-50",
          },
          {
            icon: Layers,
            label: "Topics",
            value: stats.topicsCount,
            color: "text-brand-500 bg-brand-50",
          },
          {
            icon: FolderKanban,
            label: "Projects",
            value: stats.completedProjects,
            color: "text-emerald-500 bg-emerald-50",
          },
          {
            icon: Clock,
            label: "Hours",
            value: stats.totalHours,
            color: "text-sky-500 bg-sky-50",
          },
          {
            icon: BookOpen,
            label: "Entries",
            value: entries.length,
            color: "text-violet-500 bg-violet-50",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Learning */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white">Today's Learning</h2>
              <Link
                to="/journal/new"
                className="text-sm text-brand-600 font-medium hover:text-brand-700"
              >
                + Add
              </Link>
            </div>
            {todayEntry ? (
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-1">Day {todayEntry.day}</p>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{todayEntry.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{todayEntry.learned}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{todayEntry.studyTime}h study</span>
                  <span>·</span>
                  <span>{todayEntry.difficulty}</span>
                  <span>·</span>
                  <Stars rating={todayEntry.rating} />
                </div>
                <Link
                  to={`/journal/${todayEntry.id}`}
                  className="inline-flex items-center gap-1 mt-4 text-sm text-brand-600 font-medium"
                >
                  View Today's Journal <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-500 dark:text-slate-400 mb-3">
                  No entry for today yet. Start Day {stats.currentDay}.
                </p>
                <Link to="/journal/new" className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Add Today's Learning
                </Link>
              </div>
            )}
          </div>

          {/* Recent entries */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900 dark:text-white">Recent Journal Entries</h2>
              <Link
                to="/journal"
                className="text-sm text-brand-600 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="card p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                Your journal is empty. Write your first entry to begin the challenge.
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((e) => (
                  <Link
                    key={e.id}
                    to={`/journal/${e.id}`}
                    className="card p-4 block hover:border-brand-200 dark:hover:border-brand-500/40 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-0.5">
                          Day {e.day} · {formatDate(e.date)}
                        </p>
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{e.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {e.learned}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {e.tags?.slice(0, 3).map((t) => (
                            <span key={t} className="tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-brand-600 font-medium shrink-0">View</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="card p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3">
              <Flame className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.streak}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Day Streak 🔥</p>
            {stats.streak === 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-2">Write daily to build a streak</p>
            )}
          </div>


          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Activity (4 weeks)</h3>
              <Link to="/progress" className="text-xs text-brand-600 font-medium">Full calendar →</Link>
            </div>
            <div className="flex gap-1 justify-between">
              {Array.from({ length: 28 }, (_, i) => {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() - (27 - i));
                const ds = d.toISOString().slice(0, 10);
                const has = stats.activeDates?.has?.(ds);
                return (
                  <div
                    key={ds}
                    title={ds}
                    className={`flex-1 h-3 rounded-sm ${
                      has
                        ? "bg-emerald-500"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Study Hours (7 days)</h3>
            <div className="flex items-end justify-between gap-1.5 h-28">
              {stats.last7.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center h-20">
                    <div
                      className="w-full max-w-[28px] bg-brand-500 rounded-t-md transition-all"
                      style={{
                        height: `${Math.max(4, (d.hours / maxHours) * 100)}%`,
                        opacity: d.hours ? 1 : 0.2,
                      }}
                      title={`${d.hours}h`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1 mb-1">
              Quick Actions
            </p>
            <Link to="/journal/new" className="btn-primary w-full justify-start">
              <Plus className="w-4 h-4" /> Add Journal Entry
            </Link>
            <Link to="/projects" className="btn-secondary w-full justify-start">
              <FolderKanban className="w-4 h-4" /> Add Project
            </Link>
            <Link to="/topics" className="btn-secondary w-full justify-start">
              <Layers className="w-4 h-4" /> Add Topic
            </Link>
            <Link to="/pomodoro" className="btn-secondary w-full justify-start">
              Pomodoro Timer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
