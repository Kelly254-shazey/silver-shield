import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, ArrowRight, Calendar } from "lucide-react";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { truncateText } from "../app/text";

function formatDate(value) {
  if (!value)
    return { day: "TBA", month: "DATE", full: "TBA" };
  const d = new Date(value);
  if (Number.isNaN(d.getTime()))
    return { day: "TBA", month: "DATE", full: value };
  return {
    day: d.getDate(),
    month: d.toLocaleDateString(undefined, { month: "short" }),
    full: d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    apiFetch("/events")
      .then((res) => {
        if (mounted) setEvents(res.data || []);
      })
      .finally(() => { // Added missing dependency array
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const liveEvents = useMemo(
    () =>
      events.filter((e) => String(e.status || "").toLowerCase() !== "draft"),
    [events]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return liveEvents;
    return liveEvents.filter((e) =>
      String(e.status || "").toLowerCase() === filter
    );
  }, [liveEvents, filter]);

  return (
    <PageTransition>
      <div className="flex flex-col gap-16 pb-24 bg-surface-100">
        {/* Premium Hero */}
        <section className="section-hero bg-brand-900 overflow-hidden relative text-white">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 120%, var(--brand-600) 0%, transparent 60%)",
              opacity: 0.2,
            }}
          />
          <div className="container relative z-10 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="label text-accent-400 mb-5 block"
            >
              Calendar of Impact
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h1 tracking-tight"
            >
              Community{" "}
              <span className="text-accent-400">Activations</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="body-lg text-text-400 max-w-2xl mx-auto mt-7 font-medium"
            >
              Join our gatherings, workshops, and outreach programs shaping the
              future of Bungoma through collective action.
            </motion.p>
          </div>
        </section>

        {/* Filter */}
        <div className="container -mt-20 relative z-20">
          <div className="bg-white/85 backdrop-blur-xl p-1.5 rounded-full shadow-lg border border-border-subtle flex flex-wrap justify-center gap-1.5 max-w-3xl mx-auto">
            {["all", "upcoming", "ongoing", "completed"].map((item) => (
              <button
                key={item}
                className={`px-6 py-2.5 rounded-full label transition-all border-none cursor-pointer ${
                  filter === item
                    ? "bg-brand-900 text-white shadow-md scale-105"
                    : "text-text-500 hover:text-brand-900 hover:bg-surface-200 bg-transparent"
                }`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <section className="section">
          <div className="container">
            {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <LoadingSkeleton
                    key={i}
                    className="h-56 rounded-3xl"
                  />
                ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center gap-5 bg-white rounded-3xl border border-border-subtle shadow-sm max-w-3xl mx-auto">
              <div className="w-16 h-16 bg-surface-200 rounded-2xl flex items-center justify-center text-text-400 border border-border-subtle">
                <Calendar size={32} />
              </div>
              <h3 className="h4 text-text-900">No events scheduled</h3>
              <p className="body-sm text-text-500 font-medium max-w-sm">
                {filter !== "all"
                  ? `Check back later for new ${filter} community gathering updates.`
                  : "Check back later for new community gathering updates and activations."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {filtered.map((event, i) => {
                const date = formatDate(event.eventDate);
                return (
                  <motion.article
                    key={event.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.04,
                      type: "spring",
                      stiffness: 350,
                      damping: 25,
                    }}
                    whileHover={{ y: -12 }}
                    className="program-card group"
                  >
                    <div className="program-media">
                      <img
                        src={resolveMediaUrl(event.coverImage)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000 ease-out"
                        alt=""
                      />
                      <div className="absolute top-4 left-4 flex flex-col items-center justify-center w-12 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
                        <span className="text-lg font-bold text-text-900 leading-none">
                          {date.day}
                        </span>
                        <span className="label text-accent-600 mt-1">
                          {date.month}
                        </span>
                      </div>
                    </div>

                    <div className="sm:w-3/5 p-7 flex flex-col justify-center gap-4">
                      <div className="flex justify-between items-start">
                        <span
                          className={`label px-3 py-1 rounded-full border ${
                            event.status === "upcoming"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-surface-200 text-text-500 border-border-base"
                          }`}
                        >
                          {event.status || "Planned"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <h3 className="h3 text-text-900 leading-tight group-hover:text-brand-700 transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-text-500 mt-1">
                          <div className="flex items-center gap-1.5 label">
                            <MapPin
                              size={13}
                              className="text-brand-600 flex-shrink-0"
                            />{" "}
                            {event.location || "TBA"}
                          </div>
                          <div className="hidden sm:block w-1 h-1 bg-border-strong rounded-full" />
                          <div className="flex items-center gap-1.5 label">
                            <Clock
                              size={13}
                              className="text-brand-600 flex-shrink-0"
                            />{" "}
                            {date.full}
                          </div>
                        </div>
                      </div>

                      <p className="body-sm text-text-500 font-medium leading-relaxed">
                        {truncateText(
                          event.description ||
                            "Join us for this community event. Detailed agenda and speakers will be updated soon.",
                          120
                        )}
                      </p>

                      {event.registrationUrl && (
                        <a
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-bold text-[10px] text-accent-600 uppercase tracking-wider no-underline group/link transition-all hover:gap-3"
                        >
                          Secure Entry <ArrowRight size={13} className="group-hover/link:translate-x-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default EventsPage;
