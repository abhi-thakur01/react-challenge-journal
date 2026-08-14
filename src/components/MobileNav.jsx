import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  FolderKanban,
  Layers,
  LayoutDashboard,
  LockKeyhole,
  LogIn,
  LogOut,
  Map,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Timer,
  CalendarDays,
  Target,
  MessageSquareQuote,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const moreItems = [
  { to: "/topics", icon: Layers, label: "Topics" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/reflections", icon: MessageSquareQuote, label: "Weekly Review" },
  { to: "/progress", icon: BarChart3, label: "Progress" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/pomodoro", icon: Timer, label: "Pomodoro" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function MobileNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {isMoreOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/20"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {isMoreOpen && (
        <div className="lg:hidden fixed bottom-[4.5rem] inset-x-3 z-50 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              More
            </p>
            <button
              type="button"
              aria-label="Close menu"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMoreOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {moreItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsMoreOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px]" />
                <span className="flex-1">{label}</span>
              </NavLink>
            ))}
          </div>
          <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  void logout();
                  setIsMoreOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span className="flex-1 text-left">Logout</span>
                <span className="max-w-[8rem] truncate text-xs text-slate-400">
                  {user.email}
                </span>
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-600 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/15"
              >
                <LogIn className="w-[18px] h-[18px]" />
                Login to unlock Roadmap
              </NavLink>
            )}
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-1 py-1.5 flex items-center justify-around">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-1.5 py-1 text-[10px] font-medium ${
              isActive ? "text-brand-600" : "text-slate-400"
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          Home
        </NavLink>

        <NavLink
          to="/roadmap"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-1.5 py-1 text-[10px] font-medium ${
              isActive ? "text-brand-600" : "text-slate-400"
            }`
          }
        >
          <span className="relative">
            <Map className="w-5 h-5" />
            {!user && (
              <LockKeyhole className="w-2.5 h-2.5 absolute -top-0.5 -right-1.5 text-slate-400" />
            )}
          </span>
          Roadmap
        </NavLink>

        <NavLink
          to="/journal/new"
          className="w-12 h-12 -mt-5 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30"
        >
          <Plus className="w-6 h-6" />
        </NavLink>

        <NavLink
          to="/journal"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-1.5 py-1 text-[10px] font-medium ${
              isActive ? "text-brand-600" : "text-slate-400"
            }`
          }
        >
          <BookOpen className="w-5 h-5" />
          Journal
        </NavLink>

        <button
          type="button"
          aria-label={isMoreOpen ? "Close more menu" : "Open more menu"}
          aria-expanded={isMoreOpen}
          onClick={() => setIsMoreOpen((open) => !open)}
          className={`flex flex-col items-center gap-0.5 px-1.5 py-1 text-[10px] font-medium ${
            isMoreOpen ? "text-brand-600" : "text-slate-400"
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          More
        </button>
      </nav>
    </>
  );
}
