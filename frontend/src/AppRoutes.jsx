import { Navigate, Route, Routes } from "react-router";

import AppShell from "./layouts/AppShell.jsx";
import DevNotesCrudPage from "./pages/DevNotesCrudPage.jsx";
import HealthReportingPage from "./pages/HealthReportingPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LandingPage />} />
        <Route path="dev-notes" element={<DevNotesCrudPage />} />
        <Route path="health" element={<HealthReportingPage />} />
        <Route path="not-found" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
