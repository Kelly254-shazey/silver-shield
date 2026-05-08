import { useEffect, useState } from "react";
import { apiFetch } from "../app/api";
import PageTransition from "../components/PageTransition";
import { useToast } from "../context/ToastContext";

const FALLBACK = { paybill: "522522", accountNumber: "1342183193" };
const PAYPAL_EMAIL = "Shieldsilver105@gmail.com";

// Validate and format phone number for Kenya
function validatePhoneNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  
  if (!digits) {
    return { valid: false, error: "Phone number is required" };
  }
  
  // Check if it's a valid Kenyan format
  if (/^254(7|1)\d{8}$/.test(digits)) {
    return { valid: true, formatted: digits };
  }
  
  if (/^0(7|1)\d{8}$/.test(digits)) {
    return { valid: true, formatted: `254${digits.slice(1)}` };
  }
  
  if (/^(7|1)\d{8}$/.test(digits)) {
    return { valid: true, formatted: `254${digits}` };
  }
  
  return { 
    valid: false, 
    error: "Invalid format. Use 07XXXXXXXX, 01XXXXXXXX, or +2547XXXXXXXX" 
  };
}

function DonatePage() {
  const [mpesa, setMpesa] = useState(FALLBACK);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState(null);
  const { pushToast } = useToast();

  useEffect(() => {
    let mounted = true;
    apiFetch("/donations/mpesa/details")
      .then((res) => {
        if (!mounted) return;
        const d = res?.data || {};
        setMpesa({
          paybill: String(d.paybill || FALLBACK.paybill),
          accountNumber: String(d.accountNumber || FALLBACK.accountNumber),
        });
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const copy = async (val) => {
    try { 
      await navigator.clipboard.writeText(String(val)); 
    } catch (err) {
      // Silently ignore if clipboard is unavailable
      void err;
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (value) {
      const validation = validatePhoneNumber(value);
      setPhoneError(validation.valid ? "" : validation.error);
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !amount || !name) {
      pushToast("Please fill in all required fields.", "error");
      return;
    }
    
    const validation = validatePhoneNumber(phone);
    if (!validation.valid) {
      pushToast(validation.error, "error");
      setPhoneError(validation.error);
      return;
    }
    
    const amountNum = Number(amount);
    if (amountNum <= 0) { pushToast("Amount must be greater than 0.", "error"); return; }
    if (amountNum < 10) { pushToast("Minimum amount is KES 10.", "error"); return; }

    setBusy(true);
    setResponse(null);
    try {
      const res = await apiFetch("/donations/initiate", {
        method: "POST",
        body: { 
          method: "PAYHERO", 
          amount: amountNum, 
          donorName: name.trim(), 
          donorEmail: email.trim(), 
          donorPhone: validation.formatted, 
          currency: "KES" 
        },
      });
      setResponse({
        success: true,
        message: res.providerMessage || "STK Push sent! Check your phone.",
        phone: res.normalizedPhone || phone,
      });
      pushToast("Payment prompt sent to your phone.", "success");
      setTimeout(() => { setPhone(""); setAmount(""); setName(""); setEmail(""); setPhoneError(""); }, 2000);
    } catch (err) {
      setResponse({ success: false, message: err.message || "Failed. Please try again." });
      pushToast(err.message || "STK Push failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Donate</p>
        <h1>Support Silver Shield</h1>
        <p>Every contribution helps us reach more women, youth, and families in Bungoma.</p>
      </section>

      <section className="container section donate-guide-layout">

        {/* M-Pesa Manual */}
        <article className="glass-card donate-status">
          <h2>M-Pesa Paybill</h2>
          <p>Pay directly using M-Pesa Paybill.</p>
          <div className="payment-method">
            <label>Paybill Number</label>
            <div className="highlight-box">
              <code className="mono-code">{mpesa.paybill}</code>
              <button type="button" className="copy-btn" onClick={() => copy(mpesa.paybill)}>Copy</button>
            </div>
          </div>
          <div className="payment-method">
            <label>Account Number</label>
            <div className="highlight-box">
              <code className="mono-code">{mpesa.accountNumber}</code>
              <button type="button" className="copy-btn" onClick={() => copy(mpesa.accountNumber)}>Copy</button>
            </div>
          </div>
          <div className="mpesa-instructions">
            <h4>Steps</h4>
            <ol className="instruction-list">
              <li>Open M-Pesa → Lipa na M-Pesa → Pay Bill</li>
              <li>Business No: <strong>{mpesa.paybill}</strong></li>
              <li>Account No: <strong>{mpesa.accountNumber}</strong></li>
              <li>Enter amount, PIN, and confirm.</li>
            </ol>
          </div>
        </article>

        {/* STK Push */}
        <article className="glass-card donate-status">
          <h2>Quick Pay (STK Push)</h2>
          <p>Enter your M-Pesa number and receive a payment prompt instantly.</p>
          <form onSubmit={handleSubmit} className="stk-push-form">
            <div className="form-row">
              <div className="form-group">
                <label>Amount (KES) *</label>
                <input type="number" placeholder="e.g. 500" value={amount}
                  onChange={(e) => setAmount(e.target.value)} min="10" step="1" required disabled={busy} />
                <small style={{ color: '#999', marginTop: '4px', display: 'block' }}>Minimum: KES 10</small>
              </div>
              <div className="form-group">
                <label>M-Pesa Number *</label>
                <input type="tel" placeholder="07XXXXXXXX" value={phone}
                  onChange={handlePhoneChange} required disabled={busy} aria-invalid={!!phoneError} />
                {phoneError && <small style={{ color: '#ef4444', marginTop: '4px', display: 'block' }}>{phoneError}</small>}
              </div>
            </div>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" placeholder="Your full name" value={name}
                onChange={(e) => setName(e.target.value)} required disabled={busy} />
            </div>
            <div className="form-group">
              <label>Email (optional)</label>
              <input type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} disabled={busy} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Sending..." : "Send Payment Prompt"}
            </button>
            {response && (
              <div className={`stk-response-box ${response.success ? "success" : "error"}`}>
                <p className="response-message">{response.message}</p>
                {response.success && response.phone && (
                  <p className="response-detail">Prompt sent to: {response.phone}</p>
                )}
              </div>
            )}
          </form>
        </article>

        {/* PayPal */}
        <article className="glass-card donate-status">
          <h2>PayPal</h2>
          <p>Send a donation via PayPal to our registered email.</p>
          <div className="payment-method">
            <label>PayPal Email</label>
            <div className="highlight-box">
              <code className="mono-code">{PAYPAL_EMAIL}</code>
              <button type="button" className="copy-btn" onClick={() => copy(PAYPAL_EMAIL)}>Copy</button>
            </div>
          </div>
          <div className="mpesa-instructions">
            <h4>Steps</h4>
            <ol className="instruction-list">
              <li>Log in to PayPal → Send Money</li>
              <li>Enter: <strong>{PAYPAL_EMAIL}</strong></li>
              <li>Enter amount, add note: <em>Silver Shield Donation</em></li>
              <li>Confirm payment.</li>
            </ol>
          </div>
        </article>

      </section>
    </PageTransition>
  );
}

export default DonatePage;
