import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Welcome.css'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="carnova-container">
      {/* Hero Section */}
      <div className="carnova-hero-wrapper">
        <div className="carnova-ambient-glow" />

        {/* Navigation */}
        <header className="carnova-header">
          <nav className="carnova-nav">
            <a href="#home" className="carnova-logo">
              keysNearby
            </a>

            <div className="carnova-nav-links">
              <a href="#home" className="nav-item active">Home</a>
              <a href="#about" className="nav-item">About</a>
              <button
                className="carnova-nav-signin-btn"
                onClick={() => navigate('/login')}
                type="button"
              >
                Sign In
              </button>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <section id="home" className="carnova-main">
          <div className="carnova-hero-content">
            <div className="carnova-badge">
              <svg className="carnova-badge-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
              <span>Trusted vehicle rental</span>
            </div>

            <h1 className="carnova-title">
              Find the vehicle that feels<br />
              right to you
            </h1>

            <p className="carnova-subtitle">
              Discover a seamless way to choose the perfect vehicle
              based on your comfort, needs, and lifestyle
            </p>

            <div className="hero-get-started-wrap">
              <button
                className="carnova-hero-getstarted-btn"
                onClick={() => navigate('/login')}
                type="button"
              >
                Get Started →
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="carnova-ruler-container">
        <hr className="carnova-horizontal-ruler" />
      </div>

      {/* About Section */}
      <section id="about" className="carnova-about-section">
        <div className="carnova-section-header">
          <span className="section-eyebrow">WHAT IS KEYS NEARBY?</span>
          <h2 className="carnova-section-title">Everything You Need, Right on Your Block</h2>
          <p className="carnova-section-desc">
            Keys Nearby allows vehicle owners to list their cars at a price they set, and allows anyone to search, filter, and rent available vehicles nearby — all through a simple and secure app.
          </p>
        </div>

        <div className="carnova-features-grid">
          <div className="carnova-feature-card">
            <div className="feature-icon-wrapper icon-blue"><span className="feature-emoji">🚗</span></div>
            <h3 className="feature-card-title">Rent a Vehicle</h3>
            <p className="feature-card-desc">Browse cars available near your location. Filter by type, price, and distance. Book the one you need instantly.</p>
          </div>

          <div className="carnova-feature-card">
            <div className="feature-icon-wrapper icon-emerald"><span className="feature-emoji">💰</span></div>
            <h3 className="feature-card-title">List Your Vehicle</h3>
            <p className="feature-card-desc">Own a car that sits idle? List it on Keys Nearby. Set your own daily price and earn from your parked vehicle.</p>
          </div>

          <div className="carnova-feature-card">
            <div className="feature-icon-wrapper icon-rose"><span className="feature-emoji">📍</span></div>
            <h3 className="feature-card-title">Nearby Map</h3>
            <p className="feature-card-desc">See all available cars pinned on a map around your current location. Find the closest car without travelling far.</p>
          </div>

          <div className="carnova-feature-card">
            <div className="feature-icon-wrapper icon-purple"><span className="feature-emoji">📋</span></div>
            <h3 className="feature-card-title">Booking History</h3>
            <p className="feature-card-desc">Keep track of all your past trips and listings. View dates, earnings, and trip details in one place.</p>
          </div>

          <div className="carnova-feature-card">
            <div className="feature-icon-wrapper icon-cyan"><span className="feature-emoji">🛡️</span></div>
            <h3 className="feature-card-title">Verified Users</h3>
            <p className="feature-card-desc">Every user completes identity verification. All trips include basic trip protection for safety.</p>
          </div>

          <div className="carnova-feature-card">
            <div className="feature-icon-wrapper icon-amber"><span className="feature-emoji">📱</span></div>
            <h3 className="feature-card-title">Simple to Use</h3>
            <p className="feature-card-desc">Clean interface, easy navigation. Sign up, search or list, and you are ready to go in under two minutes.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="carnova-footer">
        <p>© {new Date().getFullYear()} Keys Nearby. Peer-to-Peer Vehicle Rental Platform.</p>
      </footer>
    </div>
  )
}