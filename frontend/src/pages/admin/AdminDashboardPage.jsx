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
                className="bg-white p-6 rounded-3xl border border-border-subtle shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${card.color} group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <ArrowUpRight className="text-text-400 group-hover:text-brand-600 transition-colors" size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-400 uppercase tracking-widest">{card.label}</span>
                  <h3 className="text-3xl font-black text-brand-900 mt-1">{card.value}</h3>
                </div>
              </motion.article>
            ))
          }
        </motion.div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Inbox Panel */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-brand-900 uppercase tracking-widest flex items-center gap-2">
                <Inbox size={18} /> Recent Inquiries
              </h2>
              <span className="text-[10px] font-bold text-accent-600 uppercase">Live Feed</span>
            </div>
            <div className="bg-white rounded-[32px] border border-border-subtle shadow-sm overflow-hidden">
              <div className="flex flex-col">
                {recentMessages.length === 0 ? (
                  <div className="p-12 text-center text-text-400 text-sm font-medium uppercase tracking-widest">No recent messages.</div>
                ) : recentMessages.map((msg, i) => (
                  <div key={msg.id} className={`p-6 flex items-start gap-4 hover:bg-surface-200 transition-colors ${i !== recentMessages.length - 1 ? 'border-b border-border-subtle' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-800 flex-shrink-0 font-bold text-xs uppercase">
                      {msg.fullName.charAt(0)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-black text-text-900 truncate m-0">{msg.subject}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${msg.status === 'UNREAD' ? 'bg-accent-600 text-white' : 'bg-surface-300 text-text-500'}`}>
                          {msg.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-500 font-medium m-0">{msg.fullName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Donations Panel */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-brand-900 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={18} /> Recent Support
              </h2>
              <span className="text-[10px] font-bold text-success uppercase">Verified Impact</span>
            </div>
            <div className="bg-white rounded-[32px] border border-border-subtle shadow-sm overflow-hidden">
              <div className="flex flex-col">
                {recentDonations.length === 0 ? (
                  <div className="p-12 text-center text-text-400 text-sm font-medium uppercase tracking-widest">No recent donations.</div>
                ) : recentDonations.map((dn, i) => (
                  <div key={dn.id} className={`p-6 flex items-start gap-4 hover:bg-surface-200 transition-colors ${i !== recentDonations.length - 1 ? 'border-b border-border-subtle' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                      <DollarSign size={20} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-black text-text-900 m-0">
                          {dn.currency} {Number(dn.amount).toLocaleString()}
                        </h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${dn.status === 'SUCCESS' ? 'bg-success text-white' : 'bg-warning text-white'}`}>
                          {dn.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-500 font-medium uppercase tracking-widest m-0">{dn.method} • {dn.payerName || "Anonymous"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
    </PageTransition>
  );
}

export default AdminDashboardPage;
