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
        <section className="footer-brand-column">
          <LogoBrand variant="full" className="footer-logo" />
          <p className="footer-intro">
            Silver Shield Organisation is a community-led nonprofit shaping lives through
            mentorship, outreach, empowerment, and practical opportunity.
          </p>
          <div className="footer-contact-stack">
            <a href="mailto:Shieldsilver105@gmail.com">Shieldsilver105@gmail.com</a>
            <a href="tel:+254726836021">0726 836021 / 0115 362421</a>
            <span>Kanduyi, Bungoma, Kenya</span>
          </div>
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
          <SocialLinks className="prototype-socials footer-socials" />
          <p className="footer-connect-copy">
            Reach out to volunteer, partner, or support the next chapter of our community work.
          </p>

          <article className="footer-newsletter">
            <h5>Newsletter</h5>
            <p className="footer-newsletter-meta">
              {newsletterDoc?.title || "Newsletter will appear here once published from Admin Docs."}
            </p>
            {newsletterDoc ? (
              <a href={newsletterDownloadUrl} className="btn btn-secondary btn-sm" download>
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
        <p className="footer-credit">
          Built by <a href="mailto:kelly123simiyu@gmail.com">Kelly123simiyu@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
