import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Briefcase, 
  BookOpen, 
  BarChart3, 
  Users2, 
  Info, 
  Calendar, 
  Users, 
  Heart, 
  Inbox, 
  FileText, 
  LogOut, 
  Globe,
  Menu,
  ChevronRight,
  User
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LogoBrand from "../../components/LogoBrand";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { to: "/admin/programs", label: "Programs", icon: <Briefcase size={20} /> },
  { to: "/admin/stories", label: "Stories", icon: <BookOpen size={20} /> },
  { to: "/admin/impact", label: "Impact Stats", icon: <BarChart3 size={20} /> },
  { to: "/admin/partners", label: "Partners", icon: <Users2 size={20} /> },
  { to: "/admin/about", label: "About Page", icon: <Info size={20} /> },
  { to: "/admin/events", label: "Events", icon: <Calendar size={20} /> },
  { to: "/admin/team", label: "Team & Board", icon: <Users size={20} /> },
  { to: "/admin/donations", label: "Donations", icon: <Heart size={20} /> },
  { to: "/admin/inbox", label: "Inbox", icon: <Inbox size={20} /> },
  { to: "/admin/docs", label: "Documentation", icon: <FileText size={20} /> },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  const currentTitle = navItems.find(item => item.to === location.pathname)?.label || "Admin Console";

  return (
    <div className="flex min-h-screen bg-surface-200 overflow-x-hidden font-body">
      
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-brand-900 text-white z-sticky transition-transform duration-300 ${
        navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <LogoBrand variant="icon" className="invert brightness-0" />
            <div className="flex flex-col leading-tight">
              <h2 className="text-sm font-black tracking-wider uppercase m-0">Silver Shield</h2>
              <p className="text-[10px] font-bold text-brand-400 tracking-widest uppercase m-0">Admin Console</p>
            </div>
          </div>

          <nav className="flex-grow flex flex-col gap-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm no-underline ${
                    isActive ? "bg-white/10 text-white shadow-sm" : "text-brand-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {item.icon}
                <span className="flex-grow">{item.label}</span>
                <ChevronRight size={14} className="opacity-40" />
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-brand-500 hover:text-white transition-colors no-underline">
              <Globe size={16} /> Public Website
            </Link>
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-all font-bold text-sm border-none cursor-pointer text-left"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      <AnimatePresence>
        {navOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm z-[90] lg:hidden"
            onClick={() => setNavOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        <header className="sticky top-0 z-[80] bg-surface-100/80 backdrop-blur-md border-b border-border-subtle p-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-text-900 bg-transparent border-none cursor-pointer"
              onClick={() => setNavOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-black text-brand-900 uppercase tracking-widest hidden sm:block">{currentTitle}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right hidden sm:flex leading-tight">
                <span className="text-sm font-black text-text-900">{user?.name || "Administrator"}</span>
                <span className="text-[10px] font-bold text-text-400 uppercase tracking-widest">Global Master</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-100 border border-brand-800/10 flex items-center justify-center text-brand-800">
                <User size={24} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 flex-grow">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
