import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import { useI18n } from "./i18n/useI18n";
import { getSession } from "./lib/session";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import PaymentsPage from "./pages/PaymentsPage";

export default function App() {
  const [session, setSession] = useState(getSession);
  const { language, setLanguage, t } = useI18n();

  return (
    <AppShell language={language} session={session} setLanguage={setLanguage} t={t}>
      <Routes>
        <Route path="/" element={<LandingPage t={t} />} />
        <Route path="/login" element={<AuthPage mode="login" setSession={setSession} t={t} />} />
        <Route path="/register" element={<AuthPage mode="register" setSession={setSession} t={t} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <DashboardPage session={session} t={t} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute session={session}>
              <PaymentsPage t={t} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
