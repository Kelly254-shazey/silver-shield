import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { PROGRAM_NAV_ITEMS } from "../app/programCatalog";
import LogoBrand from "./LogoBrand";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { type: "programs", label: "Programs" },
  { to: "/events", label: "Events" },
  { to: "/impact", label: "Impact" },
  { to: "/stories", label: "Stories" },
  { to: "/team", label: "Team" },
  { to: "/donate", label: "Donate" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [programMenuOpen, setProgramMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setProgramMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setProgramMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className={menuOpen ? "site-header menu-open" : "site-header"}>
      <div className="container">
        <div className="prototype-nav-shell">
          <div className="brand-mark-wrap">
            <LogoBrand variant="minimal" className="brand-mark" />
            <Link
              to="/admin/login"
              className="admin-dot-link"
              aria-label="Admin login"
              title="Admin login"
            >
              .
            </Link>
          </div>

          <nav className="nav-links" id="site-navigation" aria-label="Primary navigation">
            {navLinks.map((item) => (
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
                      isActive
                        ? "nav-link prototype-nav-link active"
                        : "nav-link prototype-nav-link"
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
                    <span aria-hidden="true">v</span>
                  </button>
                  <div className="nav-dropdown-menu">
                    {PROGRAM_NAV_ITEMS.map((program) => (
                      <NavLink
                        key={program.slug}
                        to={`/programs/${program.slug}`}
                        className={({ isActive }) =>
                          isActive
                            ? "nav-dropdown-item active"
                            : "nav-dropdown-item"
                        }
                        onClick={() => {
                          setMenuOpen(false);
                          setProgramMenuOpen(false);
                        }}
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
              )
            ))}
          </nav>

          <div className="prototype-nav-actions">
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
