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
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiDoc, setAiDoc] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
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

    // Show confirmation dialog
    showConfirm({
      title: "Send Message",
      message: `Are you sure you want to send this message to Silver Shield? We'll get back to you shortly.`,
      confirmText: "Yes, Send",
      cancelText: "Cancel",
      variant: "primary",
      onConfirm: async () => {
        setLoading(true);
        try {
          await apiFetch("/messages", {
            method: "POST",
            body: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              subject: formData.subject,
              message: formData.message,
            },
          });
          setSubmitted(true);
          setFormData({
            fullName: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
            website: "",
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

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Contact</p>
        <h1>Contact Silver Shield</h1>
      </section>

      <section className="container section contact-layout">
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

        <form className="glass-card contact-form" onSubmit={onSubmit}>
          <h2>Send Us a Message</h2>
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
