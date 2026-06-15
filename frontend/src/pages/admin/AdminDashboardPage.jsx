import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  BookOpen, 
  Clock, 
  Inbox, 
  FileText,
  ArrowUpRight,
  MessageSquare,
  DollarSign
} from "lucide-react";
import PageTransition from "../../components/PageTransition";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { apiFetch } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

function AdminDashboardPage() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    programs: 0,
    stories: 0,
    donationsTotal: 0,
    donationsPending: 0,
    inboxUnread: 0,
    docs: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);

  const loadDashboard = async () => {
    const [programsRes, storiesRes, donationsRes, messagesRes, docsRes] = await Promise.all([
      apiFetch("/programs?admin=true", { token }),
      apiFetch("/stories?admin=true", { token }),
      apiFetch("/donations", { token }),
      apiFetch("/messages", { token }),
      apiFetch("/docs", { token }),
    ]);

    const donations = donationsRes.data || [];
    const messages = messagesRes.data || [];

    setSummary({
      programs: (programsRes.data || []).length,
      stories: (storiesRes.data || []).length,
      donationsTotal: donations.length,
      donationsPending: donations.filter((item) => item.status === "PENDING").length,
      inboxUnread: messages.filter((item) => item.status === "UNREAD").length,
      docs: (docsRes.data || []).length,
    });

    setRecentMessages(messages.slice(0, 5));
    setRecentDonations(donations.slice(0, 5));
  };

  useEffect(() => {
    let mounted = true;
    loadDashboard()
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => { if (mounted) setLoading(false); });

    const interval = setInterval(() => {
      loadDashboard().catch(() => undefined);
    }, 30000);

    return () => { mounted = false; clearInterval(interval); };
  }, [token, pushToast]);

  const cards = useMemo(() => [
    { label: "Total Programs", value: summary.programs, icon: <Briefcase size={20} />, color: "bg-brand-100 text-brand-800" },
    { label: "Change Stories", value: summary.stories, icon: <BookOpen size={20} />, color: "bg-accent-100 text-accent-700" },
    { label: "Donation Count", value: summary.donationsTotal, icon: <DollarSign size={20} />, color: "bg-success/10 text-success" },
    { label: "Pending Verification", value: summary.donationsPending, icon: <Clock size={20} />, color: "bg-warning/10 text-warning" },
    { label: "New Messages", value: summary.inboxUnread, icon: <MessageSquare size={20} />, color: "bg-brand-100 text-brand-800" },
    { label: "Active Documents", value: summary.docs, icon: <FileText size={20} />, color: "bg-surface-300 text-text-700" },
  ], [summary]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-10">
        
        {/* Stats Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading ? Array(6).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-32 rounded-3xl" />) :
            cards.map((card, i) => (
              <motion.article 
                key={i} 
                variants={item}
                className="card p-6 md:p-8 flex flex-col gap-4"
              >
                <header className="flex justify-between items-start mb-2">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${card.color}`}>
                    {card.icon}
                  </div>
                  <ArrowUpRight className="text-text-400 opacity-50" size={18} />
                </header>
                <div className="card-content">
                  <span className="text-[10px] font-black text-text-400 uppercase tracking-widest">{card.label}</span>
                  <h3 className="text-2xl font-black text-brand-900 m-0 tracking-tight">{card.value}</h3>
                </div>
              </motion.article>
            ))
          }
        </motion.div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Inbox Panel */}
          <article className="card p-8 flex flex-col gap-8">
            <header className="flex items-center justify-between border-b border-border-subtle pb-6">
              <h2 className="text-xs font-black text-brand-900 uppercase tracking-widest flex items-center gap-3 m-0">
                <Inbox size={18} /> Recent Inquiries
              </h2>
              <span className="text-[9px] font-black text-accent-600 uppercase tracking-tighter">Live Feed</span>
            </header>
            <div className="flex-grow">
              <div className="flex flex-col gap-2">
                {recentMessages.length === 0 ? (
                  <div className="py-12 text-center text-text-400 text-[10px] font-bold uppercase tracking-widest">Quiet in the hub.</div>
                ) : recentMessages.map((msg) => (
                  <div key={msg.id} className="p-5 flex items-start gap-4 hover:bg-surface-200 rounded-2xl transition-colors border border-transparent hover:border-border-subtle">
                    <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800 flex-shrink-0 font-black text-xs uppercase shadow-sm">
                      {msg.fullName.charAt(0)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-black text-brand-900 truncate m-0 uppercase tracking-tighter">{msg.subject}</h4>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${msg.status === 'UNREAD' ? 'bg-accent-600 text-white' : 'bg-surface-300 text-text-500'}`}>
                          {msg.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-400 font-bold uppercase tracking-widest m-0">{msg.fullName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Donations Panel */}
          <article className="card p-8 flex flex-col gap-8">
            <header className="flex items-center justify-between border-b border-border-subtle pb-6">
              <h2 className="text-xs font-black text-brand-900 uppercase tracking-widest flex items-center gap-3 m-0">
                <DollarSign size={18} /> Recent Support
              </h2>
              <span className="text-[9px] font-black text-success uppercase tracking-tighter">Verified Impact</span>
            </header>
            <div className="flex-grow">
              <div className="flex flex-col gap-2">
                {recentDonations.length === 0 ? (
                  <div className="py-12 text-center text-text-400 text-[10px] font-bold uppercase tracking-widest">Awaiting contributions.</div>
                ) : recentDonations.map((dn) => (
                  <div key={dn.id} className="p-5 flex items-start gap-4 hover:bg-surface-200 rounded-2xl transition-colors border border-transparent hover:border-border-subtle">
                    <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center text-success flex-shrink-0 shadow-sm">
                      <DollarSign size={20} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-black text-brand-900 m-0 tracking-tighter">
                          {dn.currency} {Number(dn.amount).toLocaleString()}
                        </h4>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${dn.status === 'SUCCESS' ? 'bg-success text-white' : 'bg-warning text-white'}`}>
                          {dn.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-400 font-bold uppercase tracking-widest m-0">{dn.method} • {dn.payerName || "Anonymous"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

        </div>
      </div>
    </PageTransition>
  );
}

export default AdminDashboardPage;
