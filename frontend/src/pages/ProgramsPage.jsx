import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { getProgramPath, PROGRAM_NAV_ITEMS } from "../app/programCatalog";
import { FALLBACK_PROGRAMS } from "../app/fallbackContent";
import { useToast } from "../context/ToastContext";

function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;
    apiFetch("/programs")
      .then((response) => {
        if (mounted) setPrograms(response.data || []);
      })
      .catch((error) => pushToast(error.message, "error"))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [pushToast]);

  const livePrograms = useMemo(
    () => programs.filter((program) => String(program.status || "").toLowerCase() !== "draft"),
    [programs],
  );

  const programItems = useMemo(
    () => (livePrograms.length ? livePrograms : FALLBACK_PROGRAMS),
    [livePrograms],
  );

  const categories = useMemo(
    () => ["all", ...new Set(programItems.map((program) => program.category).filter(Boolean))],
    [programItems],
  );

  const filtered = useMemo(
    () =>
      programItems.filter((program) =>
        category === "all" ? true : program.category === category,
      ),
    [programItems, category],
  );

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Programs</p>
        <h1>High-impact programs with transparent goals and outcomes.</h1>
      </section>

      <section className="container section">
        <div className="program-shortcuts">
          {PROGRAM_NAV_ITEMS.map((item) => (
            <Link key={item.slug} to={`/programs/${item.slug}`} className="program-shortcut-chip">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="filter-row">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={item === category ? "chip-btn active" : "chip-btn"}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid three">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <LoadingSkeleton key={`program-loading-${index}`} className="media-card" />
              ))
            : filtered.map((program) => (
                <article key={program.id} className="media-card glass-premium hover-lift">
                  <Link to={getProgramPath(program)} className="media-wrap">
                    <img
                      src={resolveMediaUrl(program.heroImage)}
                      alt={program.title}
                      loading="lazy"
                    />
                  </Link>
                  <div className="media-content">
                    <p className="chip">{program.category}</p>
                    <h3>{program.title}</h3>
                    <p>{program.summary}</p>
                    <div className="inline-meta">
                      <small>Goal: ${Number(program.goalAmount || 0).toLocaleString()}</small>
                      <small>Raised: ${Number(program.raisedAmount || 0).toLocaleString()}</small>
                    </div>
                    <Link to={getProgramPath(program)} className="text-link">
                      Program details
                    </Link>
                    <div className="program-card-actions">
                      <Link
                        to={program.isFallback ? "/donate" : `/donate?programId=${program.id}`}
                        className="btn btn-primary"
                      >
                        Donate
                      </Link>
                      <Link
                        to={`/contact?subject=${encodeURIComponent(program.title)}`}
                        className="btn btn-secondary"
                      >
                        Send Your View
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
        </div>
      </section>
    </PageTransition>
  );
}

export default ProgramsPage;
