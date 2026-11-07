
import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import AppShell from "./components/AppShell";

import {
  SimulatorProvider,
} from "./context/SimulatorContext";

import Dashboard from "./pages/Dashboard";
import ChooseChecklist from "./pages/ChooseChecklist";
import ChecklistExecution from "./pages/ChecklistExecution";
import Manual from "./pages/Manual";
import Performance from "./pages/Performance";
import HistoryPage from "./pages/History";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import HelpGuide from "./pages/HelpGuide";
import StudentRegistration from "./pages/StudentRegistration";
import CockpitControls from "./pages/CockpitControls";
import AvionicsPreview from "./pages/AvionicsPanel";

/* ============================================================
   SIMULATOR APPLICATION LAYOUT

   No login required.
   No authentication verification.
   No student selection requirement.

   Dashboard opens automatically.
   ============================================================ */

function SimulatorApplication() {
  return (
    <SimulatorProvider>
      <AppShell />
    </SimulatorProvider>
  );
}

/* ============================================================
   STUDENT REGISTRATION PAGE
   ============================================================ */

function RegistrationPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <StudentRegistration />
      </div>
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */

function App() {
  return (
    <Routes>

      {/* DEFAULT ROUTE - DASHBOARD */}

      <Route
        path="/"
        element={
          <Navigate to="/dashboard" replace />
        }
      />

      {/* AVIONICS PREVIEW */}

      <Route
        path="/avionics-preview"
        element={<AvionicsPreview />}
      />

      {/* STUDENT REGISTRATION */}

      <Route
        path="/register"
        element={<RegistrationPage />}
      />

      {/* SIMULATOR APPLICATION */}

      <Route
        element={<SimulatorApplication />}
      >

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* COCKPIT CONTROLS */}

        <Route
          path="/controls"
          element={<CockpitControls />}
        />

        {/* CHECKLIST SELECTION */}

        <Route
          path="/checklists"
          element={<ChooseChecklist />}
        />

        {/* CHECKLIST EXECUTION */}

        <Route
          path="/checklists/:checklistId"
          element={<ChecklistExecution />}
        />

        {/* MANUAL */}

        <Route
          path="/manual"
          element={<Manual />}
        />

        {/* PERFORMANCE */}

        <Route
          path="/performance"
          element={<Performance />}
        />

        {/* HISTORY */}

        <Route
          path="/history"
          element={<HistoryPage />}
        />

        {/* LEADERBOARD */}

        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />

        {/* SETTINGS */}

        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* HELP */}

        <Route
          path="/help"
          element={<HelpGuide />}
        />

      </Route>

      {/* INVALID URL - REDIRECT TO DASHBOARD */}

      <Route
        path="*"
        element={
          <Navigate to="/dashboard" replace />
        }
      />

    </Routes>
  );
}

export default App;
