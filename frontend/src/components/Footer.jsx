import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Send, Download, Heart, ArrowRight } from "lucide-react";
import { apiFetch, apiUrl } from "../app/api";
import { useToast } from "../context/ToastContext";
import LogoBrand from "./LogoBrand";
import SocialLinks from "./SocialLinks";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/programs", label: "Our Programs" },
  { to: "/events", label: "Upcoming Events" },
  { to: "/stories", label: "Impact Stories" },
  { to: "/contact", label: "Contact Us" },
];

const getInvolvedLinks = [
  { to: "/donate", label: "Make a Donation" },
  { to: "/volunteer", label: "Join as Volunteer" },
  { to: "/contact?inquiry=partner#contact-form", label: "Partner With Us" },
  { to: "/team", label: "Meet the Team" },
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
    return apiUrl(`/docs/public/${newsletterDoc.id}/download`);
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
    <footer className="footer-shell">
      <div className="footer-glow" />
      <div className="container footer-grid">
        <div className="footer-brand">
          <LogoBrand variant="minimal" tone="light" />
          <p className="footer-copy">
            Building dignity, opportunity, and resilience across Bungoma through mentorship, outreach, and practical opportunity.
          </p>
          <div className="footer-contact">
            <a href="mailto:Shieldsilver105@gmail.com" className="footer-contact-link">
              <span className="footer-contact-icon"><Mail size={18} /></span>
              Shieldsilver105@gmail.com
            </a>
            <a href="tel:+254726836021" className="footer-contact-link">
              <span className="footer-contact-icon"><Phone size={18} /></span>
              0726 836021 / 0115 362421
            </a>
            <div className="footer-contact-link">
              <span className="footer-contact-icon"><MapPin size={18} /></span>
              Kanduyi, Bungoma, Kenya
            </div>
          </div>
          <SocialLinks className="footer-socials" />
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Platform</h4>
          <nav className="footer-nav">
            {quickLinks.map((item) => (
              <Link key={item.to} to={item.to} className="footer-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Involvement</h4>
          <nav className="footer-nav">
            {getInvolvedLinks.map((item) => (
              <Link key={item.to} to={item.to} className="footer-link">
                {item.label}
              </Link>
            ))}
            <Link to="/admin/login" className="footer-link footer-admin-link">
              Admin Portal <ArrowRight size={12} className="footer-admin-icon" />
            </Link>
          </nav>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Newsletter</h4>
          <p className="footer-copy">
            {newsletterDoc?.title || "Join our community updates and help us build a better future."}
          </p>
          {newsletterDoc && (
            <a href={newsletterDownloadUrl} className="footer-link footer-report-link" download>
              <Download size={16} className="footer-report-icon" /> Latest Report
            </a>
          )}
          <form className="footer-form" onSubmit={onSubscribe}>
            <div className="footer-form-group">
              <input
                type="email"
                placeholder="Email address"
                className="footer-input"
                aria-label="Email address for newsletter"
                required
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
              />
              <button
                type="submit"
                className="footer-action"
                disabled={subscribing}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <p className="footer-bottom-note">&copy; {new Date().getFullYear()} Silver Shield Organisation. All Rights Reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/about" className="footer-link">Privacy</Link>
          <Link to="/contact" className="footer-link">Terms</Link>
          <Link to="/about" className="footer-link">Safety</Link>
        </div>
        <p className="footer-bottom-branding">
          Empowering communities with <Heart size={11} className="footer-heart-icon" />
        </p>
      </div>
    </footer>
  );
}

export default Footer;
