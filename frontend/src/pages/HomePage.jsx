import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { getProgramPath } from "../app/programCatalog";
import { truncateText } from "../app/text";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageTransition from "../components/PageTransition";

const ABOUT_FALLBACK = {
  title: "About Silver Shield",
  storyContent:
    "Silver Shield Organisation is a community-centred nonprofit shaping lives through women empowerment, youth leadership, school mentorship, outreach, and talent development.",
  mission: "To serve communities with integrity, impact, and excellence.",
  vision: "Empowering communities to rise, lead, and sustain change.",
};

const BASE = "https://edumin.co.ke/silver/silver/backend/uploads";

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
  transition: { duration: 0.6 },
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
  const [about, setAbout] = useState(ABOUT_FALLBACK);
  const [programs, setPrograms] = useState([]);
  const [stories, setStories] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      apiFetch("/about"),
      apiFetch("/programs"),
      apiFetch("/stories"),
      apiFetch("/events"),
    ])
      .then(([aboutRes, programsRes, storiesRes, eventsRes]) => {
        if (!mounted) {
          return;
        }

        if (aboutRes.status === "fulfilled" && aboutRes.value?.data) {
          setAbout((prev) => ({ ...prev, ...aboutRes.value.data }));
        }
        if (programsRes.status === "fulfilled") {
          setPrograms(programsRes.value?.data || []);
        }
        if (storiesRes.status === "fulfilled") {
          setStories(storiesRes.value?.data || []);
        }
        if (eventsRes.status === "fulfilled") {
          setEvents(eventsRes.value?.data || []);
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
  const upcomingEvents = useMemo(
    () =>
      events.filter((item) =>
        ["upcoming", "ongoing"].includes(String(item.status || "").toLowerCase()),
      ),
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

    if (mapped.length >= 4) {
      return mapped;
    }

    const usedTitles = new Set(mapped.map((item) => item.title));
    const fillers = DEFAULT_PILLARS.filter((item) => !usedTitles.has(item.title))
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
  }, [allProgramItems]);

  const heroImage = useMemo(
    () =>
      resolveMediaUrl(about.heroImage) ||
      resolveMediaUrl(featuredPrograms[0]?.heroImage) ||
      HERO_IMAGE_FALLBACK,
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
        label: "Active Programs",
        copy: "Community tracks built around mentorship, empowerment, and practical opportunity.",
      },
      {
        value: "04",
        label: "Strategic Pillars",
        copy: "Women, youth, schools, and outreach remain at the center of delivery.",
      },
      {
        value: String(allStoryItems.length).padStart(2, "0"),
        label: "Stories and Proof",
        copy: "Real field stories showing how support translates into confidence and progress.",
      },
      {
        value: "01",
        label: "Shared Mission",
        copy: truncateText(about.mission || ABOUT_FALLBACK.mission, 88),
      },
    ],
    [about.mission, allProgramItems.length, allStoryItems.length],
  );

  const highlightedStory = storyItems[0] || FALLBACK_STORIES[0];

  return (
    <PageTransition>
      <div className="hp-root">
        <section className="hp-hero">
          <div className="hp-hero-bg" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="hp-hero-overlay" />
          <div className="container hp-hero-inner">
            <motion.div
              className="hp-hero-content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="hp-hero-eyebrow">Silver Shield Organisation | Shaping Lives</p>
              <h1>Shaping Lives Through Mentorship, Dignity, and Opportunity</h1>
              <p className="hp-hero-sub">
                We work with women, young people, schools, and families to build confidence,
                practical skills, and long-term progress in the communities we serve.
              </p>
              <div className="hp-hero-btns">
                <Link to="/donate" className="btn btn-primary btn-lg">
                  Support Our Work
                </Link>
                <Link to="/programs" className="btn hp-btn-ghost btn-lg">
                  Explore Programs
                </Link>
              </div>
              <div className="hp-hero-proof">
                {heroProofCards.map((item) => (
                  <article key={item.label} className="hp-hero-proof-card">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </article>
                ))}
              </div>
            </motion.div>
          </div>
          <div className="hp-scroll-hint" aria-hidden="true">
            <span />
          </div>
        </section>

        <section className="hp-section hp-commitments-section">
          <div className="container">
            <motion.div className="hp-section-head" {...fadeUp}>
              <div>
                <p className="hp-label">Strategic Commitments</p>
                <h2>Clear priorities, practical delivery, and a stronger community footprint.</h2>
              </div>
            </motion.div>
            <div className="hp-commitments-grid">
              {commitmentCards.map((item, index) => (
                <motion.article
                  key={item.label}
                  className="hp-commitment-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                >
                  <span className="hp-commitment-value">{item.value}</span>
                  <h3>{item.label}</h3>
                  <p>{item.copy}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="hp-section hp-pillars-section">
          <div className="container">
            <motion.div className="hp-section-head" {...fadeUp}>
              <div>
                <p className="hp-label">The 4 Pillars</p>
                <h2>Where Silver Shield focuses its energy, service, and community presence.</h2>
              </div>
              <Link to="/programs" className="btn btn-secondary">
                Explore the Pillars
              </Link>
            </motion.div>
            <div className="hp-pillars-grid">
              {pillarPrograms.map((pillar, index) => (
                <motion.article
                  key={pillar.id}
                  className="hp-pillar-card"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <div className="hp-pillar-media">
                    <img src={pillar.image} alt={pillar.title} loading="lazy" />
                    <div className="hp-pillar-overlay" />
                    <span className="hp-pillar-index">{pillar.initial}</span>
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

        <section className="hp-about">
          <div className="container hp-about-grid">
            <motion.div className="hp-about-copy" {...fadeUp}>
              <p className="hp-label">Who We Are</p>
              <h2>{about.title || ABOUT_FALLBACK.title}</h2>
              <p>{truncateText(about.storyContent || ABOUT_FALLBACK.storyContent, 400)}</p>
              <div className="hp-about-actions">
                <Link to="/about" className="btn btn-primary">
                  Our Story
                </Link>
                <Link to="/volunteer" className="btn btn-secondary">
                  Volunteer With Us
                </Link>
              </div>
            </motion.div>
            <motion.div
              className="hp-mission-cards"
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="hp-mission-card hp-mission-primary">
                <p className="hp-label">Mission</p>
                <p>{about.mission || ABOUT_FALLBACK.mission}</p>
              </div>
              <div className="hp-mission-card">
                <p className="hp-label">Vision</p>
                <p>{about.vision || ABOUT_FALLBACK.vision}</p>
              </div>
              <Link to={getStoryLink(highlightedStory)} className="hp-mission-card hp-story-highlight">
                <p className="hp-label">Impact in Action</p>
                <strong>{highlightedStory.title}</strong>
                <p>{truncateText(highlightedStory.excerpt || "", 115)}</p>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="hp-section hp-programs-section">
          <div className="container">
            <motion.div className="hp-section-head" {...fadeUp}>
              <div>
                <p className="hp-label">Impact in Action</p>
                <h2>Focused Programmes Designed for Real Community Needs</h2>
              </div>
              <Link to="/programs" className="btn btn-secondary">
                View All Programs
              </Link>
            </motion.div>
            <div className="hp-programs-grid">
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

        {(loading || upcomingEvents.length > 0) && (
          <section className="hp-section hp-events-section">
            <div className="container">
              <motion.div className="hp-section-head" {...fadeUp}>
                <div>
                  <p className="hp-label">Upcoming Events</p>
                  <h2>Stay Close to the Work Through Community Events and Gatherings</h2>
                </div>
                <Link to="/events" className="btn btn-secondary">
                  All Events
                </Link>
              </motion.div>
              <div className="hp-events-grid">
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
                        >
                          <div className="hp-event-date">
                            <strong>{date.day}</strong>
                            <small>{date.month}</small>
                          </div>
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

        <section className="hp-section hp-stories-section">
          <div className="container">
            <motion.div className="hp-section-head" {...fadeUp}>
              <div>
                <p className="hp-label">Stories of Change</p>
                <h2>Moments That Show the Work Beyond the Headline</h2>
              </div>
              <Link to="/stories" className="btn btn-secondary">
                See All Stories
              </Link>
            </motion.div>
            <div className="hp-stories-grid">
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

        <section className="hp-cta-section">
          <div className="hp-cta-bg" />
          <div className="container hp-cta-inner">
            <motion.div className="hp-cta-content" {...fadeUp}>
              <p className="hp-label hp-label-light">Get Involved</p>
              <h2>Partner With Silver Shield and Help Shape Lives</h2>
              <p>
                Donate, volunteer, collaborate, or simply reach out. We are ready to connect and
                guide the next step.
              </p>
              <div className="hp-cta-btns">
                <Link to="/donate" className="btn btn-primary btn-lg">
                  Make a Donation
                </Link>
                <Link to="/contact?inquiry=partner#contact-form" className="btn hp-btn-ghost btn-lg">
                  Start a Partnership
                </Link>
              </div>
            </motion.div>
            <div className="hp-cta-contacts">
              <a href="mailto:Shieldsilver105@gmail.com" className="hp-cta-contact">
                <span className="hp-cta-contact-icon">@</span>
                <div>
                  <strong>Email Us</strong>
                  <span>Shieldsilver105@gmail.com</span>
                </div>
              </a>
              <a href="tel:+254726836021" className="hp-cta-contact">
                <span className="hp-cta-contact-icon">TEL</span>
                <div>
                  <strong>Call Us</strong>
                  <span>0726 836021 / 0115 362421</span>
                </div>
              </a>
              <Link to="/contact" className="hp-cta-contact">
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
