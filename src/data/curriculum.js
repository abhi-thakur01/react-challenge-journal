/** Full 126-day curriculum (HTML + CSS + JS + React) with complete study content */
import data from "./curriculumFull.json";

export const CURRICULUM_FULL = data;

export const CURRICULUM = data.map((d) => ({
  day: d.day,
  title: d.title,
  slug: d.slug,
  category: d.category,
  notes: (d.content?.notes || d.content?.theory || "").slice(0, 400),
}));

export function getDayContent(day) {
  return CURRICULUM_FULL.find((d) => d.day === Number(day)) || null;
}

export function curriculumToTopics() {
  return CURRICULUM_FULL.map((c) => ({
    id: 1000 + c.day,
    category: c.category,
    name: `Day ${String(c.day).padStart(2, "0")}: ${c.title}`,
    notes: (c.content?.notes || c.content?.theory || "").slice(0, 500),
    progress: 0,
    lastStudied: "",
    day: c.day,
  }));
}

export function curriculumToGoals() {
  const milestones = [1, 12, 13, 24, 25, 30, 31, 36, 37, 47, 48, 70, 90, 110, 126];
  return CURRICULUM_FULL.filter((c) => milestones.includes(c.day)).map((c) => ({
    id: 2000 + c.day,
    title: `Day ${c.day}: ${c.title}`,
    done: false,
    deadline: "",
    main: false,
    day: c.day,
  }));
}
