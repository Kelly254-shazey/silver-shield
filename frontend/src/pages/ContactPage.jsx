import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Sparkles,
  User,
  Building2,
  Upload,
  Handshake,
  HeartHandshake,
  MessageSquare,
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import { apiFetch } from "../app/api";
import { useToast } from "../context/ToastContext";
import { useDialog } from "../context/DialogContext";
import LoadingSkeleton from "../components/LoadingSkeleton";

const detailCards = [
  { title: "Email", value: "Shieldsilver105@gmail.com", icon: <Mail size={18} /> },
  { title: "Phone", value: "0726 836021 / 0115 362421", icon: <Phone size={18} /> },
  { title: "Location", value: "Community Impact Centre, Kanduyi, Bungoma", icon: <MapPin size={18} /> },
  { title: "Working Hours", value: "Mon - Fri, 8:00 AM - 5:00 PM", icon: <Clock size={18} /> },
];

const INITIAL_FORM_DATA = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "",
  inquiryType: "general",
  partnerCompanyName: "",
  partnerDescription: "",
  partnerRequirements: null,
  volunteerSkills: "",
  volunteerAvailability: "",
};

function ContactPage() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const { pushToast } = useToast();
  const { showConfirm } = useDialog();

 useEffect(() => {
    const inquiry = String(searchParams.get("inquiry") || "").toLowerCase();
    if (["partner", "volunteer"].includes(inquiry)) {
      setFormData((prev) => ({ ...prev, inquiryType: inquiry }));
      const el = document.getElementById("contact-form");
      if (el)
        setTimeout(
          () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
          100
        );
    }
  }, [searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (formData.website)
      return pushToast("Bot detection triggered.", "error");

    showConfirm({
      title: "Confirm Submission",
      message: `Send this ${formData.inquiryType} inquiry to our community support team?`,
      confirmText: "Deliver Message",
      onConfirm: async () => {
        setLoading(true);
        try {
          if (formData.inquiryType === "partner") {
            const fd = new FormData();
            Object.entries(formData).forEach(([k, v]) => {
              if (k !== "partnerRequirements") fd.append(k, v);
            });
            if (formData.partnerRequirements)
              fd.append("file", formData.partnerRequirements);
            await apiFetch("/messages", {
              method: "POST",
              body: fd,
              useFormData: true,
            });
          } else {
            await apiFetch("/messages", { method: "POST", body: formData });
          }
          setSubmitted(true);
          pushToast("Transmission received. We'll be in touch.", "success");
          setFormData(INITIAL_FORM_DATA);
          setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
          pushToast(error.message, "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return setFormData((p) => ({ ...p, partnerRequirements: null }));
    if (file.size > 5 * 1024 * 1024)
      return setFileError("File exceeds 5MB limit");
    setFileError("");
    setFormData((p) => ({ ...p, partnerRequirements: file }));
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-20 pb-24">
        {/* Slim Hero */}
        <section className="section-hero bg-brand-900 overflow-hidden relative">
          <div 
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{ 
              backgroundImage: `url('https://edumin.co.ke/backend/uploads/com1-1771957870271-956089917.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
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
              Get in Touch
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="h1 text-white"
            >
              Connect with{" "}
              <span className="text-brand-400">Shield</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="body-lg text-brand-100/70 max-w-2xl mx-auto mt-6"
            >
              Whether you are looking to partner, volunteer, or just say hello,
              we are here to listen.
            </motion.p>
          </div>
        </section>

        {/* Contact Bento */}
        <section className="section">
          <div className="container grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Context & Intel */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {detailCards.map((card, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="card p-6 md:p-8 flex flex-col gap-4 border border-border-subtle"
                >
                  <header className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800 shadow-sm">
                    {card.icon}
                    </div>
                    <span className="label text-text-400 uppercase tracking-widest">{card.title}</span>
                  </header>
                  <div className="card-content flex-grow">
                    <span className="text-base font-black text-brand-900 break-all tracking-tight">
                      {card.value}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
                whileHover={{ y: -8 }}
                className="bg-brand-900 text-white p-10 rounded-[32px] border border-white/10 shadow-premium relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div
                    className="absolute -bottom-1/2 -right-1/4 w-full h-full rounded-full"
                    style={{
                      background: "var(--accent-600)",
                      filter: "blur(60px)",
                      opacity: 0.15,
                    }}
                  />
                </div>
                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                      <Sparkles size={20} className="text-accent-400" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest m-0">Shield Intelligence</h4>
                  </div>
                  <p className="text-xs text-brand-100/80 leading-relaxed font-medium m-0">
                    Our Bungoma hub provides real-time answers grounded in official Silver Shield documentation.
                  </p>
                  <div className="flex items-center gap-2 text-[9px] font-extrabold text-brand-400 uppercase tracking-widest border-t border-white/5 pt-4">
                    <Building2 size={12} /> Verified Documentation Node
                  </div>
                </div>
              </motion.div>


              <div className="card overflow-hidden h-64 group bg-surface-200 border border-border-subtle shadow-sm shrink-0">
              <iframe
                title="Location Map"
                className="w-full h-full border-none"
                src="https://www.openstreetmap.org/export/embed.html?bbox=34.50%2C0.53%2C34.60%2C0.59&layer=mapnik"
              />
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            <form
              id="contact-form"
              className="card p-10 lg:p-16 flex flex-col gap-8 border border-border-subtle"
              onSubmit={onSubmit}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={18} className="text-accent-600" />
                  <span className="label text-brand-800">Official Inquiry</span>
                </div>
                <h2 className="h2 text-brand-900 uppercase tracking-tight">
                  Leave a{" "}
                  <span className="text-brand-600">Message</span>
                </h2>
              </div>

              <div className="flex flex-col gap-7">
                {/* Inquiry Type */}
                <div className="flex flex-col gap-3">
                  <label className="form-label text-brand-800">
                    Type of Connection
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { id: "general", label: "General", icon: <User size={13} /> },
                      { id: "partner", label: "Partner", icon: <Handshake size={13} /> },
                      { id: "volunteer", label: "Volunteer", icon: <HeartHandshake size={13} /> },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-border-subtle cursor-pointer ${
                          formData.inquiryType === type.id
                            ? "bg-brand-900 text-white shadow-lg"
                            : "bg-surface-200 text-text-500 hover:bg-brand-100"
                        }`}
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            inquiryType: type.id,
                          }))
                        }
                      >
                        {type.icon} {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="form-label text-brand-800">Full Name</label>
                    <input
                      className="input-field"
                      placeholder="John Doe"
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
                    <label className="form-label text-brand-800">Email Address</label>
                    <input
                      className="input-field"
                      placeholder="john@example.com"
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

                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label className="form-label text-brand-800">Inquiry Subject</label>
                  <input
                    className="input-field"
                    placeholder="How can we help?"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        subject: e.target.value,
                      }))
                    }
                  />
                </div>

                <AnimatePresence mode="wait">
                  {formData.inquiryType === "partner" && (
                    <motion.div
                      key="partner"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-5 overflow-hidden"
                    >
                      <div className="flex flex-col gap-2">
                        <label className="form-label text-brand-800">Organization Name</label>
                        <input
                          className="input-field"
                          placeholder="Global Impact Corp"
                          required
                          value={formData.partnerCompanyName}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              partnerCompanyName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="form-label text-brand-800">Brief Overview / Sector</label>
                        <input
                          className="input-field"
                          placeholder="e.g. Healthcare, Education, FinTech..."
                          required
                          value={formData.partnerDescription}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              partnerDescription: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="form-label text-brand-800">Proposal Documents (PDF/DOCX)</label>
                        <label className="flex items-center justify-center gap-2 w-full py-3.5 px-5 bg-brand-100 rounded-md cursor-pointer hover:bg-brand-200 transition-colors border-2 border-dashed border-brand-800/20 text-brand-800 font-bold text-[10px] uppercase tracking-widest">
                          <Upload size={16} />
                          {formData.partnerRequirements
                            ? formData.partnerRequirements.name
                            : "Select Proposal File"}
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            required={formData.inquiryType === "partner"}
                          />
                        </label>
                        {fileError && (
                          <span className="input-error-text">{fileError}</span>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {formData.inquiryType === "volunteer" && (
                    <motion.div
                      key="volunteer"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-2 overflow-hidden"
                    >
                      <label className="form-label text-brand-800">
                        Availability & Skills
                      </label>
                      <input
                        className="input-field"
                        placeholder="e.g. Weekends, Mentorship, Web Design"
                        required
                        value={formData.volunteerSkills}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            volunteerSkills: e.target.value,
                          }))
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message */}
                <div className="flex flex-col gap-2">
                  <label className="form-label text-brand-800">
                    Detailed Message
                  </label>
                  <textarea
                    className="textarea-field min-h-[140px] rounded-xl resize-y leading-relaxed"
                    placeholder="Share your thoughts with us..."
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        message: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Honeypot */}
                <input
                  className="hidden opacity-0 absolute -z-10"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, website: e.target.value }))
                  }
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-6 border-t border-border-subtle">
                <p className="text-xs text-text-400 font-semibold uppercase tracking-wider max-w-[220px]">
                  By sending, you agree to our privacy protocols.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary px-10 py-4 shadow-lg w-full sm:w-auto"
                >
                  {loading ? (
                    "Delivering..."
                  ) : (
                    <>
                      <Send size={16} /> Send Narrative
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
                  Message successfully delivered to Shield Support.
                </motion.p>
              )}
            </form>
          </div>
          </div>
        </section> {/* Closing tag for section on line 160 */}
      </div>
    </PageTransition>
  );
}

export default ContactPage;
