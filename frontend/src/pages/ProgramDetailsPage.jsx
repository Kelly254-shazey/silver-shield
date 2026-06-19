import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch, resolveMediaUrl } from "../app/api";
import PageTransition from "../components/PageTransition";
import { truncateText } from "../app/text";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useContent } from "../app/ContentContext";
import { ArrowLeft, Heart, Info, Layers, MapPin, Tag } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
 * Helper: normalize parentId across possible API shapes.
 * Some endpoints return camelCase (parentId), some snake_case
 * (parent_id), and some nest it (parent.id / parent_program_id).
 * This protects against silently losing the parent/subprogram
 * relationship just because of a naming mismatch between the single-
 * program endpoint and the list endpoint that populates `programs`.
 * ────────────────────────────────────────────────────────────────── */
function getParentId(p) {
  if (!p) return null;
  return (
    p.parentId ??
    p.parent_id ??
    p.parentProgramId ??
    p.parent_program_id ??
    p.parent?.id ??
    null
  );
}

function ProgramDetailsPage() {
  const { id } = useParams();
  const slug = id;

  const [program, setProgram]   = useState(null);
  const [loading, setLoading]   = useState(true);

  const { programs, getProgramBySlug, getProgramById } = useContent();

  /* ── Fetch program by slug from API, fall back to context ── */
  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    setLoading(true);

    apiFetch(`/programs/${slug}`)
      .then((res) => {
        if (mounted) setProgram(res?.data ?? null);
      })
      .catch(() => {
        if (mounted) {
          const local = getProgramBySlug(slug) ?? getProgramById(slug) ?? null;
          setProgram(local);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [slug, getProgramBySlug, getProgramById]);

  /*
   * ── Sub-programs ──────────────────────────────────────────────────────
   * Instead of relying on program.sub_programs (which may not be returned
   * by the API), we derive sub-programs from the shared context:
   * any program whose parentId matches the current program's id.
   *
   * We also check program.sub_programs as a fallback in case the API
   * does embed them directly on the record.
   */
  const subprograms = useMemo(() => {
    if (!program) return [];

    /* Prefer context-derived list (most reliable) */
    const fromContext = programs.filter(
      (p) =>
        String(p.id) !== String(program.id) &&
        getParentId(p) &&
        String(getParentId(p)) === String(program.id)
    );
    if (fromContext.length > 0) return fromContext;

    /* Fallback: API may embed sub_programs array directly */
    if (Array.isArray(program.sub_programs) && program.sub_programs.length > 0) {
      return program.sub_programs;
    }
    if (Array.isArray(program.subPrograms) && program.subPrograms.length > 0) {
      return program.subPrograms;
    }

    return [];
  }, [program, programs]);

  /* ── Funding % helper ── */
  const fundingPct = useMemo(() => {
    if (!program?.goalAmount || program.goalAmount <= 0) return 0;
    return Math.min(100, Math.round((program.raisedAmount / program.goalAmount) * 100));
  }, [program]);

  /* ════════ LOADING ════════ */
  if (loading) {
    return (
      <div className="container py-24">
        <LoadingSkeleton className="h-[40vh] rounded-[40px] mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <LoadingSkeleton className="h-64 rounded-3xl" />
          <LoadingSkeleton className="h-64 rounded-3xl" />
          <LoadingSkeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  /* ════════ NOT FOUND ════════ */
  if (!program) {
    return (
      <div className="container py-32 text-center flex flex-col items-center gap-4">
        <h1 className="h1 text-brand-900">Program Not Found</h1>
        <p className="text-gray-500">
          The programme you are looking for does not exist or has been removed.
        </p>
        <Link to="/programs" className="btn btn-primary mt-4">
          Back to Programmes
        </Link>
      </div>
    );
  }

  /* ════════ RENDER ════════ */
  return (
    <PageTransition>
      <div className="pb-24">

        {/* ── HERO ── */}
        <header className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-24">
          <div className="absolute inset-0 z-0">
            {program.heroImage ? (
              <img
                src={resolveMediaUrl(program.heroImage)}
                alt={program.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-brand-900" />
            )}
            <div className="absolute inset-0 bg-black/55" />
          </div>

          <div className="container relative z-10">
            <Link
              to="/programs"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Programmes
            </Link>

            <h1 className="text-4xl md:text-6xl font-black text-white uppercase leading-tight">
              {program.title}
            </h1>

            <p className="mt-4 text-white/90 max-w-2xl text-lg leading-relaxed">
              {program.summary || program.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              {program.category && (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white px-4 py-1 rounded-full text-sm">
                  <Tag size={12} />
                  {program.category}
                </span>
              )}
              {program.location && (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white px-4 py-1 rounded-full text-sm">
                  <MapPin size={12} />
                  {program.location}
                </span>
              )}
              {program.status && (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white px-4 py-1 rounded-full text-sm capitalize">
                  {program.status}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT ── */}
        <section className="container mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Description */}
            <div className="lg:col-span-2">
              <div className="card p-8 shadow-lg">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <Info size={18} />
                  About this Programme
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {program.description}
                </p>
              </div>

              {/* Gallery */}
              {Array.isArray(program.galleryImages) && program.galleryImages.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {program.galleryImages.map((img, i) => (
                      <img
                        key={i}
                        src={resolveMediaUrl(img)}
                        alt={`${program.title} gallery ${i + 1}`}
                        className="w-full h-40 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Impact / Donate sidebar */}
            <div className="card p-8 bg-brand-900 text-white shadow-xl h-fit">
              <h3 className="text-lg font-bold mb-6">Impact Tracking</h3>

              <p className="text-sm opacity-70">Funds Raised</p>
              <h2 className="text-3xl font-black">
                KES {Number(program.raisedAmount || 0).toLocaleString()}
              </h2>

              <p className="text-sm opacity-70 mt-4">Goal</p>
              <h3 className="text-xl font-bold">
                KES {Number(program.goalAmount || 0).toLocaleString()}
              </h3>

              {program.goalAmount > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-700"
                      style={{ width: `${fundingPct}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-white/60">{fundingPct}% funded</p>
                </div>
              )}

              <Link
                to={`/donate?programId=${program.id}`}
                className="btn btn-primary w-full mt-6 bg-white text-brand-900 hover:bg-gray-100"
              >
                <Heart size={16} className="mr-2" />
                Donate to this Programme
              </Link>
            </div>
          </div>

          {/* ── SUB-PROGRAMMES ─────────────────────────────────────────────────
              Rendered directly under this programme — not as separate pages.
              Each card shows the sub-programme inline so users understand the
              hierarchy: Programme → Sub-programmes beneath it.
          ─────────────────────────────────────────────────────────────────── */}
          {subprograms.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-2">
                <Layers size={24} className="text-brand-600" />
                <h2 className="text-2xl font-black">
                  Sub-Programmes under{" "}
                  <span className="text-brand-600">{program.title}</span>
                </h2>
              </div>
              <p className="text-gray-500 mb-8 text-sm">
                The following initiatives run specifically under this programme.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subprograms.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/programs/${sub.slug || sub.id}`}
                    className="card p-0 shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col"
                  >
                    {/* Sub-programme image */}
                    {sub.heroImage ? (
                      <img
                        src={resolveMediaUrl(sub.heroImage)}
                        alt={sub.title}
                        className="w-full h-36 object-cover"
                      />
                    ) : (
                      <div className="w-full h-36 bg-brand-50 flex items-center justify-center">
                        <Layers size={32} className="text-brand-200" />
                      </div>
                    )}

                    <div className="p-5 flex flex-col flex-1">
                      {/* Parent badge — makes hierarchy explicit */}
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full w-fit mb-3">
                        <Layers size={10} />
                        {program.title}
                      </span>

                      <h3 className="font-bold text-lg leading-snug">{sub.title}</h3>

                      {sub.category && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Tag size={10} />
                          {sub.category}
                        </span>
                      )}

                      <p className="text-sm text-gray-600 mt-2 flex-1 leading-relaxed">
                        {truncateText(sub.summary || sub.description, 130)}
                      </p>

                      {/* Sub-programme funding if available */}
                      {sub.goalAmount > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>
                              KES {Number(sub.raisedAmount || 0).toLocaleString()} raised
                            </span>
                            <span>
                              {Math.min(
                                100,
                                Math.round(((sub.raisedAmount || 0) / sub.goalAmount) * 100)
                              )}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-brand-600 rounded-full h-1.5 transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round(((sub.raisedAmount || 0) / sub.goalAmount) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {sub.location && (
                        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                          <MapPin size={10} />
                          {sub.location}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </section>
      </div>
    </PageTransition>
  );
}

export default ProgramDetailsPage;
