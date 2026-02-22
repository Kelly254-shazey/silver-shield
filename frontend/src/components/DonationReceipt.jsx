import DocumentHeader from "./DocumentHeader";

/**
 * DonationReceipt Component
 * Generates a printable/downloadable receipt for donations
 * Includes logo, organization branding, and donation details
 */
function DonationReceipt({
  donationId,
  donorName,
  donorEmail,
  amount,
  currency = "KES",
  method,
  date,
  programName,
  transactionId,
  status,
  onPrint,
  onClose,
}) {
  const formattedDate = date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString();
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);

  return (
    <div className="donation-receipt-container">
      <div className="receipt-actions">
        <button onClick={onPrint} className="btn btn-primary">
          Print Receipt
        </button>
        <button onClick={onClose} className="btn btn-outline">
          Close
        </button>
      </div>

      <div className="donation-receipt print-section">
        <DocumentHeader variant="receipt" />

        <div className="receipt-content">
          <div className="receipt-section">
            <h2>Receipt Details</h2>
            <div className="receipt-grid">
              <div className="receipt-field">
                <label>Receipt Number:</label>
                <p>{donationId}</p>
              </div>
              <div className="receipt-field">
                <label>Date:</label>
                <p>{formattedDate}</p>
              </div>
              <div className="receipt-field">
                <label>Transaction ID:</label>
                <p>{transactionId || "N/A"}</p>
              </div>
              <div className="receipt-field">
                <label>Status:</label>
                <p className={`status-${status?.toLowerCase()}`}>{status}</p>
              </div>
            </div>
          </div>

          <div className="receipt-section">
            <h2>Donor Information</h2>
            <div className="receipt-grid">
              <div className="receipt-field">
                <label>Donor Name:</label>
                <p>{donorName}</p>
              </div>
              <div className="receipt-field">
                <label>Email:</label>
                <p>{donorEmail}</p>
              </div>
            </div>
          </div>

          <div className="receipt-section donation-summary">
            <h2>Donation Summary</h2>
            <div className="receipt-grid">
              <div className="receipt-field">
                <label>Program:</label>
                <p>{programName || "General Fund"}</p>
              </div>
              <div className="receipt-field">
                <label>Payment Method:</label>
                <p>{method}</p>
              </div>
              <div className="receipt-field full-width">
                <label>Amount:</label>
                <p className="amount-highlight">{formattedAmount}</p>
              </div>
            </div>
          </div>

          <div className="receipt-footer">
            <p className="thank-you">
              <strong>Thank you for your generous donation!</strong>
            </p>
            <p className="tax-note">
              Silver Shield Organisation is a registered Non-Governmental Organization (NGO) in Kenya. 
              Your donation is tax-deductible where applicable.
            </p>
            <p className="footer-contact">
              For inquiries, contact us at hello@silvershield.org or call 0726 836021 / 0115 362421
            </p>
          </div>
        </div>

        <div className="receipt-footer-branding">
          <p>Silver Shield Organisation</p>
          <p>Shaping Lives</p>
        </div>
      </div>
    </div>
  );
}

export default DonationReceipt;
