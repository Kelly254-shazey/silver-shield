
import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import {
  DollarSign, Inbox, Briefcase, BookOpen,
  Users2, HeartHandshake, TrendingUp, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    messages: [], donations: [], programs: [],
    blog: [], volunteers: [], partners: [],
  });

  // FIX #2: token is now passed into every fetchTable call.
  // Previously token was read but never forwarded — all calls returned 401.
  const fetchTable = async (endpoint) => {
    try {
      const res = await apiFetch(endpoint, { token });
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.result)) return res.result;
      return [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      const [messages, donations, programs, blog, volunteers, partners] =
        await Promise.all([
          fetchTable("/messages"),
          fetchTable("/donations"),
          fetchTable("/programs?admin=true"),
          fetchTable("/blog?admin=true"),
          fetchTable("/volunteers?admin=true"),
          fetchTable("/partners?admin=true"),
        ]);
      setData({ messages, donations, programs, blog, volunteers, partners });
      setLoading(false);
    })();
  }, [token]);

  const summary = useMemo(() => ({
    donationsTotal: data.donations.reduce((s, d) => s + Number(d.amount || 0), 0),
    inboxUnread: data.messages.filter(
      m => String(m.status || "").toUpperCase() === "UNREAD"
    ).length,
    programs: data.programs.length,
    blog: data.blog.length,
    volunteers: data.volunteers.length,
    partners: data.partners.length,
  }), [data]);

  const chartData = useMemo(() =>
    data.donations.slice(-7)
      .filter(d => d.createdAt)
      .map(d => ({
        date: new Date(d.createdAt).toLocaleDateString("en-KE", {
          month: "short", day: "numeric",
        }),
        amount: Number(d.amount || 0),
      })),
    [data.donations]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">

      {/* PAGE TITLE */}
      <div>
        <h1 className="text-xl lg:text-2xl font-black text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Silver Shield Admin Console</p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard
          icon={<DollarSign size={20} />}
          label="Total Support"
          sublabel="Contribution Ledger"
          value={`KES ${summary.donationsTotal.toLocaleString()}`}
          color="green"
        />
        <MetricCard
          icon={<Inbox size={20} />}
          label="Pending Tasks"
          sublabel="Awaiting Action"
          value={summary.inboxUnread}
          color="amber"
        />
        <MetricCard
          icon={<Users2 size={20} />}
          label="Network Growth"
          sublabel="Active Alliances"
          value={summary.partners}
          color="purple"
        />
        <MetricCard
          icon={<Briefcase size={20} />}
          label="Programs"
          sublabel="System Capacity"
          value={summary.programs}
          color="blue"
        />
        <MetricCard
          icon={<BookOpen size={20} />}
          label="Blog Posts"
          sublabel="Published Narratives"
          value={summary.blog}
          color="indigo"
        />
        <MetricCard
          icon={<HeartHandshake size={20} />}
          label="Volunteers"
          sublabel="Active Personnel"
          value={summary.volunteers}
          color="rose"
        />
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* CHART */}
        <div className="xl:col-span-3 bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-black text-gray-900">Donation Trends</h2>
              <p className="text-xs text-gray-500">Last 7 contributions</p>
            </div>
            <TrendingUp size={18} className="text-green-600" />
          </div>

          {chartData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => [`KES ${Number(v).toLocaleString()}`, "Amount"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#16a34a"
                    strokeWidth={2}
                    fill="url(#grad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
              No donation data yet
            </div>
          )}
        </div>

        {/* MESSAGES */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-900">Recent Messages</h2>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
              {summary.inboxUnread} unread
            </span>
          </div>

          <div className="flex flex-col">
            {data.messages.length === 0 && (
              <p className="text-sm text-gray-400">No messages yet.</p>
            )}
            {data.messages.slice(0, 6).map((m) => (
              <div
                key={m.id}
                className="flex items-start justify-between gap-2 py-3 border-b border-gray-50 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {m.subject || "No subject"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{m.email}</p>
                </div>
                <span className={`text-xs font-bold shrink-0 px-2 py-0.5 rounded-full ${
                  String(m.status).toUpperCase() === "UNREAD"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {m.status || "read"}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── METRIC CARD ─────────────────────────────────── */
const colorMap = {
  green:  { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-100" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  blue:   { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
  rose:   { bg: "bg-rose-50",   text: "text-rose-600",   border: "border-rose-100" },
};

function MetricCard({ icon, label, sublabel, value, color = "green" }) {
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-2xl p-4 sm:p-6 border ${c.border} flex flex-col gap-4`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>
          {icon}
        </div>
        <ArrowUpRight size={16} className="text-gray-300" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 break-words">{value}</p>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}

