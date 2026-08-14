import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import JournalNew from "./pages/JournalNew";
import JournalDetail from "./pages/JournalDetail";
import Topics from "./pages/Topics";
import Projects from "./pages/Projects";
import ProgressPage from "./pages/Progress";
import Settings from "./pages/Settings";
import SearchPage from "./pages/Search";
import Roadmap from "./pages/Roadmap";
import DayStudy from "./pages/DayStudy";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PomodoroPage from "./pages/Pomodoro";
import Onboarding from "./pages/Onboarding";
import CalendarPage from "./pages/Calendar";
import GoalsPage from "./pages/Goals";
import ReflectionsPage from "./pages/Reflections";

function AppRoutes() {
  const { onboardingDone } = useApp();

  if (!onboardingDone) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<AuthPage key="login" mode="login" />} />
      <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
      <Route
        path="/forgot-password"
        element={<AuthPage key="forgot-password" mode="forgot" />}
      />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/journal/new" element={<JournalNew />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<SearchPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/roadmap/:day" element={<DayStudy />} />
        </Route>
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/:id" element={<JournalDetail />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/reflections" element={<ReflectionsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/pomodoro" element={<PomodoroPage />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || ""}>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
