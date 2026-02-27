import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../app/api";
import PageTransition from "../components/PageTransition";

const FALLBACK_MPESA_DETAILS = {
  paybill: "522522",
  accountNumber: "1342183193",
  warnings: [],
};

const PAYPAL_EMAIL = "Shieldsilver105@gmail.com";

function DonatePage() {
  const [mpesaDetails, setMpesaDetails] = useState(FALLBACK_MPESA_DETAILS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    apiFetch("/donations/mpesa/details")
      .then((response) => {
        if (!mounted) {
          return;
        }

        const data = response?.data || {};
        setMpesaDetails({
          paybill: String(data.paybill || FALLBACK_MPESA_DETAILS.paybill),
          accountNumber: String(data.accountNumber || FALLBACK_MPESA_DETAILS.accountNumber),
          warnings: Array.isArray(data.warnings) ? data.warnings : [],
        });
      })
      .catch(() => {
        if (mounted) {
          setMpesaDetails(FALLBACK_MPESA_DETAILS);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const nonSandboxWarnings = useMemo(() => {
    return (mpesaDetails.warnings || []).filter(
      (item) => !String(item).toLowerCase().includes("sandbox"),
    );
  }, [mpesaDetails.warnings]);

  const copyValue = async (value) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(String(value || ""));
    } catch {
      // Ignore clipboard failures.
    }
  };

  const paybill = String(mpesaDetails.paybill || FALLBACK_MPESA_DETAILS.paybill);
  const accountNumber = String(mpesaDetails.accountNumber || FALLBACK_MPESA_DETAILS.accountNumber);

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Donate</p>
        <h1>Donation Procedures</h1>
      </section>

      <section className="container section donate-layout donate-guide-layout">
        <article className="glass-card donate-status">
          <h2>M-Pesa Paybill</h2>
          <p>Use these details to complete your donation manually.</p>

          <div className="payment-method">
            <label>Paybill Number</label>
            <div className="highlight-box">
              <code className="mono-code">{paybill}</code>
              <button type="button" className="copy-btn" onClick={() => copyValue(paybill)}>
                Copy
              </button>
            </div>
          </div>

          <div className="payment-method">
            <label>Account Number</label>
            <div className="highlight-box">
              <code className="mono-code">{accountNumber}</code>
              <button
                type="button"
                className="copy-btn"
                onClick={() => copyValue(accountNumber)}
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mpesa-instructions">
            <h4>Procedure</h4>
            <ol className="instruction-list">
              <li>Open M-Pesa on your phone.</li>
              <li>Select Lipa na M-Pesa, then select Pay Bill.</li>
              <li>Enter Paybill Number: {paybill}.</li>
              <li>Enter Account Number: {accountNumber}.</li>
              <li>Enter amount, enter PIN, then confirm payment.</li>
            </ol>
          </div>

          {loading && <p className="text-sm">Loading latest M-Pesa details...</p>}
          {!loading && nonSandboxWarnings.length > 0 && (
            <ul className="instruction-list">
              {nonSandboxWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </article>

        <article className="glass-card donate-status">
          <h2>PayPal</h2>
          <p>Use this PayPal email for donations.</p>

          <div className="payment-method">
            <label>PayPal Email</label>
            <div className="highlight-box">
              <code className="mono-code">{PAYPAL_EMAIL}</code>
              <button type="button" className="copy-btn" onClick={() => copyValue(PAYPAL_EMAIL)}>
                Copy
              </button>
            </div>
          </div>

          <div className="mpesa-instructions">
            <h4>Procedure</h4>
            <ol className="instruction-list">
              <li>Log in to your PayPal account.</li>
              <li>Select Send or Transfer Money.</li>
              <li>Enter recipient email: {PAYPAL_EMAIL}.</li>
              <li>Enter donation amount and currency.</li>
              <li>Add note: Silver Shield Donation, then confirm payment.</li>
            </ol>
          </div>
        </article>
      </section>
    </PageTransition>
  );
}

export default DonatePage;
