import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { truncateText } from "../app/text";
import PageTransition from "../components/PageTransition";

function toYoutubeEmbed(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  const youtu = value.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
  if (youtu?.[1]) return `https://www.youtube.com/embed/${youtu[1]}`;
  const watch = value.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
  if (watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`;
  return "";
}

function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [about, setAbout] = useState({ title: "About Silver Shield", storyContent: "", mission: "", vision: "", heroImage: "", videoUrl: "" });

  useEffect(() => {
    let mounted = true;
    apiFetch("/about")
      .then((res) => { if (mounted) setAbout((prev) => ({ ...prev, ...(res.data || {}) })); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const heroImage = useMemo(() => resolveMediaUrl(about.heroImage), [about.heroImage]);
  const youtubeEmbed = useMemo(() => toYoutubeEmbed(about.videoUrl), [about.videoUrl]);
  const videoUrl = useMemo(() => resolveMediaUrl(about.videoUrl), [about.videoUrl]);

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">About</p>
        <h1>{about.title || "About Silver Shield"}</h1>
        <p>A community-led nonprofit shaping lives through mentorship, outreach, and opportunity.</p>
      </section>

      <section className="container section about-layout">
        <article className="glass-card about-story-card">
          <h2>Our Story</h2>
          {loading
            ? <p>Loading...</p>
            : <p>{about.storyContent || "Our story is coming soon."}</p>
          }

          <div className="about-pillars">
            <article className="about-pillar">
              <h3>Mission</h3>
              <p>{about.mission || "To serve communities with integrity, impact, and excellence."}</p>
            </article>
            <article className="about-pillar">
              <h3>Vision</h3>
              <p>{about.vision || "Empowering communities to rise, lead, and sustain change."}</p>
            </article>
          </div>

          <div className="home-inline-actions">
            <Link to="/donate" className="btn btn-primary">Support Our Work</Link>
            <Link to="/contact" className="btn btn-secondary">Get in Touch</Link>
          </div>
        </article>

        <aside className="about-media-stack">
          {heroImage && (
            <article className="glass-card about-media-card">
              <div className="media-wrap">
                <img src={heroImage} alt="About Silver Shield" loading="lazy" />
              </div>
            </article>
          )}
          {(youtubeEmbed || videoUrl) && (
            <article className="glass-card about-media-card">
              <div className="about-video-wrap">
                {youtubeEmbed
                  ? <iframe title="Silver Shield video" src={youtubeEmbed} allowFullScreen />
                  : <video controls src={videoUrl} />
                }
              </div>
            </article>
          )}
        </aside>
      </section>
    </PageTransition>
  );
}

export default AboutPage;
