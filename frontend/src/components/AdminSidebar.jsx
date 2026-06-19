import { NavLink, Link } from "react-router-dom";
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
  HeartHandshake,
  FileText,
  LogOut,
  Globe,
  Newspaper,
  GitBranch,
  Settings,
} from "lucide-react";
import LogoBrand from "../../../components/LogoBrand";

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

export default function AdminSidebar({ logout }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="p-4 lg:p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <LogoBrand />
          <div>
            <h2 className="text-white text-sm font-black uppercase">
              Silver Shield
            </h2>
            <p className="text-slate-400 text-xs uppercase">
              Admin Console
            </p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="px-5 mb-2 text-[10px] uppercase tracking-widest text-slate-400">
              {group.label}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `mx-2 mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 no-underline transition-all ${
                    isActive
                      ? "bg-white text-slate-900"
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
      <div className="p-4 border-t border-white/10">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white no-underline text-sm"
        >
          <Globe size={18} />
          Public Website
        </Link>
        <button
          onClick={logout}
          className="w-full mt-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 px-4 py-2.5 text-white/70 border border-white/10 transition-all cursor-pointer text-sm"
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