import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  History,
  Target,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Heart,
} from "lucide-react";
import { apiFetch, resolveMediaUrl } from "../app/api";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useSiteSettings } from "../context/SiteSettingsContext";

const DEFAULT_HERO = "https://www.edumin.co.ke/backend/uploads/com1-1771957870271-956089917.jpeg";

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
  const { settings } = useSiteSettings();
  const [about, setAbout] = useState({
    title: "About Silver Shield",
    storyContent: "",
    mission: "", // Will be set from API or fallback in useEffect
    vision: "",  // Will be set from API or fallback in useEffect
    heroImage: "",
    videoUrl: "",
  });

  useEffect(() => {
    let mounted = true;
    apiFetch("/about")
      .then((res) => {
        if (mounted)
          setAbout((prev) => ({
            ...prev,
            ...(res.data || {}),
            mission: res.data?.mission || settings?.mission || prev.mission, // Prioritize API, then settings, then current state
            vision: res.data?.vision || settings?.vision || prev.vision,   // Prioritize API, then settings, then current state
          }));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const heroImage = useMemo(() => {
    const url = resolveMediaUrl(about.heroImage);
    return url && !url.endsWith('/') ? url : DEFAULT_HERO;
  }, [about.heroImage]);
  const youtubeEmbed = useMemo(
    () => toYoutubeEmbed(about.videoUrl),
    [about.videoUrl]
  );
  const videoUrl = useMemo(
    () => resolveMediaUrl(about.videoUrl),
    [about.videoUrl]
  );

  return (
    <PageTransition>
      <div className="flex flex-col gap-20 pb-24 bg-surface-100">
        {/* Slim Hero */}
        <section className="section-hero bg-brand-900 overflow-hidden relative">
          {heroImage && (
            <div 
              className="absolute inset-0 opacity-70 pointer-events-none"
              style={{ 
                backgroundImage: `url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 120%, var(--brand-600) 0%, transparent 60%)",
              opacity: 0.2,
            }}
          />
          <div className="container relative z-10 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="label text-accent-400 mb-5 block"
            >
              Who We Are
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h1 text-white tracking-tight"
            >
              Shaping{" "}
              <span className="--color-bg">Lives</span> with Purpose
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="body-lg text-text-400 max-w-2xl mx-auto mt-7 font-medium"
            >
              A community-led organisation dedicated to building confident
              leaders and driving sustainable change through strategic mentorship
              and outreach.
            </motion.p>
          </div>
        </section>

        {/* Narrative */}
        <section className="section">
          <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-7 flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <History size={18} className="text-brand-600" />
                <span className="label text-brand-600">Our Journey</span>
              </div>
              <h3 className="h2 text-text-900">{about.title || "The Silver Shield Story"}</h3>
              {loading ? (
                <div className="mt-2 flex flex-col gap-3">
                  <LoadingSkeleton className="h-5 w-full" />
                  <LoadingSkeleton className="h-5 w-4/5" />
                  <LoadingSkeleton className="h-5 w-5/6" />
                </div>
              ) : (
                <p className="body-lg text-text-500 leading-relaxed font-medium">
                  {about.storyContent ||
                    "Our full story is being compiled to showcase the impact of our years of community service and leadership development."}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  icon: <Target size={24} />,
                  title: "Our Mission",
                  text: about.mission,
                  bg: "bg-surface-100",
                },
                {
                  icon: <Zap size={24} />,
                  title: "Our Vision",
                  text: about.vision,
                  bg: "bg-surface-100",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className="card card-body flex flex-col gap-5"
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${i === 0 ? "bg-brand-900" : "bg-accent-600"} text-white flex items-center justify-center shadow-sm`}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <h4 className="h4 text-text-900 mb-2">{c.title}</h4>
                    <p className="body-sm text-text-500 font-medium leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border-subtle">
              <Link
                to="/donate"
                className="btn btn-primary px-8 py-4 shadow-lg group"
              >
                <Heart size={16} className="fill-current" /> Support Our Work
              </Link>
              <Link
                to="/contact"
                className="btn btn-secondary px-8 py-4"
              >
                Partner With Us <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-8">
            {heroImage && (
              <motion.div
                whileHover={{ scale: 1.02, rotate: 0.5 }}
                className="card overflow-hidden border-[12px] border-white bg-surface-200"
              >
                <img
                  src={heroImage}
                  className="w-full aspect-[4/5] object-cover"
                  alt="Community impact"
                />
              </motion.div>
            )}

            {(youtubeEmbed || videoUrl) && (
              <div className="card overflow-hidden bg-brand-900 border border-white/5 aspect-video relative group">
                {youtubeEmbed ? (
                  <iframe
                    title="Silver Shield Narrative"
                    src={youtubeEmbed}
                    className="w-full h-full border-none"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    src={videoUrl}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-5 left-5 glass-dark px-4 py-1.5 rounded-full flex items-center gap-2.5 pointer-events-none border border-white/10 shadow-lg">
                  <div className="w-2 h-2 bg-accent-400 rounded-full shadow-[0_0_8px_var(--accent-500)]" />
                  <span className="label text-white">Documentary</span>
                </div>
              </div>
            )}

            <div className="card card-body flex flex-col gap-6">
              <h4 className="label text-text-400 flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-success" /> Registered &amp; Certified
              </h4>
              <ul className="flex flex-col gap-3">
                {[
                  "Registered NGO in Kenya",
                  "Verified Community Impact Centre",
                  "Transparency in Stewardship",
                  "Youth & Women Led Initiatives",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm font-semibold text-text-700 tracking-tight"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-brand-500 flex-shrink-0"
                    />{" "}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default AboutPage;
