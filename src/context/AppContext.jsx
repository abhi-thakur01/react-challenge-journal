import { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import {
  getDefaultChallenge,
  sampleEntries,
  sampleProjects,
  sampleTopics,
  sampleGoals,
  sampleResources,
  sampleReflections,
} from "../data/sampleData";
import {
  CURRICULUM,
  curriculumToTopics,
  curriculumToGoals,
} from "../data/curriculum";

const AppContext = createContext(null);
// v2 — clears old sample-data storage from previous version
const STORAGE_KEY = "react-challenge-journal-v2";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/** Days between startDate and today (inclusive). Min 1, max totalDays. */
function calcDayFromStart(startDate, totalDays) {
  if (!startDate) return 1;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / 86400000);
  const day = diff + 1; // start date = Day 1
  if (day < 1) return 1;
  if (totalDays && day > totalDays) return totalDays;
  return day;
}

export function AppProvider({ children }) {
  const saved = loadState();
  const defaults = getDefaultChallenge();

  const [challenge, setChallenge] = useState(() => ({
    ...defaults,
    ...(saved?.challenge || {}),
  }));

  const [entries, setEntries] = useState(saved?.entries ?? sampleEntries);
  const [projects, setProjects] = useState(saved?.projects ?? sampleProjects);
  const [topics, setTopics] = useState(saved?.topics ?? sampleTopics);
  const [goals, setGoals] = useState(saved?.goals ?? sampleGoals);
  const [resources, setResources] = useState(saved?.resources ?? sampleResources);
  const [reflections, setReflections] = useState(saved?.reflections ?? sampleReflections);
  const [quizResults, setQuizResults] = useState(() =>
    Array.isArray(saved?.quizResults) ? saved.quizResults : []
  );
  // Personal notes per curriculum day: { "1": "my notes...", "12": "..." }
  const [dayNotes, setDayNotes] = useState(() => saved?.dayNotes || {});
  // Bookmarked day numbers: [1, 12, 28]
  const [bookmarks, setBookmarks] = useState(() =>
    Array.isArray(saved?.bookmarks) ? saved.bookmarks : []
  );
  const [syncStatus, setSyncStatus] = useState("local"); // local | syncing | synced | error
  const [darkMode, setDarkMode] = useState(() => {
    if (saved?.darkMode != null) return saved.darkMode;
    return localStorage.getItem("rcj-dark") === "1";
  });
  const [onboardingDone, setOnboardingDone] = useState(() => {
    if (saved?.onboardingDone != null) return !!saved.onboardingDone;
    if (localStorage.getItem("rcj-onboarded") === "1") return true;
    // Returning users who already have data skip onboarding
    if (saved?.challenge?.userName || (saved?.entries && saved.entries.length > 0)) return true;
    return false;
  });

  // Dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("rcj-dark", darkMode ? "1" : "0");
  }, [darkMode]);

  // Persist everything including challenge + theme (local, per-browser fallback)
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        challenge,
        entries,
        projects,
        topics,
        goals,
        resources,
        reflections,
        quizResults,
        dayNotes,
        bookmarks,
        darkMode,
        onboardingDone,
      })
    );
  }, [challenge, entries, projects, topics, goals, resources, reflections, quizResults, dayNotes, bookmarks, darkMode, onboardingDone]);

  // —— Cloud sync (Firestore) ——
  // Logged-in users get their data synced through Firestore (doc: users/{uid}),
  // so the same journal shows up on every device/deployment (local, Vercel, etc.)
  // instead of being stuck in one browser's localStorage.
  // Logged-out (guest) users keep the localStorage-only behavior above.
  const { user } = useAuth();
  const cloudLoadedRef = useRef(false); // has the first cloud snapshot arrived for this login?
  const applyingRemoteRef = useRef(false); // true while we're applying data FROM Firestore (skip echo write)

  useEffect(() => {
    if (!user) {
      cloudLoadedRef.current = false;
      setSyncStatus("local");
      return;
    }
    setSyncStatus("syncing");

    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          applyingRemoteRef.current = true;
          if (data.challenge) setChallenge((prev) => ({ ...prev, ...data.challenge }));
          if (Array.isArray(data.entries)) setEntries(data.entries);
          if (Array.isArray(data.projects)) setProjects(data.projects);
          if (Array.isArray(data.topics)) setTopics(data.topics);
          if (Array.isArray(data.goals)) setGoals(data.goals);
          if (Array.isArray(data.resources)) setResources(data.resources);
          if (Array.isArray(data.reflections)) setReflections(data.reflections);
          if (Array.isArray(data.quizResults)) setQuizResults(data.quizResults);
          if (data.dayNotes && typeof data.dayNotes === "object") setDayNotes(data.dayNotes);
          if (Array.isArray(data.bookmarks)) setBookmarks(data.bookmarks);
          if (typeof data.darkMode === "boolean") setDarkMode(data.darkMode);
          setSyncStatus("synced");
        } else {
          // First login ever: no cloud doc yet — seed it with whatever is
          // currently in this browser so existing local data isn't lost.
          setSyncStatus("syncing");
          setDoc(ref, {
            challenge,
            entries,
            projects,
            topics,
            goals,
            resources,
            reflections,
            quizResults,
            dayNotes,
            bookmarks,
            darkMode,
          }).catch((err) => console.error("Firestore seed failed:", err));
          setSyncStatus("synced");
        }
        cloudLoadedRef.current = true;
      },
      (err) => console.error("Firestore sync failed:", err)
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user || !cloudLoadedRef.current) return;
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }
    const ref = doc(db, "users", user.uid);
    setSyncStatus("syncing");
    setDoc(
      ref,
      {
        challenge,
        entries,
        projects,
        topics,
        goals,
        resources,
        reflections,
        quizResults,
        dayNotes,
        bookmarks,
        darkMode,
      },
      { merge: true }
    )
      .then(() => setSyncStatus("synced"))
      .catch((err) => {
        console.error("Firestore write failed:", err);
        setSyncStatus("error");
      });
  }, [user, challenge, entries, projects, topics, goals, resources, reflections, quizResults, dayNotes, bookmarks, darkMode]);

  const updateChallenge = (updates) => {
    setChallenge((prev) => ({ ...prev, ...updates }));
  };

  const toggleDarkMode = () => setDarkMode((d) => !d);
  const markOnboardingDone = () => {
    setOnboardingDone(true);
    localStorage.setItem("rcj-onboarded", "1");
  };
  const resetOnboarding = () => {
    setOnboardingDone(false);
    localStorage.removeItem("rcj-onboarded");
  };

  /** Replace all data from imported JSON */
  const importAllData = (data) => {
    if (!data || typeof data !== "object") throw new Error("Invalid data");
    if (data.challenge) setChallenge((prev) => ({ ...prev, ...data.challenge }));
    if (Array.isArray(data.entries)) setEntries(data.entries);
    if (Array.isArray(data.projects)) setProjects(data.projects);
    if (Array.isArray(data.topics)) setTopics(data.topics);
    if (Array.isArray(data.goals)) setGoals(data.goals);
    if (Array.isArray(data.resources)) setResources(data.resources);
    if (Array.isArray(data.reflections)) setReflections(data.reflections);
    if (Array.isArray(data.quizResults)) setQuizResults(data.quizResults);
    if (data.dayNotes && typeof data.dayNotes === "object") setDayNotes(data.dayNotes);
    if (Array.isArray(data.bookmarks)) setBookmarks(data.bookmarks);
    if (typeof data.darkMode === "boolean") setDarkMode(data.darkMode);
  };

  const getExportData = () => ({
    version: 2,
    exportedAt: new Date().toISOString(),
    challenge,
    entries,
    projects,
    topics,
    goals,
    resources,
    reflections,
    quizResults,
    dayNotes,
    bookmarks,
    darkMode,
  });

  // —— Journal ——
  const addEntry = (entry) => {
    const newEntry = {
      ...entry,
      id: Date.now(),
      status: entry.status || "completed",
    };
    setEntries((prev) => [newEntry, ...prev].sort((a, b) => b.day - a.day));
    return newEntry;
  };
  const updateEntry = (id, updates) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  const deleteEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));
  const getEntry = (id) => entries.find((e) => e.id === Number(id));

  // —— Projects ——
  const addProject = (p) => setProjects((prev) => [{ ...p, id: Date.now() }, ...prev]);
  const updateProject = (id, u) =>
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...u } : p)));
  const deleteProject = (id) => setProjects((prev) => prev.filter((p) => p.id !== id));

  // —— Topics ——
  const addTopic = (t) => setTopics((prev) => [...prev, { ...t, id: Date.now() }]);
  const updateTopic = (id, u) =>
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...u } : t)));
  const deleteTopic = (id) => setTopics((prev) => prev.filter((t) => t.id !== id));

  /** Load all 90-day curriculum topics (and optional milestone goals) */
  const loadCurriculum = (opts = { topics: true, goals: false }) => {
    if (opts.topics) {
      const seeded = curriculumToTopics();
      setTopics((prev) => {
        // merge by day — keep progress if already exists
        const byDay = new Map(prev.filter((t) => t.day).map((t) => [t.day, t]));
        return seeded.map((t) => {
          const old = byDay.get(t.day);
          return old ? { ...t, progress: old.progress, lastStudied: old.lastStudied, notes: old.notes || t.notes } : t;
        });
      });
    }
    if (opts.goals) {
      const g = curriculumToGoals();
      setGoals((prev) => {
        const titles = new Set(prev.map((x) => x.title));
        return [...prev, ...g.filter((x) => !titles.has(x.title))];
      });
    }
  };

  // —— Goals ——
  const addGoal = (g) =>
    setGoals((prev) => [
      {
        id: Date.now(),
        done: false,
        progress: 0,
        period: "weekly",
        ...g,
      },
      ...prev,
    ]);
  const updateGoal = (id, u) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...u } : g)));
  const toggleGoal = (id) =>
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, done: !g.done, progress: !g.done ? 100 : g.progress }
          : g
      )
    );
  const deleteGoal = (id) => setGoals((prev) => prev.filter((g) => g.id !== id));

  // —— Resources ——
  const addResource = (r) =>
    setResources((prev) => [
      {
        ...r,
        id: Date.now(),
        dateAdded: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  const updateResource = (id, u) =>
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...u } : r)));
  const deleteResource = (id) => setResources((prev) => prev.filter((r) => r.id !== id));

  // —— Reflections ——
  const addReflection = (r) =>
    setReflections((prev) => [
      {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...r,
      },
      ...prev,
    ]);
  const deleteReflection = (id) =>
    setReflections((prev) => prev.filter((r) => r.id !== id));

  // —— Quiz results ——
  const addQuizResult = (result) =>
    setQuizResults((prev) => [
      {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        ...result,
      },
      ...prev,
    ]);

  // —— Derived challenge day & stats ——
  const stats = useMemo(() => {
    const totalDays = Number(challenge.totalDays) || 126;

    // Current day:
    // 1) If user set manualDay → use it
    // 2) Else max(auto from start date, highest journal day, 1)
    const autoDay = calcDayFromStart(challenge.startDate, totalDays);
    const maxEntryDay =
      entries.length > 0 ? Math.max(...entries.map((e) => Number(e.day) || 0)) : 0;

    let currentDay;
    if (challenge.manualDay != null && challenge.manualDay !== "") {
      currentDay = Math.min(
        totalDays,
        Math.max(1, Number(challenge.manualDay) || 1)
      );
    } else {
      // Auto only: Start Date → today (inclusive)
      currentDay = Math.min(totalDays, Math.max(autoDay, 1));
    }

    const daysRemaining = Math.max(0, totalDays - currentDay);
    const progress = Math.round((currentDay / totalDays) * 100);

    const totalHours = entries.reduce((s, e) => s + (Number(e.studyTime) || 0), 0);
    const completedProjects = projects.filter((p) => p.status === "Completed").length;
    const topicsCount = topics.length;

    // Streak from entry dates
    const dates = [...new Set(entries.map((e) => e.date))].sort().reverse();
    let streak = 0;
    if (dates.length) {
      const latest = new Date(dates[0]);
      latest.setHours(0, 0, 0, 0);
      for (let i = 0; i < dates.length; i++) {
        const d = new Date(dates[i]);
        d.setHours(0, 0, 0, 0);
        const expected = new Date(latest);
        expected.setDate(latest.getDate() - i);
        if (d.getTime() === expected.getTime()) streak++;
        else break;
      }
    }

    let longest = 0;
    let run = 0;
    const asc = [...dates].sort();
    for (let i = 0; i < asc.length; i++) {
      if (i === 0) run = 1;
      else {
        const prev = new Date(asc[i - 1]);
        const cur = new Date(asc[i]);
        const diff = (cur - prev) / 86400000;
        run = diff === 1 ? run + 1 : 1;
      }
      longest = Math.max(longest, run);
    }

    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().slice(0, 10);
      const hours = entries
        .filter((e) => e.date === ds)
        .reduce((s, e) => s + (Number(e.studyTime) || 0), 0);
      return {
        label: d.toLocaleDateString("en-IN", { weekday: "short" }),
        date: ds,
        hours,
      };
    });

    const activeDates = new Set(entries.map((e) => e.date));

    return {
      currentDay,
      autoDay,
      progress,
      daysRemaining,
      streak,
      longestStreak: Math.max(longest, streak),
      totalHours: Math.round(totalHours * 10) / 10,
      topicsCount,
      completedProjects,
      last7,
      activeDates,
      totalDays,
    };
  }, [challenge, entries, projects, topics]);

  const todayEntry = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return entries.find((e) => e.date === today) || null;
  }, [entries]);

  // —— Day notes (personal notes on curriculum days) ——
  const setDayNote = (day, text) => {
    const key = String(day);
    setDayNotes((prev) => {
      const next = { ...prev };
      if (!text || !String(text).trim()) delete next[key];
      else next[key] = String(text);
      return next;
    });
  };
  const getDayNote = (day) => dayNotes[String(day)] || "";

  // —— Bookmarks ——
  const toggleBookmark = (day) => {
    const n = Number(day);
    setBookmarks((prev) =>
      prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n].sort((a, b) => a - b)
    );
  };
  const isBookmarked = (day) => bookmarks.includes(Number(day));

  const value = {
    challenge,
    updateChallenge,
    darkMode,
    toggleDarkMode,
    onboardingDone,
    markOnboardingDone,
    resetOnboarding,
    importAllData,
    getExportData,
    entries,
    projects,
    topics,
    goals,
    resources,
    reflections,
    quizResults,
    dayNotes,
    setDayNote,
    getDayNote,
    bookmarks,
    toggleBookmark,
    isBookmarked,
    syncStatus,
    stats,
    todayEntry,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    addProject,
    updateProject,
    deleteProject,
    addTopic,
    updateTopic,
    deleteTopic,
    loadCurriculum,
    curriculum: CURRICULUM,
    addGoal,
    updateGoal,
    toggleGoal,
    deleteGoal,
    addResource,
    updateResource,
    deleteResource,
    addReflection,
    deleteReflection,
    addQuizResult,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
