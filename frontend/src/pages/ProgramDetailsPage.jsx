import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { useToast } from "../context/ToastContext";

function formatDate(value) {
  if (!value) {
    return "Date TBA";
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

function ProgramDetailsPage() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [relatedStories, setRelatedStories] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    apiFetch(`/programs/${id}`)
      .then((response) => {
        if (mounted) setProgram(response.data);
      })
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, pushToast]);

  useEffect(() => {
    if (!program?.slug) {
      setRelatedEvents([]);
      setRelatedStories([]);
      return;
    }

    let mounted = true;
    setRelatedLoading(true);

    const loadRelated = async () => {
      try {
        const [eventsRes, storiesRes] = await Promise.all([
          apiFetch(`/events?programSlug=${encodeURIComponent(program.slug)}`),
          apiFetch(`/stories?programSlug=${encodeURIComponent(program.slug)}`),
        ]);

        let nextEvents = eventsRes.data || [];
        let nextStories = storiesRes.data || [];

        if (!nextEvents.length) {
          const fallbackEvents = await apiFetch("/events");
          nextEvents = (fallbackEvents.data || []).slice(0, 3);
        }

        if (!nextStories.length && program.category) {
          const fallbackStories = await apiFetch(
            `/stories?category=${encodeURIComponent(program.category)}`,
          );
          nextStories = (fallbackStories.data || []).slice(0, 3);
        }

        if (!nextStories.length) {
          const fallbackStories = await apiFetch("/stories");
          nextStories = (fallbackStories.data || []).slice(0, 3);
        }

        if (mounted) {
          setRelatedEvents(nextEvents);
          setRelatedStories(nextStories);
        }
      } catch (error) {
        if (mounted) {
          pushToast(error.message || "Unable to load related content.", "error");
        }
      } finally {
        if (mounted) {
          setRelatedLoading(false);
        }
      }
    };

    loadRelated();

    return () => {
      mounted = false;
    };
  }, [program?.slug, program?.category, pushToast]);

  if (loading) {
    return (
      <PageTransition className="page-space">
        <section className="container section">
          <LoadingSkeleton className="program-hero-skeleton" />
        </section>
      </PageTransition>
    );
  }

  if (!program) {
    return (
      <PageTransition className="page-space">
        <section className="container section glass-panel">
          <h1>Program not found</h1>
          <Link to="/programs" className="text-link">
            Back to programs
          </Link>
        </section>
      </PageTransition>
    );
  }

  const progress =
    Number(program.goalAmount) > 0
      ? Math.min(100, (Number(program.raisedAmount) / Number(program.goalAmount)) * 100)
      : 0;
  const galleryImages =
    Array.isArray(program.galleryImages) && program.galleryImages.length > 0
      ? program.galleryImages
      : [program.heroImage].filter(Boolean);

  return (
    <PageTransition className="page-space">
      <section className="program-hero">
        <img src={resolveMediaUrl(program.heroImage)} alt={program.title} loading="eager" />
        <div className="program-hero-overlay" />
        <div className="container program-hero-content">
          <p className="chip">{program.category}</p>
          <h1>{program.title}</h1>
          <p>{program.summary}</p>
        </div>
      </section>

      <section className="container section program-detail-grid">
        <article className="glass-card">
          <h2>Program Overview</h2>
          <p>{program.description}</p>
          <p>
            <strong>Location:</strong> {program.location || "Multiple regions"}
          </p>
        </article>

        <aside className="glass-card">
          <h3>Funding Progress</h3>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p>
            ${Number(program.raisedAmount || 0).toLocaleString()} raised of $
            {Number(program.goalAmount || 0).toLocaleString()}
          </p>
          <Link to={`/donate?programId=${program.id}`} className="btn btn-primary">
            Donate to This Program
          </Link>
        </aside>
      </section>

      <section className="container section section-sm">
        <div className="cta-banner">
          <p className="eyebrow">Take Action</p>
          <h2>Support {program.title}</h2>
          <p>
            Your support keeps this initiative active and helps us serve more families,
            schools, and communities.
          </p>
          <div className="cta-banner-actions">
            <Link to={`/donate?programId=${program.id}`} className="btn btn-primary">
              Donate Now
            </Link>
            <Link
              to={`/contact?subject=${encodeURIComponent(program.title)}`}
              className="btn btn-secondary"
            >
              Send Your View
            </Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head split">
          <h2>Program Events</h2>
          <Link to="/events" className="text-link">
            View all events
          </Link>
        </div>

        <div className="grid three">
          {relatedLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <LoadingSkeleton key={`related-events-${index}`} className="media-card" />
              ))
            : relatedEvents.map((event) => (
                <article key={event.id} className="media-card hover-lift">
                  <div className="media-wrap">
                    <img src={resolveMediaUrl(event.coverImage)} alt={event.title} loading="lazy" />
                  </div>
                  <div className="media-content">
                    <p className="chip">{event.status || "upcoming"}</p>
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    <div className="inline-meta">
                      <small>{formatDate(event.eventDate)}</small>
                      <small>{event.location || "Location TBA"}</small>
                    </div>
                    {event.registrationUrl ? (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link"
                      >
                        Register / Learn More
                      </a>
                    ) : (
                      <Link to="/events" className="text-link">
                        Event details
                      </Link>
                    )}
                  </div>
                </article>
              ))}
        </div>

        {!relatedLoading && !relatedEvents.length && (
          <article className="glass-card">
            <p>No events linked to this program yet.</p>
          </article>
        )}
      </section>

      <section className="container section">
        <div className="section-head split">
          <h2>Program Stories</h2>
          <Link to="/stories" className="text-link">
            View all stories
          </Link>
        </div>

        <div className="grid three">
          {relatedLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <LoadingSkeleton key={`related-stories-${index}`} className="media-card" />
              ))
            : relatedStories.map((story) => (
                <article key={story.id} className="media-card hover-lift">
                  <Link to={`/stories/${story.slug || story.id}`} className="media-wrap">
                    <img src={resolveMediaUrl(story.coverImage)} alt={story.title} loading="lazy" />
                  </Link>
                  <div className="media-content">
                    <p className="chip">{story.category || "Story"}</p>
                    <h3>{story.title}</h3>
                    <p>{story.excerpt}</p>
                    <Link to={`/stories/${story.slug || story.id}`} className="text-link">
                      Read full story
                    </Link>
                  </div>
                </article>
              ))}
        </div>

        {!relatedLoading && !relatedStories.length && (
          <article className="glass-card">
            <p>No stories linked to this program yet.</p>
          </article>
        )}
      </section>

      {galleryImages.length > 0 && (
        <section className="container section">
          <div className="section-head">
            <p className="eyebrow">Gallery</p>
            <h2>From the field</h2>
          </div>
          <div className="grid three">
            {galleryImages.map((image, index) => (
              <article key={`${image}-${index}`} className="media-wrap gallery-item">
                <img
                  src={resolveMediaUrl(image)}
                  alt={`${program.title} gallery ${index + 1}`}
                  loading="lazy"
                />
              </article>
            ))}
          </div>
        </section>
      )}
    </PageTransition>
  );
}

export default ProgramDetailsPage;
