import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import StreakReminder from "./StreakReminder";
import { useApp } from "../context/AppContext";
import { WifiOff } from "lucide-react";

export default function Layout() {
  const { syncStatus } = useApp();
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        {!online && (
          <div className="bg-amber-500 text-white text-xs sm:text-sm px-4 py-2 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            You are offline — changes are saved locally and will sync when you reconnect
          </div>
        )}
        {online && syncStatus === "error" && (
          <div className="bg-red-500 text-white text-xs sm:text-sm px-4 py-2 text-center">
            Cloud sync failed — your data is still safe on this device
          </div>
        )}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <StreakReminder />
    </div>
  );
}
