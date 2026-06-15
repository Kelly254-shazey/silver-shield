import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Award,
  Target,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Mail,
  Briefcase,
} from "lucide-react";
import { apiFetch, resolveMediaUrl } from "../app/api";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";

const VALUES = [
  { icon: <Target size={22} />, title: "Godliness", description: "Faith-driven service with integrity and humility." },
  { icon: <ShieldCheck size={22} />, title: "Integrity", description: "Transparent, honest, and accountable operations." },
  { icon: <Award size={22} />, title: "Excellence", description: "Commitment to high standards in every program." },
  { icon: <Zap size={22} />, title: "Accountability", description: "Responsible stewardship of resources and trust." },
  { icon: <Users size={22} />, title: "Equity", description: "Equal opportunity and dignity for all communities." },
  { icon: <CheckCircle2 size={22} />, title: "Compassion", description: "Empathy and care at the center of our mission." },
];

function MemberCard({ member, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -12 }}
      className="program-card group"
    >
      <div className="program-media program-media-portrait">
        <img
          src={resolveMediaUrl(member.profileImage)}
          alt={member.name}
          loading="lazy"
        />
        <div className="program-meta">
          {member.department || "Leadership"}
        </div>
        {member.linkedinUrl && (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 w-8 h-8 rounded-lg bg-brand-900 text-white flex items-center justify-center shadow-md hover:bg-accent-600 transition-colors z-10"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <div className="program-body">
        <div className="flex flex-col gap-1">
          <h3 className="program-title">
            {member.name}
          </h3>
          <p className="label text-accent-600 m-0">
            {member.role}
          </p>
        </div>

        {member.bio && (
          <p className="program-description line-clamp-3">
            {member.bio}
          </p>
        )}
        <div className="flex items-center gap-2 label text-brand-800 break-all">
          <Mail size={11} className="text-accent-500 flex-shrink-0" />{" "}
          {member.email || "Official Liaison"}
        </div>
      </div>
    </motion.article>
  );
}

function BoardCard({ member, index }) {
  return (
    <motion.article
      key={member.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -12 }}
      className="program-card group"
    >
      <div className="program-media program-media-portrait">
        <img
          src={resolveMediaUrl(member.profileImage)}
          alt={member.name}
        />
        {member.linkedinUrl && (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/80 backdrop-blur-sm text-brand-900 hover:bg-brand-900 hover:text-white transition-all z-10 shadow-sm"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <div className="program-body p-5 gap-1">
        <h4 className="text-xs font-extrabold text-brand-900 uppercase tracking-tight m-0 line-clamp-1">
          {member.name}
        </h4>
        <p className="label text-text-400 m-0 line-clamp-2 leading-tight">
          {member.role}
        </p>
      </div>
    </motion.article>
  );
}

function TeamPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      apiFetch("/team/members"),
      apiFetch("/team/board"),
    ])
      .then(([teamRes, boardRes]) => {
        if (!mounted) return;
        if (teamRes.status === "fulfilled")
          setTeamMembers(teamRes.value?.data || []);
        if (boardRes.status === "fulfilled")
          setBoardMembers(boardRes.value?.data || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <PageTransition>
      <div className="flex flex-col gap-16 pb-24">
        {/* Slim Hero */}
        <section className="section-hero bg-brand-900 overflow-hidden relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 120%, var(--brand-600) 0%, transparent 60%)",
              opacity: 0.2,
            }}
          />
          <div className="container relative z-10 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="label text-accent-400 mb-5 block"
            >
              The Collective
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h1 text-white tracking-tight"
            >
              Visionary{" "}
              <span className="text-brand-400">Leadership</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="body-lg text-brand-100/70 max-w-2xl mx-auto mt-6"
            >
              Meet the dedicated professionals and directors driving positive
              community transformations across Kenya.
            </motion.p>
          </div>
        </section>

        {/* Executive Team */}
        <section className="section">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div className="flex flex-col gap-2">
              <span className="label text-brand-800">Executive</span>
              <h2 className="h1 text-brand-900 uppercase tracking-tight">
                Leadership Team
              </h2>
            </div>
            <div className="flex items-center gap-2 label text-text-500 bg-white px-4 py-2 rounded-full border border-border-subtle shadow-sm">
              {teamMembers.length} Members Active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <LoadingSkeleton
                      key={i}
                      className="h-56 rounded-2xl"
                    />
                  ))
              : teamMembers.length === 0
              ? (
                  <div className="card card-body col-span-full p-16 text-center flex flex-col items-center gap-4">
                    <Users size={40} className="text-brand-100" />
                    <span className="label text-brand-900 uppercase">
                      Roster in compilation
                    </span>
                  </div>
                )
              : teamMembers.map((m, i) => (
                  <MemberCard key={m.id} member={m} index={i} />
                ))}
            </div>
          </div>
        </section>

        {/* Board */}
        {(loading || boardMembers.length > 0) && (
          <section className="section">
            <div className="container">
              <div className="flex flex-col gap-2 mb-12">
              <span className="label text-accent-600">Governance</span>
              <h2 className="h1 text-brand-900 uppercase tracking-tight">
                Board of Directors
              </h2>
              </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {loading
                ? Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <LoadingSkeleton
                        key={i}
                        className="h-32 rounded-2xl"
                      />
                    ))
                : boardMembers.map((m, i) => (
                    <BoardCard key={m.id} member={m} index={i} />
                  ))}
            </div>
            </div>
          </section>
        )}

        {/* Core Values */}
        <section className="bg-surface-200 py-20">
          <div className="container">
            <div className="text-center mb-14">
              <span className="label text-accent-600 mb-3 block">Our DNA</span>
              <h2 className="h1 text-brand-900 uppercase tracking-tight">
                The Core Values
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {VALUES.map((v, i) => (
                <motion.article
                  key={i}
                  className="card card-body flex flex-col gap-5 group cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800 shadow-sm group-hover:bg-brand-900 group-hover:text-white transition-all duration-300">
                    {v.icon}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="h4 text-brand-900 uppercase tracking-widest">
                      {v.title}
                    </h3>
                    <p className="body-sm text-text-500 font-medium leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default TeamPage;
