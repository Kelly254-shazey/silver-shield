import { useEffect, useState } from "react";
import PageTransition from "../components/PageTransition";
import { apiFetch } from "../app/api";
import { useToast } from "../context/ToastContext";
import { useDialog } from "../context/DialogContext";

const detailCards = [
  { title: "Email", value: "hello@silvershield.org" },
  { title: "Phone", value: "0726 836021 / 0115 362421" },
  { title: "Location", value: "Community Impact Centre, Nairobi, Kenya" },
  { title: "Working Hours", value: "Mon - Fri, 8:00 AM - 5:00 PM" },
];

function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "",
    inquiryType: "general", // general, partner, volunteer
    partnerCompanyName: "",
    partnerDescription: "",
    partnerRequirements: null,
    volunteerSkills: "",
    volunteerAvailability: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiDoc, setAiDoc] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [fileError, setFileError] = useState("");
  const { pushToast } = useToast();
  const { showConfirm } = useDialog();

  useEffect(() => {
    let mounted = true;

    const loadAiInfo = async () => {
      try {
        const [aiRes, contactRes] = await Promise.all([
          apiFetch("/docs/public?category=ai&limit=1"),
          apiFetch("/docs/public?category=contact&limit=1"),
        ]);
        if (!mounted) {
          return;
        }
        setAiDoc((aiRes.data || [])[0] || (contactRes.data || [])[0] || null);
      } catch {
        if (mounted) {
          setAiDoc(null);
        }
      } finally {
        if (mounted) {
          setAiLoading(false);
        }
      }
    };

    loadAiInfo();

    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (formData.website) {
      pushToast("Submission rejected.", "error");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
      pushToast("Please complete all required fields.", "error");
      return;
    }

    if (formData.inquiryType === "partner" && !formData.partnerCompanyName) {
      pushToast("Please provide your company/organization name.", "error");
      return;
    }

    if (formData.inquiryType === "volunteer" && !formData.volunteerSkills) {
      pushToast("Please tell us about your skills and interests.", "error");
      return;
    }

    // Show confirmation dialog
    showConfirm({
      title: "Send Message",
      message: `Are you sure you want to submit this ${formData.inquiryType} inquiry to Silver Shield? We'll get back to you shortly.`,
      confirmText: "Yes, Send",
      cancelText: "Cancel",
      variant: "primary",
      onConfirm: async () => {
        setLoading(true);
        try {
          // If there's a file, we need to use FormData
          if (formData.partnerRequirements && formData.inquiryType === "partner") {
            const formDataObj = new FormData();
            formDataObj.append("fullName", formData.fullName);
            formDataObj.append("email", formData.email);
            formDataObj.append("phone", formData.phone);
            formDataObj.append("subject", formData.subject);
            formDataObj.append("message", formData.message);
            formDataObj.append("inquiryType", formData.inquiryType);
            formDataObj.append("partnerCompanyName", formData.partnerCompanyName);
            formDataObj.append("partnerDescription", formData.partnerDescription);
            formDataObj.append("file", formData.partnerRequirements);

            await apiFetch("/messages", {
              method: "POST",
              body: formDataObj,
              useFormData: true,
            });
          } else {
            const body = {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              subject: formData.subject,
              message: formData.message,
              inquiryType: formData.inquiryType,
            };

            if (formData.inquiryType === "partner") {
              body.partnerCompanyName = formData.partnerCompanyName;
              body.partnerDescription = formData.partnerDescription;
            }

            if (formData.inquiryType === "volunteer") {
              body.volunteerSkills = formData.volunteerSkills;
              body.volunteerAvailability = formData.volunteerAvailability;
            }

            await apiFetch("/messages", {
              method: "POST",
              body,
            });
          }

          setSubmitted(true);
          setFormData({
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
          });
          pushToast("Message sent successfully.", "success");
        } catch (error) {
          pushToast(error.message, "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setFileError("File size must be less than 5MB");
        return;
      }
      setFileError("");
      setFormData((prev) => ({ ...prev, partnerRequirements: file }));
    }
  };

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Contact</p>
        <h1>Contact Silver Shield</h1>
      </section>

      <section className="container section contact-layout">
        <article className="glass-card contact-cta" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h2>Interested in Partnership Opportunities?</h2>
              <p>Join us in creating lasting community impact. We're looking for organizations, sponsors, and passionate volunteers.</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setFormData((prev) => ({ ...prev, inquiryType: "partner" }));
                document.getElementById("contact-form").scrollIntoView({ behavior: "smooth" });
              }}
            >
              Partner With Us
            </button>
          </div>
        </article>

        <article className="glass-card contact-info-panel">
          <h2>Reach Us</h2>
          <div className="contact-detail-list">
            {detailCards.map((item) => (
              <article key={item.title} className="contact-detail-card">
                <h3>{item.title}</h3>
                <p>{item.value}</p>
              </article>
            ))}
          </div>
          <div className="map-embed">
            <iframe
              title="Silver Shield Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=36.78%2C-1.34%2C36.88%2C-1.24&layer=mapnik"
            />
          </div>

          <article className="contact-detail-card ai-contact-card">
            <h3>AI Assistant Information</h3>
            {aiLoading ? (
              <p>Loading approved AI information...</p>
            ) : aiDoc ? (
              <>
                <p className="ai-contact-title">{aiDoc.title}</p>
                <p>
                  {String(aiDoc.content || "").slice(0, 320)}
                  {String(aiDoc.content || "").length > 320 ? "..." : ""}
                </p>
                <small>
                  Source: Admin Documentation Center ({aiDoc.category || "general"})
                </small>
              </>
            ) : (
              <p>
                Our AI assistant gives grounded answers from approved documentation. Admin can
                update this from Documentation Center using category <strong>ai</strong>.
              </p>
            )}
          </article>
        </article>

        <form className="glass-card contact-form" id="contact-form" onSubmit={onSubmit}>
          <h2>Send Us a Message</h2>
          
          <div className="form-group">
            <label htmlFor="inquiryType">Inquiry Type</label>
            <select
              id="inquiryType"
              value={formData.inquiryType}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, inquiryType: event.target.value }))
              }
            >
              <option value="general">General Inquiry</option>
              <option value="partner">Partner With Us</option>
              <option value="volunteer">Volunteer With Us</option>
            </select>
          </div>

          <div className="field-grid two">
            <input
              placeholder="Full name"
              value={formData.fullName}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, fullName: event.target.value }))
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </div>
          <input
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, phone: event.target.value }))
            }
          />
          <input
            placeholder="Subject"
            value={formData.subject}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, subject: event.target.value }))
            }
          />

          {formData.inquiryType === "partner" && (
            <>
              <input
                placeholder="Company/Organization Name"
                value={formData.partnerCompanyName}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, partnerCompanyName: event.target.value }))
                }
              />
              <textarea
                rows={3}
                placeholder="Tell us about your organization and how you'd like to partner with us"
                value={formData.partnerDescription}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, partnerDescription: event.target.value }))
                }
              />
              <div className="form-group">
                <label htmlFor="partnerRequirements">Upload Partnership Requirements/Proposal</label>
                <input
                  id="partnerRequirements"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                  onChange={handleFileChange}
                />
                {formData.partnerRequirements && (
                  <p className="file-info">File selected: {formData.partnerRequirements.name}</p>
                )}
                {fileError && <p className="error-text">{fileError}</p>}
                <small>Accepted formats: PDF, DOC, DOCX, TXT, XLS, XLSX (Max 5MB)</small>
              </div>
            </>
          )}

          {formData.inquiryType === "volunteer" && (
            <>
              <textarea
                rows={3}
                placeholder="Tell us about your skills and interests"
                value={formData.volunteerSkills}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, volunteerSkills: event.target.value }))
                }
              />
              <input
                placeholder="Your availability (e.g., Weekends, Evenings, Full-time)"
                value={formData.volunteerAvailability}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, volunteerAvailability: event.target.value }))
                }
              />
            </>
          )}

          <textarea
            rows={6}
            placeholder="Message"
            value={formData.message}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, message: event.target.value }))
            }
          />

          <input
            className="hidden-field"
            tabIndex={-1}
            autoComplete="off"
            placeholder="Do not fill"
            value={formData.website}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, website: event.target.value }))
            }
          />

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
          {submitted && <p className="success-text">Thank you. We received your message.</p>}
        </form>
      </section>
    </PageTransition>
  );
}

export default ContactPage;
