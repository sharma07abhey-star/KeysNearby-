import { Suspense, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { useDemo } from "../hooks/useDemo";
import { addDaysISO, todayISO } from "../utils/format";
import "./Dashboard.css";

// Sidebar is described as data, then rendered with .map() - adding a page
// means adding one line here.
const sections = [
  { title: null, items: [{ label: "Overview", to: "", icon: "dashboard", end: true }] },
  {
    title: "Rent",
    items: [
      { label: "Find a Vehicle", to: "find-vehicle", icon: "search" },
      { label: "Nearby Map", to: "nearby-map", icon: "map" },
      { label: "Ride Pooling", to: "carpool", icon: "users" },
    ],
  },
  {
    title: "Host",
    items: [
      { label: "My Garage", to: "my-vehicles", icon: "key", badge: "requests" },
      { label: "List a Vehicle", to: "list-vehicle", icon: "plus" },
    ],
  },
  {
    title: "Activity",
    items: [
      { label: "History", to: "history", icon: "history" },
      { label: "Messages", to: "messages", icon: "message", badge: "unread" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Women’s Safety", to: "safety", icon: "shield" },
      { label: "Profile & Verification", to: "profile", icon: "user" },
      { label: "Feedback", to: "feedback", icon: "star" },
      { label: "Help & Support", to: "help", icon: "help" },
    ],
  },
];

// Flat map of route path → label for the topbar title
const pageTitles = Object.fromEntries(
  sections.flatMap((s) => s.items.map((item) => [item.to, item.label]))
);

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, userInitials, mode, setMode, signOut, conversations, hostRequests, bookings, verification } = useDemo();

  // Derive current page title from pathname (e.g. "/dashboard/nearby-map" → "Nearby Map")
  const routeKey = pathname.replace(/^\/dashboard\/?/, "");
  const pageTitle = pageTitles[routeKey] ?? null;

  // close menus and scroll to the top whenever the route changes
  useEffect(() => {
    setDrawerOpen(false);
    setBellOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // click outside closes the notification popover
  useEffect(() => {
    if (!bellOpen) return undefined;
    const onClick = (event) => {
      if (!bellRef.current?.contains(event.target)) setBellOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [bellOpen]);

  const unread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const pending = hostRequests.filter((r) => r.status === "Pending");
  const soon = bookings.filter(
    (b) => b.status === "Confirmed" && b.start <= addDaysISO(todayISO(), 3),
  );

  const notifications = [
    pending.length && { icon: "key", text: `${pending.length} booking request${pending.length > 1 ? "s" : ""} waiting for you`, to: "/dashboard/my-vehicles" },
    unread && { icon: "message", text: `${unread} unread message${unread > 1 ? "s" : ""}`, to: "/dashboard/messages" },
    soon.length && { icon: "calendar", text: `${soon[0].vehicle} pickup coming up`, to: "/dashboard/history" },
    !verification.identity && { icon: "shield", text: "Verify your identity to book faster", to: "/dashboard/profile" },
  ].filter(Boolean);

  const badges = { requests: pending.length, unread };

  function handleLogout() {
    signOut();
    navigate("/");
  }

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar${drawerOpen ? " is-open" : ""}`} aria-label="Dashboard navigation">
        <div className="sidebar-header">
          <Link to="/" className="brand">
            <span className="brand-mark"><Icon name="key" size={17} /></span>
            <span className="brand-name">Keys Nearby</span>
          </Link>
          <button type="button" className="icon-btn sidebar-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation">
            <Icon name="close" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div className="nav-group" key={section.title || "main"}>
              {section.title && <span className="nav-title">{section.title}</span>}
              {section.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={`/dashboard${item.to ? `/${item.to}` : ""}`}
                  end={item.end}
                  className={({ isActive }) => `sidebar-item${isActive ? " active" : ""}`}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                  {item.badge && badges[item.badge] > 0 && <b className="nav-badge">{badges[item.badge]}</b>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{userInitials}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            <Icon name="logout" size={16} /> Log out
          </button>
        </div>
      </aside>

      {drawerOpen && <button type="button" className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-label="Close navigation" />}

      <div className="dashboard-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button type="button" className="icon-btn mobile-menu-button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
              <Icon name="menu" />
            </button>

            {pathname === "/dashboard" ? (
              <div className="mode-switch" role="group" aria-label="Choose how you are using Keys Nearby">
                <button type="button" className={mode === "renter" ? "on" : ""} aria-pressed={mode === "renter"} onClick={() => setMode("renter")}>
                  <Icon name="search" size={15} /> Renting
                </button>
                <button type="button" className={mode === "host" ? "on" : ""} aria-pressed={mode === "host"} onClick={() => setMode("host")}>
                  <Icon name="key" size={15} /> Hosting
                </button>
              </div>
            ) : (
              pageTitle && <span className="topbar-page-title">{pageTitle}</span>
            )}
          </div>

          <div className="topbar-right">
            <div className="bell-wrap" ref={bellRef}>
              <button type="button" className="icon-btn" aria-label="Notifications" aria-expanded={bellOpen} onClick={() => setBellOpen((o) => !o)}>
                <Icon name="bell" />
                {notifications.length > 0 && <b className="bell-dot">{notifications.length}</b>}
              </button>
              {bellOpen && (
                <div className="popover" role="menu">
                  <strong>Notifications</strong>
                  {notifications.length === 0 && <p className="muted">You're all caught up.</p>}
                  {notifications.map((n) => (
                    <Link key={n.text} to={n.to} role="menuitem">
                      <Icon name={n.icon} size={16} /> <span>{n.text}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/dashboard/profile" className="avatar avatar-link" aria-label="Open profile">{userInitials}</Link>
          </div>
        </header>

        <main className="dashboard-main">
          <Suspense fallback={<div className="page-loading"><span className="spinner" /> Loading…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
