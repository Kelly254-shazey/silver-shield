import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, ChevronLeft, Share2, BookOpen } from "lucide-react";

import { apiFetch, resolveMediaUrl } from "../app/api";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";

/* ── Scoped styles injected once at module level — no <style> inside render ── */
const BLOG_CONTENT_STYLES = `
  .blog-content { line-height: 1.9; font-size: 1.05rem; color: var(--color-foreground, #374151); }
  .blog-content p  { margin-bottom: 1rem; }
  .blog-content h1,.blog-content h2,.blog-content h3,.blog-content h4 {
    margin-top: 1.75rem; margin-bottom: 0.75rem;
    color: var(--color-foreground, #111827); font-weight: 800; line-height: 1.2;
  }
  .blog-content ul,.blog-content ol { padding-left: 1.5rem; margin-bottom: 1rem; }
  .blog-content li { margin-bottom: 0.4rem; }
  .blog-content a  { color: var(--color-primary, #7c3aed); text-decoration: underline; }
  .blog-content blockquote {
    border-left: 4px solid var(--color-primary, #7c3aed);
    padding-left: 1.25rem; margin: 1.5rem 0;
    font-style: italic; color: #6b7280;
  }
  .blog-content table { width: 100%; display: block; overflow-x: auto; margin-bottom: 1rem; }
  .blog-content th,.blog-content td {
    padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; text-align: left;
  }
  .blog-content th { background: #f9fafb; font-weight: 700; }

  /* ── Images inside content: contained, never overflow ── */
  .blog-content img {
    max-width: 100% !important;
    width: 100% !important;
    height: auto !important;
    display: block !important;
    margin: 1.5rem auto !important;
    border-radius: 1rem;
    object-fit: contain !important;
    box-sizing: border-box;
  }

  /* ── Iframes (YouTube, maps, etc.) ── */
  .blog-content iframe {
    width: 100%;
    max-width: 100%;
    min-height: 360px;
    border: none;
    border-radius: 1rem;
    display: block;
    margin: 1.5rem 0;
  }

  /* ── Figures with captions ── */
  .blog-content figure { margin: 1.5rem 0; text-align: center; }
  .blog-content figcaption { font-size: 0.8rem; color: #9ca3af; margin-top: 0.4rem; }
`;

/* Inject styles once into <head> */
if (typeof document !== "undefined" && !document.getElementById("blog-content-styles")) {
  const tag = document.createElement("style");
  tag.id = "blog-content-styles";
  tag.textContent = BLOG_CONTENT_STYLES;
  document.head.appendChild(tag);
}

/**
 * sanitizeHtml
 * ------------
 * Parses the raw HTML through a detached DOM then:
 *  1. Removes inline width / height / style from every <img> so our
 *     CSS rules win (inline styles have higher specificity than classes).
 *  2. Forces max-width: 100% directly as a style override as a last resort.
 *  3. Makes all images lazy-load.
 *  4. Opens external links in a new tab safely.
 * Falls back to the raw string if DOMParser is unavailable.
 */
function sanitizeHtml(html) {
  if (typeof window === "undefined" || !html) return html ?? "";

  const doc  = new DOMParser().parseFromString(`<div id="r">${html}</div>`, "text/html");
  const root = doc.getElementById("r");

  root.querySelectorAll("img").forEach((img) => {
    /* Remove every attribute that can override CSS layout */
    ["width", "height", "style", "sizes", "class"].forEach((attr) =>
      img.removeAttribute(attr)
    );
    /* Force containment inline as final override — highest specificity */
    img.setAttribute(
      "style",
      "max-width:100% !important; width:100% !important; height:auto !important; display:block; object-fit:contain;"
    );
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
  });

  root.querySelectorAll("a[href]").forEach((a) => {
    try {
      if (new URL(a.href).origin !== window.location.origin) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    } catch {
      /* relative link — leave as-is */
    }
  });

  return root.innerHTML;
}

