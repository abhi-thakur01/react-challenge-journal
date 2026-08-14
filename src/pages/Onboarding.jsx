import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

const STEPS = 6;

export default function Onboarding() {
  const { updateChallenge, importAllData, markOnboardingDone } = useApp();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    userName: "",
    challengeType: "HTML + CSS + Bootstrap + Tailwind + JS + React",
    totalDays: 126,
    startDate: new Date().toISOString().slice(0, 10),
    dailyStudyGoal: 2,
    dailyMinutes: 0,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const finish = (skip = false) => {
    if (!skip) {
      const name =
        form.challengeType === "Custom"
          ? "My Learning Challenge"
          : `${form.totalDays} Days ${form.challengeType} Challenge`;
      updateChallenge({
        userName: form.userName.trim() || "Learner",
        name,
        totalDays: Number(form.totalDays) || 90,
        startDate: form.startDate,
        dailyStudyGoal: Number(form.dailyStudyGoal) || 2,
        challengeType: form.challengeType,
        manualDay: null,
      });
    }
    markOnboardingDone();
    success(skip ? "You can finish setup anytime in Settings" : "Your challenge is ready — let's learn!");
    navigate("/");
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      importAllData(data);
      markOnboardingDone();
      success("Backup imported successfully");
      navigate("/");
    } catch {
      error("Invalid backup file");
    }
  };

  const next = () => {
    if (step === 2 && !form.userName.trim()) {
      error("Please enter your name");
      return;
    }
    if (step < STEPS) setStep((s) => s + 1);
    else finish(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i + 1 <= step ? "bg-brand-500" : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>

        <div className="card p-6 sm:p-8">
          {step === 1 && (
            <div className="text-center space-y-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Let's set up your learning journey
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                This is your personal learning system — plan, study, journal, and track progress.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                What should we call you?
              </h2>
              <input
                className="input"
                placeholder="e.g. Abhishek"
                value={form.userName}
                onChange={(e) => set("userName", e.target.value)}
                autoFocus
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                What are you learning?
              </h2>
              <div className="grid gap-2">
                {["HTML + CSS + Bootstrap + Tailwind + JS + React", "React", "JavaScript", "Custom"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("challengeType", t)}
                    className={`px-4 py-3 rounded-xl border text-left text-sm font-medium ${
                      form.challengeType === t
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {t === "Custom" ? "Custom Challenge" : `${t}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                How long is your challenge?
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 90, 126].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set("totalDays", d)}
                    className={`py-4 rounded-xl border text-sm font-semibold ${
                      form.totalDays === d
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-500/15 text-brand-700"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Start date and daily goal
              </h2>
              <div>
                <label className="label">Start date</label>
                <input
                  type="date"
                  className="input"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Daily study goal (hours)</label>
                <input
                  type="number"
                  min={0.5}
                  max={12}
                  step={0.5}
                  className="input"
                  value={form.dailyStudyGoal}
                  onChange={(e) => set("dailyStudyGoal", e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-400">
                Your current day is calculated automatically from the start date.
              </p>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Do you already have journal data?
              </h2>
              <p className="text-sm text-slate-500">
                Import a backup if you have one, or start fresh.
              </p>
              <label className="btn-secondary w-full justify-center cursor-pointer">
                Import JSON backup
                <input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
              <button type="button" onClick={() => finish(false)} className="btn-primary w-full">
                Start fresh
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 gap-3">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-ghost">
                Back
              </button>
            ) : (
              <button type="button" onClick={() => finish(true)} className="btn-ghost text-sm">
                Skip for now
              </button>
            )}
            {step < STEPS && (
              <button type="button" onClick={next} className="btn-primary">
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
