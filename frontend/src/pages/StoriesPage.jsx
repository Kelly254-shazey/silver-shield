import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { FALLBACK_STORIES } from "../app/fallbackContent";
import { useToast } from "../context/ToastContext";

function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;

    apiFetch("/stories")
      .then((response) => {
        if (mounted) {
          setStories(response.data || []);
        }
      })
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [pushToast]);

  const publishedStories = useMemo(
    () => stories.filter((story) => String(story.status || "").toLowerCase() !== "draft"),
    [stories],
  );

  const storyItems = useMemo(
    () => (publishedStories.length ? publishedStories : FALLBACK_STORIES),
    [publishedStories],
  );

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Stories</p>
        <h1>Narratives from communities driving meaningful transformation.</h1>
      </section>

      <section className="container section">
        <div className="grid three">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <LoadingSkeleton key={`stories-loading-${index}`} className="media-card" />
              ))
            : storyItems.map((story) => (
                <article key={story.id} className="media-card glass-premium hover-lift">
                  <Link to={`/stories/${story.slug || story.id}`} className="media-wrap">
                    <img
                      src={resolveMediaUrl(story.coverImage)}
                      alt={story.title}
                      loading="lazy"
                    />
                  </Link>
                  <div className="media-content">
                    <p className="chip">{story.category || "Story"}</p>
                    <h3>{story.title}</h3>
                    <p>{story.excerpt || story.summary || "Story details coming soon."}</p>
                    <small>
                      {story.author || "Silver Shield"} -{" "}
                      {story.publishedAt
                        ? new Date(story.publishedAt).toLocaleDateString()
                        : "Latest"}
                    </small>
                    <Link className="text-link" to={`/stories/${story.slug || story.id}`}>
                      Read full story
                    </Link>
                  </div>
                </article>
              ))}
        </div>
      </section>
    </PageTransition>
  );
}

export default StoriesPage;
