import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import PageTransition from "../../components/PageTransition";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { API_BASE_URL, apiFetch } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const socketBaseUrl = API_BASE_URL.replace(/\/api$/, "");

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
      apiFetch("/programs?admin=true"),
      apiFetch("/stories?admin=true"),
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
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const socket = io(socketBaseUrl, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"],
    });

    socket.emit("subscribe:admin");

    const refresh = () => {
      loadDashboard().catch(() => undefined);
    };

    socket.on("message:new", refresh);
    socket.on("message:update", refresh);
    socket.on("donation:update", refresh);

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [token, pushToast]);

  const cards = useMemo(
    () => [
      { label: "Programs", value: summary.programs },
      { label: "Stories", value: summary.stories },
      { label: "Donations", value: summary.donationsTotal },
      { label: "Pending Donations", value: summary.donationsPending },
      { label: "Unread Messages", value: summary.inboxUnread },
      { label: "Documentation", value: summary.docs },
    ],
    [summary],
  );

  return (
    <PageTransition className="admin-page">
      <section className="admin-section admin-dashboard-section">
        <h1>Dashboard</h1>
        <div className="grid three admin-dashboard-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <LoadingSkeleton
                  key={`admin-card-loading-${index}`}
                  className="stat-card admin-stat-card"
                />
              ))
            : cards.map((card) => (
                <article key={card.label} className="glass-card stat-card admin-stat-card">
                  <p className="stat-label">{card.label}</p>
                  <h3>{card.value}</h3>
                </article>
              ))}
        </div>
      </section>

      <section className="admin-section admin-lists admin-dashboard-lists">
        <article className="glass-card admin-dashboard-panel">
          <h2>Recent Inbox Messages</h2>
          <div className="simple-list">
            {recentMessages.map((item) => (
              <div key={item.id} className="simple-list-item">
                <strong>{item.subject}</strong>
                <small>
                  {item.fullName} - {item.status}
                </small>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card admin-dashboard-panel">
          <h2>Recent Donations</h2>
          <div className="simple-list">
            {recentDonations.map((item) => (
              <div key={item.id} className="simple-list-item">
                <strong>
                  {item.currency} {Number(item.amount).toLocaleString()}
                </strong>
                <small>
                  {item.method} - {item.status}
                </small>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PageTransition>
  );
}

export default AdminDashboardPage;


