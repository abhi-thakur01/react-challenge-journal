import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Pencil, Check, X, Bell, BellRing } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

const STORAGE_KEY = "rcj-pomodoro-times";
const DEFAULTS = { focus: 25, short: 5, long: 15 };

const MODE_LABEL = {
  focus: "Focus mode",
  short: "Short break",
  long: "Long break",
};

function loadTimes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        focus: clamp(parsed.focus, 1, 180),
        short: clamp(parsed.short, 1, 60),
        long: clamp(parsed.long, 1, 60),
      };
    }
  } catch {}
  return { ...DEFAULTS };
}

function clamp(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, Math.round(v)));
}

function playAlarm() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const freqs = [880, 1046, 880];
    freqs.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.value = 0.06;
      const start = ctx.currentTime + i * 0.28;
      o.start(start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      o.stop(start + 0.26);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {}
}

function flashTitle(message) {
  const original = document.title;
  let n = 0;
  const id = setInterval(() => {
    document.title = n % 2 === 0 ? message : original;
    n += 1;
    if (n > 8) {
      clearInterval(id);
      document.title = original;
    }
  }, 600);
}

export default function PomodoroPage() {
  const { addEntry, stats, challenge } = useApp();
  const { success } = useToast();
  const [times, setTimes] = useState(loadTimes);
  const [preset, setPreset] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(() => loadTimes().focus * 60);
  const [running, setRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);
  const [totalFocusSec, setTotalFocusSec] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...DEFAULTS });
  const [doneBanner, setDoneBanner] = useState(null); // { mode, label }
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const tickRef = useRef(null);
  const presetRef = useRef(preset);
  presetRef.current = preset;

  const modeMinutes = times[preset] || 25;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(times));
  }, [times]);

  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tickRef.current);
          setRunning(false);
          // use ref so we get latest mode
          handleComplete(presetRef.current);
          return 0;
        }
        return s - 1;
      });
      if (presetRef.current === "focus") {
        setTotalFocusSec((t) => t + 1);
      }
    }, 1000);
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const handleComplete = (mode) => {
    const label = MODE_LABEL[mode] || mode;
    setDoneBanner({ mode, label });
    playAlarm();
    flashTitle(`⏰ ${label} finished!`);

    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(`${label} finished`, {
          body:
            mode === "focus"
              ? "Focus session complete. Take a short break or start another focus block."
              : "Break finished — start focus mode when you are ready.",
          icon: "/icon-192.png",
          tag: "pomodoro-done",
          requireInteraction: true,
        });
      }
    } catch {}

    if (mode === "focus") setCompletedFocus((c) => c + 1);
    success(`${label} has finished`);
  };

  const requestNotif = async () => {
    if (typeof Notification === "undefined") return;
    try {
      const p = await Notification.requestPermission();
      setNotifPermission(p);
      if (p === "granted") success("Notifications on");
    } catch {}
  };

  const selectPreset = (id) => {
    setRunning(false);
    setDoneBanner(null);
    setPreset(id);
    setSecondsLeft((times[id] || 25) * 60);
  };

  const reset = () => {
    setRunning(false);
    setDoneBanner(null);
    setSecondsLeft(modeMinutes * 60);
  };

  const openEdit = () => {
    setEditForm({ ...times });
    setEditing(true);
    setRunning(false);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    const next = {
      focus: clamp(editForm.focus, 1, 180),
      short: clamp(editForm.short, 1, 60),
      long: clamp(editForm.long, 1, 60),
    };
    setTimes(next);
    setSecondsLeft(next[preset] * 60);
    setEditing(false);
  };

  const dismissDone = () => setDoneBanner(null);

  const startNext = (nextMode) => {
    setDoneBanner(null);
    setPreset(nextMode);
    setSecondsLeft((times[nextMode] || 25) * 60);
    setRunning(true);
  };

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const pct =
    modeMinutes > 0
      ? Math.round(((modeMinutes * 60 - secondsLeft) / (modeMinutes * 60)) * 100)
      : 0;

  const logSession = () => {
    const hours = Math.round((totalFocusSec / 3600) * 100) / 100;
    if (hours < 0.05) {
      success("Log a bit more focus time before saving to the journal.");
      return;
    }
    addEntry({
      day: stats.currentDay || 1,
      date: new Date().toISOString().slice(0, 10),
      title: `Pomodoro session — ${completedFocus} focus blocks`,
      category: "Practice",
      goal: "Deep work with Pomodoro",
      learned: `Focused study using Pomodoro (${completedFocus} sessions, ${times.focus} min blocks).`,
      practiced: challenge?.name || "React challenge",
      studyTime: hours,
      difficulty: "Medium",
      rating: 4,
      tags: ["pomodoro", "focus"],
    });
    success(`Logged to journal: ${hours}h log ho gaya`);
    setTotalFocusSec(0);
    setCompletedFocus(0);
  };

  const presets = [
    { id: "focus", label: "Focus", mins: times.focus },
    { id: "short", label: "Short break", mins: times.short },
    { id: "long", label: "Long break", mins: times.long },
  ];

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="section-title mb-1">Pomodoro Timer</h1>
          <p className="section-sub">
            Now: <span className="font-medium text-slate-700 dark:text-slate-200">{MODE_LABEL[preset]}</span>
          </p>
        </div>
        <button type="button" onClick={openEdit} className="btn-secondary text-sm shrink-0">
          <Pencil className="w-4 h-4" /> Edit times
        </button>
      </div>

      {/* Enable notifications */}
      {notifPermission !== "granted" && typeof Notification !== "undefined" && (
        <button
          type="button"
          onClick={requestNotif}
          className="w-full mb-4 flex items-center gap-2 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-sm text-amber-800 dark:text-amber-200"
        >
          <Bell className="w-4 h-4 shrink-0" />
          Enable browser notifications when the timer ends
        </button>
      )}

      {editing && (
        <form onSubmit={saveEdit} className="card p-5 mb-6 space-y-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Set custom minutes</p>
          {[
            { key: "focus", label: "Focus (1–180 min)" },
            { key: "short", label: "Short break (1–60 min)" },
            { key: "long", label: "Long break (1–60 min)" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                type="number"
                min={1}
                max={key === "focus" ? 180 : 60}
                className="input"
                value={editForm[key]}
                onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary">
              <Check className="w-4 h-4" /> Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              type="button"
              className="btn-ghost text-sm ml-auto"
              onClick={() => setEditForm({ ...DEFAULTS })}
            >
              Reset defaults
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-6">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => selectPreset(p.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition ${
              preset === p.id
                ? "bg-brand-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <span className="block">{p.label}</span>
            <span className="opacity-80">{p.mins} min</span>
          </button>
        ))}
      </div>

      <div className="card p-8 text-center relative overflow-hidden">
        <div
          className="absolute bottom-0 left-0 h-1 bg-brand-500 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-2">
          {MODE_LABEL[preset]}
        </p>
        <p className="text-6xl font-bold tabular-nums text-slate-900 dark:text-white tracking-tight">
          {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </p>
        <p className="text-sm text-slate-500 mt-2">
          {running ? "Running…" : secondsLeft === 0 ? "Finished" : "Ready"} · {modeMinutes} min
        </p>

        {!running && secondsLeft > 0 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setSecondsLeft((s) => Math.max(60, s - 5 * 60))}
            >
              −5 min
            </button>
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setSecondsLeft((s) => Math.min(180 * 60, s + 5 * 60))}
            >
              +5 min
            </button>
          </div>
        )}

        <div className="flex justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setDoneBanner(null);
              setRunning((r) => !r);
            }}
            className="btn-primary px-6"
          >
            {running ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start
              </>
            )}
          </button>
          <button type="button" onClick={reset} className="btn-secondary">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedFocus}</p>
          <p className="text-xs text-slate-500">Focus sessions</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {Math.round((totalFocusSec / 60) * 10) / 10}m
          </p>
          <p className="text-xs text-slate-500">Focus time</p>
        </div>
      </div>

      <button
        type="button"
        onClick={logSession}
        className="btn-secondary w-full mt-4"
        disabled={totalFocusSec < 60}
      >
        Log focus time to journal
      </button>

      {/* Full-screen style completion banner */}
      {doneBanner && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/50">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-center animate-[slideIn_0.2s_ease-out]">
            <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <BellRing className="w-7 h-7" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 mb-1">
              Timer finished
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {doneBanner.label} finished
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {doneBanner.mode === "focus"
                ? "Great focus session. You can take a short break."
                : "Break over. Start focus mode again."}
            </p>
            <div className="flex flex-col gap-2">
              {doneBanner.mode === "focus" ? (
                <>
                  <button type="button" className="btn-primary w-full" onClick={() => startNext("short")}>
                    Start short break
                  </button>
                  <button type="button" className="btn-secondary w-full" onClick={() => startNext("focus")}>
                    Another focus session
                  </button>
                </>
              ) : (
                <button type="button" className="btn-primary w-full" onClick={() => startNext("focus")}>
                  Start focus mode
                </button>
              )}
              <button type="button" className="btn-ghost w-full" onClick={dismissDone}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
