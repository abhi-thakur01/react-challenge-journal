import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { useApp } from "../context/AppContext";
import ProgressBar from "../components/ProgressBar";
import { CURRICULUM } from "../data/curriculum";
import { useToast } from "../context/ToastContext";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "HTML", label: "HTML" },
  { id: "CSS", label: "CSS" },
  { id: "Bootstrap", label: "Bootstrap" },
  { id: "Tailwind", label: "Tailwind" },
  { id: "JavaScript", label: "JavaScript" },
  { id: "React", label: "React" },
];

const PAGE_SIZE = 12;

export default function Roadmap() {
  const {
    topics,
    loadCurriculum,
    entries,
    bookmarks,
    isBookmarked,
    getDayNote,
  } = useApp();
  const { success } = useToast();
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const curriculum = CURRICULUM;
  const topicByDay = Object.fromEntries(
    topics.filter((t) => t.day).map((t) => [t.day, t])
  );
  const entryDays = new Set(entries.map((e) => Number(e.day)));

  const done = topics.filter((t) => t.day && t.progress >= 100).length;
  const started = topics.filter((t) => t.day && t.progress > 0).length;

  const filtered = useMemo(() => {
    let list = curriculum;
    if (showOnlyBookmarks) {
      list = list.filter((c) => isBookmarked(c.day));
    }
    if (filter !== "all") {
      list = list.filter((c) => {
        const cat = (c.category || "").toLowerCase();
        const f = filter.toLowerCase();
        if (f === "react") {
          return (
            cat === "react" ||
            cat.includes("react") ||
            cat === "state management" ||
            cat === "react router" ||
            cat === "typescript" ||
            cat === "testing" ||
            cat === "next.js" ||
            cat === "project"
          );
        }
        if (f === "javascript") {
          return cat === "javascript" || cat === "js";
        }
        return cat === f || cat.includes(f);
      });
    }
    return list;
  }, [curriculum, filter, showOnlyBookmarks, isBookmarked, bookmarks]);

  // Reset page when filter changes
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems =
    filter === "all" || filtered.length > PAGE_SIZE
      ? filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
      : filtered;

  const setFilterAndReset = (id) => {
    setFilter(id);
    setPage(1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">
            Course Roadmap — HTML, CSS, Bootstrap, Tailwind, JavaScript, React
          </h1>
          <p className="section-sub">
            Choose a track, then open any day to study Theory, Code, Practice, and more.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn-secondary text-sm ${
              showOnlyBookmarks ? "ring-2 ring-amber-400/50 text-amber-600" : ""
            }`}
            onClick={() => {
              setShowOnlyBookmarks((v) => !v);
              setPage(1);
            }}
          >
            <Bookmark
              className={`w-4 h-4 ${
                showOnlyBookmarks ? "fill-amber-400 text-amber-500" : ""
              }`}
            />
            Bookmarks ({bookmarks.length})
          </button>
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={() => {
              loadCurriculum({ topics: true, goals: false });
              success("Topics loaded from the curriculum");
            }}
          >
            Load into Topics
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterAndReset(f.id)}
            className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition ${
              filter === f.id
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-300"
            }`}
          >
            {f.label}
            {f.id !== "all" && (
              <span className="ml-1.5 opacity-70">
                (
                {
                  curriculum.filter((c) => {
                    const cat = (c.category || "").toLowerCase();
                    const id = f.id.toLowerCase();
                    if (id === "react") {
                      return (
                        cat.includes("react") ||
                        [
                          "state management",
                          "react router",
                          "typescript",
                          "testing",
                          "next.js",
                          "project",
                        ].includes(cat)
                      );
                    }
                    if (id === "javascript") return cat === "javascript" || cat === "js";
                    return cat === id || cat.includes(id);
                  }).length
                }
                )
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {filter === "all" ? curriculum.length : filtered.length}
          </p>
          <p className="text-xs text-slate-500">
            {filter === "all" ? "Total days" : `${filter} days`}
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{started}</p>
          <p className="text-xs text-slate-500">Started</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{done}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-500">{bookmarks.length}</p>
          <p className="text-xs text-slate-500">Bookmarked</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 py-12 text-sm">
          No days match this filter.
        </p>
      ) : (
        <div className="space-y-2">
          {pageItems.map((c) => {
            const t = topicByDay[c.day];
            const progress = t?.progress || 0;
            const hasJournal = entryDays.has(c.day);
            const hasNote = Boolean(getDayNote(c.day));
            return (
              <Link
                key={c.day}
                to={`/roadmap/${c.day}`}
                className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-brand-300 dark:hover:border-brand-500/40 transition"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 shrink-0 text-center">
                    <p className="text-xs font-semibold text-brand-600">
                      Day {String(c.day).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {c.title}
                      {isBookmarked(c.day) && (
                        <span className="text-amber-500 ml-1">★</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {c.category}
                      {hasJournal && " · journal"}
                      {hasNote && " · notes"}
                    </p>
                    {progress > 0 && (
                      <div className="mt-2 max-w-xs">
                        <ProgressBar value={progress} />
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-brand-600 sm:ml-auto shrink-0">
                  Open →
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination — especially for All */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          <button
            type="button"
            className="btn-secondary text-sm"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-sm text-slate-500 px-2">
            Page {safePage} / {totalPages}
            <span className="text-slate-400">
              {" "}
              · {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
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
  );
}
