import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PaginationControls from "../components/PaginationControls";
import { apiFetch, resolveMediaUrl } from "../app/api";
import { useToast } from "../context/ToastContext";
import { Heart } from "lucide-react";

function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title-asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;

    async function loadPrograms() {
      try {
        setLoading(true);

        const response = await apiFetch("/programs");

        console.log("PROGRAM RESPONSE:", response);

        if (!mounted) return;

        if (Array.isArray(response?.data)) {
          setPrograms(response.data);
        } else if (Array.isArray(response)) {
          setPrograms(response);
        } else {
          setPrograms([]);
        }
      } catch (error) {
        console.error("Failed loading programs:", error);
        pushToast("Failed to load programs", "error");
        setPrograms([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPrograms();

    return () => {
      mounted = false;
    };
  }, [pushToast]);

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(
        programs
          .map((p) => p.category)
          .filter(Boolean)
      ),
    ];
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    let filtered = [...programs];

    if (category !== "all") {
      filtered = filtered.filter(
        (p) => p.category === category
      );
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      filtered = filtered.filter((p) =>
        [
          p.title,
          p.summary,
          p.description,
          p.category,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search)
      );
    }

    switch (sortBy) {
      case "title-desc":
        filtered.sort((a, b) =>
          b.title.localeCompare(a.title)
        );
        break;

      case "goal-desc":
        filtered.sort(
          (a, b) =>
            Number(b.goalAmount || 0) -
            Number(a.goalAmount || 0)
        );
        break;

      case "raised-desc":
        filtered.sort(
          (a, b) =>
            Number(b.raisedAmount || 0) -
            Number(a.raisedAmount || 0)
        );
        break;

      default:
        filtered.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
    }

    return filtered;
  }, [programs, category, searchTerm, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [category, searchTerm, sortBy]);

  const pagedPrograms = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPrograms.slice(start, start + pageSize);
  }, [filteredPrograms, page, pageSize]);

  return (
    <PageTransition>
      <div className="programs-page">

        {/* Hero */}
        <section className="programs-hero">
          <div className="container text-center py-20">
            <span className="label text-accent-400">
              Our Initiatives
            </span>

            <h1 className="hero-heading mt-4">
              Strategic{" "}
              <span className="text-accent-400">
                Pathways
              </span>
            </h1>

            <p className="hero-copy mt-4">
              Programmes designed with clear metrics and
              sustainable community outcomes.
            </p>
          </div>
        </section>

        {/* Filters */}
        <div className="container py-8">

          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <input
              type="search"
              className="filter-field"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            <select
              className="filter-field"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >
              <option value="title-asc">
                Title A-Z
              </option>

              <option value="title-desc">
                Title Z-A
              </option>

              <option value="goal-desc">
                Highest Goal
              </option>

              <option value="raised-desc">
                Most Raised
              </option>
            </select>

          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`filter-pill ${
                  category === cat
                    ? "filter-pill-active"
                    : ""
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <LoadingSkeleton
                  key={item}
                  className="h-80 rounded-3xl"
                />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && pagedPrograms.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold">
                No programs found
              </h3>

              <p className="text-gray-500 mt-2">
                No matching programs were found.
              </p>
            </div>
          )}

          {/* Programs */}
          {!loading && pagedPrograms.length > 0 && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

              {pagedPrograms.map((program, index) => (
                <motion.article
                  key={program.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="program-card overflow-hidden"
                >

                  <div className="h-56 overflow-hidden">
                    <img
                      src={resolveMediaUrl(
                        program.heroImage
                      )}
                      alt={program.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6">

                    <span className="text-xs bg-gray-200 px-3 py-1 rounded-full">
                      {program.category}
                    </span>

                    <h3 className="font-bold text-xl mt-4">
                      {program.title}
                    </h3>

                    <p className="text-gray-600 mt-3 line-clamp-3">
                      {program.summary}
                    </p>

                    <div className="flex gap-2 mt-6">

                      <Link
                        to={`/programs/${program.slug}`}
                        className="btn btn-primary flex-1"
                      >
                        View Details
                      </Link>

                      <Link
                        to={`/donate?programId=${program.id}`}
                        className="btn btn-secondary"
                      >
                        <Heart size={16} />
                      </Link>

                    </div>

                  </div>

                </motion.article>
              ))}

            </div>
          )}

          {!loading && (
            <PaginationControls
              page={page}
              pageSize={pageSize}
              totalItems={filteredPrograms.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              label="programs"
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default ProgramsPage;