import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, ChevronLeft, Share2, Tag, BookOpen } from "lucide-react";
import { apiFetch, resolveMediaUrl } from "../app/api";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";

function BlogDetailsPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch(`/blog/${id}`)
      .then((res) => {
        if (mounted) setPost(res.data);
      })
      .catch((err) => pushToast(err.message, "error"))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id, pushToast]);

  if (loading) return (
    <div className="container py-24">
      <LoadingSkeleton className="h-[50vh] rounded-[40px] mb-12" />
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <LoadingSkeleton className="h-12 w-3/4" />
        <LoadingSkeleton className="h-6 w-1/4" />
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    </div>
  );

  if (!post) return (
    <div className="container py-32 text-center flex flex-col items-center gap-6">
      <h1 className="h1 text-brand-900">Article Not Found</h1>
      <p className="body-lg text-text-500">The article you are looking for might have been moved or removed.</p>
      <Link to="/blog" className="btn btn-primary">Return to Blog</Link>
    </div>
  );

  return (
    <PageTransition>
      <div className="pb-24">
        <header className="bg-brand-900 pt-24 pb-24 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-70" style={{ background: `url(${resolveMediaUrl(post.coverImage)}) center/cover no-repeat` }} />
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
              <Link to="/blog" className="flex items-center gap-2 text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] hover:text-white transition-colors no-underline w-fit">
                <ChevronLeft size={14} /> Back to Insights
              </Link>
              <div className="flex flex-col gap-4">
                <span className="px-4 py-1.5 glass-dark rounded-full text-[10px] font-black tracking-widest uppercase text-accent-400 w-fit border border-solid border-white/10">
                  {post.category || "Article"}
                </span>
                <h1 className="h1 text-white m-0 uppercase tracking-tighter leading-tight">{post.title}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-brand-300">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <User size={14} className="text-accent-500" /> {post.author || "Shield Editorial"}
                </div>
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <Calendar size={14} className="text-accent-500" /> {new Date(post.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
            </div>
          </div>
        </header>

        <article className="container -mt-32 relative z-20">
          <div className="max-w-4xl mx-auto flex flex-col gap-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[40px] md:rounded-[60px] overflow-hidden border-8 border-white shadow-premium bg-surface-200">
              <img src={resolveMediaUrl(post.coverImage)} className="w-full aspect-video object-cover" alt="Article Cover" />
            </motion.div>
            <div className="card p-8 md:p-16 border border-border-subtle shadow-sm flex flex-col gap-8">
              {post.excerpt && (
                <p className="body-lg text-brand-900 font-bold leading-relaxed italic border-l-4 border-accent-500 pl-6 m-0">
                  {post.excerpt}
                </p>
              )}
              <div className="text-text-700 leading-relaxed font-medium text-lg whitespace-pre-wrap blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
              <div className="flex items-center justify-between pt-10 border-t border-border-subtle flex-wrap gap-6">
                <div className="flex items-center gap-4">
                  <button className="btn btn-secondary btn-sm rounded-xl gap-2" onClick={() => pushToast("Share link copied!", "success")}>
                    <Share2 size={14} /> Share Article
                  </button>
                </div>
                <Link to="/donate" className="btn btn-primary btn-sm rounded-xl gap-2">
                  <BookOpen size={14} /> Support Our Mission
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </PageTransition>
  );
}

export default BlogDetailsPage;