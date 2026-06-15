const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/share/18B5RNDyoz/",
    label: "Facebook",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 8.5V6.75c0-.83.18-1.25 1.42-1.25H17V2.25A20.8 20.8 0 0 0 14.65 2c-2.32 0-3.9 1.42-3.9 4.03V8.5H8v3.5h2.75v10H14V12h2.74l.41-3.5H14Z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/silvershield203",
    label: "X",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 4.5h-2.41l-3.94 4.51L9.3 4.5H4.5l5.6 7.57L4.8 18.5h2.41l4.03-4.61 3.41 4.61h4.8l-5.75-7.78L18.9 4.5Zm-3.15 12.44-6.52-8.88h1.55l6.51 8.88h-1.54Z" />
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@silver_shield1",
    label: "TikTok",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06Z" />
      </svg>
    ),
  },
];

function SocialLinks({ className = "", linkClassName = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      {SOCIAL_LINKS.map((item) => (
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
