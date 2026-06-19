import { useState, useMemo } from "react";
import { Outlet, useLocation, Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import {
  Menu, User, ChevronRight, Bell, Search, LogOut, Globe,
  LayoutDashboard, Briefcase, BookOpen, BarChart3, Users2,
  Info, Calendar, Users, Heart, Inbox, HeartHandshake,
  FileText, Settings, Newspaper, GitBranch,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LogoBrand from "../../components/LogoBrand";

// ─── Navigation groups ───
const navGroups = [
  {
    label: "Intelligence",
    items: [
      { to: "/admin/dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
      { to: "/admin/inbox", label: "Inquiry Feed", icon: <Inbox size={18} /> },
    ],
  },
  {
    label: "Communications",
    items: [
      { to: "/admin/programs", label: "Programs", icon: <Briefcase size={18} /> },
      { to: "/admin/sub-programs", label: "Sub-Tracks", icon: <GitBranch size={18} /> },
      { to: "/admin/blog", label: "Blog Console", icon: <Newspaper size={18} /> },
      { to: "/admin/stories", label: "Narratives", icon: <BookOpen size={18} /> },
      { to: "/admin/events", label: "Activations", icon: <Calendar size={18} /> },
      { to: "/admin/about", label: "Brand Story", icon: <Info size={18} /> },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/impact", label: "Site Metrics", icon: <BarChart3 size={18} /> },
      { to: "/admin/donations", label: "Support Ledger", icon: <Heart size={18} /> },
      { to: "/admin/partners", label: "Alliances", icon: <Users2 size={18} /> },
      { to: "/admin/team", label: "The Collective", icon: <Users size={18} /> },
      { to: "/admin/volunteers", label: "Personnel", icon: <HeartHandshake size={18} /> },
    ],
  },
  {
    label: "Systems",
    items: [
      { to: "/admin/docs", label: "AI Grounding", icon: <FileText size={18} /> },
      { to: "/admin/settings", label: "Global Master", icon: <Settings size={18} /> },
    ],
  },
];

const allNavItems = navGroups.flatMap(g => g.items);

// ─── Sidebar component ───
function Sidebar({ logout, onClose }) {
  return (
    <div className="flex flex-col h-full w-72 bg-slate-900">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <LogoBrand />
          <div>
            <h2 className="text-white text-sm font-black uppercase tracking-wide">
              Silver Shield
            </h2>
            <p className="text-slate-400 text-xs uppercase">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="px-5 mb-2 text-[10px] uppercase tracking-widest text-slate-400">
              {group.label}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `mx-3 mb-1 flex items-center gap-3 rounded-xl px-4 py-3 no-underline transition-colors ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`
                }
              >
                {item.icon}
                <span className="font-bold">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white no-underline transition-colors"
        >
          <Globe size={18} />
          Public Website
        </Link>
        <button
          onClick={logout}
          className="w-full mt-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 px-4 py-3 text-white/70 border border-white/10 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2">
            <LogOut size={18} />
            <span className="font-bold">End Session</span>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Main Layout ───
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ✅ Correctly detect large screens (≥1024px)
  const isDesktop = useMediaQuery({ query: "(min-width: 1024px)" });

  const location = useLocation();

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    let path = "";
    const crumbs = [{ label: "Console", to: "/admin" }];
    segments.forEach((seg) => {
      path += `/${seg}`;
      if (seg === "admin") return;
      const found = allNavItems.find(item => item.to === path);
      crumbs.push({
        label: found?.label || seg.charAt(0).toUpperCase() + seg.slice(1),
        to: path,
      });
    });
    return crumbs;
  }, [location.pathname]);

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── DESKTOP SIDEBAR (always visible on large screens) ─── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 z-20">
        <Sidebar logout={logout} onClose={closeMobileSidebar} />
      </aside>

      {/* ─── MOBILE SIDEBAR (overlay + slide-in) ─── */}
      <AnimatePresence>
        {!isDesktop && mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileSidebar}
            />
            {/* Drawer */}
            <motion.aside
              className="fixed left-0 top-0 h-screen z-50"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <Sidebar logout={logout} onClose={closeMobileSidebar} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT ─── */}
      <div
        className={`flex flex-col flex-1 min-h-screen ${
          isDesktop ? "pl-72" : ""
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="h-16 px-4 lg:px-6 flex items-center justify-between">
            {/* Left: toggle + breadcrumbs */}
            <div className="flex items-center gap-3 min-w-0">
              {/* ✅ Toggle button is ONLY rendered on mobile */}
              {!isDesktop && (
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>
              )}

              <nav className="flex items-center gap-1 flex-nowrap overflow-x-auto">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.to} className="flex items-center gap-1 whitespace-nowrap">
                    <Link
                      to={crumb.to}
                      className={`text-xs font-bold no-underline ${
                        i === breadcrumbs.length - 1
                          ? "text-indigo-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {crumb.label}
                    </Link>
                    {i < breadcrumbs.length - 1 && (
                      <ChevronRight size={12} className="text-gray-300" />
                    )}
                  </span>
                ))}
              </nav>
            </div>

            {/* Right: actions + user */}
            <div className="flex items-center gap-3 shrink-0">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Search">
                <Search size={16} className="text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative" aria-label="Notifications">
                <Bell size={16} className="text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0">
                  <User size={14} />
                </div>
                <span className="text-xs font-bold hidden md:block text-gray-700">
                  {user?.name || "Admin"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}