import { useEffect, useMemo, useState } from "react";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { truncateText } from "../app/text";

function formatDate(value) {
  if (!value) return "Date TBD";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    apiFetch("/events")
      .then((res) => { if (mounted) setEvents(res.data || []); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const liveEvents = useMemo(
    () => events.filter((e) => String(e.status || "").toLowerCase() !== "draft"),
    [events],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return liveEvents;
    return liveEvents.filter((e) => String(e.status || "").toLowerCase() === filter);
  }, [liveEvents, filter]);

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Events</p>
        <h1>Community events and gatherings.</h1>
      </section>

      <section className="container section">
        <div className="filter-row">
          {["all", "upcoming", "ongoing", "completed"].map((item) => (
            <button key={item} type="button"
              className={filter === item ? "chip-btn active" : "chip-btn"}
              onClick={() => setFilter(item)}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-2">
            {Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} className="media-card" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
            <p>No {filter === "all" ? "" : filter} events at the moment. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-2 events-grid">
            {filtered.map((event) => (
              <article key={event.id} className="media-card hover-lift event-card">
                {event.coverImage && (
                  <div className="media-wrap">
                    <img src={resolveMediaUrl(event.coverImage)} alt={event.title} loading="lazy" />
                  </div>
                )}
                <div className="media-content">
                  <p className="chip">{String(event.status || "upcoming")}</p>
                  <h3>{event.title}</h3>
                  <p>{truncateText(event.description || "", 110)}</p>
                  <div className="inline-meta">
                    <small>{formatDate(event.eventDate)}</small>
                    <small>{event.location || "Location TBA"}</small>
                  </div>
                  {event.registrationUrl && (
                    <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="text-link">
                      Register
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  );
}

export default EventsPage;
