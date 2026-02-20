import { useEffect, useMemo, useState } from "react";
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
        .then((response) => {
          if (mounted) {
            setStats(response.data || []);
          }
        })
        .catch((error) => pushToast(error.message, "error"))
        .finally(() => {
          if (mounted) setLoading(false);
        });

    load();
    const timer = setInterval(load, 20000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [pushToast]);

  const maxValue = useMemo(
    () => Math.max(...stats.map((item) => Number(item.value || 0)), 1),
    [stats],
  );

  const reports = stats.filter((item) => item.reportUrl);

  return (
    <PageTransition className="page-space impact-dashboard-page">
      <section className="container impact-dashboard-hero glass-panel">
        <p className="eyebrow">Impact Dashboard</p>
        <h1>Real-time impact indicators and downloadable accountability reports.</h1>
        <p className="impact-dashboard-subtitle">
          Live snapshots of community outcomes, progress trends, and verified reporting links.
        </p>
        <div className="impact-dashboard-hero-meta">
          <span>{stats.length || 0} indicators</span>
          <span>Auto-refresh every 20 seconds</span>
        </div>
      </section>

      <section className="container section">
        <div className="grid four impact-metrics-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={`impact-skeleton-${index}`} className="stat-card impact-stat-card" />
              ))
            : null}
          {!loading && !stats.length ? (
            <article className="glass-card impact-empty-card">
              <h2>No impact indicators published yet</h2>
              <p>Publish impact stats from admin to populate this dashboard.</p>
            </article>
          ) : null}
          {!loading
            ? stats.map((item) => (
                <article key={item.id} className="stat-card glass-premium hover-lift impact-stat-card">
                  <p className="stat-label">{item.label}</p>
                  <h3>
                    <CountUp value={item.value} /> {item.unit}
                  </h3>
                  <small
                    className={`impact-trend ${Number(item.trend) >= 0 ? "positive" : "negative"}`}
                  >
                    {Number(item.trend) >= 0 ? "+" : ""}
                    {item.trend}% trend
                  </small>
                </article>
              ))
            : null}
        </div>
      </section>

      <section className="container section impact-grid impact-dashboard-grid">
        <article className="glass-card impact-detail-card">
          <h2>Impact Distribution</h2>
          <div className="bar-chart">
            {stats.map((item) => (
              <div key={item.id} className="bar-row">
                <span>{item.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(Number(item.value || 0) / maxValue) * 100}%` }}
                  />
                </div>
                <strong>
                  {Number(item.value).toLocaleString()} {item.unit}
                </strong>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card impact-detail-card">
          <h2>Program Footprint Map</h2>
          <div className="map-embed">
            <iframe
              title="Silver Shield Map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=36.6%2C-1.6%2C37.1%2C-1.1&layer=mapnik"
            />
          </div>
        </article>
      </section>

      <section className="container section">
        <article className="glass-card impact-detail-card">
          <h2>Downloadable Reports</h2>
          <div className="report-list">
            {reports.length ? (
              reports.map((item) => (
                <a key={item.id} href={item.reportUrl} className="report-row" target="_blank" rel="noreferrer">
                  <span>{item.label} report</span>
                  <span>Download</span>
                </a>
              ))
            ) : (
              <p className="impact-empty-copy">No downloadable reports available yet.</p>
            )}
          </div>
        </article>
      </section>
    </PageTransition>
  );
}

export default ImpactPage;
