import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PaginationControls from "../components/PaginationControls";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { truncateText } from "../app/text";
import { BookText, User, ChevronRight, Calendar } from "lucide-react";
import { useToast } from "../context/ToastContext";

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;
    apiFetch("/blog")
      .then((res) => {
        if (mounted) setPosts(res.data || []);
      })
      .catch(err => pushToast(err.message, "error"))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [pushToast]);

  const publishedPosts = useMemo(
    () => posts.filter((s) => String(s.status || "").toLowerCase() === "published"),
    [posts],
  );

  const categories = useMemo(
    () => ["all", ...new Set(publishedPosts.map((post) => post.category).filter(Boolean))],
    [publishedPosts],
  );

  const items = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const next = publishedPosts.filter((post) => {
      const matchesCategory = category === "all" ? true : post.category === category;
      const haystack = [post.title, post.author, post.category, post.excerpt]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });

    return [...next].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }, [publishedPosts, category, searchTerm, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [category, searchTerm, sortBy, pageSize]);

  const pagedPosts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return (
    <PageTransition>
      <div className="flex flex-col gap-16 pb-24">
        <section className="section-hero bg-brand-900 overflow-hidden relative text-white">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 120%, var(--brand-600) 0%, transparent 60%)", opacity: 0.2 }} />
          <div className="container relative z-10 text-center">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label text-accent-400 mb-5 block">Knowledge &amp; Insights</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h1 tracking-tight">The <span className="text-brand-400">Shield</span> Blog</motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="body-lg text-brand-100/70 max-w-2xl mx-auto mt-6">Expert analysis, mission updates, and regional developments from the heart of our operations.</motion.p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="filter-shell mb-12">
              <input className="filter-field flex-grow min-w-[220px]" type="search" placeholder="Search articles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <select className="filter-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((item) => <option key={item} value={item}>{item === "all" ? "All categories" : item}</option>)}
              </select>
              <select className="filter-field" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {loading ? Array(6).fill(0).map((_, i) => <LoadingSkeleton key={i} className="h-96 rounded-[32px]" />)
                : items.length > 0 ? pagedPosts.map((post, i) => (
                  <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -12 }} className="program-card group">
                    <div className="program-media">
                      <img src={resolveMediaUrl(post.coverImage)} className="w-full h-full object-cover" alt="" />
                      <div className="program-meta">{post.category || "Insight"}</div>
                    </div>
                    <div className="program-body">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1.5 label text-text-400">
                          <Calendar size={12} className="text-brand-600" />
                          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <h3 className="h3 text-text-900 mb-3 leading-tight uppercase tracking-tight line-clamp-2">{post.title}</h3>
                      <p className="body-sm text-text-500 font-medium leading-relaxed mb-6 line-clamp-3">
                        {truncateText(post.excerpt || post.content || "", 140)}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-800">
                            <User size={12} />
                          </div>
                          <span className="text-[10px] font-black text-brand-700 uppercase tracking-widest">{post.author || "Shield Staff"}</span>
                        </div>
                        <Link to={`/blog/${post.slug || post.id}`} className="text-[10px] font-black text-accent-600 uppercase tracking-widest no-underline flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read Article <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                )) : (
                  <div className="card card-body col-span-full p-20 text-center flex flex-col items-center gap-5">
                    <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-400"><BookText size={32} /></div>
                    <h3 className="h3 text-brand-900 uppercase tracking-widest">No articles found</h3>
                    <p className="body-sm text-text-500 font-medium max-w-sm">Try adjusting your search or category filters to find what you are looking for.</p>
                  </div>
                )}
            </div>
            {!loading && items.length > 0 && (
              <div className="mt-16">
                <PaginationControls page={page} pageSize={pageSize} totalItems={items.length} onPageChange={setPage} onPageSizeChange={setPageSize} label="articles" />
              </div>
            )}
          </div>
        </section>

        <section className="container">
          <div className="card p-10 lg:p-16 text-center flex flex-col items-center gap-7">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-800 shadow-sm"><BookText size={32} /></div>
            <h2 className="h2 text-brand-900 uppercase tracking-tight">Stay Informed</h2>
            <p className="body-lg text-text-500 max-w-2xl leading-relaxed font-medium">Join our mailing list to receive the latest updates, field reports, and community insights directly in your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="your@email.com" className="input-field flex-grow" required />
              <button type="submit" className="btn btn-primary px-8">Subscribe</button>
            </form>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default BlogPage;