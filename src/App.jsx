import { Navigate, Route, Routes } from "react-router";

import AppShell from "./components/AppShell";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChooseChecklist from "./pages/ChooseChecklist";
import ChecklistExecution from "./pages/ChecklistExecution";
import Manual from "./pages/Manual";
import Performance from "./pages/Performance";
import HistoryPage from "./pages/History";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import HelpGuide from "./pages/HelpGuide";

function App() {
  return (
    <Routes>
      {/* Login is outside the main dashboard layout */}
      <Route path="/" element={<Login />} />

      {/* Main application layout */}
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/checklists" element={<ChooseChecklist />} />

        {/* Opens the selected checklist */}
        <Route
          path="/checklists/:checklistId"
          element={<ChecklistExecution />}
        />

        <Route path="/manual" element={<Manual />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<HelpGuide />} />
      </Route>

      {/* Any invalid URL returns to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;