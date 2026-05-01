import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { getProgramPath } from "../app/programCatalog";
import { truncateText } from "../app/text";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PageTransition from "../components/PageTransition";

const HERO_HIGHLIGHTS = [
  { title: "Women & girls", text: "Dignity, confidence, and economic opportunity." },
  { title: "Youth pathways", text: "Mentorship, leadership, and spaces to grow." },
  { title: "Community reach", text: "Connecting families to guidance and hope." },
];

const ABOUT_FALLBACK = {
  title: "About Silver Shield",
  storyContent: "Silver Shield Organisation is a community-centred nonprofit shaping lives through women empowerment, youth leadership, school mentorship, outreach, and talent development.",
  mission: "To serve communities with integrity, impact, and excellence.",
  vision: "Empowering communities to rise, lead, and sustain change.",
};

const FALLBACK_PROGRAMS = [
  { id: "fp1", isFallback: true, title: "Women Empowerment (Wezesha Dada)", category: "Women Empowerment", summary: "Skills training, mentorship, and business support for women-led households.", heroImage: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80" },
  { id: "fp2", isFallback: true, title: "Youth Empowerment Program", category: "Youth Empowerment", summary: "Leadership, employability, and digital pathways for young people.", heroImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80" },
  { id: "fp3", isFallback: true, title: "School Mentorship Programmes", category: "Education", summary: "School-based mentorship focused on confidence, discipline, and career guidance.", heroImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80" },
];

const FALLBACK_STORIES = [
  { id: "fs1", isFallback: true, title: "From idea to income: A women-led business circle", author: "Silver Shield Team", excerpt: "How peer support and micro-grants helped mothers launch sustainable ventures.", coverImage: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=800&q=80" },
  { id: "fs2", isFallback: true, title: "Mentorship in schools: Building confidence one session at a time", author: "Education Team", excerpt: "Mentors and teachers partnered to improve attendance, confidence, and goal setting.", coverImage: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80" },
];

const HERO_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
};

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
    ]).then(([aboutRes, programsRes, storiesRes, eventsRes]) => {
      if (!mounted) return;
      if (aboutRes.status === "fulfilled" && aboutRes.value?.data)
        setAbout((prev) => ({ ...prev, ...aboutRes.value.data }));
      if (programsRes.status === "fulfilled") setPrograms(programsRes.value?.data || []);
      if (storiesRes.status === "fulfilled") setStories(storiesRes.value?.data || []);
      if (eventsRes.status === "fulfilled") setEvents(eventsRes.value?.data || []);
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const livePrograms = useMemo(() => programs.filter((p) => String(p.status || "").toLowerCase() !== "draft"), [programs]);
  const liveStories = useMemo(() => stories.filter((s) => String(s.status || "").toLowerCase() !== "draft"), [stories]);
  const upcomingEvents = useMemo(() =>
    events.filter((e) => ["upcoming", "ongoing"].includes(String(e.status || "").toLowerCase())).slice(0, 3),
    [events]
  );

  const programItems = useMemo(() => (livePrograms.length ? livePrograms : FALLBACK_PROGRAMS).slice(0, 3), [livePrograms]);
  const storyItems = useMemo(() => (liveStories.length ? liveStories : FALLBACK_STORIES).slice(0, 2), [liveStories]);

  const heroImage = useMemo(() =>
    resolveMediaUrl(about.heroImage) || resolveMediaUrl(programItems[0]?.heroImage) || HERO_IMAGE_FALLBACK,
    [about.heroImage, programItems]
  );

  const getProgramLink = (p) => (p.isFallback ? "/programs" : getProgramPath(p));
  const getStoryLink = (s) => (s.isFallback ? "/stories" : `/stories/${s.slug || s.id}`);

  return (
    <PageTransition>
      <div className="prototype-home home-premium">

        {/* ── HERO ── */}
        <section className="hero-section home-hero-section">
          <div className="container">
            <div className="home-hero-layout">
              <motion.div className="home-hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                <p className="eyebrow home-hero-eyebrow">Community-led · Kanduyi, Bungoma, Kenya</p>
                <div className="home-hero-text">
                  <h1>Shaping lives through mentorship and opportunity.</h1>
                  <p>Silver Shield partners with women, youth, schools, and families to build dignity, confidence, and long-term progress.</p>
                </div>
                <div className="hero-actions home-hero-actions">
                  <Link to="/donate" className="btn btn-primary btn-lg">Support Our Work</Link>
                  <Link to="/programs" className="btn btn-secondary btn-lg">Explore Programs</Link>
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

              <motion.div className="home-hero-visual" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}>
                <div className="home-hero-photo">
                  <img src={heroImage} alt="Silver Shield community" loading="eager" fetchPriority="high" />
                </div>
                <div className="home-hero-callout">
                  <p className="home-mini-label">Focus areas</p>
                  <ul className="home-focus-list">
                    <li>Women Empowerment</li>
                    <li>Youth Leadership</li>
                    <li>School Mentorship</li>
                    <li>Community Outreach</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── WHO WE ARE ── */}
        <section className="container home-section-block">
          <motion.div className="home-story-layout" {...fadeUp}>
            <article className="home-story-card">
              <p className="section-kicker">Who we are</p>
              <h2>{about.title || ABOUT_FALLBACK.title}</h2>
              <p>{truncateText(about.storyContent || ABOUT_FALLBACK.storyContent, 320)}</p>
              <div className="home-inline-actions">
                <Link to="/about" className="text-link">Read more</Link>
                <Link to="/volunteer" className="text-link">Volunteer</Link>
              </div>
            </article>
            <div className="home-values-grid">
              <article className="home-value-card">
                <span>Mission</span>
                <p>{truncateText(about.mission || ABOUT_FALLBACK.mission, 160)}</p>
              </article>
              <article className="home-value-card">
                <span>Vision</span>
                <p>{truncateText(about.vision || ABOUT_FALLBACK.vision, 160)}</p>
              </article>
              <article className="home-value-card">
                <span>Approach</span>
                <p>Community partnerships, mentorship, and practical delivery that prioritise long-term progress.</p>
              </article>
            </div>
          </motion.div>
        </section>

        {/* ── PROGRAMS ── */}
        <section className="container home-section-block">
          <div className="section-head split">
            <div>
              <p className="section-kicker">What we do</p>
              <h2>Focused programmes for real community needs.</h2>
            </div>
            <Link to="/programs" className="text-link">View all</Link>
          </div>
          <div className="home-card-grid home-program-grid">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} className="media-card" />)
              : programItems.map((program, i) => (
                <motion.article key={program.id} className="prototype-media-card home-program-card"
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                  <Link to={getProgramLink(program)} className="media-wrap">
                    <img src={resolveMediaUrl(program.heroImage)} alt={program.title} loading="lazy" />
                  </Link>
                  <div className="media-content">
                    <span className="badge">{program.category || "Programme"}</span>
                    <h3>{program.title}</h3>
                    <p>{truncateText(program.summary || program.description || "", 110)}</p>
                    <Link to={getProgramLink(program)} className="text-link">Learn more</Link>
                  </div>
                </motion.article>
              ))}
          </div>
        </section>

        {/* ── UPCOMING EVENTS ── */}
        {(loading || upcomingEvents.length > 0) && (
          <section className="container home-section-block">
            <div className="section-head split">
              <div>
                <p className="section-kicker">Upcoming events</p>
                <h2>Join us at our next community event.</h2>
              </div>
              <Link to="/events" className="text-link">All events</Link>
            </div>
            <div className="home-events-grid">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} className="home-event-card" />)
                : upcomingEvents.map((event, i) => (
                  <motion.article key={event.id} className="home-event-card"
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}>
                    <div className="home-event-date">
                      <strong>{new Date(event.eventDate).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</strong>
                      <small>{new Date(event.eventDate).getFullYear()}</small>
                    </div>
                    <div className="home-event-info">
                      <span className="chip">{event.status || "upcoming"}</span>
                      <h3>{event.title}</h3>
                      <p>{truncateText(event.description || "", 90)}</p>
                      <small>{event.location || "Location TBA"}</small>
                    </div>
                  </motion.article>
                ))}
            </div>
          </section>
        )}

        {/* ── STORIES ── */}
        <section className="container home-section-block">
          <div className="section-head split">
            <div>
              <p className="section-kicker">Stories of change</p>
              <h2>Moments that show the work beyond the headline.</h2>
            </div>
            <Link to="/stories" className="text-link">See all</Link>
          </div>
          <div className="home-card-grid home-story-grid">
            {loading
              ? Array.from({ length: 2 }).map((_, i) => <LoadingSkeleton key={i} className="media-card" />)
              : storyItems.map((story, i) => (
                <motion.article key={story.id} className="prototype-media-card home-story-card-small"
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                  <Link to={getStoryLink(story)} className="media-wrap">
                    <img src={resolveMediaUrl(story.coverImage)} alt={story.title} loading="lazy" />
                  </Link>
                  <div className="media-content">
                    <small className="story-meta">{story.author || "Silver Shield Team"}</small>
                    <h3>{story.title}</h3>
                    <p>{truncateText(story.excerpt || story.content || "", 120)}</p>
                    <Link to={getStoryLink(story)} className="text-link">Read story</Link>
                  </div>
                </motion.article>
              ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="container home-section-block home-last-section">
          <motion.div className="cta-banner home-contact-cta" {...fadeUp}>
            <div>
              <p className="eyebrow">Get involved</p>
              <h2>Partner with Silver Shield and help shape lives.</h2>
              <p>Donate, volunteer, collaborate, or simply reach out. We are ready to connect.</p>
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
                <strong>Contact form</strong>
                <span>Inquiries and partnerships.</span>
              </Link>
            </div>
            <div className="cta-banner-actions">
              <Link to="/donate" className="btn btn-primary">Make a donation</Link>
              <Link to="/contact?inquiry=partner#contact-form" className="btn btn-secondary">Start a partnership</Link>
            </div>
          </motion.div>
        </section>

      </div>
    </PageTransition>
  );
}

export default HomePage;
