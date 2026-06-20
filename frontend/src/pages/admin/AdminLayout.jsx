import { useState, useMemo } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import {
  Menu,
  User,
  ChevronRight,
  Bell,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "../../components/AdminSidebar";
const navItems = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/inbox", label: "Inquiry Feed" },
  { to: "/admin/programs", label: "Programs" },
  { to: "/admin/sub-programs", label: "Sub-Tracks" },
  { to: "/admin/blog", label: "Blog Console" },
  { to: "/admin/stories", label: "Narratives" },
  { to: "/admin/events", label: "Activations" },
  { to: "/admin/about", label: "Brand Story" },
  { to: "/admin/impact", label: "Site Metrics" },
  { to: "/admin/donations", label: "Support Ledger" },
  { to: "/admin/partners", label: "Alliances" },
  { to: "/admin/team", label: "The Collective" },
  { to: "/admin/volunteers", label: "Personnel" },
  { to: "/admin/docs", label: "AI Grounding" },
  { to: "/admin/settings", label: "Global Master" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery({ query: "(min-width: 1024px)" });
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    let path = "";
    const crumbs = [{ label: "Console", to: "/admin" }];

    segments.forEach((seg) => {
      path += `/${seg}`;
      if (seg === "admin") return;

      const found = navItems.find((item) => item.to === path);

      crumbs.push({
        label: found?.label || seg,
        to: path,
      });
    });

    return crumbs;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 z-40">
        <AdminSidebar logout={logout} />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {!isDesktop && mobileSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />

            <motion.aside
              className="fixed left-0 top-0 h-screen z-50"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <AdminSidebar
                logout={logout}
                onClose={() => setMobileSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className={`flex flex-col flex-1 ${isDesktop ? "lg:pl-72" : ""}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="h-16 lg:h-20 px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {!isDesktop && (
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="p-2 rounded-xl hover:bg-gray-100"
                >
                  <Menu size={20} />
                </button>
              )}

              <nav className="flex items-center gap-1 overflow-x-auto">
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

            <div className="flex items-center gap-3">
              <button className="p-2 lg:p-3 hover:bg-gray-100 rounded-xl">
                <Search size={16} className="text-gray-500" />
              </button>

              <button className="p-2 lg:p-3 hover:bg-gray-100 rounded-xl relative">
                <Bell size={16} className="text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <User size={14} />
                </div>

                <span className="text-xs font-bold hidden md:block text-gray-700">
                  {user?.name || "Admin"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="p-4 lg:p-10 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}