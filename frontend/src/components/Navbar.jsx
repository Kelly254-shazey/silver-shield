/**
 * Navbar.jsx — Silver Shield Organisation
 * Fully responsive, no external CSS.
 * Mobile toggle is 100% visible on phones.
 */

import { useEffect, useState, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import {
  Menu, X, ChevronDown, Heart,
  Home, CalendarDays, BookOpen, PenLine,
  Info, Users, HandHelping, Mail,
  LayoutGrid, Phone, MapPin,
} from "lucide-react";

import LogoBrand from "./LogoBrand";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { useContent } from "../app/ContentContext";

// ─── ROBUST MOBILE DETECTION ──────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // sync on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

// ─── Nav link definitions ──────────────────────────────────────────────────
const mainNavLinks = [
  { to: "/",        label: "Home",    icon: Home,         end: true },
  { to: "/events",  label: "Events",  icon: CalendarDays            },
  { to: "/stories", label: "Stories", icon: BookOpen                },
  { to: "/blog",    label: "Blog",    icon: PenLine                 },
];

const orgNavLinks = [
  { to: "/about",     label: "About",     icon: Info        },
  { to: "/team",      label: "Team",      icon: Users       },
  { to: "/volunteer", label: "Volunteer", icon: HandHelping },
  { to: "/contact",   label: "Contact",   icon: Mail        },
];

// ─── Style tokens (all via CSS vars) ──────────────────────────────────────
const S = {
  topbar: {
    background: "var(--color-primary, #6B21A8)",
    color: "var(--color-primary-foreground, #fff)",
    fontSize: "0.75rem",
    padding: "0.35rem 0",
  },
  topbarInner: {
    maxWidth: "var(--container-max, 1280px)",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  topbarGroup: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  topbarLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    color: "inherit",
    textDecoration: "none",
    opacity: 0.9,
  },
  topbarLocation: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    opacity: 0.9,
  },

  shell: (scrolled) => ({
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "100%",
    background: scrolled
      ? "rgba(var(--color-background-rgb, 255,255,255), 0.92)"
      : "var(--color-background, #fff)",
    backdropFilter: scrolled ? "blur(12px)" : "none",
    boxShadow: scrolled
      ? "0 2px 16px rgba(0,0,0,0.08)"
      : "0 1px 0 rgba(0,0,0,0.07)",
    transition: "background 0.3s, box-shadow 0.3s",
  }),

  bar: {
    maxWidth: "var(--container-max, 1280px)",
    margin: "0 auto",
    padding: "0 1.5rem",
    height: "4rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    overflow: "visible", // 🔥 ensures nothing clips the toggle
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    textDecoration: "none",
    flexShrink: 0,      // keep brand from squishing
  },
  brandText: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.1,
  },
  brandTitle: {
    fontWeight: 700,
    fontSize: "0.875rem",
    letterSpacing: "0.08em",
    color: "var(--color-primary, #6B21A8)",
  },
  brandSub: {
    fontSize: "0.6rem",
    letterSpacing: "0.12em",
    color: "var(--color-muted-foreground, #888)",
    textTransform: "uppercase",
  },

  // ── desktop nav ────────────────────────────────────────────────────────
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    flex: 1,
    justifyContent: "center",
  },
  navGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.1rem",
  },
  navLink: (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.4rem 0.65rem",
    borderRadius: "0.4rem",
    fontSize: "0.8rem",
    fontWeight: isActive ? 600 : 400,
    color: isActive
      ? "var(--color-primary, #6B21A8)"
      : "var(--color-foreground, #111)",
    background: isActive
      ? "var(--color-primary-light, rgba(107,33,168,0.08))"
      : "transparent",
    textDecoration: "none",
    transition: "background 0.15s, color 0.15s",
    whiteSpace: "nowrap",
  }),

  // ── programmes dropdown ──────────────────────────────────────────────
  dropWrap: {
    position: "relative",
  },
  dropBtn: (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.4rem 0.65rem",
    borderRadius: "0.4rem",
    fontSize: "0.8rem",
    fontWeight: isActive ? 600 : 400,
    color: isActive
      ? "var(--color-primary, #6B21A8)"
      : "var(--color-foreground, #111)",
    background: isActive
      ? "var(--color-primary-light, rgba(107,33,168,0.08))"
      : "transparent",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }),
  dropdown: {
    position: "absolute",
    top: "calc(100% + 0.5rem)",
    left: "50%",
    transform: "translateX(-50%)",
    minWidth: "13rem",
    background: "var(--color-background, #fff)",
    border: "1px solid var(--color-border, #e5e7eb)",
    borderRadius: "0.6rem",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    padding: "0.4rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.1rem",
    zIndex: 50,
  },
  dropLink: (isActive) => ({
    display: "block",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.4rem",
    fontSize: "0.8rem",
    fontWeight: isActive ? 600 : 400,
    color: isActive
      ? "var(--color-primary, #6B21A8)"
      : "var(--color-foreground, #111)",
    background: isActive
      ? "var(--color-primary-light, rgba(107,33,168,0.08))"
      : "transparent",
    textDecoration: "none",
    transition: "background 0.12s",
  }),
  dropEmpty: {
    padding: "0.5rem 0.75rem",
    fontSize: "0.8rem",
    color: "var(--color-muted-foreground, #888)",
  },

  // ── CTA buttons ───────────────────────────────────────────────────────
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flexShrink: 1,        // 🔥 allow shrinking on small screens
    minWidth: 0,
  },
  btnOutline: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.45rem 1rem",
    borderRadius: "2rem",
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "var(--color-primary, #6B21A8)",
    border: "1.5px solid var(--color-primary, #6B21A8)",
    background: "transparent",
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  btnFilled: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.45rem 1rem",
    borderRadius: "2rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--color-primary-foreground, #fff)",
    background: "var(--color-primary, #6B21A8)",
    border: "none",
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  btnFull: {
    width: "100%",
    justifyContent: "center",
  },

  // ── mobile toggle ─────────────────────────────────────────────────────
  // Rendered always, but hidden on desktop via display: none
  mobileToggle: (isMobile) => ({
    display: isMobile ? "flex" : "none", // 🔥 key fix: hidden only on desktop
    alignItems: "center",
    justifyContent: "center",
    width: "2.25rem",
    height: "2.25rem",
    borderRadius: "0.4rem",
    border: "1px solid var(--color-border, #e5e7eb)",
    background: "transparent",
    cursor: "pointer",
    flexShrink: 0,
    color: "var(--color-foreground, #111)",
  }),

  // ── backdrop & drawer ────────────────────────────────────────────────
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 1100,
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "min(85vw, 22rem)",
    background: "var(--color-background, #fff)",
    zIndex: 1200,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.25rem",
    borderBottom: "1px solid var(--color-border, #e5e7eb)",
    flexShrink: 0,
  },
  drawerBody: {
    display: "flex",
    flexDirection: "column",
    padding: "0.75rem 0",
    flex: 1,
  },
  drawerLink: (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1.25rem",
    fontSize: "0.9rem",
    fontWeight: isActive ? 600 : 400,
    color: isActive
      ? "var(--color-primary, #6B21A8)"
      : "var(--color-foreground, #111)",
    background: isActive
      ? "var(--color-primary-light, rgba(107,33,168,0.08))"
      : "transparent",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "background 0.12s",
  }),
  drawerAccordionBtn: (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1.25rem",
    fontSize: "0.9rem",
    fontWeight: isActive ? 600 : 400,
    color: isActive
      ? "var(--color-primary, #6B21A8)"
      : "var(--color-foreground, #111)",
    background: isActive
      ? "var(--color-primary-light, rgba(107,33,168,0.08))"
      : "transparent",
    border: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
  }),
  drawerSublink: (isActive) => ({
    display: "block",
    padding: "0.6rem 1.25rem 0.6rem 3.25rem",
    fontSize: "0.85rem",
    fontWeight: isActive ? 600 : 400,
    color: isActive
      ? "var(--color-primary, #6B21A8)"
      : "var(--color-muted-foreground, #555)",
    background: isActive
      ? "var(--color-primary-light, rgba(107,33,168,0.06))"
      : "transparent",
    textDecoration: "none",
    borderLeft: "2px solid var(--color-primary-light, rgba(107,33,168,0.2))",
    transition: "background 0.12s",
  }),
  drawerDivider: {
    height: "1px",
    background: "var(--color-border, #e5e7eb)",
    margin: "0.5rem 1.25rem",
  },
  drawerActions: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "0.75rem 1.25rem",
  },
  drawerContact: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "0.75rem 1.25rem",
    borderTop: "1px solid var(--color-border, #e5e7eb)",
    marginTop: "auto",
  },
  drawerContactLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.8rem",
    color: "var(--color-muted-foreground, #666)",
    textDecoration: "none",
  },
};

