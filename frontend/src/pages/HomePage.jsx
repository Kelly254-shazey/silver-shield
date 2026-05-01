import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { getProgramPath } from "../app/programCatalog";
import { truncateText } from "../app/text";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageTransition from "../components/PageTransition";

const HERO_HIGHLIGHTS = [
  {
    title: "Women and girls",
    text: "Support that strengthens dignity, confidence, and economic opportunity.",
  },
  {
    title: "Youth pathways",
    text: "Mentorship, leadership development, and spaces where talent can grow.",
  },
  {
    title: "Community reach",
    text: "Practical outreach that connects families to guidance, services, and hope.",
  },
];

const WHY_WE_EXIST = [
  {
    number: "01",
    title: "Limited access to opportunity",
    text: "Many women and young people need practical pathways to skills, confidence, and income instead of one-off support.",
  },
  {
    number: "02",
    title: "Young people need guidance",
    text: "Schools and communities need trusted mentorship that helps young people make informed, future-facing decisions.",
  },
  {
    number: "03",
    title: "Communities need early support",
    text: "Families often need outreach, referrals, and clear information before challenges become long-term setbacks.",
  },
];

const ABOUT_FALLBACK = {
  title: "About Silver Shield",
  storyContent:
    "Silver Shield Organisation is a community-centred nonprofit shaping lives through women empowerment, youth leadership, school mentorship, outreach, and talent development. We work with families, schools, and local partners to turn support into practical opportunity.",
  mission: "To serve communities with integrity, impact, and excellence.",
  vision: "Empowering communities to rise, lead, and sustain change.",
};

const FALLBACK_PROGRAMS = [
  {
    id: "fallback-program-1",
    isFallback: true,
    title: "Women empowerment program (wezesha dada initiative)",
    category: "Women Empowerment",
    summary: "Skills training, mentorship, and business support for women-led households.",
    heroImage:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-program-2",
    isFallback: true,
    title: "Youth empowerment program",
    category: "Youth Empowerment",
    summary: "Leadership, employability, and digital pathways for young people.",
    heroImage:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-program-3",
    isFallback: true,
    title: "School mentorship programmes",
    category: "Education",
    summary: "School-based mentorship focused on confidence, discipline, and career guidance.",
    heroImage:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80",
  },
];

const FALLBACK_STORIES = [
  {
    id: "fallback-story-1",
    isFallback: true,
    title: "From idea to income: A women-led business circle",
    author: "Silver Shield Team",
    excerpt: "How peer support and micro-grants helped mothers launch sustainable ventures.",
    coverImage:
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-story-2",
    isFallback: true,
    title: "Mentorship in schools: Building confidence one session at a time",
    author: "Education Team",
    excerpt: "Mentors and teachers partnered to improve attendance, confidence, and goal setting.",
    coverImage:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1400&q=80",
  },
];

const FALLBACK_IMPACT = [
  {
    value: "05",
    label: "Programme tracks",
    copy: "Focused on empowerment, mentorship, outreach, and talent development.",
  },
  {
    value: "04",
    label: "Priority themes",
    copy: "Built around the needs of women, youth, schools, and local communities.",
  },
  {
    value: "1 mission",
    label: "Shared direction",
    copy: "Shape lives with integrity, compassion, accountability, and practical support.",
  },
];

const HERO_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80";

const revealInView = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55 },
};

