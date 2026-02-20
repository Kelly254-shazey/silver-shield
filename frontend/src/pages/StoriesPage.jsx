import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { apiFetch, resolveMediaUrl } from "../app/api";
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
            : stories.map((story) => (
                <article key={story.id} className="media-card glass-premium hover-lift">
                  <Link to={`/stories/${story.id}`} className="media-wrap">
                    <img
                      src={resolveMediaUrl(story.coverImage)}
                      alt={story.title}
                      loading="lazy"
                    />
                  </Link>
                  <div className="media-content">
                    <p className="chip">{story.category || "Story"}</p>
                    <h3>{story.title}</h3>
                    <p>{story.excerpt}</p>
                    <small>
                      {story.author || "Silver Shield"} -{" "}
                      {story.publishedAt
                        ? new Date(story.publishedAt).toLocaleDateString()
                        : "Latest"}
                    </small>
                    <Link className="text-link" to={`/stories/${story.id}`}>
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

