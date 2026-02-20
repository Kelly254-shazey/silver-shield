import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, resolveMediaUrl } from "../app/api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageTransition from "../components/PageTransition";
import { useToast } from "../context/ToastContext";

function toYoutubeEmbed(url) {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  const youtu = value.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
  if (youtu?.[1]) {
    return `https://www.youtube.com/embed/${youtu[1]}`;
  }

  const watch = value.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
  if (watch?.[1]) {
    return `https://www.youtube.com/embed/${watch[1]}`;
  }

  return "";
}

function AboutPage() {
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [about, setAbout] = useState({
    title: "About Silver Shield",
    storyContent: "",
    mission: "",
    vision: "",
    heroImage: "",
    videoUrl: "",
  });

  useEffect(() => {
    let mounted = true;
    apiFetch("/about")
      .then((response) => {
        if (mounted) {
          setAbout((prev) => ({ ...prev, ...(response.data || {}) }));
        }
      })
      .catch((error) => pushToast(error.message || "Unable to load about content.", "error"))
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [pushToast]);

  const heroImage = useMemo(() => resolveMediaUrl(about.heroImage), [about.heroImage]);
  const videoUrl = useMemo(() => resolveMediaUrl(about.videoUrl), [about.videoUrl]);
  const youtubeEmbed = useMemo(() => toYoutubeEmbed(about.videoUrl), [about.videoUrl]);

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">About</p>
        <h1>{about.title || "About Silver Shield"}</h1>
      </section>

      <section className="container section about-layout">
        <article className="glass-card about-story-card">
          <h2>Our Story</h2>
          {loading ? <LoadingSkeleton className="story-skeleton" /> : <p>{about.storyContent || "Our story is coming soon."}</p>}

          <div className="about-pillars">
            <article className="about-pillar">
              <h3>Mission</h3>
              <p>{about.mission || "Mission details will be updated soon."}</p>
            </article>
            <article className="about-pillar">
              <h3>Vision</h3>
              <p>{about.vision || "Vision details will be updated soon."}</p>
            </article>
          </div>

          <div className="form-actions">
            <Link to="/donate" className="btn btn-primary">
              Support Our Work
            </Link>
            <Link to="/events" className="btn btn-secondary">
              View Events
            </Link>
          </div>
        </article>

        <aside className="about-media-stack">
          <article className="glass-card about-media-card">
            <h3>Featured Image</h3>
            {heroImage ? (
              <div className="media-wrap">
                <img src={heroImage} alt="About Silver Shield" loading="lazy" />
              </div>
            ) : (
              <p>No image uploaded yet.</p>
            )}
          </article>

          <article className="glass-card about-media-card">
            <h3>Featured Video</h3>
            {youtubeEmbed ? (
              <div className="about-video-wrap">
                <iframe title="Silver Shield story video" src={youtubeEmbed} allowFullScreen />
              </div>
            ) : videoUrl ? (
              <div className="about-video-wrap">
                <video controls src={videoUrl} />
              </div>
            ) : (
              <p>No video uploaded yet.</p>
            )}
          </article>
        </aside>
      </section>
    </PageTransition>
  );
}

export default AboutPage;
