import { Link } from "react-router-dom";
import { useState } from "react";

/**
 * Logo Brand Component
 * Displays the Silver Shield logo with slogan
 * Used across navbar, footer, and documents
 */
function LogoBrand({ variant = "full", className = "" }) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

  const renderLogo = (imageClass, altText) => {
    if (imageError) {
      return (
        <span className={`${imageClass} logo-fallback`} role="img" aria-label={altText}>
          SS
        </span>
      );
    }

    return (
      <img
        src={logoUrl}
        alt={altText}
        className={imageClass}
        decoding="async"
        onError={() => setImageError(true)}
      />
    );
  };
  
  // Full variant: logo + name + slogan
  if (variant === "full") {
    return (
      <Link to="/" className={`logo-brand-full ${className}`}>
        <div className="logo-container">
          {renderLogo("logo-image", "Silver Shield Logo")}
          <div className="logo-text">
            <h3 className="org-name">SILVER SHIELD</h3>
            <p className="org-tagline">ORGANISATION</p>
            <p className="org-slogan">Shaping Lives</p>
          </div>
        </div>
      </Link>
    );
  }

  // Icon variant: just the logo
  if (variant === "icon") {
    return (
      <Link to="/" className={`logo-brand-icon ${className}`}>
        {renderLogo("logo-image-icon", "Silver Shield")}
      </Link>
    );
  }

  // Minimal variant: logo + name only
  if (variant === "minimal") {
    return (
      <Link to="/" className={`logo-brand-minimal ${className}`}>
        {renderLogo("logo-image-small", "Silver Shield")}
        <div className="logo-text-minimal">
          <strong>SILVER SHIELD</strong>
          <small>ORGANISATION</small>
        </div>
      </Link>
    );
  }

  // Document variant: logo with slogan for documents
  if (variant === "document") {
    return (
      <div className={`logo-brand-document ${className}`}>
        {renderLogo("logo-image-document", "Silver Shield Logo")}
        <div className="document-branding">
          <h2 className="doc-org-name">SILVER SHIELD ORGANISATION</h2>
          <p className="doc-org-slogan">Shaping Lives</p>
          <p className="doc-org-contact">
            Community Impact Centre, Nairobi, Kenya | hello@silvershield.org | 0726 836021 / 0115 362421
          </p>
        </div>
      </div>
    );
  }

  // Default
  return (
    <Link to="/" className={`logo-brand ${className}`}>
      {renderLogo("logo-image", "Silver Shield")}
    </Link>
  );
}

export default LogoBrand;
