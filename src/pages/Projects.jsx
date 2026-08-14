import { useState } from "react";
import { Plus, ExternalLink, Github, X, Pencil } from "lucide-react";
import { useApp } from "../context/AppContext";
import ImageUpload from "../components/ImageUpload";

const STATUS_COLOR = {
  Idea: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  Planning: "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "In Progress": "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Archived: "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  Planned: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const empty = {
  title: "",
  description: "",
  technologies: "",
  status: "Idea",
  startDate: "",
  endDate: "",
  targetDate: "",
  progress: 0,
  milestones: "",
  tasks: "",
  githubUrl: "",
  liveUrl: "",
  image: "",
  learnings: "",
  challenges: "",
  notes: "",
  reflection: "",
};

function projectToForm(p) {
  return {
    title: p.title || "",
    description: p.description || "",
    technologies: Array.isArray(p.technologies) ? p.technologies.join(", ") : "",
    status: p.status || "Idea",
    startDate: p.startDate || "",
    endDate: p.endDate || "",
    targetDate: p.targetDate || "",
    progress: p.progress ?? 0,
    milestones: Array.isArray(p.milestones) ? p.milestones.join("\n") : (p.milestones || ""),
    tasks: Array.isArray(p.tasks) ? p.tasks.join("\n") : (p.tasks || ""),
    githubUrl: p.githubUrl || "",
    liveUrl: p.liveUrl || "",
    image: p.image || "",
    learnings: p.learnings || "",
    challenges: p.challenges || "",
    notes: p.notes || "",
    reflection: p.reflection || "",
  };
}

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState("All");

  const list =
    filter === "All" ? projects : projects.filter((p) => p.status === filter);

  const openAdd = () => {
    setEditingId(null);
    setForm(empty);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm(projectToForm(p));
    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      ...form,
      technologies: form.technologies
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      targetDate: form.targetDate,
      progress: Number(form.progress) || 0,
      milestones: String(form.milestones || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      tasks: String(form.tasks || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      notes: form.notes,
      reflection: form.reflection,
    };
    if (editingId) {
      updateProject(editingId, payload);
    } else {
      addProject(payload);
    }
    setForm(empty);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">Projects</h1>
          <p className="section-sub">Track what you build during the challenge.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "Planned", "In Progress", "Completed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              filter === s
                ? "bg-brand-500 text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="card p-5 mb-6 space-y-3">
          <div className="flex justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {editingId ? "Edit Project" : "New Project"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <input
            className="input"
            placeholder="Project name"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="input min-h-[70px]"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="input"
            placeholder="Technologies (comma separated)"
            value={form.technologies}
            onChange={(e) => setForm({ ...form, technologies: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Planned</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <input
              type="date"
              className="input"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <input
            className="input"
            placeholder="GitHub URL"
            value={form.githubUrl}
            onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
          />
          <input
            className="input"
            placeholder="Live demo URL"
            value={form.liveUrl}
            onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
          />
          <div>
            <label className="label">Progress %</label>
            <input type="number" min={0} max={100} className="input" value={form.progress}
              onChange={(e) => setForm({ ...form, progress: e.target.value })} />
          </div>
          <div>
            <label className="label">Target date</label>
            <input type="date" className="input" value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Milestones (one per line)</label>
            <textarea className="input min-h-[70px]" value={form.milestones}
              onChange={(e) => setForm({ ...form, milestones: e.target.value })} />
          </div>
          <div>
            <label className="label">Tasks checklist (one per line)</label>
            <textarea className="input min-h-[70px]" value={form.tasks}
              onChange={(e) => setForm({ ...form, tasks: e.target.value })} />
          </div>
          <div>
            <label className="label">Project notes</label>
            <textarea className="input min-h-[60px]" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <ImageUpload
            value={form.image}
            onChange={(v) => setForm({ ...form, image: v })}
            label="Screenshot"
          />
          <textarea
            className="input min-h-[60px]"
            placeholder="What I learned"
            value={form.learnings}
            onChange={(e) => setForm({ ...form, learnings: e.target.value })}
          />
          <textarea
            className="input min-h-[60px]"
            placeholder="Challenges"
            value={form.challenges}
            onChange={(e) => setForm({ ...form, challenges: e.target.value })}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              {editingId ? "Save Changes" : "Save Project"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <div className="card p-10 text-center text-slate-500 dark:text-slate-400 text-sm">
          No projects yet. Add your first build.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {list.map((p) => (
            <div key={p.id} className="card p-5 flex flex-col">
              {p.image && (
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-36 object-cover rounded-xl mb-3"
                />
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                <select
                  className={`text-xs font-medium rounded-full px-2.5 py-0.5 border-0 cursor-pointer ${
                    STATUS_COLOR[p.status] || STATUS_COLOR.Planned
                  }`}
                  value={p.status}
                  onChange={(e) =>
                    updateProject(p.id, {
                      status: e.target.value,
                      endDate:
                        e.target.value === "Completed"
                          ? new Date().toISOString().slice(0, 10)
                          : p.endDate,
                    })
                  }
                >
                  <option>Idea</option>
                  <option>Planning</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Archived</option>
                </select>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                {p.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(p.technologies || []).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              {p.learnings && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Learned:</span>{" "}
                  {p.learnings}
                </p>
              )}
              <div className="mt-auto pt-3 flex items-center gap-3 text-sm">
                {p.githubUrl && (
                  <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-slate-800 dark:text-slate-100 dark:hover:text-white flex items-center gap-1"
                  >
                    <Github className="w-4 h-4" /> Code
                  </a>
                )}
                {p.liveUrl && (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" /> Live
                  </a>
                )}
                <button
                  onClick={() => openEdit(p)}
                  className="ml-auto text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete project?")) deleteProject(p.id);
                  }}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
