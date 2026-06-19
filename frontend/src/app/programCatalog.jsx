import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, resolveMediaUrl } from "./api";
import LoadingSkeleton from "../components/LoadingSkeleton";


// src/app/programCatalog.jsx — add this
export function getProgramPath(program) {
  return `/programs/${program.slug || program.id}`;
}

function ProgramCatalog() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    apiFetch("/programs")
      .then((res) => {
        if (mounted && res.data) {
          setPrograms(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load programs:", err);
        setPrograms([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Loading UI
  if (loading) {
    return (
      <div className="container py-16 grid md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <LoadingSkeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="container py-16">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase">
          Our Programs
        </h1>
        <p className="text-gray-600 mt-2">
          Explore our community empowerment initiatives
        </p>
      </div>

      {/* Program Grid */}
      <div className="grid md:grid-cols-3 gap-8">

        {programs.map((program) => (
          <Link
            key={program.id}
            to={`/programs/${program.slug}`}   // 🔥 IMPORTANT FIX
            className="card overflow-hidden hover:shadow-lg transition"
          >

            {/* Image */}
            <div className="h-48 overflow-hidden">
              <img
                src={resolveMediaUrl(program.heroImage)}
                alt={program.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-5">

              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                {program.category}
              </span>

              <h3 className="font-bold mt-3 text-lg">
                {program.title}
              </h3>

              <p className="text-sm text-gray-600 mt-2">
                {program.summary}
              </p>

            </div>

          </Link>
        ))}

      </div>

    </div>
  );
}

export default ProgramCatalog;