import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

const empty = {
  weekLabel: "",
  wentWell: "",
  learned: "",
  difficult: "",
  improve: "",
  achievement: "",
  blocker: "",
  nextPlan: "",
};

export default function ReflectionsPage() {
  const { reflections, addReflection, deleteReflection } = useApp();
  const { success } = useToast();
  const [form, setForm] = useState(empty);
  const [deleteId, setDeleteId] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.wentWell.trim() && !form.learned.trim()) {
      return;
    }
    addReflection({
      ...form,
      weekLabel:
        form.weekLabel ||
        `Week of ${new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })}`,
    });
    setForm(empty);
    success("Weekly reflection saved");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="section-title mb-1">Weekly Review</h1>
      <p className="section-sub mb-6">Reflect, improve, plan next week</p>

      <form onSubmit={submit} className="card p-5 mb-8 space-y-3">
        <input
          className="input"
          placeholder="Week label e.g. Week 3 — Hooks"
          value={form.weekLabel}
          onChange={(e) => set("weekLabel", e.target.value)}
        />
        {[
          ["wentWell", "What went well?"],
          ["learned", "What did I learn?"],
          ["difficult", "What was difficult?"],
          ["improve", "What needs improvement?"],
          ["achievement", "Biggest achievement"],
          ["blocker", "Biggest blocker"],
          ["nextPlan", "Next week's plan"],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="label">{label}</label>
            <textarea
              className="input min-h-[70px]"
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
            />
          </div>
        ))}
        <button type="submit" className="btn-primary">
          Save reflection
        </button>
      </form>

      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
        Previous reflections
      </h2>
      {reflections.length === 0 ? (
        <p className="text-slate-400 text-sm">None yet.</p>
      ) : (
        <div className="space-y-3">
          {reflections.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {r.weekLabel || "Reflection"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString("en-IN")
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteId(r.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {r.achievement && (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Win:</span> {r.achievement}
                </p>
              )}
              {r.learned && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {r.learned}
                </p>
              )}
              {r.nextPlan && (
                <p className="text-xs text-brand-600 mt-1">
                  Next: {r.nextPlan}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Delete reflection?"
        message="This weekly review will be removed."
        danger
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          deleteReflection(deleteId);
          setDeleteId(null);
          success("Reflection deleted");
        }}
      />
    </div>
  );
}
