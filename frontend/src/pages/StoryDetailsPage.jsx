import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Tag, Share2, Heart, Globe } from "lucide-react";
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
      .then((response) => { if (mounted) setStory(response.data); })
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id, pushToast]);

  if (loading) return <PageTransition><div className="p-12"><LoadingSkeleton className="h-[600px] rounded-[40px]"/></div></PageTransition>;
  if (!story) return <PageTransition><div className="container py-24 text-center"><h1 className="display-1">Story Archive Empty</h1><Link to="/stories" className="btn btn-primary mt-8 no-underline inline-block border-none cursor-pointer">Back to Library</Link></div></PageTransition>;

  return (
    <PageTransition>
      <div className="flex flex-col gap-16 pb-24 font-body">
        
        {/* Editorial Hero */}
        <section className="section-hero bg-brand-900 overflow-hidden relative pt-24 pb-24">
          <div className="absolute inset-0 opacity-10 pointer-events-none" />
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-8 text-center">
              <Link to="/stories" className="flex items-center gap-2 text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] hover:text-white transition-colors no-underline mx-auto">
                <ArrowLeft size={14}/> Back to perspectives
              </Link>
              <div className="flex flex-col gap-4">
                <span className="px-4 py-1.5 glass-dark rounded-full text-[10px] font-black tracking-widest uppercase text-accent-500 w-fit mx-auto border border-solid border-white/10">
                  {story.category || "Transformation"}
                </span>
                <h1 className="display-1 text-white m-0 uppercase tracking-tighter leading-tight">{story.title}</h1>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-brand-400">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <User size={14} className="text-accent-600"/> {story.author || "Silver Shield Editorial"}
                </div>
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <Clock size={14} className="text-accent-600"/> {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently Published"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Content */}
        <section className="section -mt-32 relative z-20">
          <div className="container max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            <div className="lg:col-span-8 flex flex-col gap-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[60px] overflow-hidden border-8 border-white shadow-premium bg-surface-200"
              >
                <img src={resolveMediaUrl(story.coverImage)} className="w-full aspect-video object-cover" alt="Story Cover" />
              </motion.div>

              <article className="bg-white p-10 lg:p-16 rounded-[60px] border border-border-subtle shadow-sm">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4 pb-8 border-b border-border-subtle">
                    <h2 className="text-xs font-black text-brand-900 uppercase tracking-widest m-0 leading-none">Executive Summary</h2>
                    <p className="body-lg text-brand-800 font-bold leading-relaxed italic m-0">
                      {story.excerpt || "A firsthand account of transformation and community empowerment through Silver Shield initiatives."}
                    </p>
                  </div>
                  
                  <div className="text-text-700 leading-relaxed font-medium text-lg whitespace-pre-wrap m-0">
                    {story.content}
                  </div>

                  {Array.isArray(story.tags) && story.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-10 border-t border-border-subtle">
                      <Tag size={14} className="text-text-400" />
                      {story.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-surface-200 rounded-lg text-[10px] font-black text-text-500 uppercase tracking-widest">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </div>

            <aside className="lg:col-span-4 flex flex-col gap-8 lg:sticky lg:top-24">
              <div className="bg-brand-900 text-white p-10 rounded-[40px] shadow-premium flex flex-col gap-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Share2 size={80}/></div>
                 <h4 className="text-lg font-black uppercase tracking-widest m-0 leading-tight relative z-10">Share this journey</h4>
                 <p className="text-xs text-brand-100/70 font-medium leading-relaxed m-0 relative z-10">
                   Help us amplify the voices of our community by sharing this story with your network.
                 </p>
                 <div className="flex gap-2 relative z-10">
                    <button className="flex-grow btn glass-dark py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-white/10 hover:bg-white/10 transition-all border border-solid border-white/10 cursor-pointer text-white">Share Platform</button>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-border-subtle shadow-sm flex flex-col gap-6 group hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-800 shadow-sm group-hover:bg-brand-900 group-hover:text-white transition-all duration-300">
                  <Heart size={24} />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-black text-brand-900 uppercase tracking-widest m-0 leading-tight">Support Initiatives</h4>
                  <p className="text-xs text-text-500 font-medium leading-relaxed m-0">
                    Stories like this are only possible through the generosity of our supporters.
                  </p>
                </div>
                <Link to="/donate" className="btn btn-primary w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest no-underline text-center text-white border-none cursor-pointer shadow-lg block">
                  Fuel More Stories
                </Link>
              </div>

              <div className="bg-surface-100 p-8 rounded-[40px] border border-border-subtle flex flex-col gap-6">
                <h4 className="text-[10px] font-black text-text-400 uppercase tracking-widest m-0 leading-none">Perspective Source</h4>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-800 border border-border-subtle shadow-sm">
                      <Globe size={20}/>
                   </div>
                   <div className="flex flex-col leading-tight">
                      <span className="text-xs font-black text-brand-900 uppercase tracking-tighter leading-none">Community Voice</span>
                      <span className="text-[9px] font-bold text-text-400 uppercase tracking-widest mt-1">Verified Narrative</span>
                   </div>
                </div>
              </div>
            </aside>

          </div>
        </section>

      </div>
    </PageTransition>
  );
}

export default StoryDetailsPage;
