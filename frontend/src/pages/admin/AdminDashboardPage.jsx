import { useEffect, useState, useMemo, useCallback } from "react";
import { apiFetch } from "../../app/api";
import { useAuth } from "../../context/AuthContext";
import {
  DollarSign,
  Inbox,
  Briefcase,
  BookOpen,
  Users2,
  HeartHandshake,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const colorMap = {
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-100",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
  },
};

function MetricCard({ icon, label, sublabel, value, color = "green" }) {
  const c = colorMap[color] || colorMap.green;

  return (
    <div
      className={`bg-white rounded-2xl p-5 border ${c.border} shadow-sm hover:shadow-md transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}
        >
          {icon}
        </div>
        <ArrowUpRight size={16} className="text-gray-300" />
      </div>

      <p className="text-2xl font-black text-gray-900 break-words">
        {value}
      </p>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">
        {label}
      </p>
      <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    messages: [],
    donations: [],
    programs: [],
    blog: [],
    volunteers: [],
    partners: [],
  });

  const fetchTable = useCallback(
    async (endpoint) => {
      const res = await apiFetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.results)) return res.results;

      return [];
    },
    [token]
  );

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Authentication required");
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          messages,
          donations,
          programs,
          blog,
          volunteers,
          partners,
        ] = await Promise.all([
          fetchTable("/messages"),
          fetchTable("/donations"),
          fetchTable("/programs?admin=true"),
          fetchTable("/blog?admin=true"),
          fetchTable("/volunteers?admin=true"),
          fetchTable("/partners?admin=true"),
        ]);

        if (!cancelled) {
          setData({
            messages,
            donations,
            programs,
            blog,
            volunteers,
            partners,
          });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [token, fetchTable]);

  const summary = useMemo(
    () => ({
      donationsTotal: data.donations.reduce(
        (sum, d) => sum + Number(d.amount || 0),
        0
      ),
      inboxUnread: data.messages.filter(
        (m) => String(m?.status || "").toUpperCase() === "UNREAD"
      ).length,
      programs: data.programs.length,
      blog: data.blog.length,
      volunteers: data.volunteers.length,
      partners: data.partners.length,
    }),
    [data]
  );

  const chartData = useMemo(
    () =>
      data.donations.slice(-7).map((d) => ({
        date: new Date(d.createdAt).toLocaleDateString("en-KE", {
          month: "short",
          day: "numeric",
        }),
        amount: Number(d.amount || 0),
      })),
    [data.donations]
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl font-semibold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-gray-900">
          Overview
        </h1>
        <p className="text-gray-500 mt-1">Silver Shield Admin Console</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <MetricCard
          icon={<DollarSign size={22} />}
          label="Total Support"
          sublabel="Contribution Ledger"
          value={`KES ${summary.donationsTotal.toLocaleString()}`}
          color="green"
        />
        <MetricCard
          icon={<Inbox size={22} />}
          label="Pending Tasks"
          sublabel="Awaiting Action"
          value={summary.inboxUnread}
          color="amber"
        />
        <MetricCard
          icon={<Users2 size={22} />}
          label="Network Growth"
          sublabel="Active Alliances"
          value={summary.partners}
          color="purple"
        />
        <MetricCard
          icon={<Briefcase size={22} />}
          label="Programs"
          sublabel="System Capacity"
          value={summary.programs}
          color="blue"
        />
        <MetricCard
          icon={<BookOpen size={22} />}
          label="Blog Posts"
          sublabel="Published Narratives"
          value={summary.blog}
          color="indigo"
        />
        <MetricCard
          icon={<HeartHandshake size={22} />}
          label="Volunteers"
          sublabel="Active Personnel"
          value={summary.volunteers}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between mb-6">
            <div>
              <h2 className="font-black">Donation Trends</h2>
              <p className="text-sm text-gray-500">Last 7 contributions</p>
            </div>
            <TrendingUp className="text-green-600" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#16a34a"
                  fill="#dcfce7"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-black mb-4">Recent Messages</h2>

          {data.messages.length === 0 ? (
            <p className="text-gray-400">No messages yet</p>
          ) : (
            data.messages.slice(0, 6).map((m) => (
              <div
                key={m.id || m._id}
                className="py-3 border-b last:border-0"
              >
                <p className="font-bold text-sm">
                  {m.subject || "No subject"}
                </p>
                <p className="text-xs text-gray-500">{m.email}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}