import { useEffect } from "react";
import { useApp } from "../context/AppContext";

const PREF_KEY = "rcj-streak-reminder";
const LAST_NOTIFY_KEY = "rcj-streak-last-notify";

/**
 * Runs in Layout. If user enabled streak reminder in Settings,
 * asks notification permission and pings once/day when no entry today.
 */
export default function StreakReminder() {
  const { entries, stats } = useApp();

  useEffect(() => {
    const enabled = localStorage.getItem(PREF_KEY) === "1";
    if (!enabled) return;
    if (typeof Notification === "undefined") return;

    const today = new Date().toISOString().slice(0, 10);
    const hasToday = entries.some((e) => e.date === today);
    if (hasToday) return;

    const last = localStorage.getItem(LAST_NOTIFY_KEY);
    if (last === today) return;

    const hour = new Date().getHours();
    // Only remind in evening window 18–23 or morning 8–11
    if (!((hour >= 18 && hour <= 23) || (hour >= 8 && hour <= 11))) return;

    const fire = () => {
      try {
        new Notification("React Challenge — Streak reminder", {
          body:
            stats.streak > 0
              ? `Log today's journal — your ${stats.streak}-day streak is active 🔥`
              : "Study for 10 minutes today and add a journal entry to start your streak.",
          tag: "rcj-streak",
        });
        localStorage.setItem(LAST_NOTIFY_KEY, today);
      } catch {}
    };

    if (Notification.permission === "granted") {
      fire();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((p) => {
        if (p === "granted") fire();
      });
    }
  }, [entries, stats.streak]);

  return null;
}

export function getStreakReminderEnabled() {
  return localStorage.getItem(PREF_KEY) === "1";
}

export function setStreakReminderEnabled(on) {
  localStorage.setItem(PREF_KEY, on ? "1" : "0");
  if (on && typeof Notification !== "undefined" && Notification.permission === "default") {
    Notification.requestPermission();
  }
}
