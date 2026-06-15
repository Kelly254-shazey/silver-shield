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
import { apiFetch, resolveMediaUrl } from "../app/api";
import { getProgramPath } from "../app/programCatalog";
import { truncateText } from "../app/text";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageTransition from "../components/PageTransition";

const ABOUT_FALLBACK = {
  title: "Silver Shield Organisation",
  storyContent:
    "Building dignity, opportunity, and resilience across Bungoma. We partner with women, youth, schools, and families to unlock potential through mentorship, skills training, and community leadership.",
  mission: "To empower communities with integrity, impact, and excellence.",
  vision: "Communities of confident, skilled leaders driving sustainable change.",
  tagline: "DIGNITY \u2022 OPPORTUNITY \u2022 MOMENTUM",
};

const BASE = "https://edumin.co.ke/backend/uploads";
const HERO_IMAGE_FALLBACK = `${BASE}/com1-1771957870271-956089917.jpeg`;

const DEFAULT_PILLARS = [
  {
    key: "women",
    initial: "01",
    label: "Women Empowerment",
    title: "Women Empowerment",
    desc: "Dignity, skills, and practical economic opportunity for women and girls.",
    image: `${BASE}/wezesha-1771957330475-984046030.jpeg`,
    icon: <Users className="text-white" size={24} />,
  },
  {
    key: "youth",
    initial: "02",
    label: "Youth Leadership",
    title: "Youth Leadership",
    desc: "Mentorship, exposure, and clear pathways for young people to lead and grow.",
    image: `${BASE}/school1-1771957696185-702314221.jpeg`,
    icon: <TrendingUp className="text-white" size={24} />,
  },
  {
    key: "schools",
    initial: "03",
    label: "School Mentorship",
    title: "School Mentorship",
    desc: "Confidence, discipline, and career guidance delivered closer to learners.",
    image: `${BASE}/school2-1771957710886-585105571.jpeg`,
    icon: <ShieldCheck className="text-white" size={24} />,
  },
  {
    key: "community",
    initial: "04",
    label: "Community Outreach",
    title: "Community Outreach",
    desc: "Field engagement that connects families to support, hope, and practical next steps.",
    image: `${BASE}/com1-1771957870271-956089917.jpeg`,
    icon: <Globe className="text-white" size={24} />,
  },
];

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [about, setAbout] = useState(ABOUT_FALLBACK);
  const [programs, setPrograms] = useState([]);

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
        ]);
        if (!mounted) return;
        if (results[0].status === "fulfilled" && results[0].value?.data)
          setAbout((prev) => ({ ...prev, ...results[0].value.data }));
        setPrograms(
          results[1].status === "fulfilled" ? (results[1].value?.data || []) : []
        );
      } catch (err) {
        console.error("HomePage data fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

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
                background: "radial-gradient(circle at center, rgba(236, 72, 153, 0.1), rgba(0, 0, 0, 0.6))"
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
                {about.tagline || "Dignity 	 Opportunity 	 Momentum"}
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
              {DEFAULT_PILLARS.map((pillar) => (
                <motion.article
                  key={pillar.key}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="pillar-card"
                >
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    className="pillar-image"
                  />

                  <div className="pillar-card-content">
                    <span className="pillar-pill">{pillar.initial}</span>
                    <h3 className="h3 pillar-title">{pillar.title}</h3>
                    <p className="pillar-copy">{pillar.desc}</p>
                    <div className="pillar-card-footer">
                      <div className="pillar-card-icon">{pillar.icon}</div>
                      <span className="pillar-card-label">{pillar.label}</span>
                    </div>
                  </div>

                  <Link to="/programs" className="pillar-card-link" aria-label={`Explore ${pillar.title}`} />
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
