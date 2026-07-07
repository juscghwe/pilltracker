import { Outlet } from "react-router";

import AppNav from "../components/AppNav.jsx";

function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-kicker">Self-hosted medication tracker</p>
          <h1>PillTracker</h1>
        </div>

        <AppNav />
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
