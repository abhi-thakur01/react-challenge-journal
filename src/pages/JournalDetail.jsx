import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Pencil,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Stars from "../components/Stars";
import ImageUpload from "../components/ImageUpload";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  );
}

// Stable — outside component so inputs never remount on keystroke
function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

const CATEGORIES = [
  "React",
  "JavaScript",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Git & GitHub",
  "APIs",
  "Other",
];

function entryToForm(entry) {
  return {
    day: entry.day ?? "",
    date: entry.date ?? "",
    title: entry.title ?? "",
    category: entry.category ?? "React",
    goal: entry.goal ?? "",
    learned: entry.learned ?? "",
    practiced: entry.practiced ?? "",
    project: entry.project ?? "",
    problems: entry.problems ?? "",
    solution: entry.solution ?? "",
    takeaways: entry.takeaways ?? "",
    improvements: entry.improvements ?? "",
    tomorrowGoal: entry.tomorrowGoal ?? "",
    studyTime: entry.studyTime ?? 1,
    difficulty: entry.difficulty ?? "Medium",
    rating: entry.rating ?? 4,
    tags: Array.isArray(entry.tags) ? entry.tags.join(", ") : entry.tags || "",
    image: entry.image || "",
  };
}

export default function JournalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEntry, updateEntry, deleteEntry, entries, stats } = useApp();
  const entry = getEntry(id);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  // Sync form when entry loads / changes (not while typing)
  useEffect(() => {
    if (entry && !editing) {
      setForm(entryToForm(entry));
    }
  }, [entry, editing]);

  if (!entry) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Entry not found.</p>
        <Link to="/journal" className="btn-primary">
          Back to Journal
        </Link>
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => a.day - b.day);
  const idx = sorted.findIndex((e) => e.id === entry.id);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const startEdit = () => {
    setForm(entryToForm(entry));
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm(entryToForm(entry));
    setEditing(false);
  };

  const saveChanges = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.learned.trim()) {
      alert("Title and “What I learned” are required.");
      return;
    }
    updateEntry(entry.id, {
      day: Number(form.day) || entry.day,
      date: form.date,
      title: form.title.trim(),
      category: form.category,
      goal: form.goal,
      learned: form.learned,
      practiced: form.practiced,
      project: form.project,
      problems: form.problems,
      solution: form.solution,
      takeaways: form.takeaways,
      improvements: form.improvements,
      tomorrowGoal: form.tomorrowGoal,
      studyTime: Number(form.studyTime) || 0,
      difficulty: form.difficulty,
      rating: Number(form.rating) || 3,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image: form.image || "",
    });
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Delete this journal entry?")) {
      deleteEntry(entry.id);
      navigate("/journal");
    }
  };

  // ——— EDIT MODE ———
  if (editing && form) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <button type="button" onClick={cancelEdit} className="btn-ghost text-sm">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Edit Entry</p>
          <button type="button" onClick={saveChanges} className="btn-primary text-sm py-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>

        <form onSubmit={saveChanges}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Day">
              <input
                type="number"
                className="input"
                value={form.day}
                onChange={(e) => set("day", e.target.value)}
                min={1}
                max={stats.totalDays}
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

          <Field label="Topic / Title *">
            <input
              className="input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </Field>

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

          <Field label="Today's Goal">
            <textarea
              className="input min-h-[70px]"
              value={form.goal}
              onChange={(e) => set("goal", e.target.value)}
            />
          </Field>

          <Field label="What Did I Learn? *">
            <textarea
              className="input min-h-[120px]"
              value={form.learned}
              onChange={(e) => set("learned", e.target.value)}
              required
            />
          </Field>

          <Field label="What Did I Practice?">
            <textarea
              className="input min-h-[80px]"
              value={form.practiced}
              onChange={(e) => set("practiced", e.target.value)}
            />
          </Field>

          <Field label="Project / Task">
            <input
              className="input"
              value={form.project}
              onChange={(e) => set("project", e.target.value)}
            />
          </Field>

          <Field label="Problems I Faced">
            <textarea
              className="input min-h-[80px]"
              value={form.problems}
              onChange={(e) => set("problems", e.target.value)}
            />
          </Field>

          <Field label="How Did I Solve Them?">
            <textarea
              className="input min-h-[80px]"
              value={form.solution}
              onChange={(e) => set("solution", e.target.value)}
            />
          </Field>

          <Field label="Key Takeaways">
            <textarea
              className="input min-h-[80px]"
              value={form.takeaways}
              onChange={(e) => set("takeaways", e.target.value)}
            />
          </Field>

          <Field label="What I Need To Improve">
            <textarea
              className="input min-h-[70px]"
              value={form.improvements}
              onChange={(e) => set("improvements", e.target.value)}
            />
          </Field>

          <Field label="Tomorrow's Goal">
            <textarea
              className="input min-h-[70px]"
              value={form.tomorrowGoal}
              onChange={(e) => set("tomorrowGoal", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Study Time (hrs)">
              <input
                type="number"
                step="0.5"
                min="0"
                className="input"
                value={form.studyTime}
                onChange={(e) => set("studyTime", e.target.value)}
              />
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
            <Field label="Rating (1–5)">
              <select
                className="input"
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Tags (comma separated)">
            <input
              className="input"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="React, Hooks, useMemo"
            />
          </Field>

          <ImageUpload
            value={form.image}
            onChange={(v) => set("image", v)}
            label="Screenshot / Image"
          />

          <div className="flex flex-wrap gap-3 pt-4 pb-6">
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4" /> Save Changes
            </button>
            <button type="button" onClick={cancelEdit} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ——— READ-ONLY VIEW ———
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/journal" className="btn-ghost text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={startEdit} className="btn-ghost text-sm text-brand-600 hover:bg-brand-50">
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <p className="text-brand-600 font-semibold text-sm mb-1">DAY {entry.day}</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{entry.title}</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{formatDate(entry.date)}</p>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-2">
        <span>{entry.studyTime}h study</span>
        <span>·</span>
        <span>{entry.difficulty}</span>
        <span>·</span>
        <Stars rating={entry.rating} />
        {entry.category && <span className="tag ml-1">{entry.category}</span>}
      </div>

      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-8">
          {entry.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}

      {entry.image && (
        <img
          src={entry.image}
          alt=""
          className="w-full max-h-64 object-cover rounded-2xl mb-6 border border-slate-100 dark:border-slate-700"
        />
      )}

      <div className="card p-6 sm:p-8">
        <Section title="Today's Goal">{entry.goal}</Section>
        <Section title="What I Learned">{entry.learned}</Section>
        <Section title="What I Practiced">{entry.practiced}</Section>
        {entry.project && <Section title="Project / Task">{entry.project}</Section>}
        <Section title="Problems I Faced">{entry.problems}</Section>
        <Section title="How I Solved Them">{entry.solution}</Section>
        <Section title="Key Takeaways">{entry.takeaways}</Section>
        <Section title="What I Need To Improve">{entry.improvements}</Section>
        <Section title="Tomorrow's Goal">{entry.tomorrowGoal}</Section>
      </div>

      <div className="flex justify-between mt-8">
        {prev ? (
          <Link to={`/journal/${prev.id}`} className="btn-secondary text-sm">
            <ChevronLeft className="w-4 h-4" /> Day {prev.day}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/journal/${next.id}`} className="btn-secondary text-sm">
            Day {next.day} <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
