import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { useToast } from "../context/ToastContext";

function StoryDetailsPage() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch(`/stories/${id}`)
      .then((response) => {
        if (mounted) setStory(response.data);
      })
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, pushToast]);

  if (loading) {
    return (
      <PageTransition className="page-space">
        <section className="container section">
          <LoadingSkeleton className="story-skeleton" />
        </section>
      </PageTransition>
    );
  }

  if (!story) {
    return (
      <PageTransition className="page-space">
        <section className="container section glass-panel">
          <h1>Story not found</h1>
          <Link to="/stories" className="text-link">
            Back to stories
          </Link>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="page-space">
      <section className="story-hero">
        <img src={resolveMediaUrl(story.coverImage)} alt={story.title} loading="eager" />
        <div className="program-hero-overlay" />
        <div className="container program-hero-content">
          <p className="chip">{story.category || "Story"}</p>
          <h1>{story.title}</h1>
          <p>{story.excerpt}</p>
        </div>
      </section>

      <section className="container section">
        <article className="glass-card story-body">
          <p className="story-meta">
            {story.author || "Silver Shield Editorial"} -{" "}
            {story.publishedAt
              ? new Date(story.publishedAt).toLocaleDateString()
              : "Recent story"}
          </p>
          <p>{story.content}</p>
          {Array.isArray(story.tags) && story.tags.length > 0 && (
            <div className="tag-row">
              {story.tags.map((tag) => (
                <span key={tag} className="chip">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </section>
    </PageTransition>
  );
}

export default StoryDetailsPage;

