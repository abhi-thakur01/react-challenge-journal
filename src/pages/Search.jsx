import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search as SearchIcon,
  BookOpen,
  Layers,
  FolderKanban,
  Map,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CURRICULUM_FULL } from "../data/curriculum";

export default function SearchPage() {
  const { entries, topics, projects, dayNotes } = useApp();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      return { entries: [], topics: [], projects: [], curriculum: [], notes: [] };
    }
    const match = (...fields) =>
      fields.some((f) => String(f || "").toLowerCase().includes(query));

    const notesHits = Object.entries(dayNotes || {})
      .filter(([, text]) => String(text).toLowerCase().includes(query))
      .map(([day, text]) => ({ day: Number(day), text }));

    return {
      entries: entries.filter((e) =>
        match(e.title, e.learned, e.practiced, e.goal, e.takeaways, e.category, ...(e.tags || []))
      ),
      topics: topics.filter((t) => match(t.name, t.notes, t.category)),
      projects: projects.filter((p) =>
        match(p.title, p.description, p.learnings, p.challenges, ...(p.technologies || []))
      ),
      curriculum: CURRICULUM_FULL.filter((c) =>
        match(
          c.title,
          c.category,
          c.slug,
          c.content?.theory,
          c.content?.notes,
          c.content?.practice,
          c.content?.interview,
          ...(c.content?.codes || []).map((x) => x.name + " " + x.code)
        )
      ),
      notes: notesHits,
    };
  }, [q, entries, topics, projects, dayNotes]);

  const total =
    results.entries.length +
    results.topics.length +
    results.projects.length +
    results.curriculum.length +
    results.notes.length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="section-title mb-1">Search</h1>
      <p className="section-sub mb-6">
        Journal, topics, projects, roadmap content aur personal notes.
      </p>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="input pl-10 text-base py-3"
          placeholder='Search… e.g. "let", useEffect, Redux'
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>

      {!q.trim() && (
        <p className="text-center text-slate-400 text-sm py-12">
          Type to search across journal, topics, and curriculum.
        </p>
      )}
      {q.trim() && total === 0 && (
        <p className="text-center text-slate-400 text-sm py-12">
          No results for “{q}”
        </p>
      )}

      {results.curriculum.length > 0 && (
        <ResultGroup icon={Map} title="Curriculum" count={results.curriculum.length}>
          {results.curriculum.map((c) => (
            <Link
              key={c.day}
              to={`/roadmap/${c.day}`}
              className="card p-4 block hover:border-brand-200 dark:hover:border-brand-500/40 mb-2"
            >
              <p className="text-xs text-slate-400">
                Day {c.day} · {c.category}
              </p>
              <p className="font-medium text-slate-900 dark:text-white">{c.title}</p>
            </Link>
          ))}
        </ResultGroup>
      )}

      {results.notes.length > 0 && (
        <ResultGroup icon={BookOpen} title="My Notes" count={results.notes.length}>
          {results.notes.map((n) => (
            <Link
              key={n.day}
              to={`/roadmap/${n.day}`}
              className="card p-4 block hover:border-brand-200 dark:hover:border-brand-500/40 mb-2"
            >
              <p className="text-xs text-slate-400">Day {n.day}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                {n.text}
              </p>
            </Link>
          ))}
        </ResultGroup>
      )}

      {results.entries.length > 0 && (
        <ResultGroup icon={BookOpen} title="Journal" count={results.entries.length}>
          {results.entries.map((e) => (
            <Link
              key={e.id}
              to={`/journal/${e.id}`}
              className="card p-4 block hover:border-brand-200 dark:hover:border-brand-500/40 mb-2"
            >
              <p className="text-xs text-slate-400">Day {e.day}</p>
              <p className="font-medium text-slate-900 dark:text-white">{e.title}</p>
            </Link>
          ))}
        </ResultGroup>
      )}

      {results.topics.length > 0 && (
        <ResultGroup icon={Layers} title="Topics" count={results.topics.length}>
          {results.topics.map((t) => (
            <Link
              key={t.id}
              to={t.day ? `/roadmap/${t.day}` : "/topics"}
              className="card p-4 block hover:border-brand-200 dark:hover:border-brand-500/40 mb-2"
            >
              <p className="font-medium text-slate-900 dark:text-white">{t.name}</p>
            </Link>
          ))}
        </ResultGroup>
      )}

      {results.projects.length > 0 && (
        <ResultGroup icon={FolderKanban} title="Projects" count={results.projects.length}>
          {results.projects.map((p) => (
            <Link
              key={p.id}
              to="/projects"
              className="card p-4 block hover:border-brand-200 dark:hover:border-brand-500/40 mb-2"
            >
              <p className="font-medium text-slate-900 dark:text-white">{p.title}</p>
            </Link>
          ))}
        </ResultGroup>
      )}
    </div>
  );
}

function ResultGroup({ icon: Icon, title, count, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-brand-500" />
        <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
          {title} <span className="text-slate-400 font-normal">({count})</span>
        </h2>
      </div>
      {children}
    </div>
  );
}
