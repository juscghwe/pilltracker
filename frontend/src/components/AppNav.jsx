import { NavLink } from "react-router";

const navItems = [
  { to: "/", label: "Landing", end: true },
  { to: "/dev-notes", label: "DevNotes CRUD" },
  { to: "/health", label: "Health" },
];

function AppNav() {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => (isActive ? "app-nav-link active" : "app-nav-link")}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default AppNav;
