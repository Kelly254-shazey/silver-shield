import { useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "../app/api";
import PageTransition from "../components/PageTransition";
import { useToast } from "../context/ToastContext";

const volunteerRoles = [
  "Mentorship",
  "Skills Training",
  "Community Outreach",
  "Event Organization",
  "Administrative Support",
  "Fundraising",
  "Other",
];

const availabilityOptions = [
  "Weekdays",
  "Weekends",
  "Flexible",
];

function VolunteerPage() {
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    skills: [],
    interests: [],
    availability: "",
    message: "",
  });

  const handleCheckbox = (field, value) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      if (current.includes(value)) {
        return {
          ...prev,
          [field]: current.filter((item) => item !== value),
        };
      }
      return {
        ...prev,
        [field]: [...current, value],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone) {
      pushToast("Please fill in all required fields.", "error");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/volunteers", {
        method: "POST",
        body: formData,
      });

      pushToast("Thank you! Your volunteer application has been submitted.", "success");
      setSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        skills: [],
        interests: [],
        availability: "",
        message: "",
      });

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      pushToast(error.message || "Failed to submit application.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="prototype-home">
        <section className="hero-section compact">
          <div className="container">
            <div className="hero-split glass-panel">
              <div className="prototype-hero-content">
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55 }}
                >
                  Join as a Volunteer
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                >
                  Be part of our mission to create lasting change in communities. Your skills and passion can make a real difference.
                </motion.p>
              </div>
            </div>
          </div>
        </section>

        <section className="container prototype-surface-wrap">
          <div className="prototype-surface">
            <section className="prototype-section">
              <div className="grid two">
                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="volunteer-info-card"
                >
                  <h3>Why Volunteer?</h3>
                  <ul className="checklist">
                    <li>Make a direct impact in local communities</li>
                    <li>Develop new skills and expertise</li>
                    <li>Connect with like-minded changemakers</li>
                    <li>Flexible opportunities to match your schedule</li>
                    <li>Be part of meaningful projects</li>
                  </ul>
                </motion.article>

                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="volunteer-info-card"
                >
                  <h3>What You Can Do</h3>
                  <ul className="checklist">
                    <li>Mentor youth and vulnerable populations</li>
                    <li>Facilitate skills training workshops</li>
                    <li>Support community outreach activities</li>
                    <li>Help organize events and programs</li>
                    <li>Contribute your professional expertise</li>
                  </ul>
                </motion.article>
              </div>
            </section>

            <section className="prototype-section compact-top">
              <div className="section-head prototype-centered-head">
                <h2>Apply to Volunteer</h2>
                <p>Tell us about yourself and your interest in volunteering with Silver Shield.</p>
              </div>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="success-banner"
                  style={{
                    padding: "20px",
                    marginBottom: "20px",
                    backgroundColor: "#e8f5e9",
                    borderLeft: "4px solid #4caf50",
                    borderRadius: "4px",
                  }}
                >
                  <strong>Success!</strong> We've received your application. Our team will review it and get back to you soon.
                </motion.div>
              )}

              <form className="prototype-contact-form glass-card" onSubmit={handleSubmit}>
                <div className="field-grid two">
                  <div>
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Your name"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email">Email *</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="field-grid two">
                  <div>
                    <label htmlFor="phone">Phone *</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="location">Location</label>
                    <input
                      id="location"
                      type="text"
                      placeholder="City/Region"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, location: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label>Areas of Interest</label>
                  <div className="checkbox-grid">
                    {volunteerRoles.map((role) => (
                      <label key={role} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(role)}
                          onChange={() => handleCheckbox("interests", role)}
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label>Your Skills</label>
                  <textarea
                    placeholder="Tell us about your skills and expertise..."
                    rows={3}
                    value={formData.skills.join(", ")}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        skills: e.target.value.split(",").map((s) => s.trim()),
                      }))
                    }
                  />
                </div>

                <div>
                  <label>Availability</label>
                  <div className="checkbox-grid">
                    {availabilityOptions.map((option) => (
                      <label key={option} className="checkbox-label">
                        <input
                          type="radio"
                          name="availability"
                          value={option}
                          checked={formData.availability === option}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, availability: e.target.value }))
                          }
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="message">Additional Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Tell us why you want to volunteer and any specific goals you have..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, message: e.target.value }))
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </section>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default VolunteerPage;
