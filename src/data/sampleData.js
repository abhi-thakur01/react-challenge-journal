// Default challenge — used only on first visit (no saved data)
// All values are editable from the Dashboard "Edit Challenge" form.

export function getDefaultChallenge() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    name: "126-Day Frontend Challenge (HTML, CSS, Bootstrap, Tailwind, JavaScript, React)",
    totalDays: 126,
    startDate: today,
    userName: "Abhishek",
    description: "A complete path from HTML and CSS through Bootstrap, Tailwind, JavaScript, and React.",
    dailyStudyGoal: 2, // hours per day
    // manualDay: null means auto-calculate from startDate
    // if set (number), user override is used
    manualDay: null,
  };
}

// Empty defaults — user builds history from Day 1
export const sampleEntries = [];
export const sampleProjects = [];
export const sampleTopics = [];
export const sampleGoals = [];
export const sampleResources = [];
export const sampleReflections = [];
