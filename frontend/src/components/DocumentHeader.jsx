import LogoBrand from "./LogoBrand";

/**
 * DocumentHeader Component
 * Used for documents, receipts, invoices, newsletters
 * Includes logo, organization name, slogan, and contact information
 */
function DocumentHeader({ variant = "standard", customContact = null }) {
  const contactInfo = customContact || {
    address: "Community Impact Centre, Nairobi, Kenya",
    email: "hello@silvershield.org",
    phone: "0726 836021 / 0115 362421",
    website: "www.silvershield.org",
  };

  return (
    <div className={`document-header document-header-${variant}`}>
      <LogoBrand variant="document" />

      {variant === "receipt" && (
        <div className="document-receipt-header">
          <h1>DONATION RECEIPT</h1>
          <p className="receipt-tagline">Thank you for your generosity</p>
        </div>
      )}

      {variant === "newsletter" && (
        <div className="document-newsletter-header">
          <h1>Newsletter</h1>
          <p className="newsletter-tagline">Silver Shield Shaping Lives</p>
        </div>
      )}

      {variant === "invoice" && (
        <div className="document-invoice-header">
          <h1>INVOICE</h1>
        </div>
      )}

      {variant === "report" && (
        <div className="document-report-header">
          <h1>IMPACT REPORT</h1>
          <p className="report-tagline">Building Stronger Communities</p>
        </div>
      )}

      <div className="document-contact-footer">
        <p>{contactInfo.address}</p>
        <p>Email: {contactInfo.email} | Phone: {contactInfo.phone}</p>
        {contactInfo.website && <p>Website: {contactInfo.website}</p>}
      </div>
    </div>
  );
}

export default DocumentHeader;
