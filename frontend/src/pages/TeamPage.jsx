import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch, resolveMediaUrl } from "../app/api";
import PageTransition from "../components/PageTransition";
import LoadingSkeleton from "../components/LoadingSkeleton";

const VALUES = [
  { icon: "G", title: "Godliness", description: "Faith-driven service with integrity and humility." },
  { icon: "I", title: "Integrity", description: "Transparent, honest, and accountable operations." },
  { icon: "E", title: "Excellence", description: "Commitment to high standards in every program." },
  { icon: "A", title: "Accountability", description: "Responsible stewardship of resources and trust." },
  { icon: "E", title: "Equity", description: "Equal opportunity and dignity for all communities." },
  { icon: "C", title: "Compassion", description: "Empathy and care at the center of our mission." },
];

function MemberCard({ member, index }) {
  return (
    <motion.article className="media-card hover-lift"
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
      <div className="media-wrap">
        <img src={resolveMediaUrl(member.profileImage)} alt={member.name} loading="lazy" />
      </div>
      <div className="media-content">
        <span className="badge">{member.role}</span>
        <h3>{member.name}</h3>
        {member.bio && <p>{member.bio}</p>}
        {member.email && (
          <a href={`mailto:${member.email}`} className="text-link">Email</a>
        )}
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
    Promise.allSettled([apiFetch("/team/members"), apiFetch("/team/board")])
      .then(([teamRes, boardRes]) => {
        if (!mounted) return;
        if (teamRes.status === "fulfilled") setTeamMembers(teamRes.value?.data || []);
        if (boardRes.status === "fulfilled") setBoardMembers(boardRes.value?.data || []);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Our Team</p>
        <h1>The people behind the impact.</h1>
        <p className="lead-text">Dedicated professionals and leaders driving positive change across communities in Kenya.</p>
      </section>

      {/* Leadership */}
      <section className="container section">
        <div className="section-head">
          <p className="section-kicker">Leadership</p>
          <h2>Our Team</h2>
        </div>
        {loading ? ( /* Use team-members-grid for specific styling */
          <div className="grid grid-2 team-members-grid">
            {Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} className="media-card" />)}
          </div>
        ) : teamMembers.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Team members will be listed here soon.</p>
        ) : (
          <div className="grid grid-2 team-members-grid">
            {teamMembers.map((m, i) => <MemberCard key={m.id} member={m} index={i} />)}
          </div>
        )}
      </section>

      {/* Board */}
      {(loading || boardMembers.length > 0) && (
        <section className="container section">
          <div className="section-head">
            <p className="section-kicker">Governance</p>
            <h2>Board of Directors</h2>
          </div>
          {loading ? (
            <div className="grid grid-2 board-members-grid">
              {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="media-card" />)}
            </div>
          ) : (
            <div className="grid grid-2 board-members-grid">
              {boardMembers.map((m, i) => <MemberCard key={m.id} member={m} index={i} />)}
            </div>
          )}
        </section>
      )}

      {/* Values */}
      <section className="container section">
        <div className="section-head">
          <p className="section-kicker">Our Values</p>
          <h2>What drives us.</h2>
        </div> /* Use values-grid for specific styling */
        <div className="grid three values-grid">
          {VALUES.map((v, i) => (
            <motion.article key={v.title + i} className="feature"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <div className="feature-icon">{v.icon}</div>
              <h3 className="feature-title">{v.title}</h3>
              <p className="feature-description">{v.description}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}

export default TeamPage;
