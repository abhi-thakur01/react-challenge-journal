import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter } from "lucide-react";
import { useApp } from "../context/AppContext";
import Stars from "../components/Stars";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Journal() {
  const { entries } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const categories = useMemo(() => {
    const s = new Set(entries.map((e) => e.category).filter(Boolean));
    return ["All", ...s];
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        e.title?.toLowerCase().includes(q) ||
        e.learned?.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q));
      const matchCat = category === "All" || e.category === category;
      const matchDiff = difficulty === "All" || e.difficulty === difficulty;
      return matchSearch && matchCat && matchDiff;
    });
  }, [entries, search, category, difficulty]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">Daily Learning Journal</h1>
          <p className="section-sub">Document what you learn every day.</p>
        </div>
        <Link to="/journal/new" className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          Add Today's Learning
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search entries, topics, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-40"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All topics" : c}
            </option>
          ))}
        </select>
        <select
          className="input sm:w-36"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          {["All", "Easy", "Medium", "Hard"].map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "Difficulty" : d}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">No entries found.</p>
          <Link to="/journal/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Write first entry
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <Link
              key={e.id}
              to={`/journal/${e.id}`}
              className="card p-5 block hover:border-brand-200 transition group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 mb-1">
                    Day {e.day} — {formatDate(e.date)}
                    {e.category && (
                      <span className="ml-2 tag">{e.category}</span>
                    )}
                  </p>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                    {e.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{e.learned}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{e.studyTime}h</span>
                    <span>·</span>
                    <span>{e.difficulty}</span>
                    <span>·</span>
                    <Stars rating={e.rating} />
                  </div>
                  {e.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {e.tags.map((t) => (
                        <span key={t} className="tag">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-sm text-brand-600 font-medium shrink-0 self-center">
                  Read Entry →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
