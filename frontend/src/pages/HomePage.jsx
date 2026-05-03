import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  tagline: "DIGNITY • OPPORTUNITY • MOMENTUM"
};

const BASE = "https://edumin.co.ke/backend/uploads";

const FALLBACK_PROGRAMS = [
  {
    id: "fp1",
    isFallback: true,
    title: "Women Empowerment (Wezesha Dada)",
    category: "Women Empowerment",
    summary: "Skills training, mentorship, and business support for women-led households.",
    heroImage: `${BASE}/wezesha-1771957330475-984046030.jpeg`,
  },
  {
    id: "fp2",
    isFallback: true,
    title: "Youth Empowerment Program",
    category: "Youth Empowerment",
    summary: "Leadership, employability, and digital pathways for young people.",
    heroImage: `${BASE}/school1-1771957696185-702314221.jpeg`,
  },
  {
    id: "fp3",
    isFallback: true,
    title: "School Mentorship Programmes",
    category: "Education",
    summary: "School-based mentorship focused on confidence, discipline, and career guidance.",
    heroImage: `${BASE}/school2-1771957710886-585105571.jpeg`,
  },
  {
    id: "fp4",
    isFallback: true,
    title: "Community Outreach Programme",
    category: "Community Outreach",
    summary: "Field support, referrals, and direct engagement with families and local communities.",
    heroImage: `${BASE}/com1-1771957870271-956089917.jpeg`,
  },
];

const FALLBACK_STORIES = [
  {
    id: "fs1",
    isFallback: true,
    title: "From idea to income: A women-led business circle",
    author: "Silver Shield Team",
    excerpt: "How peer support and micro-grants helped mothers launch sustainable ventures.",
    coverImage: `${BASE}/dada2-1771957439505-25471827.jpeg`,
  },
  {
    id: "fs2",
    isFallback: true,
    title: "Mentorship in schools: Building confidence one session at a time",
    author: "Education Team",
    excerpt: "Mentors and teachers partnered to improve attendance, confidence, and goal setting.",
    coverImage: `${BASE}/school3-1771957704379-378662269.jpeg`,
  },
];

const HERO_IMAGE_FALLBACK = `${BASE}/com1-1771957870271-956089917.jpeg`;

const DEFAULT_PILLARS = [
  {
    key: "women",
    initial: "01",
    label: "Women Empowerment",
    title: "Women Empowerment",
    desc: "Dignity, skills, and practical economic opportunity for women and girls.",
    image: `${BASE}/wezesha-1771957330475-984046030.jpeg`,
  },
  {
    key: "youth",
    initial: "02",
    label: "Youth Leadership",
    title: "Youth Leadership",
    desc: "Mentorship, exposure, and clear pathways for young people to lead and grow.",
    image: `${BASE}/school1-1771957696185-702314221.jpeg`,
  },
  {
    key: "schools",
    initial: "03",
    label: "School Mentorship",
    title: "School Mentorship",
    desc: "Confidence, discipline, and career guidance delivered closer to learners.",
    image: `${BASE}/school2-1771957710886-585105571.jpeg`,
  },
  {
    key: "community",
    initial: "04",
    label: "Community Outreach",
    title: "Community Outreach",
    desc: "Field engagement that connects families to support, hope, and practical next steps.",
    image: `${BASE}/com1-1771957870271-956089917.jpeg`,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5 }, // Slightly faster transition for a snappier feel
};

function formatEventDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { day: "TBA", month: "Date", year: "" };
  }

  return {
    day: parsed.toLocaleDateString(undefined, { day: "numeric" }),
    month: parsed.toLocaleDateString(undefined, { month: "short" }),
    year: String(parsed.getFullYear()),
  };
}

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [about, setAbout] = useState(ABOUT_FALLBACK);
  const [programs, setPrograms] = useState([]);
  const [stories, setStories] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          apiFetch("/about"),
          apiFetch("/programs"),
          apiFetch("/stories"),
          apiFetch("/events"),
        ]);

        if (!mounted) return;

        // Process results with better error handling
        if (results[0].status === "fulfilled" && results[0].value?.data) {
          setAbout((prev) => ({ ...prev, ...results[0].value.data }));
        }
        
        setPrograms(results[1].status === "fulfilled" ? (results[1].value?.data || []) : []);
        setStories(results[2].status === "fulfilled" ? (results[2].value?.data || []) : []);
        setEvents(results[3].status === "fulfilled" ? (results[3].value?.data || []) : []);
        
        setError(null);
      } catch (err) {
        if (mounted) {
          setError("Failed to load content. Using fallback data.");
          console.error("HomePage data fetch error:", err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  const livePrograms = useMemo(
    () => programs.filter((item) => String(item.status || "").toLowerCase() !== "draft"),
    [programs],
  );
  
  const liveStories = useMemo(
    () => stories.filter((item) => String(item.status || "").toLowerCase() !== "draft"),
    [stories],
  );
  
  const upcomingEvents = useMemo(
    () => events.filter((item) => {
      const status = String(item.status || "").toLowerCase();
      return status === "upcoming" || status === "ongoing";
    }),
    [events],
  );

  const allProgramItems = useMemo(
    () => (livePrograms.length ? livePrograms : FALLBACK_PROGRAMS),
    [livePrograms],
  );
  
  const featuredPrograms = useMemo(() => allProgramItems.slice(0, 3), [allProgramItems]);
  
  const allStoryItems = useMemo(
    () => (liveStories.length ? liveStories : FALLBACK_STORIES),
    [liveStories],
  );
  
  const storyItems = useMemo(() => allStoryItems.slice(0, 2), [allStoryItems]);

  const getProgramLink = (program) => (program.isFallback ? "/programs" : getProgramPath(program));
  const getStoryLink = (story) => (story.isFallback ? "/stories" : `/stories/${story.slug || story.id}`);

  const pillarPrograms = useMemo(() => {
    const mapped = allProgramItems.slice(0, 4).map((program, index) => ({
      id: program.id || `pillar-${index + 1}`,
      initial: DEFAULT_PILLARS[index]?.initial || String(index + 1).padStart(2, "0"),
      label: program.category || DEFAULT_PILLARS[index]?.label || "Programme",
      title: program.title || DEFAULT_PILLARS[index]?.title || "Programme",
      desc: truncateText(
        program.summary || program.description || DEFAULT_PILLARS[index]?.desc || "",
        120,
      ),
      image:
        resolveMediaUrl(program.heroImage) || DEFAULT_PILLARS[index]?.image || HERO_IMAGE_FALLBACK,
      link: getProgramLink(program),
    }));

    // Fill remaining slots with fallback pillars if needed
    if (mapped.length < 4) {
      const usedTitles = new Set(mapped.map((item) => item.title));
      const fillers = DEFAULT_PILLARS
        .filter((item) => !usedTitles.has(item.title))
        .slice(0, 4 - mapped.length)
        .map((item) => ({
          id: item.key,
          initial: item.initial,
          label: item.label,
          title: item.title,
          desc: item.desc,
          image: item.image,
          link: "/programs",
        }));
      return [...mapped, ...fillers];
    }

    return mapped;
  }, [allProgramItems]);

  const heroImage = useMemo(
    () => {
      const aboutHero = resolveMediaUrl(about.heroImage);
      const programHero = 
        featuredPrograms.length > 0 ? resolveMediaUrl(featuredPrograms[0]?.heroImage) : null;
      return aboutHero || programHero || HERO_IMAGE_FALLBACK;
    },
    [about.heroImage, featuredPrograms],
  );

  const heroProofCards = useMemo(
    () => [
      { value: String(allProgramItems.length).padStart(2, "0"), label: "Programs" },
      { value: "04", label: "Core Pillars" },
      { value: String(allStoryItems.length).padStart(2, "0"), label: "Stories" },
    ],
    [allProgramItems.length, allStoryItems.length],
  );

  const commitmentCards = useMemo(
    () => [
      {
        value: String(allProgramItems.length).padStart(2, "0"),
        label: "Live Programs",
        copy: "Mentorship, empowerment, and practical opportunity built for real community needs.",
      },
      {
        value: "04",
        label: "Strategic Pillars",
        copy: "Women, youth, schools, and outreach. Four focused areas. Unlimited impact.",
      },
      {
        value: String(allStoryItems.length).padStart(2, "0"),
        label: "Stories of Change",
        copy: "Real transformations. Real voices. Proof that change happens when we show up.",
      },
      {
        value: "100%",
        label: "Community-Led",
        copy: truncateText(about.mission || ABOUT_FALLBACK.mission, 88),
      },
    ],
    [about.mission, allProgramItems.length, allStoryItems.length],
  );

  const highlightedStory = storyItems[0] || FALLBACK_STORIES[0];

  return (
    <PageTransition>
      <div className="hp-root">
        {/* Hero Section */}
        <section className="hp-hero" role="region" aria-label="Hero section">
          <div className="hp-hero-bg" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="hp-hero-overlay" />
          <div className="container hp-hero-inner">
            <motion.div
              className="hp-hero-content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="hp-hero-eyebrow">{about.tagline || "DIGNITY • OPPORTUNITY • MOMENTUM"}</p>
              <h1>Building Confident Leaders & Thriving Communities</h1>
              <p className="hp-hero-sub">
                We unlock potential through mentorship, skills training, and community-led change.
                Partner with us to shape lives and drive real progress.
              </p>
              <div className="hp-hero-btns">
                <Link to="/donate" className="btn btn-primary btn-lg">
                  Support Our Work
                </Link>
                <Link to="/programs" className="btn hp-btn-ghost btn-lg">
                  Explore Programs
                </Link>
              </div>
              <div className="hp-hero-proof" aria-label="Key statistics">
                {heroProofCards.map((item) => (
                  <article key={item.label} className="hp-hero-proof-card">
                    <strong aria-label={`${item.value} ${item.label}`}>{item.value}</strong>
                    <span>{item.label}</span>
                  </article>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            Note: Some live content could not be loaded. Showing latest available information.
          </div>
        )}

        <div className="hp-scroll-hint" aria-hidden="true">
          <span />
        </div>
        {/* Strategic Commitments Section */}
        <section className="hp-section hp-commitments-section" role="region" aria-label="Strategic commitments">
          <div className="container">
            <motion.div className="hp-section-head" {...fadeUp}>
              <div>
                <p className="hp-label">STRATEGIC COMMITMENTS</p>
                <h2>Impact by Design. Results by Choice.</h2>
              </div>
            </motion.div>
            <div className="hp-commitments-grid" role="list">
              {commitmentCards.map((item, index) => (
                <motion.article
                  key={item.label}
                  className="hp-commitment-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  role="listitem"
                >
                  <span className="hp-commitment-value" aria-label={item.label}>{item.value}</span>
                  <h3>{item.label}</h3>
                  <p>{item.copy}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="hp-section hp-pillars-section" role="region" aria-label="Four pillars">
          <div className="container">
            <motion.div className="hp-section-head" {...fadeUp}>
              <div>
                <p className="hp-label">THE 4 PILLARS</p>
                <h2>Four Pathways. Unlimited Potential.</h2>
              </div>
              <Link to="/programs" className="btn btn-secondary">
                Explore All
              </Link>
            </motion.div>
            <div className="hp-pillars-grid" role="list">
              {pillarPrograms.map((pillar, index) => (
                <motion.article
                  key={pillar.id}
                  className="hp-pillar-card"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  role="listitem"
                >
                  <div className="hp-pillar-media">
                    <img src={pillar.image} alt={pillar.title} loading="lazy" />
                    <div className="hp-pillar-overlay" />
                    <span className="hp-pillar-index" aria-label={`Pillar ${pillar.initial}`}>{pillar.initial}</span>
                  </div>
                  <div className="hp-pillar-body">
                    <small>{pillar.label}</small>
                    <h3>{pillar.title}</h3>
                    <p>{pillar.desc}</p>
                    <Link to={pillar.link} className="hp-card-link">
                      Learn more {"->"}
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="hp-about" role="region" aria-label="About Silver Shield">
          <div className="container hp-about-grid">
            <motion.div className="hp-about-copy" {...fadeUp}>
              <p className="hp-label">OUR STORY</p>
              <h2>{about.title || ABOUT_FALLBACK.title}</h2>
              <p>{truncateText(about.storyContent || ABOUT_FALLBACK.storyContent, 380)}</p>
              <div className="hp-about-actions">
                <Link to="/about" className="btn btn-primary">
                  Our Full Story
                </Link>
                <Link to="/volunteer" className="btn btn-secondary">
                  Join Our Team
                </Link>
              </div>
            </motion.div>
            <motion.div
              className="hp-mission-cards"
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              role="region"
              aria-label="Mission and vision"
            >
              <div className="hp-mission-card hp-mission-primary">
                <p className="hp-label">MISSION</p>
                <p><strong>{about.mission || ABOUT_FALLBACK.mission}</strong></p>
              </div>
              <div className="hp-mission-card">
                <p className="hp-label">VISION</p>
                <p><strong>{about.vision || ABOUT_FALLBACK.vision}</strong></p>
              </div>
              <Link to={getStoryLink(highlightedStory)} className="hp-mission-card hp-story-highlight">
                <p className="hp-label">SPOTLIGHT</p>
                <strong>{highlightedStory.title}</strong>
                <p>{truncateText(highlightedStory.excerpt || "", 110)}</p>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="hp-section hp-programs-section" role="region" aria-label="Featured programs">
          <div className="container">
            <motion.div className="hp-section-head" {...fadeUp}>
              <div>
                <p className="hp-label">IMPACT IN ACTION</p>
                <h2>Programmes Making Real Progress</h2>
              </div>
              <Link to="/programs" className="btn btn-secondary">
                See All Impact
              </Link>
            </motion.div>
            <div className="hp-programs-grid" role="list">
              {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <LoadingSkeleton
                      key={`program-skeleton-${index}`}
                      className="hp-program-card"
                      style={{ minHeight: 360 }}
                    />
                  ))
                : featuredPrograms.map((program, index) => (
                    <motion.article
                      key={program.id}
                      className="hp-program-card"
                      initial={{ opacity: 0, y: 28 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      role="listitem"
                    >
                      <Link to={getProgramLink(program)} className="hp-card-img-wrap">
                        <img src={resolveMediaUrl(program.heroImage)} alt={program.title} loading="lazy" />
                        <span className="hp-card-badge">{program.category || "Programme"}</span>
                      </Link>
                      <div className="hp-card-body">
                        <h3>{program.title}</h3>
                        <p>{truncateText(program.summary || program.description || "", 115)}</p>
                        <Link to={getProgramLink(program)} className="hp-card-link">
                          Learn more {"->"}
                        </Link>
                      </div>
                    </motion.article>
                  ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        {(loading || upcomingEvents.length > 0) && (
          <section className="hp-section hp-events-section" role="region" aria-label="Upcoming events">
            <div className="container">
              <motion.div className="hp-section-head" {...fadeUp}>
                <div>
                  <p className="hp-label">UPCOMING ACTIVATIONS</p>
                  <h2>Community Events & Opportunities</h2>
                </div>
                <Link to="/events" className="btn btn-secondary">
                  See All Events
                </Link>
              </motion.div>
              <div className="hp-events-grid" role="list">
                {loading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <LoadingSkeleton
                        key={`event-skeleton-${index}`}
                        style={{ height: 128, borderRadius: 18 }}
                      />
                    ))
                  : upcomingEvents.slice(0, 3).map((event, index) => {
                      const date = formatEventDate(event.eventDate);

                      return (
                        <motion.article
                          key={event.id}
                          className="hp-event-card"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.45, delay: index * 0.08 }}
                          role="listitem"
                        >
                          <time dateTime={event.eventDate} className="hp-event-date">
                            <strong>{date.day}</strong>
                            <small>{date.month}</small>
                          </time>
                          <div className="hp-event-body">
                            <span className="chip">{event.status || "upcoming"}</span>
                            <h3>{event.title}</h3>
                            <p>{truncateText(event.description || "", 96)}</p>
                            <small>
                              {event.location || "Location TBA"}
                              {date.year ? ` | ${date.year}` : ""}
                            </small>
                          </div>
                        </motion.article>
                      );
                    })}
              </div>
            </div>
          </section>
        )}

        {/* Stories Section */}
        <section className="hp-section hp-stories-section" role="region" aria-label="Stories of change">
          <div className="container">
            <motion.div className="hp-section-head" {...fadeUp}>
              <div>
                <p className="hp-label">PROVEN RESULTS</p>
                <h2>Stories That Inspire Change</h2>
              </div>
              <Link to="/stories" className="btn btn-secondary">
                Read All Stories
              </Link>
            </motion.div>
            <div className="hp-stories-grid" role="list">
              {loading
                ? Array.from({ length: 2 }).map((_, index) => (
                    <LoadingSkeleton
                      key={`story-skeleton-${index}`}
                      className="hp-story-card"
                      style={{ minHeight: 340 }}
                    />
                  ))
                : storyItems.map((story, index) => (
                    <motion.article
                      key={story.id}
                      className="hp-story-card"
                      initial={{ opacity: 0, y: 28 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      role="listitem"
                    >
                      <Link to={getStoryLink(story)} className="hp-card-img-wrap hp-story-img">
                        <img src={resolveMediaUrl(story.coverImage)} alt={story.title} loading="lazy" />
                      </Link>
                      <div className="hp-card-body">
                        <small className="hp-story-author">{story.author || "Silver Shield Team"}</small>
                        <h3>{story.title}</h3>
                        <p>{truncateText(story.excerpt || story.content || "", 136)}</p>
                        <Link to={getStoryLink(story)} className="hp-card-link">
                          Read story {"->"}
                        </Link>
                      </div>
                    </motion.article>
                  ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="hp-cta-section" role="region" aria-label="Call to action">
          <div className="hp-cta-bg" />
          <div className="container hp-cta-inner">
            <motion.div className="hp-cta-content" {...fadeUp}>
              <p className="hp-label hp-label-light">GET INVOLVED NOW</p>
              <h2>Ready to Create Change? Join Us.</h2>
              <p>
                Donate to fuel impact. Volunteer your expertise. Partner with us to scale change.
                Together, we're building thriving communities with real opportunities.
              </p>
              <div className="hp-cta-btns">
                <Link to="/donate" className="btn btn-primary btn-lg">
                  Support Our Work
                </Link>
                <Link to="/contact?inquiry=partner#contact-form" className="btn hp-btn-ghost btn-lg">
                  Become a Partner
                </Link>
              </div>
            </motion.div>
            <div className="hp-cta-contacts" role="list" aria-label="Contact methods">
              <a href="mailto:Shieldsilver105@gmail.com" className="hp-cta-contact" role="listitem">
                <span className="hp-cta-contact-icon">✉</span>
                <div>
                  <strong>Email Us</strong>
                  <span>Shieldsilver105@gmail.com</span>
                </div>
              </a>
              <a href="tel:+254726836021" className="hp-cta-contact" role="listitem">
                <span className="hp-cta-contact-icon">TEL</span>
                <div>
                  <strong>Call Us</strong>
                  <span>0726 836021 / 0115 362421</span>
                </div>
              </a>
              <Link to="/contact" className="hp-cta-contact" role="listitem">
                <span className="hp-cta-contact-icon">FORM</span>
                <div>
                  <strong>Contact Form</strong>
                  <span>Send us a message</span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default HomePage;
