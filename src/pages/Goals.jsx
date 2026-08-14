import { useState } from "react";
import { Plus, Target, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, toggleGoal, deleteGoal } = useApp();
  const { success } = useToast();
  const [period, setPeriod] = useState("weekly");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const list = goals.filter((g) => (g.period || "weekly") === period);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      description,
      target,
      period,
      progress: 0,
      done: false,
    });
    setTitle("");
    setDescription("");
    setTarget("");
    success("Goal added");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="section-title mb-1">Goals</h1>
      <p className="section-sub mb-6">Weekly & monthly learning targets</p>

      <div className="flex gap-2 mb-6">
        {["weekly", "monthly"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
              period === p
                ? "bg-brand-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="card p-5 mb-6 space-y-3">
        <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> New {period} goal
        </p>
        <input
          className="input"
          placeholder="Title e.g. Finish Hooks module"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input min-h-[70px]"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="input"
          placeholder="Target e.g. 5 topics / 10 hours"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Add Goal
        </button>
      </form>

      {list.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">
          No {period} goals yet.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((g) => (
            <div key={g.id} className="card p-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleGoal(g.id)}
                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                    g.done
                      ? "bg-brand-500 border-brand-500 text-white"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {g.done ? "✓" : ""}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm ${
                      g.done
                        ? "line-through text-slate-400"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {g.title}
                  </p>
                  {g.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>
                  )}
                  {g.target && (
                    <p className="text-xs text-brand-600 mt-1 flex items-center gap-1">
                      <Target className="w-3 h-3" /> {g.target}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={g.progress || 0}
                      onChange={(e) =>
                        updateGoal(g.id, {
                          progress: Number(e.target.value),
                          done: Number(e.target.value) >= 100,
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-slate-500 w-8">{g.progress || 0}%</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteId(g.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete goal?"
        message="This goal will be removed permanently."
        danger
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          deleteGoal(deleteId);
          setDeleteId(null);
          success("Goal deleted");
        }}
      />
    </div>
  );
}
