import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { useDemo } from "../hooks/useDemo";
import "./Welcome.css";

const features = [
  [
    "car",
    "Rent a Vehicle",
    "Browse cars available near your location. Filter by type, price, and distance. Book the one you need instantly.",
    "blue",
  ],
  [
    "wallet",
    "List Your Vehicle",
    "Own a car that sits idle? Set your own daily price and earn from your parked vehicle.",
    "emerald",
  ],
  [
    "pin",
    "Nearby Map",
    "See all available cars around your current location and find the closest option.",
    "rose",
  ],
  [
    "history",
    "Booking History",
    "Keep track of your trips and listings, including dates, earnings, and details.",
    "purple",
  ],
  [
    "shield",
    "Verified Users",
    "Every user completes identity verification and trips include basic protection.",
    "cyan",
  ],
  [
    "bolt",
    "Simple to Use",
    "Sign up, search or list, and you are ready to go in under two minutes.",
    "amber",
  ],
  [
    "users",
    "Ride Pooling",
    "Share journeys with people travelling the same route, split fuel costs, and help reduce solo car trips.",
    "emerald",
  ],
  [
    "shield",
    "Women’s Safety",
    "Use trip check-ins, share a location link with a trusted contact, and access quick safety guidance.",
    "rose",
  ],
  [
    "sparkle",
    "KeyBot AI Assistant",
    "Ask in plain language: find an SUV under ₹2000, get a price quote, or check pooled rides.",
    "cyan",
  ],
  [
    "message",
    "Feedback & Support",
    "Rate your experience and suggest improvements so the platform can keep getting better.",
    "purple",
  ],
];

export default function Welcome() {
  const { user } = useDemo();

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
              <Link className="carnova-nav-signin-btn" to={user ? "/dashboard" : "/login"}>
                {user ? "Dashboard" : "Sign In"}
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
            <div className="hero-actions">
              <Link className="carnova-hero-getstarted-btn" to={user ? "/dashboard" : "/login"}>
                Get Started <span aria-hidden="true">→</span>
              </Link>
              <a className="hero-secondary-link" href="#about">Explore the platform ↓</a>
            </div>
            <div className="hero-trust-row">
              <span>✓ Flexible vehicle access</span><span>✓ Earn from idle vehicles</span><span>✓ Share journeys</span>
            </div>
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
          {features.map(([icon, title, text, color]) => (
            <article className="carnova-feature-card" key={title}>
              <div className={`feature-icon-wrapper icon-${color}`}>
                <Icon name={icon} size={24} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="how-section" aria-labelledby="how-title">
        <div className="carnova-section-header">
          <span className="section-eyebrow">How it works</span>
          <h2 id="how-title">Two ways to use Keys Nearby</h2>
        </div>
        <div className="how-grid">
          <article className="how-card">
            <span className="how-tag">Renting</span>
            <ol>
              <li><b>Search</b> cars, bikes and scooters near you</li>
              <li><b>Pick dates</b> and see the full price up front</li>
              <li><b>Book</b>, chat with the owner and go</li>
            </ol>
          </article>
          <article className="how-card how-card-host">
            <span className="how-tag">Hosting</span>
            <ol>
              <li><b>List</b> your vehicle with your own daily price</li>
              <li><b>Approve</b> requests from verified renters</li>
              <li><b>Earn</b> while it would otherwise sit parked</li>
            </ol>
          </article>
        </div>
      </section>
      <section className="homepage-pooling">
        <div className="pooling-copy">
          <span className="section-eyebrow">A smarter way to travel</span>
          <h2>One journey. Shared costs. A lighter footprint.</h2>
          <p>Ride pooling lets people heading in the same direction coordinate a shared trip. Riders can contribute toward fuel costs while drivers make better use of empty seats.</p>
          <Link className="carnova-hero-getstarted-btn" to="/login">Explore ride pooling <span aria-hidden="true">→</span></Link>
          <small>Contributions are illustrative and depend on route, local rules, and the people sharing the ride.</small>
        </div>
        <div className="pooling-benefits">
          <div><strong>01</strong><span><b>Share fuel costs</b><small>Split the trip cost fairly between passengers.</small></span></div>
          <div><strong>02</strong><span><b>Use fewer cars</b><small>Reduce duplicate journeys when routes match.</small></span></div>
          <div><strong>03</strong><span><b>Make seats useful</b><small>Drivers may receive cost contributions for spare seats.</small></span></div>
        </div>
      </section>
      <footer className="carnova-footer">
        © {new Date().getFullYear()} Keys Nearby. Peer-to-Peer Vehicle Rental
        Platform.
      </footer>
    </div>
  );
}
