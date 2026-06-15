import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartHandshake,
  Users,
  Zap,
  Target,
  Globe,
  CheckCircle2,
  Send,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Sparkles,
} from "lucide-react";
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

const availabilityOptions = ["Weekdays", "Weekends", "Flexible"];

const BENEFITS = [
  { icon: <Globe size={20} />, text: "Make a direct impact in local communities" },
  { icon: <Zap size={20} />, text: "Develop new leadership skills and expertise" },
  { icon: <Users size={20} />, text: "Connect with like-minded global changemakers" },
  { icon: <Target size={20} />, text: "Flexible opportunities tailored to your life" },
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
      if (current.includes(value))
        return { ...prev, [field]: current.filter((item) => item !== value) };
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone)
      return pushToast("Required fields missing.", "error");

    setLoading(true);
    try {
      await apiFetch("/volunteers", { method: "POST", body: formData });
      pushToast("Application successfully delivered.", "success");
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
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-16 pb-24">
        {/* Slim Hero */}
        <section className="section-hero bg-brand-900 overflow-hidden relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 120%, var(--brand-600) 0%, transparent 60%)",
              opacity: 0.2,
            }}
          />
          <div className="container relative z-10 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="label text-accent-400 mb-5 block"
            >
              Force for Good
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="h1 text-white tracking-tight"
            >
              Enlist as a{" "}
              <span className="text-brand-400">Volunteer</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="body-lg text-brand-100/70 max-w-2xl mx-auto mt-6"
            >
              Join our mission to create lasting change. Your skills and passion
              are the engines of our community impact.
            </motion.p>
          </div>
        </section>

        {/* Main Layout */}
        <section className="section">
          <div className="container grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
            {/* Left */}
            <div className="xl:col-span-4 flex flex-col gap-7">
              <div className="card p-8 md:p-10 flex flex-col gap-7 border border-border-subtle">
                <div className="flex flex-col gap-2">
                  <span className="label text-brand-800">Incentives</span>
                  <h2 className="h3 text-text-900 uppercase tracking-tight">
                    Why Join Us?
                  </h2>
                </div>
                <div className="flex flex-col gap-5">
                  {BENEFITS.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800 flex-shrink-0 group-hover:bg-brand-900 group-hover:text-white transition-all duration-300 shadow-sm">
                        {b.icon}
                      </div>
                      <p className="body-sm text-text-700 font-bold leading-relaxed pt-2">
                        {b.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div
                className="card p-8 md:p-10 flex flex-col gap-5 relative overflow-hidden shadow-lg border-none"
                style={{ background: "linear-gradient(135deg, var(--color-brand-900), var(--color-brand-800))" }}
              >
                <div className="absolute -top-4 -right-4 pointer-events-none opacity-10">
                  <Sparkles size={100} />
                </div>
                <h3 className="h3 text-white uppercase tracking-widest leading-tight">
                  Ready to make a difference?
                </h3>
                <p className="body-sm text-white/90 font-medium leading-relaxed">
                  We are currently looking for mentors in our "Wezesha Dada"
                  program and youth digital skills trainers.
                </p>
                <div className="flex items-center gap-2 text-xs font-extrabold text-white uppercase tracking-widest">
                  <CheckCircle2 size={16} /> Instant Onboarding Support
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="xl:col-span-8">
              <form
                className="card p-8 md:p-12 xl:p-16 flex flex-col gap-8 border border-border-subtle"
                onSubmit={handleSubmit}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <HeartHandshake size={18} className="text-accent-600" />
                    <span className="label text-brand-800">Enrollment Form</span>
                  </div>
                  <h2 className="h1 text-brand-900 uppercase tracking-tight">
                    Official{" "}
                    <span className="text-brand-600">Application</span>
                  </h2>
                </div>

                <div className="flex flex-col gap-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="form-label text-brand-800 flex items-center gap-1.5">
                        <User size={12} /> Full Name
                      </label>
                      <input
                        className="input-field"
                        placeholder="Jane Doe"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            fullName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="form-label text-brand-800 flex items-center gap-1.5">
                        <Mail size={12} /> Email Address
                      </label>
                      <input
                        className="input-field"
                        placeholder="jane@example.com"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="form-label text-brand-800 flex items-center gap-1.5">
                        <Phone size={12} /> Phone
                      </label>
                      <input
                        className="input-field"
                        placeholder="07XXXXXXXX"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="form-label text-brand-800 flex items-center gap-1.5">
                        <MapPin size={12} /> Location
                      </label>
                      <input
                        className="input-field"
                        placeholder="Bungoma, KE"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            location: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="flex flex-col gap-3">
                    <label className="form-label text-brand-800">Areas of Impact</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {volunteerRoles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          className={`py-2.5 px-4 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all border border-border-subtle cursor-pointer ${
                            formData.interests.includes(role)
                              ? "bg-brand-900 text-white shadow-lg border-transparent"
                              : "bg-surface-200 text-text-500 hover:bg-brand-100"
                          }`}
                          onClick={() => handleCheckbox("interests", role)}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-col gap-2">
                    <label className="form-label text-brand-800 flex items-center gap-1.5">
                      <Briefcase size={12} /> Primary Skills
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. Web Design, Teaching, Accounting..."
                      value={formData.skills.join(", ")}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          skills: e.target.value.split(",").map((s) => s.trim()),
                        }))
                      }
                    />
                  </div>

                  {/* Availability */}
                  <div className="flex flex-col gap-3">
                    <label className="form-label text-brand-800">Availability</label>
                    <div className="flex flex-wrap gap-2.5">
                      {availabilityOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`px-5 py-2.5 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all border border-border-subtle cursor-pointer ${
                            formData.availability === opt
                              ? "bg-brand-900 text-white shadow-lg border-transparent"
                              : "bg-surface-200 text-text-500 hover:bg-brand-100"
                          }`}
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              availability: opt,
                            }))
                          }
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label className="form-label text-brand-800">
                      Personal Statement
                    </label>
                    <textarea
                      className="textarea-field min-h-[140px] rounded-xl resize-y leading-relaxed"
                      placeholder="Why would you like to join the Silver Shield mission?"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          message: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-6 border-t border-border-subtle">
                  <p className="text-xs text-text-400 font-semibold uppercase tracking-wider max-w-[200px]">
                    Review process takes 48-72 business hours.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary px-10 py-4 shadow-lg w-full sm:w-auto"
                  >
                    {loading ? (
                      "Transmitting..."
                    ) : (
                      <>
                        <Send size={16} /> Deliver Application
                      </>
                    )}
                  </button>
                </div>
                {submitted && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-success font-bold text-xs uppercase tracking-widest"
                  >
                    Application successfully delivered to HR.
                  </motion.p>
                )}
              </form>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default VolunteerPage;
