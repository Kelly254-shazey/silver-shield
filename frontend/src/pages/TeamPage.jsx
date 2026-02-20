import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "../app/api";
import { resolveMediaUrl } from "../app/api";
import PageTransition from "../components/PageTransition";
import { useToast } from "../context/ToastContext";

const values = [
  { icon: "G", title: "Godliness", description: "Faith-driven service with integrity and humility." },
  { icon: "I", title: "Integrity", description: "Transparent, honest, and accountable operations." },
  { icon: "E", title: "Excellence", description: "Commitment to high standards in every program." },
  { icon: "A", title: "Accountability", description: "Responsible stewardship of resources and trust." },
  { icon: "Q", title: "Equity and Inclusivity", description: "Equal opportunity and dignity for all communities." },
  { icon: "C", title: "Compassion", description: "Empathy and care at the center of our mission." },
];

function TeamPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;

    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const [teamRes, boardRes] = await Promise.all([apiFetch("/team/members"), apiFetch("/team/board")]);
        if (!mounted) {
          return;
        }
        setTeamMembers(teamRes.data || []);
        setBoardMembers(boardRes.data || []);
      } catch (error) {
        pushToast("Failed to load team data.", "error");
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTeamData();

    return () => {
      mounted = false;
    };
  }, [pushToast]);

  return (
    <PageTransition className="page-space">
      <section className="hero-standard">
        <div className="container">
          <span className="eyebrow">Our Team</span>
          <h1>The People Behind the Impact</h1>
          <p className="hero-description">
            Meet the dedicated professionals and leaders driving positive change across communities
            in Kenya.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Leadership</span>
            <h2>Our Leadership Team</h2>
            <p>Experienced professionals committed to transparency and community-driven impact.</p>
          </div>

          {loading ? (
            <div className="glass-panel text-center">
              <p>Loading team members...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="glass-panel text-center">
              <p>No team members available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {teamMembers.map((member, index) => (
                <motion.article
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="card card-hover"
                >
                  <div className="image-wrapper">
                    <img
                      src={resolveMediaUrl(member.profileImage)}
                      alt={member.name}
                      className="card-image image-zoom"
                    />
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{member.name}</h3>
                    <div className="badge mb-md">{member.role}</div>
                    <p className="card-description">{member.bio}</p>
                    <div className="flex gap-md mt-lg">
                      <a href={`mailto:${member.email}`} className="btn btn-sm btn-secondary" style={{ flex: 1 }}>
                        Email
                      </a>
                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          className="icon-btn"
                          aria-label="LinkedIn"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          in
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Governance</span>
            <h2>Board of Directors</h2>
            <p>Distinguished leaders providing strategic guidance and oversight.</p>
          </div>

          {loading ? (
            <div className="glass-panel text-center">
              <p>Loading board members...</p>
            </div>
          ) : boardMembers.length === 0 ? (
            <div className="glass-panel text-center">
              <p>No board members available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-4">
              {boardMembers.map((member, index) => (
                <motion.article
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="glass-card text-center"
                >
                  <div className="image-wrapper mb-md">
                    <img
                      src={resolveMediaUrl(member.profileImage)}
                      alt={member.name}
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        margin: "0 auto",
                      }}
                    />
                  </div>
                  <h4 className="mb-md">{member.name}</h4>
                  <div className="badge mb-md">{member.role}</div>
                  <p className="text-sm">{member.credentials}</p>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Our Values</span>
            <h2>What Drives Us</h2>
            <p>Core values that guide every decision, program, and partnership.</p>
          </div>

          <div className="grid grid-3">
            {values.map((value, index) => (
              <motion.article
                key={value.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="feature"
              >
                <div className="feature-icon">{value.icon}</div>
                <h3 className="feature-title">{value.title}</h3>
                <p className="feature-description">{value.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <h2>Join Our Mission</h2>
            <p>
              We are always looking for people who share our vision of empowering communities.
            </p>
            <div className="cta-banner-actions">
              <a href="/contact" className="btn btn-primary btn-lg">
                Get in Touch
              </a>
              <a href="mailto:careers@silvershield.org" className="btn btn-secondary btn-lg">
                careers@silvershield.org
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

export default TeamPage;
