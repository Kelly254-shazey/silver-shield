import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoBrand from "../../components/LogoBrand";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/programs", label: "Programs" },
  { to: "/admin/stories", label: "Stories" },
  { to: "/admin/impact", label: "Impact Stats" },
  { to: "/admin/partners", label: "Partners" },
  { to: "/admin/about", label: "About Page" },
  { to: "/admin/events", label: "Events" },
  { to: "/admin/team", label: "Team & Board" },
  { to: "/admin/donations", label: "Donations" },
  { to: "/admin/inbox", label: "Inbox" },
  { to: "/admin/docs", label: "Documentation" },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div className="admin-brand">
            <LogoBrand variant="icon" />
            <div>
              <h2>Silver Shield</h2>
              <p>Admin Console</p>
            </div>
          </div>
          <div className="admin-top-actions">
            <button
              type="button"
              className={navOpen ? "admin-nav-toggle active" : "admin-nav-toggle"}
              aria-label="Toggle admin navigation"
              aria-expanded={navOpen}
              onClick={() => setNavOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
            <button type="button" className="btn btn-outline" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
        <nav className={navOpen ? "admin-top-nav open" : "admin-top-nav"}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
              onClick={() => setNavOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <button
        type="button"
        className={navOpen ? "admin-nav-backdrop active" : "admin-nav-backdrop"}
        onClick={() => setNavOpen(false)}
        aria-label="Close admin navigation"
      />
      <main className="admin-main">
        <header className="admin-topbar glass-panel">
          <Link to="/" className="admin-back-link" aria-label="Back to website">
            <span aria-hidden="true">{"<-"}</span>
            Back to Website
          </Link>
          <p>Welcome, {user?.name || "Admin"}</p>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
