import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, apiFetch } from "../app/api";
import { useToast } from "../context/ToastContext";
import LogoBrand from "./LogoBrand";
import SocialLinks from "./SocialLinks";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/events", label: "Events" },
  { to: "/stories", label: "Stories" },
  { to: "/contact", label: "Contact" },
];

const getInvolvedLinks = [
  { to: "/donate", label: "Make a Donation" },
  { to: "/volunteer", label: "Volunteer" },
  { to: "/contact?inquiry=partner#contact-form", label: "Partner With Us" },
  { to: "/team", label: "Our Team" },
  { to: "/admin/login", label: "Admin Login" },
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
        if (mounted) setNewsletterDoc((response.data || [])[0] || null);
      })
      .catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  const newsletterDownloadUrl = useMemo(() => {
    if (!newsletterDoc?.id) return "";
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
          message: "Please subscribe this email to Silver Shield newsletter and update notifications.",
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
      <div className="container footer-grid">

        {/* Brand + Contact */}
        <section className="footer-brand-col">
          <LogoBrand variant="full" className="footer-logo" />
          <p className="footer-tagline">
            Shaping lives through mentorship, outreach, and practical opportunity.
          </p>
          <ul className="footer-contact-list">
            <li><a href="mailto:Shieldsilver105@gmail.com">Shieldsilver105@gmail.com</a></li>
            <li><a href="tel:+254726836021">0726 836021 / 0115 362421</a></li>
            <li>Kanduyi, Bungoma, Kenya</li>
          </ul>
          <SocialLinks className="footer-socials" />
        </section>

        {/* Quick Links */}
        <section className="footer-links-col">
          <h4>Quick Links</h4>
          <nav>
            {quickLinks.map((item) => (
              <Link key={item.to} to={item.to} className="footer-link">{item.label}</Link>
            ))}
          </nav>
        </section>

        {/* Get Involved */}
        <section className="footer-links-col">
          <h4>Get Involved</h4>
          <nav>
            {getInvolvedLinks.map((item) => (
              <Link key={`${item.to}-${item.label}`} to={item.to} className="footer-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </section>

        {/* Newsletter */}
        <section className="footer-newsletter-col">
          <h4>Newsletter</h4>
          <p className="footer-newsletter-meta">
            {newsletterDoc?.title || "Stay updated with our latest news and programs."}
          </p>
          {newsletterDoc && (
            <a href={newsletterDownloadUrl} className="btn btn-secondary btn-sm" download>
              Download Newsletter
            </a>
          )}
          <form className="footer-newsletter-form" onSubmit={onSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              value={subscriberEmail}
              onChange={(e) => setSubscriberEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={subscribing}>
              {subscribing ? "..." : "Subscribe"}
            </button>
          </form>
        </section>

      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} Silver Shield Organisation. All rights reserved.</p>
          <p>
            Built by{" "}
            <a href="mailto:kelly123simiyu@gmail.com">KellyFloTech</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
