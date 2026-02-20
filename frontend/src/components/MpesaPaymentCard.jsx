import { useEffect, useState } from "react";
import { apiFetch } from "../app/api";

function MpesaPaymentCard({ amount = 0 }) {
  const [mpesaDetails, setMpesaDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMpesaDetails = async () => {
      try {
        const response = await apiFetch("/donations/mpesa/details");
        setMpesaDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch M-Pesa details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMpesaDetails();
  }, []);

  if (loading) {
    return (
      <div className="mpesa-card glass-panel loading">
        <div className="skeleton-title" />
        <div className="skeleton-text" />
      </div>
    );
  }

  if (!mpesaDetails) {
    return null;
  }

  return (
    <div className="mpesa-card glass-panel premium-gradient">
      <div className="mpesa-header">
        <div className="mpesa-icon">M</div>
        <h3>M-Pesa Payment</h3>
      </div>

      <div className="mpesa-content">
        <div className="payment-method">
          <label>Pay Bill Number</label>
          <div className="highlight-box">
            <code className="mono-code">{mpesaDetails.paybill}</code>
            <button
              className="copy-btn"
              type="button"
              onClick={() => navigator.clipboard.writeText(mpesaDetails.paybill)}
              title="Copy paybill"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="payment-method">
          <label>Account Number</label>
          <div className="highlight-box">
            <code className="mono-code">{mpesaDetails.accountNumber}</code>
            <button
              className="copy-btn"
              type="button"
              onClick={() => navigator.clipboard.writeText(mpesaDetails.accountNumber)}
              title="Copy account number"
            >
              Copy
            </button>
          </div>
        </div>

        {amount > 0 && (
          <div className="payment-method">
            <label>Amount to Pay</label>
            <div className="amount-display">
              <span className="currency">KES</span>
              <span className="value">{amount.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="mpesa-instructions">
          <h4>How to pay manually:</h4>
          <ol className="instruction-list">
            <li>Go to M-Pesa menu on your phone</li>
            <li>
              Select <strong>Lipa na M-Pesa</strong>, then <strong>Pay Bill</strong>
            </li>
            <li>
              Enter Pay Bill Number: <strong>{mpesaDetails.paybill}</strong>
            </li>
            <li>
              Enter Account Reference: <strong>{mpesaDetails.accountNumber}</strong>
            </li>
            {amount > 0 && (
              <li>
                Enter Amount: <strong>{amount.toLocaleString()}</strong>
              </li>
            )}
            <li>Enter your M-Pesa PIN and confirm</li>
          </ol>
        </div>

        <div className="mpesa-security">
          <span className="security-badge">Secure Payment</span>
          <p>Your transaction is protected by M-Pesa security protocols.</p>
          {mpesaDetails.environment && (
            <p>
              Environment: <strong>{mpesaDetails.environment}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MpesaPaymentCard;
