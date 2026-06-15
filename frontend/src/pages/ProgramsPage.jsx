import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PaginationControls from "../components/PaginationControls";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { getProgramPath } from "../app/programCatalog";
import { FALLBACK_PROGRAMS } from "../app/fallbackContent";
import { truncateText } from "../app/text";
import { useToast } from "../context/ToastContext";
import { Heart } from "lucide-react";

function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title-asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;
    apiFetch("/programs")
      .then((response) => {
        if (mounted) setPrograms(response.data || []);
      })
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [pushToast]);

  const programItems = useMemo(() => {
    const live = programs.filter(
      (p) => String(p.status || "").toLowerCase() !== "draft"
    );
    return live.length ? live : FALLBACK_PROGRAMS;
  }, [programs]);

  const categories = useMemo(
    () => ["all", ...new Set(programItems.map((p) => p.category).filter(Boolean))],
    [programItems]
  );

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const next = programItems.filter((p) => {
      const matchesCategory = category === "all" ? true : p.category === category;
      const haystack = [p.title, p.category, p.summary, p.description, p.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });

    return [...next].sort((a, b) => {
      if (sortBy === "goal-desc") return Number(b.goalAmount || 0) - Number(a.goalAmount || 0);
      if (sortBy === "raised-desc") return Number(b.raisedAmount || 0) - Number(a.raisedAmount || 0);
      if (sortBy === "title-desc") return String(b.title || "").localeCompare(String(a.title || ""));
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }, [programItems, category, searchTerm, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [category, searchTerm, sortBy, pageSize]);

  const pagedPrograms = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <PageTransition>
      <div className="programs-page">
        <section className="programs-hero">
          <div
            className="hero-backdrop"
            style={{ 
              background: "radial-gradient(circle at 50% 120%, var(--color-brand-600) 0%, transparent 65%)",
              opacity: 0.2,
            }}
          />
          <div className="container text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="label text-accent-400 hero-eyebrow"
            >
              Our Initiatives
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="hero-heading"
            >
              Strategic <span className="text-accent-400">Pathways</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hero-copy"
            >
              Programmes designed with clear metrics and sustainable community
              outcomes for long-term growth.
            </motion.p>
          </div>
        </section>

        <div className="container programs-filter-shell">
          <input
            className="filter-field"
            type="search"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search programs"
          />
          <select
            className="filter-field"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort programs"
          >
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="goal-desc">Highest goal</option>
            <option value="raised-desc">Most raised</option>
          </select>
          <div className="filter-pill-group">
            {categories.map((item) => (
              <button
                key={item}
                className={`filter-pill ${category === item ? "filter-pill-active" : ""}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <section className="section programs-grid-section">
          <div className="container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <LoadingSkeleton
                      key={i}
                      className="programs-skeleton"
                    />
                  ))
              : pagedPrograms.map((p, i) => (
                  <motion.article
                    key={p.id || i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
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
                        src={resolveMediaUrl(p.heroImage)}
                        className="program-media-img"
                        alt=""
                      />
                    <div className="program-meta">
                        {p.category || "Impact"}
                      </div>
                    </div>

                    <div className="program-body">
                      <h3 className="program-title text-text-900 mb-1 leading-tight uppercase tracking-tight line-clamp-2">
                        {p.title}
                      </h3>
                      <p className="program-description line-clamp-3">
                        {truncateText(
                          p.summary ||
                            "Description in development. We are working on providing full details for this initiative.",
                          150
                        )}
                      </p>

                      <div className="pt-4 mt-2 border-t border-border-subtle flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="label text-text-400 text-[9px]">Goal</span>
                            <div className="text-sm font-black text-brand-900">
                              ${Number(p.goalAmount || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className="program-metric-status">
                            <span className="label text-accent-600 text-[9px]">Secured</span>
                            <div className="text-sm font-black text-accent-600">
                              ${Number(p.raisedAmount || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="program-progress">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{
                              width: `${Math.min(100, (p.raisedAmount / (p.goalAmount || 1)) * 100)}%`,
                            }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 1.5,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="program-progress-fill"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <Link
                          to={
                            p.id && !p.isFallback
                              ? getProgramPath(p)
                              : "/programs"
                          }
                          className="btn btn-primary btn-sm flex-grow"
                        >
                          Details
                        </Link>
                        <Link
                          to={
                            p.id && !p.isFallback
                              ? `/donate?programId=${p.id}`
                              : "/donate"
                          }
                          className="btn btn-secondary btn-icon"
                        >
                          <Heart size={14} className="fill-current text-accent-600" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
          </div>
          {!loading && (
            <PaginationControls
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              label="programs"
            />
          )}
        </section>
      </div>
    </PageTransition>
  );
}

export default ProgramsPage;
