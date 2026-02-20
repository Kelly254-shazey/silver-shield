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

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Impact</p>
        <h1>Real-time impact indicators and downloadable accountability reports.</h1>
      </section>

      <section className="container section">
        <div className="grid four">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={`impact-skeleton-${index}`} className="stat-card" />
              ))
            : stats.map((item) => (
                <article key={item.id} className="stat-card glass-premium hover-lift">
                  <p className="stat-label">{item.label}</p>
                  <h3>
                    <CountUp value={item.value} /> {item.unit}
                  </h3>
                  <small className={Number(item.trend) >= 0 ? "positive" : "negative"}>
                    {Number(item.trend) >= 0 ? "+" : ""}
                    {item.trend}% trend
                  </small>
                </article>
              ))}
        </div>
      </section>

      <section className="container section impact-grid">
        <article className="glass-card">
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

        <article className="glass-card">
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
        <article className="glass-card">
          <h2>Downloadable Reports</h2>
          <div className="report-list">
            {stats
              .filter((item) => item.reportUrl)
              .map((item) => (
                <a key={item.id} href={item.reportUrl} className="report-row">
                  <span>{item.label} report</span>
                  <span>Download</span>
                </a>
              ))}
          </div>
        </article>
      </section>
    </PageTransition>
  );
}

export default ImpactPage;