function formatMetricValue(metric) {
  const numericValue = Number(metric?.value);
  const rawValue = Number.isFinite(numericValue)
    ? numericValue.toLocaleString()
    : String(metric?.value || "").trim();
  const unit = String(metric?.unit || "").trim();

  if (!rawValue) {
    return "";
  }

  if (!unit) {
    return rawValue;
  }

  if (["+", "%", "x"].includes(unit)) {
    return `${rawValue}${unit}`;
  }

  return `${rawValue} ${unit}`.trim();
}

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [about, setAbout] = useState(ABOUT_FALLBACK);
  const [programs, setPrograms] = useState([]);
  const [stories, setStories] = useState([]);
  const [impactStats, setImpactStats] = useState([]);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      apiFetch("/about"),
      apiFetch("/programs"),
      apiFetch("/stories"),
      apiFetch("/impact/stats"),
    ])
      .then(([aboutResult, programsResult, storiesResult, impactResult]) => {
        if (!mounted) {
          return;
        }

        if (aboutResult.status === "fulfilled" && aboutResult.value?.data) {
          setAbout((prev) => ({ ...prev, ...aboutResult.value.data }));
        }

        if (programsResult.status === "fulfilled") {
          setPrograms(programsResult.value?.data || []);
        }

        if (storiesResult.status === "fulfilled") {
          setStories(storiesResult.value?.data || []);
        }

        if (impactResult.status === "fulfilled") {
          setImpactStats(impactResult.value?.data || []);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const livePrograms = useMemo(
    () => programs.filter((item) => String(item.status || "").toLowerCase() !== "draft"),
    [programs],
  );
  const liveStories = useMemo(
    () => stories.filter((item) => String(item.status || "").toLowerCase() !== "draft"),
    [stories],
  );

  const programItems = useMemo(
    () => (livePrograms.length ? livePrograms : FALLBACK_PROGRAMS),
    [livePrograms],
  );
  const storyItems = useMemo(() => (liveStories.length ? liveStories : FALLBACK_STORIES), [liveStories]);
  const featuredPrograms = useMemo(() => programItems.slice(0, 3), [programItems]);
  const featuredStories = useMemo(() => storyItems.slice(0, 2), [storyItems]);

  const focusAreas = useMemo(() => {
    const categories = Array.from(
      new Set(
        programItems
          .map((item) => String(item.category || "").trim())
          .filter(Boolean),
      ),
    );

    return categories.length
      ? categories.slice(0, 4)
      : ["Women empowerment", "Youth leadership", "School mentorship", "Community outreach"];
  }, [programItems]);

  const impactCards = useMemo(() => {
    if (impactStats.length) {
      return impactStats.slice(0, 3).map((item) => ({
        value: formatMetricValue(item),
        label: item.label || "Impact metric",
        copy: item.trend
          ? `${Math.abs(Number(item.trend || 0)).toLocaleString()}% movement tracked in recent reporting.`
          : "Tracked through current Silver Shield impact reporting.",
      }));
    }

    if (programItems.length) {
      return [
        {
          value: String(programItems.length).padStart(2, "0"),
          label: "Programme tracks",
          copy: "Focused on empowerment, mentorship, outreach, and long-term opportunity.",
        },
        {
          value: String(focusAreas.length).padStart(2, "0"),
          label: "Priority themes",
          copy: "Designed around the needs of women, youth, schools, and communities.",
        },
        FALLBACK_IMPACT[2],
      ];
    }

    return FALLBACK_IMPACT;
  }, [focusAreas.length, impactStats, programItems.length]);

  const storyContent = useMemo(
    () => truncateText(about.storyContent || ABOUT_FALLBACK.storyContent, 420),
    [about.storyContent],
  );

  const heroImage = useMemo(
    () =>
      resolveMediaUrl(about.heroImage) ||
      resolveMediaUrl(featuredPrograms[0]?.heroImage) ||
      HERO_IMAGE_FALLBACK,
    [about.heroImage, featuredPrograms],
  );

  const mission = about.mission || ABOUT_FALLBACK.mission;
  const vision = about.vision || ABOUT_FALLBACK.vision;

  const getProgramLink = (program) => (program.isFallback ? "/programs" : getProgramPath(program));
  const getStoryLink = (story) => (story.isFallback ? "/stories" : `/stories/${story.slug || story.id}`);

  return (
    <PageTransition>
      <div className="prototype-home home-premium">
        <section className="hero-section home-hero-section">
          <div className="container">
            <div className="home-hero-layout">
              <motion.div
                className="home-hero-copy"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <p className="eyebrow home-hero-eyebrow">Community-led organisation</p>
                <div className="home-hero-text">
                  <h1>Shaping lives through practical support, mentorship, and opportunity.</h1>
                  <p>
                    Silver Shield Organisation partners with women, young people, schools, and
                    families to build dignity, confidence, and long-term progress in the
                    communities we serve.
                  </p>
                </div>

                <div className="hero-actions home-hero-actions">
                  <Link to="/donate" className="btn btn-primary btn-lg">
                    Support Our Work
                  </Link>
                  <Link to="/programs" className="btn btn-secondary btn-lg">
                    Explore Programs
                  </Link>
                </div>

                <div className="home-hero-stat-row">
                  {HERO_HIGHLIGHTS.map((item) => (
                    <article key={item.title} className="home-hero-stat-card">
                      <strong>{item.title}</strong>
                      <small>{item.text}</small>
                    </article>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="home-hero-visual"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
              >
                <div className="home-hero-photo">
                  <img
                    src={heroImage}
                    alt="Silver Shield community engagement"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
                <div className="home-hero-callout">
                  <p className="home-mini-label">What we are about</p>
                  <ul className="home-focus-list">
                    {focusAreas.map((area) => (
                      <li key={area}>{area}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="container home-section-block">
          <motion.div className="section-head home-section-head" {...revealInView}>
            <p className="section-kicker">Why we exist</p>
            <h2>
              People do not just need attention. They need access, guidance, and pathways that
              actually move life forward.
            </h2>
            <p>
              Silver Shield focuses on the gaps that limit confidence, education, income, and
              community wellbeing, then responds with programmes that are practical and close to
              people.
            </p>
          </motion.div>

          <div className="home-why-grid">
            {WHY_WE_EXIST.map((item, index) => (
              <motion.article
                key={item.title}
                className="home-problem-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <span className="home-problem-number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="container home-section-block">
          <div className="home-story-layout">
            <motion.article className="home-story-card" {...revealInView}>
              <p className="section-kicker">Our story</p>
              <h2>{about.title || ABOUT_FALLBACK.title}</h2>
              <p>{storyContent}</p>
              <div className="home-inline-actions">
                <Link to="/about" className="text-link">
                  Read More
                </Link>
                <Link to="/volunteer" className="text-link">
                  Volunteer With Us
                </Link>
              </div>
            </motion.article>

            <motion.div
              className="home-values-grid"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              <article className="home-value-card">
                <span>Mission</span>
                <p>{truncateText(mission, 180)}</p>
              </article>
              <article className="home-value-card">
                <span>Vision</span>
                <p>{truncateText(vision, 180)}</p>
              </article>
              <article className="home-value-card">
                <span>Approach</span>
                <p>
                  Community partnerships, mentorship, outreach, and practical delivery that
                  prioritise long-term progress.
                </p>
              </article>
            </motion.div>
          </div>
        </section>

        <section className="container home-section-block">
          <div className="section-head split">
            <div>
              <p className="section-kicker">What we do</p>
              <h2>Focused programmes designed for real community needs.</h2>
            </div>
            <Link to="/programs" className="text-link">
              View all programs
            </Link>
          </div>

          <div className="home-card-grid home-program-grid">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <LoadingSkeleton key={`program-skeleton-${index}`} className="media-card" />
                ))
              : featuredPrograms.map((program, index) => (
                  <motion.article
                    key={program.id}
                    className="prototype-media-card home-program-card"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <Link to={getProgramLink(program)} className="media-wrap">
                      <img
                        src={resolveMediaUrl(program.heroImage)}
                        alt={program.title}
                        loading="lazy"
                      />
                    </Link>
                    <div className="media-content">
                      <span className="badge">{program.category || "Programme"}</span>
                      <h3>{program.title}</h3>
                      <p>
                        {truncateText(
                          program.summary || program.description || "Program details coming soon.",
                          136,
                        )}
                      </p>
                      <Link to={getProgramLink(program)} className="text-link">
                        Learn more
                      </Link>
                    </div>
                  </motion.article>
                ))}
          </div>
        </section>

        <section className="container home-section-block">
          <div className="home-impact-layout">
            <motion.div className="section-head home-impact-copy" {...revealInView}>
              <p className="section-kicker">Impact focus</p>
              <h2>Every activity should lead to measurable, human change.</h2>
              <p>
                Silver Shield combines outreach, mentorship, and opportunity-building so support
                does not stop at awareness. It should translate into confidence, access, and real
                next steps.
              </p>
            </motion.div>

            <div className="home-impact-grid">
              {impactCards.map((item, index) => (
                <motion.article
                  key={`${item.label}-${item.value}`}
                  className="home-impact-card glass-card"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <p className="stat-label">{item.label}</p>
                  <h3>{item.value}</h3>
                  <small>{item.copy}</small>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="container home-section-block">
          <div className="section-head split">
            <div>
              <p className="section-kicker">Stories of change</p>
              <h2>Moments that show the work beyond the headline.</h2>
            </div>
            <Link to="/stories" className="text-link">
              See all stories
            </Link>
          </div>

          <div className="home-card-grid home-story-grid">
            {loading
              ? Array.from({ length: 2 }).map((_, index) => (
                  <LoadingSkeleton key={`story-skeleton-${index}`} className="media-card" />
                ))
              : featuredStories.map((story, index) => (
                  <motion.article
                    key={story.id}
                    className="prototype-media-card home-story-card-small"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <Link to={getStoryLink(story)} className="media-wrap">
                      <img
                        src={resolveMediaUrl(story.coverImage)}
                        alt={story.title}
                        loading="lazy"
                      />
                    </Link>
                    <div className="media-content">
                      <small className="story-meta">{story.author || "Silver Shield Team"}</small>
                      <h3>{story.title}</h3>
                      <p>{truncateText(story.excerpt || story.content || "", 140)}</p>
                      <Link to={getStoryLink(story)} className="text-link">
                        Read story
                      </Link>
                    </div>
                  </motion.article>
                ))}
          </div>
        </section>

        <section className="container home-section-block home-last-section">
          <motion.div className="cta-banner home-contact-cta" {...revealInView}>
            <div>
              <p className="eyebrow">Get involved</p>
              <h2>Partner with Silver Shield and help shape lives with intention.</h2>
              <p>
                Whether you want to donate, volunteer, collaborate, or ask questions, we are ready
                to connect and guide the next step.
              </p>
            </div>

            <div className="home-contact-actions">
              <a href="mailto:Shieldsilver105@gmail.com" className="home-contact-link">
                <strong>Email us</strong>
                <span>Shieldsilver105@gmail.com</span>
              </a>
              <a href="tel:+254726836021" className="home-contact-link">
                <strong>Call us</strong>
                <span>0726 836021 / 0115 362421</span>
              </a>
              <Link to="/contact" className="home-contact-link">
                <strong>Visit contact</strong>
                <span>Use the contact form for inquiries and partnerships.</span>
              </Link>
            </div>

            <div className="cta-banner-actions">
              <Link to="/donate" className="btn btn-primary">
                Make a donation
              </Link>
              <Link to="/contact?inquiry=partner#contact-form" className="btn btn-secondary">
                Start a partnership
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
}

export default HomePage;
