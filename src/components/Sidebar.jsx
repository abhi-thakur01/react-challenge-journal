import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FolderKanban,
  BarChart3,
  Settings,
  Plus,
  Code2,
  Search,
  Map,
  LockKeyhole,
  LogIn,
  LogOut,
  Timer,
  CalendarDays,
  Target,
  MessageSquareQuote,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const groups = [
  {
    label: "Learn",
    items: [
      { to: "/roadmap", icon: Map, label: "Roadmap", protected: true },
      { to: "/topics", icon: Layers, label: "Topics" },
    ],
  },
  {
    label: "Track",
    items: [
      { to: "/journal", icon: BookOpen, label: "Journal" },
      { to: "/projects", icon: FolderKanban, label: "Projects" },
      { to: "/progress", icon: BarChart3, label: "Progress" },
      { to: "/calendar", icon: CalendarDays, label: "Calendar" },
    ],
  },
  {
    label: "Focus",
    items: [{ to: "/pomodoro", icon: Timer, label: "Pomodoro" }],
  },
  {
    label: "Goals",
    items: [
      { to: "/goals", icon: Target, label: "Goals" },
      { to: "/reflections", icon: MessageSquareQuote, label: "Weekly Review" },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { syncStatus } = useApp();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
    }`;

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
            React Journal
          </p>
          <p className="text-[11px] text-slate-400">
            {syncStatus === "synced"
              ? "Cloud synced"
              : syncStatus === "syncing"
              ? "Syncing..."
              : syncStatus === "error"
              ? "Sync issue"
              : "Local mode"}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-4 overflow-y-auto pb-4">
        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard className="w-[18px] h-[18px]" />
          Dashboard
        </NavLink>
        <NavLink to="/search" className={linkClass}>
          <Search className="w-[18px] h-[18px]" />
          Search
        </NavLink>

        {groups.map((g) => (
          <div key={g.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {g.label}
            </p>
            <div className="space-y-0.5">
              {g.items.map(({ to, icon: Icon, label, protected: isProtected }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  <Icon className="w-[18px] h-[18px]" />
                  <span className="flex-1">{label}</span>
                  {isProtected && !user && (
                    <LockKeyhole className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <NavLink to="/settings" className={linkClass}>
          <Settings className="w-[18px] h-[18px]" />
          Settings
        </NavLink>
      </nav>

      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {user ? (
          <div className="flex items-center gap-2 px-2">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-400">Signed in as</p>
              <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                {user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="btn-secondary w-full text-sm">
            <LogIn className="w-4 h-4" />
            Login to unlock
          </NavLink>
        )}
        <NavLink to="/journal/new" className="btn-primary w-full text-sm">
          <Plus className="w-4 h-4" />
          Add Today Learning
        </NavLink>
      </div>
    </aside>
  );
}