/* ── Style tokens ── */
const S = {
  page: {
    maxWidth: "780px",
    margin: "0 auto",
    padding: "5rem 1.5rem 6rem",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--color-primary, #7c3aed)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    marginBottom: "2rem",
  },
  categoryBadge: {
    display: "inline-block",
    background: "var(--color-primary-light, rgba(124,58,237,0.1))",
    color: "var(--color-primary, #7c3aed)",
    padding: "5px 14px",
    borderRadius: "999px",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
    fontWeight: 900,
    lineHeight: 1.15,
    marginBottom: "1.25rem",
    color: "var(--color-foreground, #111827)",
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.25rem",
    marginBottom: "2rem",
    color: "var(--color-muted-foreground, #6b7280)",
    fontSize: "0.875rem",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  coverWrap: {
    overflow: "hidden",
    borderRadius: "1.25rem",
    marginBottom: "2.5rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    maxHeight: "480px",
  },
  coverImg: {
    width: "100%",
    height: "100%",
    maxHeight: "480px",
    objectFit: "cover",
    display: "block",
  },
  card: {
    background: "var(--color-background, #fff)",
    borderRadius: "1.25rem",
    padding: "clamp(1.5rem, 4vw, 2.5rem)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid var(--color-border, #e5e7eb)",
  },
  excerpt: {
    borderLeft: "4px solid var(--color-primary, #7c3aed)",
    paddingLeft: "1.25rem",
    marginBottom: "2rem",
    fontStyle: "italic",
    fontSize: "1.05rem",
    color: "var(--color-muted-foreground, #374151)",
    lineHeight: 1.7,
  },
  footer: {
    marginTop: "2.5rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid var(--color-border, #e5e7eb)",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
};

function BlogDetailsPage() {
  const { id } = useParams();

  const [post, setPost]       = useState(null);
  const [loading, setLoading] = useState(true);

  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/blog/${id}`);
        if (mounted) setPost(res?.data ?? null);
      } catch (err) {
        console.error("Failed to load article:", err);
        if (mounted) {
          setPost(null);
          pushToast(err.message || "Failed to load article", "error");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id, pushToast]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      pushToast("Article link copied!", "success");
    } catch {
      pushToast("Failed to copy article link", "error");
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={S.page}>
        <LoadingSkeleton className="h-8 w-32 mb-6 rounded-full" />
        <LoadingSkeleton className="h-12 w-full mb-3 rounded-xl" />
        <LoadingSkeleton className="h-5 w-56 mb-8 rounded-full" />
        <LoadingSkeleton className="h-[400px] rounded-2xl mb-8" />
        <LoadingSkeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  /* ── Not found ── */
  if (!post) {
    return (
      <div style={{ ...S.page, textAlign: "center", paddingTop: "8rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>
          Article Not Found
        </h1>
        <p style={{ color: "var(--color-muted-foreground, #6b7280)", marginBottom: "2rem" }}>
          The article you are looking for does not exist or has been removed.
        </p>
        <Link to="/blog" className="btn btn-primary">Return to Blog</Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <div style={S.page}>

        {/* Back */}
        <Link to="/blog" style={S.backLink}>
          <ChevronLeft size={16} />
          Back to Blog
        </Link>

        {/* Category */}
        {post.category && (
          <span style={S.categoryBadge}>{post.category}</span>
        )}

        {/* Title */}
        <h1 style={S.title}>{post.title}</h1>

        {/* Meta */}
        <div style={S.meta}>
          <span style={S.metaItem}>
            <User size={15} />
            {post.author || "Silver Shield Editorial"}
          </span>
          <span style={S.metaItem}>
            <Calendar size={15} />
            {post.createdAt
              ? new Date(post.createdAt).toLocaleDateString(undefined, {
                  year: "numeric", month: "long", day: "numeric",
                })
              : "Date unavailable"}
          </span>
        </div>

        {/* Cover image — constrained, never overflows */}
        {post.coverImage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={S.coverWrap}
          >
            <img
              src={resolveMediaUrl(post.coverImage)}
              alt={post.title}
              style={S.coverImg}
            />
          </motion.div>
        )}

        {/* Content card */}
        <div style={S.card}>

          {/* Excerpt pull-quote */}
          {post.excerpt && (
            <blockquote style={S.excerpt}>{post.excerpt}</blockquote>
          )}

          {/* Rich content — sanitized so inline img styles cannot override containment */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />

          {/* Footer actions */}
          <div style={S.footer}>
            <button onClick={handleShare} className="btn btn-secondary">
              <Share2 size={15} />
              Share Article
            </button>
            <Link to="/donate" className="btn btn-primary">
              <BookOpen size={15} />
              Support Our Mission
            </Link>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}

export default BlogDetailsPage;