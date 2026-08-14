import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Code2,
  ClipboardList,
  MessageCircle,
  FolderKanban,
  Lightbulb,
  FileText,
  StickyNote,
  Bookmark,
  Save,
} from "lucide-react";
import { getDayContent } from "../data/curriculum";
import { useApp } from "../context/AppContext";
import MarkdownView from "../components/MarkdownView";

const TABS = [
  { id: "theory", label: "Theory", icon: BookOpen },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "code", label: "Code", icon: Code2 },
  { id: "practice", label: "Practice", icon: ClipboardList },
  { id: "assignment", label: "Assignment", icon: FileText },
  { id: "interview", label: "Interview", icon: MessageCircle },
  { id: "project", label: "Project", icon: FolderKanban },
  { id: "solution", label: "Solution", icon: Lightbulb },
  { id: "cheatsheet", label: "Cheat Sheet", icon: FileText },
  { id: "myNotes", label: "My Notes", icon: StickyNote },
];

export default function DayStudy() {
  const { day } = useParams();
  const navigate = useNavigate();
  const {
    updateTopic,
    topics,
    getDayNote,
    setDayNote,
    isBookmarked,
    toggleBookmark,
  } = useApp();
  const data = getDayContent(day);
  const [tab, setTab] = useState("theory");
  const [codeIdx, setCodeIdx] = useState(0);
  const [myNote, setMyNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const d = data ? Number(data.day) : Number(day);

  useEffect(() => {
    setMyNote(getDayNote(d));
    setNoteSaved(false);
    setTab("theory");
    setCodeIdx(0);
    // only when day changes — getDayNote in deps was resetting tab on every click
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d]);

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 mb-4">Day not found.</p>
        <Link to="/roadmap" className="btn-primary">
          Back to Roadmap
        </Link>
      </div>
    );
  }

  const content = data.content || {};
  const codes = content.codes || [];
  const activeCode = codes[codeIdx] || null;
  const bookmarked = isBookmarked(d);

  const markDone = () => {
    const existing = topics.find((t) => t.day === d);
    if (existing) {
      updateTopic(existing.id, {
        progress: 100,
        lastStudied: new Date().toISOString().slice(0, 10),
      });
    }
    alert(`Day ${d} marked complete in Topics.`);
  };

  const saveNote = () => {
    setDayNote(d, myNote);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
      <div className="flex items-center justify-between mb-4 gap-2">
        <Link to="/roadmap" className="btn-ghost text-sm">
          <ArrowLeft className="w-4 h-4" /> Roadmap
        </Link>
        <div className="flex gap-1 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => toggleBookmark(d)}
            className={`btn-secondary text-xs py-1.5 ${
              bookmarked ? "text-amber-500 border-amber-300 dark:border-amber-600" : ""
            }`}
            title={bookmarked ? "Remove bookmark" : "Bookmark this day"}
          >
            <Bookmark
              className={`w-4 h-4 ${bookmarked ? "fill-amber-400 text-amber-500" : ""}`}
            />
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>
          {d > 1 && (
            <button
              type="button"
              onClick={() => navigate(`/roadmap/${d - 1}`)}
              className="btn-secondary text-xs py-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Day {d - 1}
            </button>
          )}
          {d < 126 && (
            <button
              type="button"
              onClick={() => navigate(`/roadmap/${d + 1}`)}
              className="btn-secondary text-xs py-1.5"
            >
              Day {d + 1} <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-brand-600 font-semibold text-sm mb-1">
        DAY {String(d).padStart(2, "0")} · {data.category}
        {bookmarked && <span className="text-amber-500"> · ★</span>}
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
        {data.title}
      </h1>

      <div className="relative z-10 flex flex-wrap gap-2 pb-3 mb-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const has =
            id === "myNotes"
              ? true
              : id === "code"
              ? codes.length > 0
              : Boolean(
                  typeof content[id] === "string"
                    ? content[id].trim()
                    : content[id]
                );
          return (
            <button
              key={id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTab(id);
              }}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition cursor-pointer select-none ${
                tab === id
                  ? "bg-brand-500 text-white shadow-sm"
                  : has
                  ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-brand-300"
                  : "bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-slate-600"
              }`}
            >
              <Icon className="w-3.5 h-3.5 pointer-events-none" />
              <span className="pointer-events-none">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="card p-5 sm:p-7">
        {tab === "myNotes" ? (
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Write your personal notes for this day. They sync to the cloud when you are logged in.
            </p>
            <textarea
              className="input min-h-[200px] font-mono text-sm"
              value={myNote}
              onChange={(e) => {
                setMyNote(e.target.value);
                setNoteSaved(false);
              }}
              placeholder="Example: Understood useState — practice again tomorrow…"
            />
            <div className="flex items-center gap-3 mt-3">
              <button type="button" onClick={saveNote} className="btn-primary text-sm">
                <Save className="w-4 h-4" /> Save Notes
              </button>
              {noteSaved && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  Saved ✓
                </span>
              )}
            </div>
          </div>
        ) : tab === "code" ? (
          codes.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No code files for this day.</p>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {codes.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCodeIdx(i)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono ${
                      i === codeIdx
                        ? "bg-brand-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs sm:text-sm overflow-x-auto leading-relaxed whitespace-pre">
                <code>{activeCode?.code || ""}</code>
              </pre>
            </div>
          )
        ) : (
          <MarkdownView content={content[tab] || ""} />
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <Link to="/journal/new" className="btn-primary">
          Write journal for this day
        </Link>
        <button type="button" onClick={markDone} className="btn-secondary">
          Mark day complete
        </button>
        <Link to="/roadmap" className="btn-ghost">
          Roadmap
        </Link>
      </div>
    </div>
  );
}
