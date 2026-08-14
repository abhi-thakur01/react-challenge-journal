import { useRef, useState, useEffect } from "react";
import { Moon, Sun, Download, Upload, FileText, Pencil, Save, X, Bell } from "lucide-react";
import {
  getStreakReminderEnabled,
  setStreakReminderEnabled,
} from "../components/StreakReminder";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import { exportJournalPdf } from "../utils/exportPdf";

export default function Settings() {
  const {
    challenge,
    updateChallenge,
    stats,
    entries,
    darkMode,
    toggleDarkMode,
    getExportData,
    importAllData,
    syncStatus,
    resetOnboarding,
    projects,
    bookmarks,
  } = useApp();
  const fileRef = useRef(null);
  const { success, error } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  const [editing, setEditing] = useState(false);
  const [reminderOn, setReminderOn] = useState(() => getStreakReminderEnabled());
  const [form, setForm] = useState({
    userName: "",
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!editing) {
      setForm({
        userName: challenge.userName || "",
        name: challenge.name || "",
        description: challenge.description || "",
      });
    }
  }, [challenge, editing]);

  const startEdit = () => {
    setForm({
      userName: challenge.userName || "",
      name: challenge.name || "",
      description: challenge.description || "",
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const saveProfile = (e) => {
    e.preventDefault();
    updateChallenge({
      userName: form.userName.trim() || "Learner",
      name: form.name.trim() || "My Challenge",
      description: form.description,
    });
    setEditing(false);
  };

  const resetData = () => {
    setConfirmReset(true);
  };

  const doReset = () => {
    localStorage.removeItem("react-challenge-journal-v2");
    localStorage.removeItem("rcj-onboarded");
    setConfirmReset(false);
    success("Data cleared — reloading");
    setTimeout(() => window.location.reload(), 600);
  };

  const exportJSON = () => {
    const data = getExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `react-journal-backup-${dateStamp()}.json`);
  };

  const exportPDF = () => {
    exportJournalPdf({
      challenge,
      stats,
      entries,
      projects,
      bookmarks,
    });
  };

  const exportMarkdown = () => {
    const lines = [
      `# ${challenge.name}`,
      ``,
      `Exported: ${new Date().toLocaleString()}`,
      `Progress: Day ${stats.currentDay} / ${stats.totalDays}`,
      ``,
      `---`,
      ``,
    ];
    const sorted = [...entries].sort((a, b) => a.day - b.day);
    sorted.forEach((e) => {
      lines.push(`## Day ${e.day} — ${e.title}`);
      lines.push(`*${e.date}* · ${e.studyTime}h · ${e.difficulty || ""}`);
      if (e.tags?.length) lines.push(`Tags: ${e.tags.join(", ")}`);
      lines.push(``);
      if (e.goal) lines.push(`**Goal:** ${e.goal}`, ``);
      if (e.learned) lines.push(`**Learned:**`, e.learned, ``);
      if (e.practiced) lines.push(`**Practiced:**`, e.practiced, ``);
      if (e.problems) lines.push(`**Problems:**`, e.problems, ``);
      if (e.solution) lines.push(`**Solution:**`, e.solution, ``);
      if (e.takeaways) lines.push(`**Takeaways:**`, e.takeaways, ``);
      lines.push(`---`, ``);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    downloadBlob(blob, `react-journal-${dateStamp()}.md`);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.entries && !data.challenge && !data.projects) {
        throw new Error("Unrecognized backup file");
      }
      importAllData(data);
      success("Import successful!");
    } catch (err) {
      error("Import failed: " + (err.message || "invalid file"));
    }
    e.target.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5">
      <h1 className="section-title">Settings</h1>

      {/* Profile card — editable */}
      <div className="card p-5 sm:p-6">
        {!editing ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 flex items-center justify-center text-xl font-bold shrink-0">
              {(challenge.userName || "A")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {challenge.userName || "Learner"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {challenge.name || "My Challenge"}
              </p>
              {challenge.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {challenge.description}
                </p>
              )}
            </div>
            <button
              onClick={startEdit}
              className="btn-ghost text-sm text-brand-600 shrink-0"
              type="button"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          </div>
        ) : (
          <form onSubmit={saveProfile} className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Edit profile
              </p>
              <button type="button" onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="label">Your Name</label>
              <input
                className="input"
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                placeholder="e.g. Abhishek"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Challenge Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. 90 Days React Challenge"
              />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <textarea
                className="input min-h-[70px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What is this challenge about?"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary">
                <Save className="w-4 h-4" /> Save
              </button>
              <button type="button" onClick={cancelEdit} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Dark mode */}
      <div className="card p-5 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {darkMode ? (
            <Moon className="w-5 h-5 text-brand-400" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500" />
          )}
          <div>
            <p className="font-medium text-slate-900 dark:text-white text-sm">
              Dark mode
            </p>
            <p className="text-xs text-slate-500">{darkMode ? "On" : "Off"}</p>
          </div>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`relative w-11 h-6 rounded-full transition ${
            darkMode ? "bg-brand-500" : "bg-slate-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
              darkMode ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Streak reminder */}
      <div className="card p-5 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-brand-500" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white text-sm">
              Streak reminder
            </p>
            <p className="text-xs text-slate-500">
              Browser notification agar aaj journal na likha ho
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const next = !reminderOn;
            setReminderOn(next);
            setStreakReminderEnabled(next);
            if (next && typeof Notification !== "undefined" && Notification.permission === "denied") {
              error("Notifications blocked — allow from browser site settings.");
            }
          }}
          className={`relative w-11 h-6 rounded-full transition ${
            reminderOn ? "bg-brand-500" : "bg-slate-200 dark:bg-slate-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
              reminderOn ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Cloud sync */}
      <div className="card p-5 sm:p-6">
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          Cloud Sync (Firebase)
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          Login hone par journal, notes, bookmarks phone + laptop pe same rehte hain.
        </p>
        <p className="text-sm">
          Status:{" "}
          <span
            className={
              syncStatus === "synced"
                ? "text-green-600 dark:text-green-400 font-medium"
                : syncStatus === "syncing"
                ? "text-amber-600 font-medium"
                : syncStatus === "error"
                ? "text-red-500 font-medium"
                : "text-slate-500"
            }
          >
            {syncStatus === "synced"
              ? "Synced ✓"
              : syncStatus === "syncing"
              ? "Syncing…"
              : syncStatus === "error"
              ? "Error — check login / network"
              : "Local only (login for cloud)"}
          </span>
        </p>
      </div>

      {/* Export / Import */}
      <div className="card p-5 sm:p-6 space-y-3">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          Backup & Export
        </p>
        <button onClick={exportJSON} className="btn-secondary w-full justify-start">
          <Download className="w-4 h-4" /> Export JSON (full backup)
        </button>
        <button onClick={exportPDF} className="btn-secondary w-full justify-start">
          <FileText className="w-4 h-4" /> Export Journal as PDF
        </button>
        <button onClick={exportMarkdown} className="btn-secondary w-full justify-start">
          <FileText className="w-4 h-4" /> Export Journal as Markdown
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="btn-secondary w-full justify-start"
        >
          <Upload className="w-4 h-4" /> Import JSON backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      <div className="card divide-y divide-slate-100 dark:divide-slate-700">
        <Row label="Challenge" value={challenge.name} />
        <Row label="Start Date" value={challenge.startDate || "—"} />
        <Row label="Current Day" value={`${stats.currentDay} / ${stats.totalDays}`} />
        <Row label="Days Remaining" value={stats.daysRemaining} />
        <Row label="Progress" value={`${stats.progress}%`} />
        <Row label="Daily Study Goal" value={`${challenge.dailyStudyGoal || 0}h`} />
        <Row label="Streak" value={`${stats.streak} days`} />
        <Row label="Total Entries" value={entries.length} />
        <Row label="Total Study Hours" value={stats.totalHours} />
        <Row label="Storage" value="LocalStorage (this browser)" />
      </div>

      <div className="card p-5 sm:p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Advanced Settings
          </p>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            The current day is calculated from your start date. Override only if needed.
          </p>
        </div>
        <div>
          <label className="label mb-1.5 block">Manual day override (leave empty for automatic)</label>
          <input
            type="number"
            min={1}
            className="input"
            placeholder="Auto"
            defaultValue={challenge.manualDay ?? ""}
            id="manual-day-input"
          />
          <button
            type="button"
            className="btn-secondary mt-3 text-sm"
            onClick={() => {
              const el = document.getElementById("manual-day-input");
              const v = el?.value;
              updateChallenge({
                manualDay: v === "" || v == null ? null : Number(v),
              });
            }}
          >
            Save day override
          </button>
        </div>
        <button
          type="button"
          className="btn-ghost text-sm mt-2"
          onClick={() => {
            resetOnboarding();
            window.location.href = "/";
          }}
        >
          Run setup again
        </button>
      </div>

      <button
        onClick={resetData}
        className="mt-2 w-full py-3 rounded-xl border border-red-200 dark:border-red-900 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/40 transition"
      >
        Reset All Data
      </button>

      <p className="text-center text-xs text-slate-400 mt-8">
        React Challenge Journal v1.2 · React + Tailwind CSS · PWA
      </p>

      <ConfirmModal
        open={confirmReset}
        title="Reset all data?"
        message="This will permanently delete all journal entries, projects, and goals. This cannot be undone."
        danger
        confirmLabel="Reset everything"
        onCancel={() => setConfirmReset(false)}
        onConfirm={doReset}
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="p-4 flex justify-between text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-white text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}