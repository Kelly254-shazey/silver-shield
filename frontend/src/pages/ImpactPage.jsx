import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Globe,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Target,
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import CountUp from "../components/CountUp";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { apiFetch } from "../app/api";
import { useToast } from "../context/ToastContext";

function ImpactPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;
    const load = () =>
      apiFetch("/impact/stats")
        .then((res) => {
          if (mounted) setStats(res.data || []);
        })
        .catch((error) => pushToast(error.message, "error"))
        .finally(() => {
          if (mounted) setLoading(false);
        });

    load();
    const timer = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [pushToast]);

  const maxValue = useMemo(
    () => Math.max(...stats.map((s) => Number(s.value || 0)), 1),
    [stats]
  );
  const reports = stats.filter((s) => s.reportUrl);

  return (
    <PageTransition>
      <div className="flex flex-col gap-16 pb-24 bg-surface-100">
        {/* Hero */}
        <section className="section-hero bg-brand-900 overflow-hidden relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 120%, var(--brand-600) 0%, transparent 60%)",
              opacity: 0.2,
            }}
          />
          <div className="container relative z-10 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="label text-accent-400 mb-5 block"
            >
              Real-time Outcomes
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h1 text-white tracking-tight"
            >
              Impact{" "}
              <span className="text-brand-400">Indicators</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="body-lg text-brand-100/70 max-w-2xl mx-auto mt-6"
            >
              Live tracking of our community progress, strategic outcomes, and
              verified reporting links.
            </motion.p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="section -mt-20 relative z-20">
          <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <LoadingSkeleton
                      key={i}
                      className="h-36 rounded-2xl"
                    />
                  ))
              : stats.length === 0
              ? (
                  <div className="md:col-span-2 lg:col-span-4 p-14 text-center flex flex-col items-center gap-4 bg-white rounded-3xl border border-border-subtle shadow-sm">
                    <Target size={40} className="text-brand-100" />
                    <span className="label text-brand-900 uppercase">
                      Dashboard aggregating data...
                    </span>
                  </div>
                )
              : stats.map((s, i) => (
                  <motion.article
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white p-7 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-3 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="label text-text-400">
                        {s.label}
                      </span>
                      <div
                        className={`p-1.5 rounded-lg ${
                          Number(s.trend) >= 0
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {Number(s.trend) >= 0 ? (
                          <ArrowUpRight size={14} />
                        ) : (
                          <ArrowDownRight size={14} />
                        )}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 leading-none">
                      <h3 className="text-3xl font-black text-brand-900">
                        <CountUp value={s.value} />
                      </h3>
                      <span className="label text-accent-600">
                        {s.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1 flex-grow bg-surface-300 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-800 transition-all duration-1000 rounded-full"
                          style={{
                            width: `${Math.min(100, (Number(s.value) / maxValue) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="label text-text-400">
                        {Math.abs(s.trend)}%{" "}
                        <span className="opacity-50">&#916;</span>
                      </span>
                    </div>
                  </motion.article>
                ))}
          </div>
        </section>

        {/* Deep Analysis & Map */}
        <section className="section">
          <div className="container grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex flex-col gap-7">
            <div className="bg-white p-8 rounded-3xl border border-border-subtle shadow-sm flex flex-col gap-7">
              <div className="flex justify-between items-center px-0.5">
                <div className="flex flex-col gap-1">
                  <span className="label text-accent-600">Analytics</span>
                  <h3 className="h3 text-brand-900 uppercase tracking-tight">
                    Impact Distribution
                  </h3>
                </div>
                <BarChart3 size={22} className="text-brand-100" />
              </div>

              <div className="flex flex-col gap-5">
                {stats.map((s) => (
                  <div key={s.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center label text-text-600">
                      <span>{s.label}</span>
                      <span className="font-bold text-brand-900">
                        {Number(s.value).toLocaleString()} {s.unit}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-surface-200 rounded-full overflow-hidden p-0.5 border border-border-subtle shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${(Number(s.value || 0) / maxValue) * 100}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-brand-800 rounded-full shadow-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-border-subtle shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800">
                  <RefreshCw
                    size={18}
                    className="animate-[spin_10s_linear_infinite]"
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="label text-brand-900">Auto-Sync Active</span>
                  <span className="label text-text-400 mt-1">
                    Refreshes every 30 seconds
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="label text-success">Network Live</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-7">
            <div
              className="rounded-3xl overflow-hidden border border-border-subtle shadow-sm h-72 relative group bg-surface-200"
              style={{ minHeight: "320px" }}
            >
              <iframe
                title="Program Footprint"
                className="w-full h-full border-none grayscale group-hover:grayscale-0 transition-all duration-700"
                src="https://www.openstreetmap.org/export/embed.html?bbox=36.78%2C-1.34%2C36.88%2C-1.24&layer=mapnik"
              />
              <div className="absolute top-5 left-5 glass-dark px-4 py-1.5 rounded-full flex items-center gap-2 pointer-events-none border border-white/10 shadow-lg">
                <Globe size={13} className="text-accent-400" />
                <span className="label text-white">Live Footprint</span>
              </div>
            </div>

            <div
              className="p-8 rounded-3xl shadow-lg flex flex-col gap-7 relative overflow-hidden text-white"
              style={{ background: "var(--brand-900)" }}
            >
              <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-[0.04]">
                <FileText size={70} />
              </div>
              <div className="flex flex-col gap-2 relative z-10">
                <span className="label text-accent-400">Transparency</span>
                <h3 className="h3 text-white uppercase tracking-tight">
                  Official Reports
                </h3>
              </div>

              <div className="flex flex-col gap-2.5 relative z-10">
                {reports.length > 0
                  ? reports.map((r) => (
                      <a
                        key={r.id}
                        href={r.reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group no-underline border border-transparent hover:border-white/10"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText
                            size={16}
                            className="text-brand-300 flex-shrink-0"
                          />
                          <span className="label text-brand-100 uppercase truncate">
                            {r.label}
                          </span>
                        </div>
                        <Download
                          size={14}
                          className="text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        />
                      </a>
                    ))
                  : (
                      <p className="label text-brand-400 text-center py-7 border border-dashed border-white/10 rounded-2xl leading-tight">
                        Pending publication cycle
                      </p>
                    )}
              </div>

              <p className="label text-brand-500 border-t border-white/5 pt-4 relative z-10">
                Data verified by certified auditors.
              </p>
            </div>
          </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default ImpactPage;
