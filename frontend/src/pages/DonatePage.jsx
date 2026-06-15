import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Smartphone,
  Globe,
  Copy,
  Check,
  ArrowRight,
  Heart,
  ShieldCheck,
  Zap,
  HelpCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "../app/api";
import PageTransition from "../components/PageTransition";
import { useToast } from "../context/ToastContext";

const FALLBACK = { paybill: "522522", accountNumber: "1342183193" };
const PAYPAL_EMAIL = "Shieldsilver105@gmail.com";

function validatePhoneNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits)
    return { valid: false, error: "Phone number is required" };
  if (/^254(7|1)\d{8}$/.test(digits)) return { valid: true, formatted: digits };
  if (/^0(7|1)\d{8}$/.test(digits))
    return { valid: true, formatted: `254${digits.slice(1)}` };
  if (/^(7|1)\d{8}$/.test(digits)) return { valid: true, formatted: `254${digits}` };
  return {
    valid: false,
    error: "Format: 07XXXXXXXX or 01XXXXXXXX",
  };
}

function DonatePage() {
  const [mpesa, setMpesa] = useState(FALLBACK);
  const [stkConfigured, setStkConfigured] = useState(true);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
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
        setStkConfigured(Boolean(d.configured));
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const copy = async (val, field) => {
    try {
      await navigator.clipboard.writeText(String(val));
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      pushToast("Copied to clipboard", "success");
    } catch (err) {
      void err;
    }
  };

  const handlePhoneChange = (e) => {
    const v = e.target.value;
    setPhone(v);
    if (v) {
      const val = validatePhoneNumber(v);
      setPhoneError(val.valid ? "" : val.error);
    } else setPhoneError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = validatePhoneNumber(phone);
    if (!val.valid) return setPhoneError(val.error);

    const amountNum = Number(amount);
    if (amountNum < 10) return pushToast("Minimum amount is KES 10", "error");

    setBusy(true);
    try {
      await apiFetch("/donations/initiate", {
        method: "POST",
        body: {
          method: "MPESA",
          amount: amountNum,
          donorPhone: val.formatted,
          currency: "KES",
        },
      });
      pushToast("Payment prompt sent to your phone", "success");
      setTimeout(() => {
        setPhone("");
        setAmount("");
      }, 2000);
    } catch (err) {
      pushToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col pb-24 bg-background">
        {/* Slim Hero */}
        <section className="section-hero relative overflow-hidden" style={{ background: 'var(--hero-gradient)' }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "rgba(0,0,0,0.1)",
            }}
          />
          <div className="container relative z-10 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="label text-accent-400 mb-5 block"
            >
              Fuel the Impact
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h1 text-white tracking-tight"
            >
              Secure{" "}
              <span className="text-accent-400">Contribution</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="body-lg text-text-300 max-w-2xl mx-auto mt-7 font-medium leading-relaxed"
            >
              Your generosity directly empowers women and youth initiatives.
              Every contribution drives sustainable change across Bungoma.
            </motion.p>
          </div>
          {/* Fold Transition */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-surface-100 to-transparent" />
        </section>

        {/* Donation Hub */}
        <section className="container py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* STK Push */}
            <div className="lg:col-span-7">
              <form
                className="bg-white p-8 lg:p-12 rounded-3xl shadow-lg border border-border-subtle flex flex-col gap-8 relative overflow-hidden"
                onSubmit={handleSubmit}
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <Smartphone size={120} />
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <Zap size={18} className="text-accent-600" />
                    <span className="label text-brand-600">
                      Instant Secure Pay
                    </span>
                  </div>
                  <h2 className="h2 text-text-900">Mobile Express</h2>
                  {!stkConfigured && (
                    <p className="text-xs font-bold text-danger uppercase tracking-wider mt-1 bg-danger/5 px-3 py-2 rounded-lg border border-danger/10">
                      Express payment is currently syncing. Manual paybill is
                      available.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-8 relative z-10">
                  {/* Amount */}
                  <div className="flex flex-col gap-3">
                    <label className="input-label">Support Amount (KES)</label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-500 font-bold text-lg select-none">
                        KES
                      </span>
                      <input
                        type="number"
                        className="input-base pl-16 pr-5 text-2xl font-bold rounded-xl"
                        placeholder="1,000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        disabled={busy}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {[500, 1000, 2000, 5000].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setAmount(String(v))}
                          className="px-4 py-2 rounded-xl bg-surface-200 text-xs font-bold uppercase tracking-wider hover:bg-brand-900 hover:text-white hover:shadow-md transition-all border-none border border-transparent hover:border-brand-900 text-text-600"
                        >
                          +{v.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-3">
                    <label className="input-label">M-Pesa Number</label>
                    <input
                      type="tel"
                      className={`input-base py-4 rounded-xl ${phoneError ? "input-error" : ""}`}
                      placeholder="07XXXXXXXX"
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                      disabled={busy}
                    />
                    {phoneError && (
                      <span className="input-error-text">
                        {phoneError}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={busy || !amount || !phone}
                    className="btn btn-primary btn-lg py-5 rounded-xl w-full group relative overflow-hidden transition-all active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2.5 text-[11px] tracking-widest">
                      {busy ? (
                        "Authenticating..."
                      ) : (
                        <>
                          <Zap size={18} /> Initiate Express Pay
                        </>
                      )}
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-2.5 text-text-400 mt-1">
                    <ShieldCheck size={15} className="text-success" />
                    <span className="text-xs font-semibold tracking-wide">
                      End-to-End Secure Transaction
                    </span>
                  </div>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-5 flex flex-col gap-7">
              {/* Paybill */}
              <div className="bg-white p-8 rounded-3xl border border-border-subtle shadow-sm flex flex-col gap-7">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-brand-900 text-white flex items-center justify-center shadow-md">
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <span className="label text-text-400">Manual Process</span>
                    <p className="font-bold text-text-900 tracking-tight">
                      M-Pesa Paybill
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    {
                      label: "Business Number",
                      value: mpesa.paybill,
                      field: "paybill",
                    },
                    {
                      label: "Account ID",
                      value: mpesa.accountNumber,
                      field: "account",
                    },
                  ].map((field) => (
                    <div
                      key={field.field}
                      className="flex items-center justify-between p-4 bg-surface-200 rounded-2xl border border-border-subtle hover:border-brand-500/20 transition-all"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="label text-text-400">
                          {field.label}
                        </span>
                        <span className="text-lg font-bold text-text-900 font-mono tracking-tight">
                          {field.value}
                        </span>
                      </div>
                      <button
                        onClick={() => copy(field.value, field.field)}
                        className="w-10 h-10 bg-white rounded-xl text-text-500 shadow-sm hover:bg-brand-900 hover:text-white transition-all flex items-center justify-center border border-border-subtle shrink-0"
                      >
                        {copiedField === field.field ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-brand-50 rounded-2xl border border-brand-100">
                  <div className="flex items-center gap-2.5 mb-3">
                    <HelpCircle size={16} className="text-brand-700" />
                    <h4 className="label text-brand-800">Quick Steps</h4>
                  </div>
                  <ol className="flex flex-col gap-2 pl-1">
                    <li className="body-sm text-text-700 font-medium">
                      Open <span className="font-bold text-brand-900">Lipa na M-Pesa</span> &gt; Pay Bill
                    </li>
                    <li className="body-sm text-text-700 font-medium">
                      Enter Business No.{" "}
                      <span className="font-mono font-bold text-brand-900">
                        {mpesa.paybill}
                      </span>
                    </li>
                    <li className="body-sm text-text-700 font-medium">
                      Enter Account ID{" "}
                      <span className="font-mono font-bold text-brand-900">
                        {mpesa.accountNumber}
                      </span>
                    </li>
                    <li className="body-sm text-text-700 font-medium">
                      Confirm with your M-Pesa PIN
                    </li>
                  </ol>
                </div>
              </div>

              {/* PayPal */}
              <div className="bg-white p-8 rounded-3xl border border-border-subtle shadow-sm flex flex-col gap-6 group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-accent-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Globe size={22} />
                  </div>
                  <div>
                    <span className="label text-text-400">International</span>
                    <p className="font-bold text-text-900 tracking-tight">
                      PayPal Gateway
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-accent-100 rounded-2xl border border-accent-100">
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <span className="label text-accent-700">
                      PayPal Recipient
                    </span>
                    <span className="text-sm font-bold text-text-900 truncate">
                      {PAYPAL_EMAIL}
                    </span>
                  </div>
                  <button
                    onClick={() => copy(PAYPAL_EMAIL, "paypal")}
                    className="w-10 h-10 bg-white rounded-xl text-accent-600 shadow-sm hover:bg-accent-600 hover:text-white transition-all flex items-center justify-center border border-accent-100 shrink-0"
                  >
                    {copiedField === "paypal" ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>

                <a
                  href="https://www.paypal.com/paypalme/silvershield"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-accent btn-lg w-full no-underline transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  <span className="tracking-widest">
                    Visit PayPal Me
                  </span>{" "}
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Accountability */}
        <section className="container">
          <div className="bg-white p-10 lg:p-16 rounded-3xl border border-border-subtle text-center flex flex-col items-center gap-7 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center text-brand-600 border border-border-subtle shadow-sm">
              <Sparkles size={32} />
            </div>
            <h3 className="h2 text-text-900">Maximum Accountability.</h3>
            <p className="body-lg text-text-500 max-w-2xl leading-relaxed font-medium">
              Silver Shield is a fully registered NGO. 100% of your contribution
              goes directly to community programs. We maintain strict financial
              stewardship and provide detailed annual impact reports.
            </p>
            <Link
              to="/about"
              className="group inline-flex items-center gap-2.5 text-sm font-bold text-brand-700 uppercase tracking-widest no-underline transition-all hover:gap-3.5"
            >
              Governance &amp; Stewardship Records{" "}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default DonatePage;
