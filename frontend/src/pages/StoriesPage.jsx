import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { truncateText } from "../app/text";

const FALLBACK_STORIES = [
  { id: "fs1", title: "From idea to income: A women-led business circle", author: "Silver Shield Team", excerpt: "How peer support and micro-grants helped mothers launch sustainable ventures.", coverImage: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=800&q=80" },
  { id: "fs2", title: "Mentorship in schools: Building confidence one session at a time", author: "Education Team", excerpt: "Mentors and teachers partnered to improve attendance, confidence, and goal setting.", coverImage: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80" },
];

function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch("/stories")
      .then((res) => { if (mounted) setStories(res.data || []); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const items = useMemo(() => {
    const live = stories.filter((s) => String(s.status || "").toLowerCase() !== "draft");
    return live.length ? live : FALLBACK_STORIES;
  }, [stories]);

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Stories</p>
        <h1>Stories from communities creating change.</h1>
      </section>

      <section className="container section">
        <div className="grid grid-2 stories-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} className="media-card" />)
            : items.map((story, index) => (
              <motion.article
                key={story.id}
                className="hp-story-card glass-card hover-lift"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Link to={`/stories/${story.slug || story.id}`} className="hp-card-img-wrap">
                  <img src={resolveMediaUrl(story.coverImage)} alt={story.title} loading="lazy" />
                </Link>
                <div className="hp-card-body">
                  <small className="hp-story-author">{story.author || "Silver Shield"}</small>
                  <h3>{story.title}</h3>
                  <p>{truncateText(story.excerpt || story.summary || "", 110)}</p>
                  <Link className="hp-card-link" to={`/stories/${story.slug || story.id}`}>Read story {"->"}</Link>
                </div>
              </motion.article>
            ))}
        </div>
      </section>
    </PageTransition>
  );
}

export default StoriesPage;
