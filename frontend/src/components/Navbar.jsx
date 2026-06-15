import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, ChevronDown, Heart } from "lucide-react";
import { PROGRAM_NAV_ITEMS } from "../app/programCatalog";
import LogoBrand from "./LogoBrand";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { type: "programs", label: "Programs" },
  { to: "/events", label: "Events" },
  { to: "/stories", label: "Stories" },
  { to: "/blog", label: "Blog" },
  {  to: "/contact", label: "Contact" },
  { to : "/team", label: "Team" },
  { to: "/volunteer", label: "Volunteer" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [programMenuOpen, setProgramMenuOpen] = useState(false);
  const location = useLocation();

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  useEffect(() => {
    setIsOpen(false);
    setProgramMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`navbar-shell ${scrolled ? "navbar-scrolled" : ""}`}
      >
        <div className="top-info-bar">
          <div className="container navbar-inner">
            <div className="top-info-group">
              <a href="mailto:Shieldsilver105@gmail.com" className="top-info-item">
                <span className="top-info-icon">✉</span>
                Shieldsilver105@gmail.com
              </a>
              <a href="tel:+254726836021" className="top-info-item">
                <span className="top-info-icon">☎</span>
                +254 726 836 021
              </a>
            </div>
            <div className="top-info-label">
              <span className="top-info-icon"></span>
              Kanduyi, Bungoma, Kenya
            </div>
          </div>
        </div>

        <div className="container navbar-inner">
          {/* Logo + Organization Name */}
          <Link to="/" className="navbar-brand">
            <LogoBrand variant="default" tone="dark" className="navbar-logo" />
            <div className="navbar-brand-text">
              <span className="navbar-brand-title">Silver Shield</span>
              <span className="navbar-brand-subtitle">Organisation</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-links">
            {navLinks.map((item) =>
              item.type === "programs" ? (
                <div
                  key="programs"
                  className="nav-item nav-item-group"
                  onMouseEnter={() => setProgramMenuOpen(true)}
                  onMouseLeave={() => setProgramMenuOpen(false)}
                >
                  <button
                    className={`nav-item-button ${
                      location.pathname.startsWith("/programs") ? "nav-item-active" : ""
                    }`}
                    aria-expanded={programMenuOpen}
                  >
                    Programs
                    <ChevronDown
                      size={14}
                      className={`nav-item-chevron ${programMenuOpen ? "nav-item-chevron-open" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {programMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="program-dropdown-panel"
                      >
                        <div className="program-dropdown-header">
                          <span className="label text-text-400">Our Focus Areas</span>
                        </div>
                        {PROGRAM_NAV_ITEMS.map((program) => (
                          <NavLink
                            key={program.slug}
                            to={`/programs/${program.slug}`}
                            className={({ isActive }) =>
                              `program-dropdown-link ${isActive ? "program-dropdown-link-active" : ""}`
                            }
                          >
                            {program.title}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "nav-item-active" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && <span className="nav-underline" />}
                    </>
                  )}
                </NavLink>
              )
            )}
          </nav>

          <div className="nav-actions">
            <Link to="/contact" className="btn btn-secondary btn-sm">
              Partner
            </Link>
            <Link to="/donate" className="btn btn-primary btn-sm">
              <Heart size={14} className="fill-current" /> Donate
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="nav-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu - positioned fixed outside navbar to prevent layout inflation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-menu-backdrop"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              variants={{
                closed: {
                  opacity: 0,
                  x: "100%",
                  transition: { duration: 0.2, ease: "easeIn" },
                },
                open: {
                  opacity: 1,
                  x: 0,
                  transition: {
                    type: "spring",
                    damping: 30,
                    stiffness: 300,
                    mass: 0.8,
                  },
                },
              }}
              initial="closed"
              animate="open"
              exit="closed"
              className="mobile-menu-panel"
            >
              <div className="mobile-menu-content">
                <div className="mobile-nav-group">
                  {navLinks.map((item) =>
                    item.type === "programs" ? (
                      <div
                        key="mob-programs"
                        className="mobile-nav-group"
                      >
                        <span className="label text-text-400">Programs</span>
                        <div className="mobile-nav-subgroup">
                          {PROGRAM_NAV_ITEMS.map((program) => (
                            <NavLink
                              key={program.slug}
                              to={`/programs/${program.slug}`}
                              className="mobile-nav-link"
                              onClick={() => setIsOpen(false)}
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
                        className="mobile-nav-link"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </NavLink>
                    )
                  )}
                </div>
              </div>
              <div className="mobile-menu-actions">
                <Link
                  to="/donate"
                  className="btn btn-primary btn-lg w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Heart size={20} className="fill-current" /> Donate Now
                </Link>
                <Link
                  to="/contact"
                  className="btn btn-secondary btn-lg w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Partner With Us
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
