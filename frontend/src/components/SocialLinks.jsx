const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/share/18B5RNDyoz/",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 22v-8.25h2.75l.41-3.22H13.5V8.47c0-.93.26-1.56 1.59-1.56h1.7V4.03c-.29-.04-1.28-.13-2.44-.13-2.41 0-4.06 1.47-4.06 4.17v2.46H7.5v3.22h2.79V22h3.21Z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/silvershield203",
    label: "X",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.9 4.5h-2.41l-3.94 4.51L9.3 4.5H4.5l5.6 7.57L4.8 18.5h2.41l4.03-4.61 3.41 4.61h4.8l-5.75-7.78L18.9 4.5Zm-3.15 12.44-6.52-8.88h1.55l6.51 8.88h-1.54Z" />
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@silver_shield1",
    label: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06Z" />
      </svg>
    ),
  },
];

function SocialLinks({ className = "", linkClassName = "" }) {
  return (
    <div className={`social-link-list ${className}`.trim()}>
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          title={item.label}
          className={`social-link ${linkClassName}`.trim()}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
