import { useEffect, useMemo, useState } from "react";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { FALLBACK_EVENTS } from "../app/fallbackContent";
import { useToast } from "../context/ToastContext";

function formatDate(value) {
  if (!value) {
    return "Date TBD";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function EventsPage() {
  const { pushToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    apiFetch("/events")
      .then((response) => {
        if (mounted) {
          setEvents(response.data || []);
        }
      })
      .catch((error) => pushToast(error.message || "Unable to load events.", "error"))
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [pushToast]);

  const liveEvents = useMemo(
    () => events.filter((item) => String(item.status || "").toLowerCase() !== "draft"),
    [events],
  );

  const eventItems = useMemo(
    () => (liveEvents.length ? liveEvents : FALLBACK_EVENTS),
    [liveEvents],
  );

  const filteredEvents = useMemo(() => {
    if (filter === "all") {
      return eventItems;
    }
    return eventItems.filter((item) => String(item.status || "").toLowerCase() === filter);
  }, [eventItems, filter]);

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Events</p>
        <h1>Upcoming and recent community events</h1>
      </section>

      <section className="container section">
        <div className="filter-row">
          {["all", "upcoming", "ongoing", "completed"].map((item) => (
            <button
              key={item}
              type="button"
              className={filter === item ? "chip-btn active" : "chip-btn"}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid three">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <LoadingSkeleton key={`event-skeleton-${index}`} className="media-card" />
              ))
            : filteredEvents.map((event) => (
                <article key={event.id} className="media-card hover-lift event-card">
                  <div className="media-wrap">
                    <img
                      src={resolveMediaUrl(event.coverImage)}
                      alt={event.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="media-content">
                    <p className="chip">{String(event.status || "upcoming").toLowerCase()}</p>
                    <h3>{event.title}</h3>
                    <p>{event.description || "Event details coming soon."}</p>
                    <div className="inline-meta">
                      <small>{formatDate(event.eventDate)}</small>
                      <small>{event.location || "Location TBA"}</small>
                    </div>
                    {event.registrationUrl && (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link"
                      >
                        Register / Learn More
                      </a>
                    )}
                  </div>
                </article>
              ))}
        </div>
      </section>
    </PageTransition>
  );
}

export default EventsPage;
