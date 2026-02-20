import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, apiFetch } from "../app/api";
import { useToast } from "../context/ToastContext";
import LogoBrand from "./LogoBrand";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/events", label: "Events" },
  { to: "/impact", label: "Impact" },
  { to: "/stories", label: "Stories" },
  { to: "/donate", label: "Donate" },
];

const getInvolvedLinks = [
  { to: "/donate", label: "Make a Donation" },
  { to: "/contact", label: "Volunteer" },
  { to: "/contact", label: "Partner With Us" },
  { to: "/team", label: "Our Team" },
];

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", short: "FB" },
  { href: "https://x.com", label: "X", short: "X" },
  { href: "https://instagram.com", label: "Instagram", short: "IG" },
  { href: "https://linkedin.com", label: "LinkedIn", short: "IN" },
];

function Footer() {
  const { pushToast } = useToast();
  const [newsletterDoc, setNewsletterDoc] = useState(null);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    let mounted = true;

    apiFetch("/docs/public?category=newsletter&limit=1")
      .then((response) => {
        if (mounted) {
          setNewsletterDoc((response.data || [])[0] || null);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const newsletterDownloadUrl = useMemo(() => {
    if (!newsletterDoc?.id) {
      return "";
    }
    return `${API_BASE_URL}/docs/public/${newsletterDoc.id}/download`;
  }, [newsletterDoc]);

  const onSubscribe = async (event) => {
    event.preventDefault();

    if (!subscriberEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subscriberEmail)) {
      pushToast("Please enter a valid email to subscribe.", "error");
      return;
    }

    setSubscribing(true);
    try {
      await apiFetch("/messages", {
        method: "POST",
        body: {
          fullName: "Newsletter Subscriber",
          email: subscriberEmail.trim().toLowerCase(),
          phone: "",
          subject: `Newsletter Subscription${newsletterDoc?.title ? ` - ${newsletterDoc.title}` : ""}`,
          message:
            "Please subscribe this email to Silver Shield newsletter and update notifications.",
        },
      });
      setSubscriberEmail("");
      pushToast("Newsletter subscription request sent.", "success");
    } catch (error) {
      pushToast(error.message || "Unable to submit subscription right now.", "error");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="site-footer">
      <div className="container prototype-footer-grid">
        <section>
          <LogoBrand variant="full" className="footer-logo" />
          <p>Community Impact Centre, Nairobi, Kenya</p>
          <p>hello@silvershield.org</p>
          <p>0726 836021 / 0115 362421</p>
        </section>

        <section>
          <h4>Quick Links</h4>
          {quickLinks.map((item) => (
            <Link key={item.to} to={item.to} className="footer-link">
              {item.label}
            </Link>
          ))}
        </section>

        <section>
          <h4>Get Involved</h4>
          {getInvolvedLinks.map((item) => (
            <Link key={`${item.to}-${item.label}`} to={item.to} className="footer-link">
              {item.label}
            </Link>
          ))}
        </section>

        <section>
          <h4>Connect</h4>
          <div className="prototype-socials">
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
              >
                {item.short}
              </a>
            ))}
          </div>
          <p>Partner with us for sustainable social impact.</p>

          <article className="footer-newsletter">
            <h5>Newsletter</h5>
            <p className="footer-newsletter-meta">
              {newsletterDoc?.title || "Newsletter will appear here once published from Admin Docs."}
            </p>
            {newsletterDoc ? (
              <a
                href={newsletterDownloadUrl}
                className="btn btn-secondary btn-sm"
                download
              >
                Download Newsletter
              </a>
            ) : (
              <p className="text-sm">No published newsletter document yet.</p>
            )}

            <form className="footer-newsletter-form" onSubmit={onSubscribe}>
              <input
                type="email"
                placeholder="Enter email"
                value={subscriberEmail}
                onChange={(event) => setSubscriberEmail(event.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={subscribing}>
                {subscribing ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </article>
        </section>
      </div>
      <div className="container footer-bottom">
        <p>{new Date().getFullYear()} Silver Shield Organisation. All rights reserved.</p>
        <p style={{ fontSize: "0.8125rem", marginTop: "0.5rem", opacity: 0.7 }}>
          Built by <a href="mailto:kelly123simiyu@gmail.com" style={{ color: "var(--primary-purple)", fontWeight: 600 }}>Kelly123simiyu@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
