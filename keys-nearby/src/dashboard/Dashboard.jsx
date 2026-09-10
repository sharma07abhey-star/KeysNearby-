// Dashboard.jsx — Main dashboard with sidebar navigation
// Each sidebar link opens a different page (separate route)

import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import './Dashboard.css'

// ── Inline SVG icons (currentColor inherits sidebar text colour) ──────────────
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const IconCar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="16.5" cy="17.5" r="2.5" />
  </svg>
)

const IconHistory = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
    <polyline points="12 7 12 12 16 14" />
  </svg>
)

const IconMessage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const IconMap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
)

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconHelp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)
// ─────────────────────────────────────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  // get logged in user name safely from localStorage
  let user = { name: 'User', email: '' }
  try {
    const stored = localStorage.getItem('kn-user')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') {
        user = {
          name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name : 'User',
          email: typeof parsed.email === 'string' ? parsed.email : ''
        }
      }
    }
  } catch {
    user = { name: 'User', email: '' }
  }

  function handleLogout() {
    localStorage.removeItem('kn-auth')
    localStorage.removeItem('kn-user')
    navigate('/')
  }

  // sidebar menu items
  const menuItems = [
    { label: 'Find a Vehicle',         path: '/dashboard/find-vehicle', icon: <IconSearch /> },
    { label: 'List My Vehicle',        path: '/dashboard/list-vehicle', icon: <IconCar /> },
    { label: 'History',                path: '/dashboard/history',      icon: <IconHistory /> },
    { label: 'Messages',               path: '/dashboard/messages',     icon: <IconMessage /> },
    { label: 'Nearby Map',             path: '/dashboard/map',          icon: <IconMap /> },
    { label: 'Profile & Verification', path: '/dashboard/profile',      icon: <IconUser /> },
    { label: 'Help & Support',         path: '/dashboard/help',         icon: <IconHelp /> },
  ]

  function isActive(path) {
    return location.pathname === path
  }

  const avatarLetter = (user.name && user.name.length > 0) ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="dashboard-layout">

      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-text">Keys Nearby</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{avatarLetter}</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user.name}</p>
            <p className="sidebar-user-email">{user.email || ''}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.path}
              className={'sidebar-item' + (isActive(item.path) ? ' active' : '')}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span className="sidebar-item-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>

    </div>
  )
}

export default Dashboard
