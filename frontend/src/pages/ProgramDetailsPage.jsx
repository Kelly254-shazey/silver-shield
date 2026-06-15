import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiFetch, resolveMediaUrl } from "../app/api";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, Target, Heart, ShieldCheck, Info } from "lucide-react";

function ProgramDetailsPage() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch(`/programs/${id}`)
      .then((res) => {
        if (mounted) setProgram(res.data);
      })
      .catch((err) => pushToast(err.message, "error"))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id, pushToast]);

  if (loading) return (
    <div className="container py-24">
      <LoadingSkeleton className="h-[40vh] rounded-[40px] mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <LoadingSkeleton className="h-64 rounded-3xl" />
        <LoadingSkeleton className="h-64 rounded-3xl" />
        <LoadingSkeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  );

  if (!program) return (
    <div className="container py-32 text-center">
      <h1 className="h1 text-brand-900">Program Not Found</h1>
      <Link to="/programs" className="btn btn-primary mt-8">Back to Programs</Link>
    </div>
  );

  return (
    <PageTransition>
      <div className="pb-24">
        {/* Hero Section */}
        <header className="bg-brand-900 pt-24 pb-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-70" style={{ background: `url(${resolveMediaUrl(program.heroImage)}) center/cover no-repeat` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-950/60 to-brand-900" />
          <div className="container relative z-10">
            <div className="max-w-4xl flex flex-col gap-6">
              <Link to="/programs" className="flex items-center gap-2 text-[10px] font-black text-brand-400 uppercase tracking-widest hover:text-white transition-colors no-underline w-fit">
                <ArrowLeft size={14} /> Back to Initiatives
              </Link>
              <div className="flex flex-col gap-3">
                <span className="badge badge-soft w-fit">{program.category}</span>
                <h1 className="h1 text-white m-0 uppercase tracking-tighter">{program.title}</h1>
              </div>
              <p className="body-lg text-brand-100/80 max-w-2xl">{program.summary || program.description}</p>
            </div>
          </div>
        </header>

        <section className="container -mt-20 relative z-20">
          <div className="flex flex-col gap-20">
            {/* Main Stats/Description */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 flex flex-col gap-8">
                <div className="card p-10 md:p-16 border border-border-subtle">
                  <h2 className="h3 text-brand-900 mb-8 flex items-center gap-3">
                    <Info className="text-accent-500" /> Executive Summary
                  </h2>
                  <div className="text-text-700 leading-relaxed whitespace-pre-wrap">
                    {program.description}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="card p-10 bg-brand-900 text-white border-white/5 shadow-premium">
                  <h3 className="label text-brand-400 mb-6">Impact Tracking</h3>
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-black">${Number(program.raisedAmount).toLocaleString()}</span>
                      <span className="label text-white/60">Raised</span>
                    </div>
                    <div className="program-progress h-2 bg-white/10 border-none shadow-none">
                      <div className="program-progress-fill h-full" style={{ width: `${Math.min(100, (program.raisedAmount / (program.goalAmount || 1)) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-300">
                      <span>Goal: ${Number(program.goalAmount).toLocaleString()}</span>
                      <span>{Math.round((program.raisedAmount / (program.goalAmount || 1)) * 100)}%</span>
                    </div>
                    <Link to={`/donate?programId=${program.id}`} className="btn btn-primary w-full gap-2">
                      <Heart size={16} fill="currentColor" /> Fuel this Mission
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Programs Section */}
            {program.sub_programs?.length > 0 && (
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-2">
                  <span className="label text-accent-600">Specialized Tracks</span>
                  <h2 className="h2 text-brand-900 uppercase tracking-tight">Focus Initiatives</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {program.sub_programs.map((sub, i) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -12 }}
                      className="program-card group"
                    >
                      <div className="program-media">
                        <img
                          src={resolveMediaUrl(sub.coverImage)}
                          alt={sub.title}
                        />
                        <div className="program-meta">
                           Sub-Program
                        </div>
                      </div>
                      <div className="program-body">
                        <h3 className="program-title text-text-900 mb-1 leading-tight uppercase tracking-tight line-clamp-2">{sub.title}</h3>
                        <p className="program-description line-clamp-2">
                          {sub.description}
                        </p>

                        <div className="pt-4 mt-2 border-t border-border-subtle flex flex-col gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="label text-text-400 text-[9px]">Goal</span>
                              <div className="text-sm font-black text-brand-900">
                                ${Number(sub.goalAmount || 0).toLocaleString()}
                              </div>
                            </div>
                            <div className="program-metric-status">
                              <span className="label text-accent-600 text-[9px]">Secured</span>
                              <div className="text-sm font-black text-accent-600">
                                ${Number(sub.raisedAmount || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="program-progress">
                            <div className="program-progress-fill" style={{ width: `${Math.min(100, (sub.raisedAmount / (sub.goalAmount || 1)) * 100)}%` }} />
                          </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <Link to={`/programs/${sub.slug || sub.id}`} className="btn btn-primary btn-sm flex-grow">
                            Details
                          </Link>
                          <Link to={`/donate?programId=${sub.id}`} className="btn btn-secondary btn-sm px-4">
                            <Heart size={14} className="fill-current text-accent-600" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default ProgramDetailsPage;