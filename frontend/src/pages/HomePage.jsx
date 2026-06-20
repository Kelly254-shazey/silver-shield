import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Zap,
  Heart,
  ChevronRight,
  TrendingUp,
  ArrowDown,
  Award,
  Globe,
  Sparkles,
} from "lucide-react";
import CountUp from "../components/CountUp";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { getProgramPath } from "../app/programCatalog";
import { truncateText } from "../app/text";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageTransition from "../components/PageTransition";
import { useSiteSettings } from "../context/SiteSettingsContext";

const ABOUT_FALLBACK = {
  title: "Silver Shield Organisation",
  storyContent:
    "Building dignity, opportunity, and resilience across Bungoma. We partner with women, youth, schools, and families to unlock potential through mentorship, skills training, and community leadership.",
  mission: "To empower communities with integrity, impact, and excellence.",
  vision: "Communities of confident, skilled leaders driving sustainable change.",
  tagline: "DIGNITY \u2022 OPPORTUNITY \u2022 MOMENTUM",
};

const BASE = "https://www.edumin.co.ke/backend/uploads";
const HERO_IMAGE_FALLBACK = `${BASE}/com1-1771957870271-956089917.jpeg`;

// ─── Pillar colours (solid, no images) ────────────────────────────────────
const PILLAR_COLORS = [
  "#7c3aed", // purple – Women
  "#4f46e5", // indigo – Youth
  "#0ea5e9", // sky blue – Schools
  "#8b5cf6", // violet – Community
];

const DEFAULT_PILLARS = [
  {
    key: "women",
    initial: "01",
    label: "Women Empowerment",
    title: "Women Empowerment",
    desc: "Dignity, skills, and practical economic opportunity for women and girls.",
    icon: <Users size={28} />,
    color: PILLAR_COLORS[0],
  },
  {
    key: "youth",
    initial: "02",
    label: "Youth Leadership",
    title: "Youth Leadership",
    desc: "Mentorship, exposure, and clear pathways for young people to lead and grow.",
    icon: <TrendingUp size={28} />,
    color: PILLAR_COLORS[1],
  },
  {
    key: "schools",
    initial: "03",
    label: "School Mentorship",
    title: "School Mentorship",
    desc: "Confidence, discipline, and career guidance delivered closer to learners.",
    icon: <ShieldCheck size={28} />,
    color: PILLAR_COLORS[2],
  },
  {
    key: "community",
    initial: "04",
    label: "Community Outreach",
    title: "Community Outreach",
    desc: "Field engagement that connects families to support, hope, and practical next steps.",
    icon: <Globe size={28} />,
    color: PILLAR_COLORS[3],
  },
];