// ─── ProgramsList ──────────────────────────────────────────────────────────
function ProgramsList({ programs, loading, error, linkStyle, activeLinkStyle, onPick }) {
  if (loading) return <span style={S.dropEmpty}>Loading programmes…</span>;
  if (error)   return <span style={S.dropEmpty}>Could not load programmes</span>;
  if (!programs.length) return <span style={S.dropEmpty}>No programmes yet</span>;

  return programs.map((prog) => (
    <NavLink
      key={prog.id}
      to={`/programs/${prog.slug}`}
      onClick={onPick}
      style={({ isActive }) =>
        isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle
      }
    >
      {prog.title}
    </NavLink>
  ));
}

// ─── Main Navbar ──────────────────────────────────────────────────────────
export default function Navbar() {
  const [isOpen,             setIsOpen]             = useState(false);
  const [scrolled,           setScrolled]           = useState(false);
  const [programMenuOpen,    setProgramMenuOpen]    = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);

  const location = useLocation();
  const { settings } = useSiteSettings();
  const { programs, loading, error } = useContent();
  const { scrollY } = useScroll();
  const isMobile = useIsMobile();

  // Scroll listener
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 50));

  // Close drawer on navigation
  useEffect(() => {
    setIsOpen(false);
    setProgramMenuOpen(false);
  }, [location.pathname]);

  // Auto-open programmes accordion if on a programmes page
  useEffect(() => {
    if (location.pathname.startsWith("/programs")) {
      setMobileProgramsOpen(true);
    }
  }, [location.pathname]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setProgramMenuOpen(false);
  }, []);

  const onPrograms = location.pathname.startsWith("/programs");

  const activeDropStyle = {
    fontWeight: 600,
    color:      "var(--color-primary, #6B21A8)",
    background: "var(--color-primary-light, rgba(107,33,168,0.08))",
  };
  const activeSubStyle = {
    fontWeight: 600,
    color:      "var(--color-primary, #6B21A8)",
    background: "var(--color-primary-light, rgba(107,33,168,0.06))",
  };

  // Dropdown close delay
  const [closeTimer, setCloseTimer] = useState(null);
  const handleMouseLeave = () => {
    const timer = setTimeout(() => setProgramMenuOpen(false), 120);
    setCloseTimer(timer);
  };
  const handleMouseEnter = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      setCloseTimer(null);
    }
    setProgramMenuOpen(true);
  };

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={S.shell(scrolled)}
      >
        {/* TOP BAR */}
        <div style={S.topbar}>
          <div style={S.topbarInner}>
            <div style={S.topbarGroup}>
              <a
                href={`mailto:${settings?.contactEmail || "info@silvershield.org"}`}
                style={S.topbarLink}
              >
                <Mail size={11} aria-hidden="true" />
                {settings?.contactEmail || "info@silvershield.org"}
              </a>
              <a
                href={`tel:${(settings?.contactPhone || "+254700000000").replace(/\s/g, "")}`}
                style={S.topbarLink}
              >
                <Phone size={11} aria-hidden="true" />
                {settings?.contactPhone || "+254 700 000 000"}
              </a>
            </div>
            <div style={S.topbarLocation}>
              <MapPin size={11} aria-hidden="true" />
              {settings?.officeLocation || "Nairobi, Kenya"}
            </div>
          </div>
        </div>

        {/* MAIN BAR */}
        <div style={S.bar}>
          {/* Brand */}
          <Link to="/" style={S.brand} aria-label="Silver Shield home">
            <LogoBrand variant="minimal" />
            <div style={S.brandText}>
              <span style={S.brandTitle}>SILVER SHIELD</span>
              <span style={S.brandSub}>ORGANISATION</span>
            </div>
          </Link>

          {/* Desktop navigation — hidden on mobile */}
          {!isMobile && (
            <nav className="nb-nav" style={S.nav} aria-label="Main navigation">
              <div style={S.navGroup}>
                {mainNavLinks.map((item) => {
                  const NavIcon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      style={({ isActive }) => S.navLink(isActive)}
                    >
                      <NavIcon size={14} aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>

              {/* Programmes dropdown */}
              <div
                style={S.dropWrap}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  style={S.dropBtn(onPrograms)}
                  aria-haspopup="true"
                  aria-expanded={programMenuOpen}
                >
                  <LayoutGrid size={14} aria-hidden="true" />
                  Programmes
                  <motion.span
                    animate={{ rotate: programMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "inline-flex" }}
                  >
                    <ChevronDown size={12} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {programMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8,  scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit={{    opacity: 0, y: 8,  scale: 0.97 }}
                      transition={{ duration: 0.16 }}
                      style={S.dropdown}
                      role="menu"
                    >
                      <ProgramsList
                        programs={programs}
                        loading={loading}
                        error={error}
                        linkStyle={S.dropLink(false)}
                        activeLinkStyle={activeDropStyle}
                        onPick={() => setProgramMenuOpen(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={S.navGroup}>
                {orgNavLinks.map((item) => {
                  const NavIcon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      style={({ isActive }) => S.navLink(isActive)}
                    >
                      <NavIcon size={14} aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </nav>
          )}

          {/* ── CTA Buttons ────────────────────────────────────────────── */}
          <div className="nb-actions" style={S.actions}>
            {/* "Partner with us" – hidden on mobile to save space */}
            {!isMobile && (
              <Link to="/contact" style={S.btnOutline}>
                Partner with us
              </Link>
            )}
            {/* Donate – shows only icon on mobile, full text on desktop */}
            <Link to="/donate" style={S.btnFilled}>
              <Heart size={14} aria-hidden="true" />
              {isMobile ? "" : "Donate"}
            </Link>
          </div>

          {/* ── MOBILE TOGGLE ───────────────────────────────────────────── */}
          {/* Rendered unconditionally, but hidden on desktop via style */}
          <button
            className="nb-mobile-toggle"
            style={S.mobileToggle(isMobile)}
            onClick={() => setIsOpen((p) => !p)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isOpen ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{    rotate:  90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: "inline-flex" }}
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* ── MOBILE DRAWER ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              style={S.backdrop}
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            <motion.div
              style={S.drawer}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.26 }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              <div style={S.drawerHeader}>
                <Link to="/" style={S.brand} onClick={close}>
                  <LogoBrand variant="minimal" />
                  <div style={S.brandText}>
                    <span style={S.brandTitle}>SILVER SHIELD</span>
                    <span style={S.brandSub}>ORGANISATION</span>
                  </div>
                </Link>
                <button
                  style={{ ...S.mobileToggle(true), display: "flex" }}
                  onClick={close}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div style={S.drawerBody}>
                {mainNavLinks.map((item) => {
                  const NavIcon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={close}
                      style={({ isActive }) => S.drawerLink(isActive)}
                    >
                      <NavIcon size={17} aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  );
                })}

                <div>
                  <button
                    style={S.drawerAccordionBtn(onPrograms)}
                    onClick={() => setMobileProgramsOpen((p) => !p)}
                    aria-expanded={mobileProgramsOpen}
                  >
                    <LayoutGrid size={17} aria-hidden="true" />
                    <span style={{ flex: 1, textAlign: "left" }}>Programmes</span>
                    <motion.span
                      animate={{ rotate: mobileProgramsOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: "inline-flex" }}
                    >
                      <ChevronDown size={14} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {mobileProgramsOpen && (
                      <motion.div
                        key="mob-programs"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden" }}
                      >
                        <ProgramsList
                          programs={programs}
                          loading={loading}
                          error={error}
                          linkStyle={S.drawerSublink(false)}
                          activeLinkStyle={activeSubStyle}
                          onPick={close}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {orgNavLinks.map((item) => {
                  const NavIcon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={close}
                      style={({ isActive }) => S.drawerLink(isActive)}
                    >
                      <NavIcon size={17} aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  );
                })}

                <div style={S.drawerDivider} />

                <div style={S.drawerActions}>
                  <Link
                    to="/contact"
                    style={{ ...S.btnOutline, ...S.btnFull }}
                    onClick={close}
                  >
                    Partner with us
                  </Link>
                  <Link
                    to="/donate"
                    style={{ ...S.btnFilled, ...S.btnFull }}
                    onClick={close}
                  >
                    <Heart size={14} aria-hidden="true" />
                    Donate
                  </Link>
                </div>

                <div style={S.drawerContact}>
                  <a
                    href={`mailto:${settings?.contactEmail || "info@silvershield.org"}`}
                    style={S.drawerContactLink}
                  >
                    <Mail size={13} aria-hidden="true" />
                    {settings?.contactEmail || "info@silvershield.org"}
                  </a>
                  <a
                    href={`tel:${(settings?.contactPhone || "+254700000000").replace(/\s/g, "")}`}
                    style={S.drawerContactLink}
                  >
                    <Phone size={13} aria-hidden="true" />
                    {settings?.contactPhone || "+254 700 000 000"}
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}