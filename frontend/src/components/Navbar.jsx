import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { PROGRAM_NAV_ITEMS } from "../app/programCatalog";
import LogoBrand from "./LogoBrand";
import SocialLinks from "./SocialLinks";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { type: "programs", label: "Programs" },
  { to: "/events", label: "Events" },
  { to: "/stories", label: "Stories" },
  { to: "/team", label: "Team" },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/donate", label: "Donate" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [programMenuOpen, setProgramMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setProgramMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    document.body.classList.toggle("nav-open", menuOpen);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("nav-open");
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") { setMenuOpen(false); setProgramMenuOpen(false); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${menuOpen ? " menu-open" : ""}${scrolled ? " scrolled" : ""}`}>
      {/* Top bar */}
      <div className="navbar-top-bar">
        <div className="container navbar-top-container">
          <div className="navbar-contact-info">
            <a href="mailto:Shieldsilver105@gmail.com" className="navbar-contact-link">
              <span className="navbar-meta-label">Email</span>
              <span>Shieldsilver105@gmail.com</span>
            </a>
            <span className="navbar-contact-separator">/</span>
            <a href="tel:+254726836021" className="navbar-contact-link">
              <span className="navbar-meta-label">Call</span>
              <span>0726 836021</span>
            </a>
            <span className="navbar-contact-separator">/</span>
            <span className="navbar-contact-location">
              <span className="navbar-meta-label">Based in</span>
              <span>Kanduyi, Bungoma, Kenya</span>
            </span>
          </div>
          <SocialLinks className="navbar-socials" linkClassName="social-link-minimal" />
        </div>
      </div>

      {/* Main nav */}
      <div className="container">
        <div className="prototype-nav-shell">
          <div className="brand-mark-wrap">
            <LogoBrand variant="minimal" className="brand-mark" />
          </div>

          <nav className="nav-links" id="site-navigation" aria-label="Primary navigation">
            {/* Mobile header inside drawer */}
            <div className="nav-mobile-header">
              <LogoBrand variant="minimal" className="brand-mark" />
              <button
                type="button"
                className="nav-close-btn"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {navLinks.map((item) =>
              item.type === "programs" ? (
                <div
                  key="programs-menu"
                  className={programMenuOpen ? "nav-dropdown-group open" : "nav-dropdown-group"}
                  onMouseEnter={() => setProgramMenuOpen(true)}
                  onMouseLeave={() => setProgramMenuOpen(false)}
                >
                  <NavLink
                    to="/programs"
                    className={({ isActive }) =>
                      isActive ? "nav-link prototype-nav-link active" : "nav-link prototype-nav-link"
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                  <button
                    type="button"
                    className="nav-dropdown-toggle"
                    aria-label="Toggle programs menu"
                    aria-expanded={programMenuOpen}
                    onClick={() => setProgramMenuOpen((prev) => !prev)}
                  >
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="nav-dropdown-menu">
                    {PROGRAM_NAV_ITEMS.map((program) => (
                      <NavLink
                        key={program.slug}
                        to={`/programs/${program.slug}`}
                        className={({ isActive }) =>
                          isActive ? "nav-dropdown-item active" : "nav-dropdown-item"
                        }
                        onClick={() => { setMenuOpen(false); setProgramMenuOpen(false); }}
                      >
                        {program.title}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? "nav-link prototype-nav-link active" : "nav-link prototype-nav-link"
                  }
                  onClick={() => setMenuOpen(false)}
                  end={item.to === "/"}
                >
                  {item.label}
                </NavLink>
              ),
            )}

            {/* Mobile CTA inside drawer */}
            <div className="nav-mobile-cta">
              <Link to="/donate" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                Donate Now
              </Link>
              <Link to="/contact?inquiry=partner#contact-form" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>
                Partner With Us
              </Link>
            </div>
          </nav>

          <div className="prototype-nav-actions">
            <Link to="/contact?inquiry=partner#contact-form" className="btn btn-secondary prototype-partner-btn">
              Partner With Us
            </Link>
            <Link to="/donate" className="btn btn-donate prototype-donate-btn">
              Donate
            </Link>
            <button
              type="button"
              className={menuOpen ? "icon-btn icon-menu active" : "icon-btn icon-menu"}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="site-navigation"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={menuOpen ? "mobile-nav-backdrop active" : "mobile-nav-backdrop"}
        onClick={() => setMenuOpen(false)}
        aria-label="Close menu overlay"
      />
    </header>
  );
}

export default Navbar;
