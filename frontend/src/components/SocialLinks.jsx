import { useSiteSettings } from "../context/SiteSettingsContext";

const SOCIAL_LINKS = [
];

function SocialLinks({ className = "", linkClassName = "" }) {
  const { settings } = useSiteSettings();

  const dynamicSocialLinks = [
    settings?.facebookUrl && {
      href: settings.facebookUrl,
      label: "Facebook",
      icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8.5V6.75c0-.83.18-1.25 1.42-1.25H17V2.25A20.8 20.8 0 0 0 14.65 2c-2.32 0-3.9 1.42-3.9 4.03V8.5H8v3.5h2.75v10H14V12h2.74l.41-3.5H14Z" /></svg>),
    },
    settings?.twitterUrl && {
      href: settings.twitterUrl,
      label: "X",
      icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 4.5h-2.41l-3.94 4.51L9.3 4.5H4.5l5.6 7.57L4.8 18.5h2.41l4.03-4.61 3.41 4.61h4.8l-5.75-7.78L18.9 4.5Zm-3.15 12.44-6.52-8.88h1.55l6.51 8.88h-1.54Z" /></svg>),
    },
    settings?.linkedinUrl && {
      href: settings.linkedinUrl,
      label: "LinkedIn",
      icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9.401h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.062-2.065c0-1.136.925-2.063 2.062-2.063 1.136 0 2.064.927 2.064 2.063 0 1.136-.928 2.065-2.064 2.065zm1.785 13.019H3.552V9.401h3.57zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.208 24 24 23.227 24 22.271V1.729C24 .774 23.208 0 22.225 0z" /></svg>),
    },
    // Add other social media links as needed, e.g., TikTok, Instagram
  ].filter(Boolean); // Filter out null/undefined entries

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      {dynamicSocialLinks.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          title={item.label}
          className={`w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-accent-600 hover:scale-110 transition-all duration-300 shadow-sm border border-white/5 no-underline ${linkClassName}`.trim()}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