/* ─── Pillar styles – solid background, no images ────────────────────── */
const pillarStyles = `
  .pillar-card {
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.28s ease, box-shadow 0.28s ease;
    box-shadow: 0 4px 18px -4px rgba(0,0,0,0.18);
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    padding: 1.5rem;
    color: #fff;
  }
  .pillar-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px -8px rgba(0,0,0,0.4);
  }
  .pillar-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  .pillar-number {
    font-size: 2.5rem;
    font-weight: 800;
    opacity: 0.3;
    line-height: 1;
  }
  .pillar-icon {
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .pillar-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }
  .pillar-copy {
    font-size: 0.9rem;
    opacity: 0.9;
    line-height: 1.5;
    flex: 1;
  }
  .pillar-card-footer {
    margin-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.2);
    padding-top: 0.75rem;
    font-weight: 600;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .pillar-card-link {
    position: absolute;
    inset: 0;
    z-index: 2;
    text-indent: -9999px;
  }
  .pillar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }
`;

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [about, setAbout] = useState(ABOUT_FALLBACK);
  const [programs, setPrograms] = useState([]);
  const [impactStats, setImpactStats] = useState([]);
  const { settings, loading: settingsLoading } = useSiteSettings();

  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.04]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.5]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          apiFetch("/about"),
          apiFetch("/programs"),
          apiFetch("/impact/stats"),
        ]);
        if (!mounted) return;

        if (results[0].status === "fulfilled" && results[0].value?.data)
          setAbout((prev) => ({ ...prev, ...results[0].value.data }));

        if (!settingsLoading && settings?.tagline)
          setAbout((prev) => ({ ...prev, tagline: settings.tagline }));

        setPrograms(
          results[1].status === "fulfilled" ? results[1].value?.data || [] : []
        );
        setImpactStats(
          results[2].status === "fulfilled" ? results[2].value?.data || [] : []
        );
      } catch (err) {
        console.error("HomePage data fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [settings, settingsLoading]);

  const featuredPrograms = useMemo(() => {
    const live = programs.filter(
      (p) => String(p.status || "").toLowerCase() !== "draft"
    );
    return (live.length ? live : DEFAULT_PILLARS).slice(0, 3);
  }, [programs]);

  const sectionMotion = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <PageTransition>
      <style>{pillarStyles}</style>

      <div className="hp-root">
        {/* ─── HERO ─────────────────────────────── */}
        <section className="hero-section section-hero min-h-[65vh] flex items-center py-12 md:py-20">
          <motion.div
            style={{ scale: heroScale, opacity: heroOpacity }}
            className="hero-overlay"
          >
            <div
              className="hero-overlay-backdrop"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(236, 72, 153, 0.1), rgba(0, 0, 0, 0.6))",
              }}
            />
            <div
              className="hero-overlay-image"
              style={{
                backgroundImage: `url(${resolveMediaUrl(about.heroImage) || HERO_IMAGE_FALLBACK})`,
                opacity: 0.95,
              }}
            />
            <div className="hero-glow hero-glow-brand" />
            <div className="hero-glow hero-glow-accent" />
          </motion.div>

          <div className="container hero-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="hero-eyebrow text-white">
                <Sparkles size={14} />
                {about.tagline || "Dignity • Opportunity • Momentum"}
              </span>

              <h1 className="hero-heading text-white">
                Building Confident Leaders
                <br />
                <span>&</span> Thriving Communities
              </h1>

              <p className="hero-copy text-white">
                We unlock potential through mentorship, skills training, and
                community-led change. Partner with us to shape lives and drive
                real progress across Bungoma.
              </p>

              <div className="hero-actions">
                <Link to="/donate" className="btn btn-primary btn-xl">
                  <Heart size={20} />
                  Support Our Work
                </Link>
                <Link to="/programs" className="btn btn-secondary btn-xl hero-link">
                  Explore Programs
                  <ArrowRight size={20} />
                </Link>
              </div>

              <div className="scroll-hint" aria-hidden="true">
                <span>Scroll to explore impact</span>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="scroll-hint-dot"
                >
                  <ArrowDown size={18} />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── IMPACT METRICS ─── */}
        {impactStats.length > 0 && (
          <section className="bg-brand-900 py-12 border-y border-white/5 relative z-20 shadow-lg">
            <div className="container grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {[...impactStats]
                .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                .map((stat) => (
                  <div
                    key={stat.id || stat.metricKey}
                    className="flex flex-col items-center text-center gap-1"
                  >
                    <span className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                      <CountUp value={stat.value} suffix={stat.unit} />
                    </span>
                    <span className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">
                      {stat.label}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ─── FOUR PILLARS GRID ───────────────── */}
        <motion.section
          className="section section-surface section-border"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          variants={sectionMotion}
        >
          <div className="container">
            <div className="section-grid section-grid-2 section-headline-wrap">
              <div>
                <span className="label section-label">
                  <Sparkles size={16} />
                  The 4 Pillars
                </span>
                <h2 className="h2 section-title">
                  Strategic Impact.
                  <br />
                  <span className="hero-gradient-text">Built for lasting change.</span>
                </h2>
              </div>

              <Link to="/programs" className="hero-link">
                View our strategy <ArrowRight size={16} />
              </Link>
            </div>

            <div className="pillar-grid">
              {DEFAULT_PILLARS.map((pillar, i) => (
                <motion.article
                  key={pillar.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  className="pillar-card"
                  style={{ backgroundColor: pillar.color }} // solid colour
                >
                  <div className="pillar-header">
                    <span className="pillar-number">{pillar.initial}</span>
                    <div className="pillar-icon">{pillar.icon}</div>
                  </div>

                  <h3 className="pillar-title">{pillar.title}</h3>
                  <p className="pillar-copy">{pillar.desc}</p>

                  <div className="pillar-card-footer">
                    {pillar.label}
                  </div>

                  <Link
                    to="/programs"
                    className="pillar-card-link"
                    aria-label={`Explore ${pillar.title}`}
                  />
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─── MISSION & VALUES ───────────────── */}
        <motion.section
          className="section section-surface section-border"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          variants={sectionMotion}
        >
          <div
            className="section-overlay"
            style={{
              background:
                "radial-gradient(circle at 100% 0%, rgba(124, 58, 237, 0.14), transparent 40%)",
            }}
          />
          <div className="container section-grid section-grid-2 section-gap-xl">
            <div className="section-content">
              <span className="label section-label-alt">Our Narrative</span>
              <h2 className="h2 section-title">{about.title}</h2>
              <p className="body-lg section-copy">
                {truncateText(about.storyContent || ABOUT_FALLBACK.storyContent, 450)}
              </p>
              <div className="item-grid">
                {[
                  {
                    icon: <Award size={24} />,
                    title: "Our Mission",
                    text: about.mission,
                    iconBg: "brand",
                  },
                  {
                    icon: <Zap size={24} />,
                    title: "Our Vision",
                    text: about.vision,
                    iconBg: "accent",
                  },
                ].map((item, index) => (
                  <div key={index} className="item-card">
                    <div className={`item-card-icon item-card-icon-${item.iconBg}`}>
                      {item.icon}
                    </div>
                    <h4 className="h4">{item.title}</h4>
                    <p className="body-sm">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="item-grid item-grid-compact">
              {[
                { label: "Godliness", icon: "G" },
                { label: "Integrity", icon: "I" },
                { label: "Excellence", icon: "E" },
                { label: "Accountability", icon: "A" },
                { label: "Equity", icon: "Eq" },
                { label: "Compassion", icon: "C" },
              ].map((value) => (
                <motion.div
                  key={value.label}
                  whileHover={{ y: -4 }}
                  className="value-card"
                >
                  <div className="value-card-icon">{value.icon}</div>
                  <span className="value-card-label">{value.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─── FEATURED INITIATIVES ─────────────────── */}
        <section className="section section-surface">
          <div className="container">
            <div className="section-headline text-center">
              <span className="label section-label">Impact in Action</span>
              <h2 className="h2 section-title">Real Change. Real Stories.</h2>
            </div>

            <div className="program-grid">
              {loading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <LoadingSkeleton key={i} className="programs-skeleton" />
                    ))
                : featuredPrograms.slice(0, 3).map((program, index) => (
                    <motion.article
                      key={program.id || index}
                      whileHover={{ y: -12 }}
                      className="program-card"
                    >
                      <div className="program-media">
                        <img
                          src={resolveMediaUrl(program.heroImage)}
                          alt={program.title || "Featured initiative"}
                        />
                        <div className="program-meta">
                          {program.category || "Impact"}
                        </div>
                      </div>
                      <div className="program-body">
                        <h3 className="program-title">{program.title}</h3>
                        <p className="program-description">
                          {truncateText(
                            program.summary || program.description || "",
                            150
                          )}
                        </p>
                        <div className="program-actions">
                          <Link
                            to={program.id ? getProgramPath(program) : "/programs"}
                            className="link-inline"
                          >
                            Explore Case Study
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ──────────────────────── */}
        <motion.section
          className="section section-cta"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          variants={sectionMotion}
        >
          <div className="section-cta-overlay" />
          <div className="container">
            <div className="cta-panel">
              <span className="label section-label">Ready to Create Change?</span>
              <h2 className="h2 cta-title">
                Your Support Shapes
                <br />
                Confident <span className="text-accent-400">Lives.</span>
              </h2>
              <p className="body-lg cta-copy">
                Donate to fuel impact. Volunteer your expertise. Partner with us
                to scale change. Together, we are building thriving communities
                with real opportunities.
              </p>
              <div className="button-row">
                <Link to="/donate" className="btn btn-primary btn-xl">
                  Support Our Work
                </Link>
                <Link to="/contact" className="btn btn-secondary btn-xl">
                  Become a Partner
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
}

export default HomePage;