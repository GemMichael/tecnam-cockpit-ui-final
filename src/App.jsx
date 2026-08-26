import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import AppShell from "./components/AppShell";

import {
  SimulatorProvider,
} from "./context/SimulatorContext";

import {
  getSelectedStudent,
} from "./services/studentStorage";

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
import StudentRegistration from "./pages/StudentRegistration";
import CockpitControls from "./pages/CockpitControls";


/* ============================================================
   GET LOGGED-IN USER
   ============================================================ */

function getLoggedInUser() {
  try {
    const stored =
      localStorage.getItem(
        "tecnamUser"
      );


    if (!stored) {
      return null;
    }


    return JSON.parse(
      stored
    );
  } catch (
    error
  ) {
    console.warn(
      "Invalid stored login data.",
      error
    );


    localStorage.removeItem(
      "tecnamUser"
    );


    return null;
  }
}


/* ============================================================
   PROTECTED APPLICATION

   Student must have BOTH:

   1. tecnamUser
   2. selected registered student

   Otherwise access is denied.

   This protects:

   /dashboard
   /controls
   /checklists
   /history
   etc.

   Even if someone manually types the URL.
   ============================================================ */

function ProtectedApplication() {
  const user =
    getLoggedInUser();


  const student =
    getSelectedStudent();


  if (
    !user ||
    !student ||
    !student.studentId
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  return (
    <SimulatorProvider>
      <AppShell />
    </SimulatorProvider>
  );
}


/* ============================================================
   PUBLIC REGISTRATION LAYOUT

   Registration must be accessible before login.
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

      {/* =====================================================
          PUBLIC ROUTES
          ===================================================== */}

      <Route
        path="/"
        element={
          <Login />
        }
      />


      {/* Registration does NOT require login */}

      <Route
        path="/register"
        element={
          <RegistrationPage />
        }
      />


      {/* =====================================================
          PROTECTED APPLICATION
          ===================================================== */}

      <Route
        element={
          <ProtectedApplication />
        }
      >

        {/* COCKPIT CONTROLS */}

        <Route
          path="/controls"
          element={
            <CockpitControls />
          }
        />


        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <Dashboard />
          }
        />


        {/* CHECKLIST SELECTION */}

        <Route
          path="/checklists"
          element={
            <ChooseChecklist />
          }
        />


        {/* CHECKLIST EXECUTION */}

        <Route
          path="/checklists/:checklistId"
          element={
            <ChecklistExecution />
          }
        />


        {/* MANUAL */}

        <Route
          path="/manual"
          element={
            <Manual />
          }
        />


        {/* PERFORMANCE */}

        <Route
          path="/performance"
          element={
            <Performance />
          }
        />


        {/* HISTORY */}

        <Route
          path="/history"
          element={
            <HistoryPage />
          }
        />


        {/* LEADERBOARD */}

        <Route
          path="/leaderboard"
          element={
            <Leaderboard />
          }
        />


        {/* SETTINGS */}

        <Route
          path="/settings"
          element={
            <Settings />
          }
        />


        {/* HELP */}

        <Route
          path="/help"
          element={
            <HelpGuide />
          }
        />

      </Route>


      {/* =====================================================
          INVALID URL
          ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}


export default App;