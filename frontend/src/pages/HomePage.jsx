import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { getProgramPath } from "../app/programCatalog";
import { truncateText } from "../app/text";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageTransition from "../components/PageTransition";
import { useToast } from "../context/ToastContext";

const purposeCards = [
  {
    title: "Protect Dignity",
    text: "Community-first support systems designed with local leaders and families.",
  },
  {
    title: "Unlock Opportunity",
    text: "Education, mentorship, and skills pipelines that build long-term independence.",
  },
  {
    title: "Scale Impact",
    text: "Evidence-driven programs with transparent reporting and accountable delivery.",
  },
];

const contactCards = [
  { label: "Email", value: "Shieldsilver105@gmail.com", icon: "E" },
  { label: "Phone", value: "0726 836021 / 0115 362421", icon: "T" },
  { label: "Location", value: "Community Impact Centre, Nairobi", icon: "L" },
];

const missionVisionValues = {
  mission: "To serve communities with integrity, impact and excellence.",
  vision: "Empowering communities to rise, lead and sustain change.",
  coreValues: [
    "Godliness",
    "Integrity",
    "Excellence",
    "Accountability",
    "Equity and Inclusivity",
    "Compassion",
  ],
};

function daysFromNowIso(dayOffset, hour = 9) {
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  target.setDate(target.getDate() + dayOffset);
  return target.toISOString();
}

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
  {
    id: "fallback-program-4",
    isFallback: true,
    title: "Community outreach programme",
    category: "Community",
    summary: "Household support, health awareness, and referrals across local communities.",
    heroImage:
      "https://images.unsplash.com/photo-1469571486292-b53601010376?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-program-5",
    isFallback: true,
    title: "Naturing talent",
    category: "Talent Development",
    summary: "Creative arts and sports coaching to nurture confidence and purpose.",
    heroImage:
      "https://images.unsplash.com/photo-1529634898458-93dff0d8ed63?auto=format&fit=crop&w=1400&q=80",
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
    title: "Youth leaders driving change in their neighborhoods",
    author: "Community Desk",
    excerpt: "Young people designed and delivered a weekend service project with measurable impact.",
    coverImage:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-story-3",
    isFallback: true,
    title: "Mentorship in schools: Building confidence one session at a time",
    author: "Education Team",
    excerpt: "Mentors and teachers partnered to improve attendance and goal setting.",
    coverImage:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-story-4",
    isFallback: true,
    title: "Community outreach that reached the last mile",
    author: "Field Operations",
    excerpt: "Mobile support days connected families to health, education, and legal guidance.",
    coverImage:
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-story-5",
    isFallback: true,
    title: "Talent nurtured: A new stage for young creators",
    author: "Programs Team",
    excerpt: "Creative workshops gave youth safe spaces to perform, collaborate, and grow.",
    coverImage:
      "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1400&q=80",
  },
];

const FALLBACK_EVENTS = [
  {
    id: "fallback-event-1",
    isFallback: true,
    status: "upcoming",
    title: "Women in Enterprise Bootcamp",
    description: "Hands-on training for women-led businesses, financial literacy, and networking.",
    location: "Nairobi",
    eventDate: daysFromNowIso(6),
    coverImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-event-2",
    isFallback: true,
    status: "upcoming",
    title: "Youth Innovation and Career Clinic",
    description: "Career coaching, CV labs, and innovation showcases for youth participants.",
    location: "Nakuru",
    eventDate: daysFromNowIso(13),
    coverImage:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-event-3",
    isFallback: true,
    status: "ongoing",
    title: "School Mentorship Weekend",
    description: "Mentors, counselors, and educators guiding learners through life and career paths.",
    location: "Kisumu",
    eventDate: daysFromNowIso(19),
    coverImage:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-event-4",
    isFallback: true,
    status: "upcoming",
    title: "Community Outreach Health and Legal Camp",
    description: "Integrated clinic support with referrals for health, legal, and social protection.",
    location: "Mombasa",
    eventDate: daysFromNowIso(27),
    coverImage:
      "https://images.unsplash.com/photo-1576765608866-5b51046452be?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "fallback-event-5",
    isFallback: true,
    status: "upcoming",
    title: "Naturing Talent Showcase",
    description: "A live showcase for youth in music, spoken word, dance, and visual arts.",
    location: "Narok",
    eventDate: daysFromNowIso(35),
    coverImage:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80",
  },
];

