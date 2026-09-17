import { Link } from "react-router-dom";
import "./Welcome.css";

const features = [
  [
    "🚗",
    "Rent a Vehicle",
    "Browse cars available near your location. Filter by type, price, and distance. Book the one you need instantly.",
    "blue",
  ],
  [
    "💰",
    "List Your Vehicle",
    "Own a car that sits idle? Set your own daily price and earn from your parked vehicle.",
    "emerald",
  ],
  [
    "📍",
    "Nearby Map",
    "See all available cars around your current location and find the closest option.",
    "rose",
  ],
  [
    "📋",
    "Booking History",
    "Keep track of your trips and listings, including dates, earnings, and details.",
    "purple",
  ],
  [
    "🛡️",
    "Verified Users",
    "Every user completes identity verification and trips include basic protection.",
    "cyan",
  ],
  [
    "📱",
    "Simple to Use",
    "Sign up, search or list, and you are ready to go in under two minutes.",
    "amber",
  ],
];

export default function Welcome() {
  return (
    <div className="carnova-container">
      <div className="carnova-hero-wrapper">
        <div className="carnova-ambient-glow" />
        <header className="carnova-header">
          <nav className="carnova-nav" aria-label="Main navigation">
            <Link to="/" className="carnova-logo">
              keysNearby
            </Link>
            <div className="carnova-nav-links">
              <a className="nav-item active" href="#home">
                Home
              </a>
              <a className="nav-item" href="#about">
                About
              </a>
              <Link className="carnova-nav-signin-btn" to="/login">
                Sign In
              </Link>
            </div>
          </nav>
        </header>
        <main id="home" className="carnova-main">
          <div className="carnova-hero-content">
            <div className="carnova-badge">
              <span aria-hidden="true">♛</span>
              <span>Trusted vehicle rental</span>
            </div>
            <h1 className="carnova-title">
              Find the vehicle that feels
              <br className="desktop-break" /> right to you
            </h1>
            <p className="carnova-subtitle">
              Discover a seamless way to choose the perfect vehicle based on
              your comfort, needs, and lifestyle.
            </p>
            <Link className="carnova-hero-getstarted-btn" to="/login">
              Get Started <span aria-hidden="true">→</span>
            </Link>
          </div>
        </main>
      </div>
      <div className="carnova-ruler-container">
        <hr className="carnova-horizontal-ruler" />
      </div>
      <section id="about" className="carnova-about-section">
        <div className="carnova-section-header">
          <span className="section-eyebrow">What is Keys Nearby?</span>
          <h2>Everything You Need, Right on Your Block</h2>
          <p>
            Keys Nearby lets vehicle owners list cars at a price they set, while
            renters search, filter, and book available vehicles nearby through
            one simple app.
          </p>
        </div>
        <div className="carnova-features-grid">
          {features.map(([emoji, title, text, color]) => (
            <article className="carnova-feature-card" key={title}>
              <div className={`feature-icon-wrapper icon-${color}`}>
                <span>{emoji}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="carnova-footer">
        © {new Date().getFullYear()} Keys Nearby. Peer-to-Peer Vehicle Rental
        Platform.
      </footer>
    </div>
  );
}
