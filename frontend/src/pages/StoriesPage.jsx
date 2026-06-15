import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PaginationControls from "../components/PaginationControls";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { truncateText } from "../app/text";
import { BookOpen, User, ChevronRight } from "lucide-react";

function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("title-asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let mounted = true;
    apiFetch("/stories")
      .then((res) => {
        if (mounted) setStories(res.data || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const publishedStories = useMemo(
    () => stories.filter((s) => String(s.status || "").toLowerCase() !== "draft"),
    [stories],
  );

  const categories = useMemo(
    () => ["all", ...new Set(publishedStories.map((story) => story.category).filter(Boolean))],
    [publishedStories],
  );

  const items = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const next = publishedStories.filter((story) => {
      const matchesCategory = category === "all" ? true : story.category === category;
      const haystack = [story.title, story.author, story.category, story.excerpt, story.summary]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });

    return [...next].sort((a, b) => {
      if (sortBy === "author-asc") return String(a.author || "").localeCompare(String(b.author || ""));
      if (sortBy === "title-desc") return String(b.title || "").localeCompare(String(a.title || ""));
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }, [publishedStories, category, searchTerm, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [category, searchTerm, sortBy, pageSize]);

  const pagedStories = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return (
    <PageTransition>
      <div className="flex flex-col gap-16 pb-24">
        {/* Slim Hero */}
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
              Voices of Change
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="h1 tracking-tight"
            >
              Real{" "}
              <span className="text-brand-400">Impact</span> Stories
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="body-lg text-brand-100/70 max-w-2xl mx-auto mt-6"
            >
              Documenting the journey of resilience, empowerment, and community
              growth.
            </motion.p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="filter-shell mb-8">
            <input
              className="filter-field flex-grow min-w-[220px]"
              type="search"
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search stories"
            />
            <select
              className="filter-field"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter stories by category"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All categories" : item}
                </option>
              ))}
            </select>
            <select
              className="filter-field"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort stories"
            >
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="author-asc">Author A-Z</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <LoadingSkeleton
                      key={i}
                      className="h-80 rounded-3xl"
                    />
                  ))
              : items.length > 0
              ? pagedStories.map((s, i) => (
                  <motion.article
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -6 }}
                    className="program-card group"
                  >
                    <div className="program-media">
                      <img
                        src={resolveMediaUrl(s.coverImage)}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <div className="program-meta">
                        {s.category || "Perspective"}
                      </div>
                    </div>

                    <div className="program-body">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-800">
                          <User size={12} />
                        </div>
                        <span className="label text-brand-700">
                          {s.author || "Silver Shield"}
                        </span>
                      </div>

                      <h3 className="h3 text-text-900 mb-3 leading-tight uppercase tracking-tight">
                        {s.title}
                      </h3>
                      <p className="body-sm text-text-500 font-medium leading-relaxed mb-6">
                        {truncateText(
                          s.excerpt ||
                            s.summary ||
                            "Read the full transformation story of this community member.",
                          140
                        )}
                      </p>

                      <Link
                        to={`/stories/${s.slug || s.id}`}
                        className="inline-flex items-center gap-2 font-bold text-[10px] text-accent-600 uppercase tracking-wider no-underline group-hover:gap-3 transition-all"
                      >
                         Read full story{" "}
                         <ChevronRight size={14} />
                      </Link>
                    </div>
                  </motion.article>
                ))
              : (
                  <div className="md:col-span-2 p-16 text-center flex flex-col items-center gap-5 bg-white rounded-3xl border border-border-subtle shadow-sm">
                    <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center text-brand-400">
                      <BookOpen size={28} />
                    </div>
                    <h3 className="h4 text-brand-900 uppercase tracking-widest">
                      No stories published yet
                    </h3>
                    <p className="body-sm text-text-500 font-medium max-w-sm">
                      Check back soon for inspiring updates from our programmes.
                    </p>
                  </div>
                )}
          </div>
          {!loading && (
            <PaginationControls
              page={page}
              pageSize={pageSize}
              totalItems={items.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              label="stories"
            />
          )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default StoriesPage;