const INITIAL_NOW_TS = Date.now();

function formatEventDate(value) {
  if (!value) {
    return "Date TBA";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function HomePage() {
  const programsRailRef = useRef(null);
  const storiesRailRef = useRef(null);
  const eventsRailRef = useRef(null);
  const [programs, setPrograms] = useState([]);
  const [stories, setStories] = useState([]);
  const [events, setEvents] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nowTimestamp, setNowTimestamp] = useState(INITIAL_NOW_TS);
  const { pushToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const livePrograms = useMemo(() => programs.filter((item) => item.status !== "draft"), [programs]);
  const publishedStories = useMemo(
    () => stories.filter((item) => item.status !== "draft"),
    [stories],
  );
  const publishedEvents = useMemo(() => events.filter((item) => item.status !== "draft"), [events]);
  const comingEvents = useMemo(() => {
    return [...publishedEvents]
      .filter((item) => {
        const status = String(item.status || "").toLowerCase();
        if (status === "draft" || status === "completed" || status === "cancelled") {
          return false;
        }
        if (!item.eventDate) {
          return status === "upcoming" || status === "ongoing";
        }
        const eventTime = new Date(item.eventDate).getTime();
        if (Number.isNaN(eventTime)) {
          return status === "upcoming" || status === "ongoing";
        }
        return eventTime >= nowTimestamp - 24 * 60 * 60 * 1000;
      })
      .sort((a, b) => {
        const aTime = a.eventDate ? new Date(a.eventDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.eventDate ? new Date(b.eventDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
  }, [publishedEvents, nowTimestamp]);
  const programItems = useMemo(
    () => (livePrograms.length ? livePrograms : FALLBACK_PROGRAMS),
    [livePrograms],
  );
  const storyItems = useMemo(
    () => (publishedStories.length ? publishedStories : FALLBACK_STORIES),
    [publishedStories],
  );
  const eventItems = useMemo(() => {
    if (comingEvents.length) {
      return comingEvents;
    }
    if (publishedEvents.length) {
      return [...publishedEvents].sort((a, b) => {
        const aTime = a.eventDate ? new Date(a.eventDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.eventDate ? new Date(b.eventDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
    }
    return FALLBACK_EVENTS;
  }, [comingEvents, publishedEvents]);
  const topPrograms = useMemo(() => {
    const getScore = (program) => {
      const goal = Number(program.goalAmount || 0);
      const raised = Number(program.raisedAmount || 0);
      const progress = goal > 0 ? Math.min(1, raised / goal) : 0;
      return progress * 1000000 + raised;
    };

    return [...programItems].sort((a, b) => getScore(b) - getScore(a)).slice(0, 3);
  }, [programItems]);
  const topStories = useMemo(() => storyItems.slice(0, 3), [storyItems]);
  const topEvents = useMemo(() => eventItems.slice(0, 3), [eventItems]);
  const heroStatCards = useMemo(
    () => [
      { label: "Active Programs", value: String(programItems.length || 0) },
      { label: "Published Stories", value: String(storyItems.length || 0) },
      { label: "Upcoming Events", value: String(eventItems.length || 0) },
    ],
    [programItems.length, storyItems.length, eventItems.length],
  );

  useEffect(() => {
    let mounted = true;

    Promise.all([
      apiFetch("/programs"),
      apiFetch("/stories"),
      apiFetch("/events"),
      apiFetch("/partners"),
    ])
      .then(([programRes, storyRes, eventRes, partnerRes]) => {
        if (!mounted) {
          return;
        }
        setPrograms((programRes.data || []).slice(0, 12));
        setStories((storyRes.data || []).slice(0, 12));
        setEvents((eventRes.data || []).slice(0, 12));
        setPartners((partnerRes.data || []).slice(0, 10));
      })
      .catch((error) => {
        pushToast(error.message || "Unable to load homepage data.", "error");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [pushToast]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const syncNow = () => setNowTimestamp(Date.now());
    syncNow();
    const timer = window.setInterval(syncNow, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const onContactSubmit = async (event) => {
    event.preventDefault();
    if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
      pushToast("Please complete all contact fields.", "error");
      return;
    }

    try {
      await apiFetch("/messages", {
        method: "POST",
        body: formData,
      });
      pushToast("Message sent successfully.", "success");
      setFormData({ fullName: "", email: "", subject: "", message: "" });
    } catch (error) {
      pushToast(error.message, "error");
    }
  };

  const scrollRailBy = (railRef, direction) => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }
    
    // Get first card's width to scroll by exact card width
    const firstCard = rail.querySelector('.prototype-media-card');
    if (!firstCard) {
      return;
    }
    
    const cardWidth = firstCard.offsetWidth;
    const gap = parseInt(window.getComputedStyle(rail).gap || '0', 10);
    const step = cardWidth + gap;
    
    rail.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  };
  const getProgramLink = (program) => (program.isFallback ? "/programs" : getProgramPath(program));
  const getStoryLink = (story) =>
    story.isFallback ? "/stories" : `/stories/${story.slug || story.id}`;

  return (
    <PageTransition>
      <div className="prototype-home">
        <section className="hero-section">
          <div className="container">
            <div className="hero-split glass-panel">
              <div className="prototype-hero-content">
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55 }}
                >
                  Empowering Communities.
                  <br />
                  Creating Lasting Impact.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                >
                  Practical programs helping women, youth, and families build stable futures.
                </motion.p>
                <motion.div
                  className="hero-actions"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.16 }}
                >
                  <Link to="/donate" className="btn btn-primary">
                    Donate Now
                  </Link>
                  <Link to="/programs" className="btn prototype-secondary-btn">
                    Explore Programs
                  </Link>
                </motion.div>
                <motion.div
                  className="hero-stat-strip"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.24 }}
                >
                  {heroStatCards.map((card) => (
                    <article key={card.label} className="hero-stat-chip">
                      <strong>{card.value}</strong>
                      <small>{card.label}</small>
                    </article>
                  ))}
                </motion.div>
              </div>
              <div className="hero-media">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
                  alt="Silver Shield community outreach"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="container prototype-surface-wrap">
          <div className="prototype-surface">
            <section className="prototype-section">
              <div className="section-head prototype-centered-head">
                <h2>What We Are For</h2>
              </div>
              <div className="grid three">
                {purposeCards.map((card, index) => (
                  <motion.article
                    key={card.title}
                    className="prototype-purpose-card"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </motion.article>
                ))}
              </div>
            </section>

            <section className="prototype-section compact-top">
              <div className="section-head prototype-centered-head">
                <p className="section-kicker">Live Updates</p>
                <h2>Our Programs</h2>
              </div>
              <div className="rail-controls">
                <button
                  type="button"
                  className="rail-control-btn"
                  onClick={() => scrollRailBy(programsRailRef, -1)}
                  aria-label="Scroll programs left"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  className="rail-control-btn"
                  onClick={() => scrollRailBy(programsRailRef, 1)}
                  aria-label="Scroll programs right"
                >
                  {">"}
                </button>
              </div>
              <div className="home-horizontal-row-shell">
                <div className="home-horizontal-row" ref={programsRailRef}>
                {loading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <LoadingSkeleton key={`program-skeleton-${index}`} className="media-card" />
                    ))
                  : topPrograms.map((program) => (
                      <article key={program.id} className="prototype-media-card hover-lift">
                        <Link to={getProgramLink(program)} className="media-wrap">
                          <img
                            src={resolveMediaUrl(program.heroImage)}
                            alt={program.title}
                            loading="lazy"
                          />
                        </Link>
                        <div className="media-content">
                          <h3 className="home-rail-card-title">{program.title}</h3>
                          <p className="home-rail-card-copy">
                            {truncateText(
                              program.summary || program.description || "Program details coming soon.",
                              120,
                            )}
                          </p>
                          <Link to={getProgramLink(program)} className="text-link">
                            Read More
                          </Link>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>

            <section className="prototype-section compact-top">
              <div className="section-head split">
                <div>
                  <p className="section-kicker">Narratives</p>
                  <h2>Stories</h2>
                </div>
                <Link className="text-link" to="/stories">
                  See all stories
                </Link>
              </div>
              <div className="rail-controls">
                <button
                  type="button"
                  className="rail-control-btn"
                  onClick={() => scrollRailBy(storiesRailRef, -1)}
                  aria-label="Scroll stories left"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  className="rail-control-btn"
                  onClick={() => scrollRailBy(storiesRailRef, 1)}
                  aria-label="Scroll stories right"
                >
                  {">"}
                </button>
              </div>
              <div className="home-horizontal-row-shell">
                <div className="home-horizontal-row" ref={storiesRailRef}>
                {loading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <LoadingSkeleton key={`story-skeleton-${index}`} className="media-card" />
                    ))
                  : topStories.map((story) => (
                      <article key={story.id} className="prototype-media-card hover-lift">
                        <Link to={getStoryLink(story)} className="media-wrap">
                          <img
                            src={resolveMediaUrl(story.coverImage)}
                            alt={story.title}
                            loading="lazy"
                          />
                        </Link>
                        <div className="media-content">
                          <h3 className="home-rail-card-title">{story.title}</h3>
                          <p className="home-rail-card-copy">
                            {truncateText(story.excerpt || story.summary || "Story details coming soon.", 120)}
                          </p>
                          <Link to={getStoryLink(story)} className="text-link">
                            Read More
                          </Link>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>

            <section className="prototype-section compact-top">
              <div className="section-head split">
                <div>
                  <p className="section-kicker">Calendar</p>
                  <h2>Coming Events</h2>
                </div>
                <Link className="text-link" to="/events">
                  View all events
                </Link>
              </div>
              <div className="rail-controls">
                <button
                  type="button"
                  className="rail-control-btn"
                  onClick={() => scrollRailBy(eventsRailRef, -1)}
                  aria-label="Scroll events left"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  className="rail-control-btn"
                  onClick={() => scrollRailBy(eventsRailRef, 1)}
                  aria-label="Scroll events right"
                >
                  {">"}
                </button>
              </div>
              <div className="home-horizontal-row-shell">
                <div className="home-horizontal-row" ref={eventsRailRef}>
                {loading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <LoadingSkeleton key={`event-loading-${index}`} className="media-card" />
                    ))
                  : topEvents.map((event) => (
                      <article key={event.id} className="prototype-media-card hover-lift event-card">
                        <div className="media-wrap">
                          <img
                            src={resolveMediaUrl(event.coverImage)}
                            alt={event.title}
                            loading="lazy"
                          />
                        </div>
                        <div className="media-content">
                          <p className="chip">{event.status || "upcoming"}</p>
                          <h3 className="home-rail-card-title">{event.title}</h3>
                          <p className="home-rail-card-copy">
                            {truncateText(event.description || "Event details coming soon.", 120)}
                          </p>
                          <div className="inline-meta">
                            <small>
                              {formatEventDate(event.eventDate)}
                            </small>
                            <small>{event.location || "Location TBA"}</small>
                          </div>
                          {event.registrationUrl ? (
                            <a
                              href={event.registrationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-link"
                            >
                              Register / Learn More
                            </a>
                          ) : (
                            <Link to="/events" className="text-link">
                              Event details
                            </Link>
                          )}
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>

            <section className="prototype-section compact-top mission-vision-section">
              <div className="mission-vision-header">
                <div className="org-logo">
                  <div className="logo-placeholder">S</div>
                  <h2>Silver Shield</h2>
                  <p>Organisation</p>
                </div>
              </div>

              <div className="mission-vision-grid">
                <motion.article
                  className="mission-card mission-enhanced hover-lift"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                >
                  <div className="card-accent accent-top" />
                  <div className="card-icon-wrapper mission-icon">M</div>
                  <div className="card-divider" />
                  <h3>Our Mission</h3>
                  <p className="mission-text">"{missionVisionValues.mission}"</p>
                  <div className="card-accent accent-bottom" />
                </motion.article>

                <motion.article
                  className="vision-card vision-enhanced hover-lift"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.08 }}
                >
                  <div className="card-accent accent-top" />
                  <div className="card-icon-wrapper vision-icon">V</div>
                  <div className="card-divider" />
                  <h3>Our Vision</h3>
                  <p className="vision-text">"{missionVisionValues.vision}"</p>
                  <div className="card-accent accent-bottom" />
                </motion.article>

                <motion.article
                  className="values-card hover-lift"
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.14 }}
                >
                  <div className="card-icon">C</div>
                  <h3>Core Values</h3>
                  <ul className="values-list">
                    {missionVisionValues.coreValues.map((value) => (
                      <li key={value}>{value}</li>
                    ))}
                  </ul>
                </motion.article>
              </div>
            </section>

            <section className="prototype-section compact-top">
              <div className="cta-banner prototype-cta-banner hover-lift">
                <div>
                  <p className="eyebrow">Take Action</p>
                  <h2>Support community programs that create lasting change</h2>
                  <p>
                    Fund education, health, and resilience projects in local communities.
                  </p>
                </div>
                <div className="cta-banner-actions">
                  <Link to="/donate" className="btn btn-primary">
                    Donate Now
                  </Link>
                  <Link to="/contact?inquiry=partner#contact-form" className="btn btn-secondary">
                    Partner With Us
                  </Link>
                </div>
              </div>
            </section>

            <section className="prototype-section compact-top contact-section">
              <div className="section-head">
                <p className="eyebrow">Get In Touch</p>
                <h2>Have Questions? We Would Love to Hear From You</h2>
                <p>
                  Reach out for partnerships, volunteering opportunities, or support inquiries.
                </p>
              </div>

              <div className="contact-info-grid">
                {contactCards.map((item) => (
                  <article key={item.label} className="prototype-contact-card hover-lift">
                    <div className="contact-icon">{item.icon}</div>
                    <h3>{item.label}</h3>
                    <p>{item.value}</p>
                  </article>
                ))}
              </div>

              <div className="contact-form-wrapper">
                <form className="prototype-contact-form glass-card" onSubmit={onContactSubmit}>
                  <h3>Send us a Message</h3>
                  <div className="field-grid two">
                    <input
                      placeholder="Your Name"
                      value={formData.fullName}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, fullName: event.target.value }))
                      }
                    />
                    <input
                      placeholder="Your Email"
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, email: event.target.value }))
                      }
                    />
                  </div>
                  <input
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, subject: event.target.value }))
                    }
                  />
                  <textarea
                    rows={4}
                    placeholder="Your Message..."
                    value={formData.message}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, message: event.target.value }))
                    }
                  />
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Send Message
                    </button>
                    <Link to="/contact" className="btn prototype-secondary-btn">
                      Full Contact Page
                    </Link>
                  </div>
                </form>
              </div>
            </section>

            {partners.length > 0 && (
              <section className="prototype-section compact-top partners-section">
                <div className="section-head split">
                  <h2>Our Partners</h2>
                  <Link to="/contact" className="text-link">
                    Become a Partner
                  </Link>
                </div>
                <div className="partners-strip">
                  {partners.map((partner) => (
                    partner.websiteUrl ? (
                      <a
                        key={partner.id}
                        href={partner.websiteUrl}
                        className="partner-chip"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit ${partner.name}`}
                      >
                        {partner.logoUrl ? (
                          <img
                            src={resolveMediaUrl(partner.logoUrl)}
                            alt={partner.name}
                            loading="lazy"
                          />
                        ) : (
                          <span>{partner.name}</span>
                        )}
                      </a>
                    ) : (
                      <div key={partner.id} className="partner-chip partner-chip-static">
                        {partner.logoUrl ? (
                          <img
                            src={resolveMediaUrl(partner.logoUrl)}
                            alt={partner.name}
                            loading="lazy"
                          />
                        ) : (
                          <span>{partner.name}</span>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </section>
            )}

          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default HomePage;
