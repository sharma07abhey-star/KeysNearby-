import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Icon from "../components/Icon";
import "./Dashboard.css";

const links = [
  ["Find a Vehicle", "find-vehicle", "search"],
  ["List My Vehicle", "list-vehicle", "car"],
  ["History", "history", "history"],
  ["Messages", "messages", "message"],
  ["Nearby Map", "nearby-map", "map"],
  ["Profile & Verification", "profile", "user"],
  ["Help & Support", "help", "help"],
];

function getUserInfo() {
  const email = localStorage.getItem("userEmail") || "demo@keysnearby.app";
  const name = localStorage.getItem("userName") || email;
  const avatarLetter = (localStorage.getItem("userName") || email)[0].toUpperCase();
  return { email, name, avatarLetter };
}

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const { email, name, avatarLetter } = getUserInfo();
  return (
    <div className="dashboard-layout">
      <button
        className="mobile-menu-button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Icon name="menu" />
      </button>
      <aside
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="Dashboard navigation"
      >
        <div className="sidebar-header">
          <span className="sidebar-logo-text">Keys Nearby</span>
          <button
            className="sidebar-close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{avatarLetter}</div>
          <div>
            <strong>{name}</strong>
            <span>{email}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {/* Overview — links to the Welcome back / DashboardHome screen */}
          <NavLink
            to="/dashboard"
            end
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "active" : ""}`
            }
          >
            <Icon name="home" />
            <span>Overview</span>
          </NavLink>
          {links.map(([label, path, icon]) => (
            <NavLink
              key={path}
              to={`/dashboard/${path}`}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <Icon name={icon} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/" className="sidebar-logout">
            Logout
          </NavLink>
        </div>
      </aside>
      {open && (
        <button
          className="drawer-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
