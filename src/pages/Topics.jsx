import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X, Pencil, Trash2, ChevronLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import ProgressBar from "../components/ProgressBar";
import ConfirmModal from "../components/ConfirmModal";

const CATEGORIES = [
  "All",
  "HTML",
  "CSS",
  "Bootstrap",
  "Tailwind",
  "JavaScript",
  "React",
  "Tailwind CSS",
  "Git & GitHub",
  "APIs",
  "Other",
];

const PAGE_SIZE = 12;
const emptyForm = { name: "", category: "React", notes: "", progress: 0 };

export default function Topics() {
  const { topics, addTopic, updateTopic, deleteTopic, entries, loadCurriculum } =
    useApp();
  const { success } = useToast();
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmLoad, setConfirmLoad] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const detailRef = useRef(null);

  const filtered = useMemo(() => {
    if (filter === "All") return topics;
    return topics.filter(
      (t) => (t.category || "").toLowerCase() === filter.toLowerCase()
    );
  }, [topics, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const relatedEntries = selected
    ? entries.filter(
        (e) =>
          e.title?.toLowerCase().includes(selected.name.toLowerCase()) ||
          e.tags?.some((tag) =>
            tag.toLowerCase().includes(selected.name.toLowerCase())
          )
      )
    : [];

  useEffect(() => {
    if (selected && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selected?.id]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      name: t.name || "",
      category: t.category || "React",
      notes: t.notes || "",
      progress: t.progress || 0,
    });
    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      progress: Number(form.progress) || 0,
      lastStudied: new Date().toISOString().slice(0, 10),
    };
    if (editingId) {
      updateTopic(editingId, payload);
      if (selected?.id === editingId) setSelected({ ...selected, ...payload });
    } else {
      addTopic(payload);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    success(editingId ? "Topic updated" : "Topic added");
  };

  const doLoadCurriculum = () => {
    loadCurriculum({ topics: true, goals: false });
    setConfirmLoad(false);
    setPage(1);
    setSelected(null);
    success("Curriculum topics loaded into your knowledge base");
  };

  const selectTopic = (t) => {
    setSelected(t);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">Topics / Knowledge Base</h1>
          <p className="section-sub">
            Organize what you have learned. Load the course curriculum or add your own.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => setConfirmLoad(true)}
          >
            Load curriculum
          </button>
          <button type="button" className="btn-primary text-sm" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Add topic
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setFilter(c);
              setPage(1);
              setSelected(null);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filter === c
                ? "bg-brand-500 text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {c}
            {c !== "All" && (
              <span className="ml-1 opacity-70">
                (
                {
                  topics.filter(
                    (t) => (t.category || "").toLowerCase() === c.toLowerCase()
                  ).length
                }
                )
              </span>
            )}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="card p-5 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {editingId ? "Edit topic" : "New topic"}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            className="input"
            placeholder="Topic name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.filter((c) => c !== "All").map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            className="input min-h-[100px]"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div>
            <label className="label">Progress: {form.progress}%</label>
            <input
              type="range"
              min={0}
              max={100}
              className="w-full"
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary">
            Save topic
          </button>
        </form>
      )}

      {topics.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-500">
          <p className="mb-3">No topics yet.</p>
          <button type="button" className="btn-primary" onClick={() => setConfirmLoad(true)}>
            Load curriculum topics
          </button>
        </div>
      ) : (
        <>
          {/* Mobile: detail first when selected */}
          {selected && (
            <div
              ref={detailRef}
              className="lg:hidden card p-5 mb-4 scroll-mt-20"
            >
              <button
                type="button"
                className="btn-ghost text-sm mb-3 -ml-2"
                onClick={() => setSelected(null)}
              >
                <ChevronLeft className="w-4 h-4" /> Back to list
              </button>
              <TopicDetail
                selected={selected}
                relatedEntries={relatedEntries}
                onEdit={() => openEdit(selected)}
                onDelete={() => setConfirmDelete(selected.id)}
                onProgress={(progress) => {
                  updateTopic(selected.id, { progress });
                  setSelected({ ...selected, progress });
                }}
              />
            </div>
          )}

          <div className={`grid gap-4 ${selected ? "lg:grid-cols-5" : ""}`}>
            {/* List — hide on mobile when a topic is open */}
            <div className={`${selected ? "hidden lg:block lg:col-span-2" : ""} space-y-2`}>
              <p className="text-xs text-slate-400 mb-2">
                {filtered.length} topic{filtered.length === 1 ? "" : "s"}
                {filter !== "All" ? ` in ${filter}` : ""}
              </p>
              {pageItems.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTopic(t)}
                  className={`w-full text-left card p-4 transition ${
                    selected?.id === t.id
                      ? "border-brand-400 ring-1 ring-brand-400/30"
                      : "hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.category}</p>
                  {(t.progress || 0) > 0 && (
                    <div className="mt-2">
                      <ProgressBar value={t.progress} />
                    </div>
                  )}
                </button>
              ))}

              {filtered.length > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Desktop detail panel */}
            <div className="hidden lg:block lg:col-span-3">
              {selected ? (
                <div className="card p-5 sticky top-4">
                  <TopicDetail
                    selected={selected}
                    relatedEntries={relatedEntries}
                    onEdit={() => openEdit(selected)}
                    onDelete={() => setConfirmDelete(selected.id)}
                    onProgress={(progress) => {
                      updateTopic(selected.id, { progress });
                      setSelected({ ...selected, progress });
                    }}
                  />
                </div>
              ) : (
                <div className="card p-10 text-center text-sm text-slate-400">
                  Select a topic to view notes and progress
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmLoad}
        title="Load curriculum topics?"
        message="This will load (and may replace) topics from the full course curriculum into your knowledge base."
        confirmLabel="Load topics"
        onCancel={() => setConfirmLoad(false)}
        onConfirm={doLoadCurriculum}
      />
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete topic?"
        message="This topic will be removed from your knowledge base."
        danger
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          deleteTopic(confirmDelete);
          if (selected?.id === confirmDelete) setSelected(null);
          setConfirmDelete(null);
          success("Topic deleted");
        }}
      />
    </div>
  );
}

function TopicDetail({ selected, relatedEntries, onEdit, onDelete, onProgress }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-slate-900 dark:text-white text-lg leading-snug">
          {selected.name}
        </h3>
        <div className="flex gap-1 shrink-0">
          <button type="button" onClick={onEdit} className="btn-ghost p-2" title="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button type="button" onClick={onDelete} className="btn-ghost p-2 text-red-500" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-3">{selected.category}</p>
      <ProgressBar value={selected.progress || 0} max={100} label="Progress" className="mb-4" />
      <div>
        <label className="label">Update progress</label>
        <input
          type="range"
          min={0}
          max={100}
          className="w-full"
          value={selected.progress || 0}
          onChange={(e) => onProgress(Number(e.target.value))}
        />
      </div>
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
          Notes
        </p>
        <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
          {selected.notes || "No notes yet."}
        </div>
      </div>
      {relatedEntries.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Related journal entries
          </p>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {relatedEntries.slice(0, 5).map((e) => (
              <li key={e.id}>· {e.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
