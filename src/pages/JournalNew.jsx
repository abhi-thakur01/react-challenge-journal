import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import ImageUpload from "../components/ImageUpload";

const empty = {
  day: "",
  date: new Date().toISOString().slice(0, 10),
  title: "",
  category: "React",
  mood: "Good",
  energy: 3,
  goal: "",
  learned: "",
  practiced: "",
  project: "",
  built: "",
  problems: "",
  stuck: "",
  solution: "",
  takeaways: "",
  improvements: "",
  tomorrowGoal: "",
  notes: "",
  codeSnippet: "",
  githubLink: "",
  resourceLinks: "",
  studyTime: 1,
  difficulty: "Medium",
  rating: 4,
  tags: "",
  image: "",
};

const CATEGORIES = [
  "React",
  "JavaScript",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Hooks",
  "Firebase",
  "API",
  "Git & GitHub",
  "Other",
];

const MOODS = ["Great", "Good", "Okay", "Difficult", "Bad"];

// Outside component — no remount on keystroke
function Field({ label, children, hint }) {
  return (
    <div className="mb-4">
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function JournalNew() {
  const navigate = useNavigate();
  const { addEntry, stats } = useApp();
  const { success, error } = useToast();

  const [form, setForm] = useState({
    ...empty,
    day: Math.min(stats.totalDays, Math.max(1, stats.currentDay)),
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e, asDraft = false) => {
    e.preventDefault();
    if (!form.title.trim() || !form.learned.trim()) {
      error("Title and “What I learned” are required.");
      return;
    }
    addEntry({
      ...form,
      day: Number(form.day) || stats.currentDay,
      studyTime: Number(form.studyTime) || 1,
      rating: Number(form.rating) || 3,
      energy: Number(form.energy) || 3,
      tags: String(form.tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: asDraft ? "draft" : "completed",
    });
    success(asDraft ? "Draft saved" : "Journal entry saved");
    navigate("/journal");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/journal" className="btn-ghost text-sm">
          <ArrowLeft className="w-4 h-4" /> Cancel
        </Link>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          New Journal Entry
        </p>
        <button type="button" onClick={(e) => handleSubmit(e)} className="btn-primary text-sm py-2">
          <Save className="w-4 h-4" /> Save
        </button>
      </header>

      <form onSubmit={(e) => handleSubmit(e)} className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Day (auto)" hint="Challenge day from start date">
            <input
              type="number"
              className="input bg-slate-50 dark:bg-slate-800/50"
              value={form.day}
              readOnly
              title="Change only in Settings → Advanced"
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Title *">
          <input
            className="input"
            placeholder="e.g. useEffect cleanup"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select
              className="input"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Mood">
            <select
              className="input"
              value={form.mood}
              onChange={(e) => set("mood", e.target.value)}
            >
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Energy (1–5)">
            <select
              className="input"
              value={form.energy}
              onChange={(e) => set("energy", e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Difficulty">
            <select
              className="input"
              value={form.difficulty}
              onChange={(e) => set("difficulty", e.target.value)}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </Field>
          <Field label="Time (hrs)">
            <input
              type="number"
              step="0.25"
              min="0"
              className="input"
              value={form.studyTime}
              onChange={(e) => set("studyTime", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Today's goal">
          <textarea
            className="input min-h-[64px]"
            value={form.goal}
            onChange={(e) => set("goal", e.target.value)}
          />
        </Field>

        <Field label="What I learned *">
          <textarea
            className="input min-h-[110px]"
            value={form.learned}
            onChange={(e) => set("learned", e.target.value)}
            required
          />
        </Field>

        <Field label="What I built / practiced">
          <textarea
            className="input min-h-[80px]"
            value={form.built || form.practiced}
            onChange={(e) => {
              set("built", e.target.value);
              set("practiced", e.target.value);
            }}
          />
        </Field>

        <Field label="What I struggled with">
          <textarea
            className="input min-h-[70px]"
            value={form.problems}
            onChange={(e) => set("problems", e.target.value)}
          />
        </Field>

        <Field label="Where I got stuck">
          <textarea
            className="input min-h-[64px]"
            value={form.stuck}
            onChange={(e) => set("stuck", e.target.value)}
          />
        </Field>

        <Field label="How I solved it">
          <textarea
            className="input min-h-[70px]"
            value={form.solution}
            onChange={(e) => set("solution", e.target.value)}
          />
        </Field>

        <Field label="Tomorrow's plan">
          <textarea
            className="input min-h-[64px]"
            value={form.tomorrowGoal}
            onChange={(e) => set("tomorrowGoal", e.target.value)}
          />
        </Field>

        <Field label="Notes">
          <textarea
            className="input min-h-[70px]"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>

        <Field label="Code snippet" hint="Paste code — plain text">
          <textarea
            className="input min-h-[100px] font-mono text-xs"
            value={form.codeSnippet}
            onChange={(e) => set("codeSnippet", e.target.value)}
            placeholder="// your code..."
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="GitHub / commit link">
            <input
              className="input"
              placeholder="https://github.com/..."
              value={form.githubLink}
              onChange={(e) => set("githubLink", e.target.value)}
            />
          </Field>
          <Field label="Resources / links">
            <input
              className="input"
              placeholder="docs, articles..."
              value={form.resourceLinks}
              onChange={(e) => set("resourceLinks", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Tags (comma separated)">
          <input
            className="input"
            placeholder="React, Hooks, useEffect"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
          />
        </Field>

        <Field label="Rating (1–5)">
          <select
            className="input"
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>

        <ImageUpload
          value={form.image}
          onChange={(v) => set("image", v)}
          label="Screenshot (optional)"
        />

        <div className="flex flex-wrap gap-3 pt-4 pb-10">
          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4" /> Save Entry
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, true)} className="btn-secondary">
            Save as Draft
          </button>
          <Link to="/journal" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
