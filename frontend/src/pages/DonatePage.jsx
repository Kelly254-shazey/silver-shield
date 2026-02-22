import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE_URL, apiFetch } from "../app/api";
import PageTransition from "../components/PageTransition";
import MpesaPaymentCard from "../components/MpesaPaymentCard";
import { useDialog } from "../context/DialogContext";
import { useToast } from "../context/ToastContext";

const presetAmounts = [1000, 2500, 5000];
const socketBaseUrl = API_BASE_URL.replace(/\/api$/, "");

function normalizeKenyanPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (/^254(7|1)\d{8}$/.test(digits)) {
    return digits;
  }
  if (/^0(7|1)\d{8}$/.test(digits)) {
    return `254${digits.slice(1)}`;
  }
  if (/^(7|1)\d{8}$/.test(digits)) {
    return `254${digits}`;
  }
  return digits;
}

function DonatePage() {
  const [searchParams] = useSearchParams();
  const initialProgramId = searchParams.get("programId") || "";

  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState("MPESA");
  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    currency: "KES",
    programId: initialProgramId,
  });

  const [pendingDonation, setPendingDonation] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [mpesaDetails, setMpesaDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(true);

  const { pushToast } = useToast();
  const { showConfirm } = useDialog();

  const amount = useMemo(
    () => Number(customAmount || selectedAmount || 0),
    [customAmount, selectedAmount],
  );

  useEffect(() => {
    let mounted = true;
    apiFetch("/donations/mpesa/details")
      .then((response) => {
        if (mounted) {
          setMpesaDetails(response.data);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) {
          setDetailsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!pendingDonation?.donationId) {
      return undefined;
    }

    const socket = io(socketBaseUrl, { transports: ["websocket"] });
    socket.emit("subscribe:donation", pendingDonation.donationId);

    socket.on("donation:update", (payload) => {
      if (Number(payload.id) === Number(pendingDonation.donationId)) {
        setPendingDonation(payload);
      }
    });

    return () => socket.disconnect();
  }, [pendingDonation?.donationId]);

  useEffect(() => {
    if (!pendingDonation?.donationId || pendingDonation?.status !== "PENDING") {
      return undefined;
    }

    const timer = setInterval(() => {
      apiFetch(`/donations/${pendingDonation.donationId}/status`)
        .then((response) => setPendingDonation(response.data))
        .catch(() => undefined);
    }, 4000);

    return () => clearInterval(timer);
  }, [pendingDonation]);

  const onInitiateDonation = async (event) => {
    event.preventDefault();

    if (amount <= 0) {
      pushToast("Please choose a valid amount.", "error");
      return;
    }

    const normalizedPhone = normalizeKenyanPhone(formData.donorPhone);
    if (method === "MPESA" && !/^254(7|1)\d{8}$/.test(normalizedPhone)) {
      pushToast("Use a valid Kenyan phone number, for example 07XXXXXXXX.", "error");
      return;
    }

    showConfirm({
      title: "Confirm Donation",
      message: `You are donating ${formData.currency} ${amount.toLocaleString()} via ${method}. Continue?`,
      confirmText: "Proceed",
      cancelText: "Cancel",
      variant: "primary",
      onConfirm: async () => {
        setProcessing(true);
        try {
          const response = await apiFetch("/donations/initiate", {
            method: "POST",
            body: {
              ...formData,
              donorPhone: normalizedPhone,
              amount,
              method,
            },
          });

          const donationData = response.data;
          setPendingDonation({
            id: donationData.donationId,
            donationId: donationData.donationId,
            status: donationData.status,
            method: donationData.method,
            providerReference: donationData.providerReference,
            environment: donationData.environment,
          });

          if (donationData.approvalUrl) {
            window.open(donationData.approvalUrl, "_blank", "noopener,noreferrer");
          }

          if (method === "MPESA") {
            pushToast(
              donationData.providerMessage ||
                `STK push sent to ${donationData.normalizedPhone || normalizedPhone}.`,
              "success",
            );
          } else {
            pushToast("Donation initiated successfully.", "success");
          }
        } catch (error) {
          pushToast(error.message, "error");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const onConfirmPaypal = async () => {
    if (!pendingDonation?.donationId || !pendingDonation?.providerReference) {
      return;
    }

    showConfirm({
      title: "Confirm PayPal Payment",
      message: "Confirm this PayPal payment now?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      variant: "success",
      onConfirm: async () => {
        try {
          const response = await apiFetch("/donations/paypal/confirm", {
            method: "POST",
            body: {
              donationId: pendingDonation.donationId || pendingDonation.id,
              orderId: pendingDonation.providerReference,
            },
          });
          setPendingDonation(response.data);
          pushToast("PayPal donation confirmed.", "success");
        } catch (error) {
          pushToast(error.message, "error");
        }
      },
    });
  };

  const mpesaWarnings = mpesaDetails?.warnings || [];
  const nonSandboxWarnings = mpesaWarnings.filter((item) => !item.toLowerCase().includes("sandbox"));

  return (
    <PageTransition className="page-space">
      <section className="mini-hero container glass-panel">
        <p className="eyebrow">Donate</p>
        <h1>Support community programs with secure and transparent giving.</h1>
      </section>

      <section className="container section donate-layout">
        <form className="glass-card donate-form" onSubmit={onInitiateDonation}>
          <h2>Donation Details</h2>
          <div className="amount-presets">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                className={Number(selectedAmount) === preset ? "chip-btn active" : "chip-btn"}
                onClick={() => {
                  setSelectedAmount(preset);
                  setCustomAmount("");
                }}
              >
                KES {preset.toLocaleString()}
              </button>
            ))}
          </div>

          <input
            type="number"
            min="1"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
          />

          <div className="field-grid two">
            <select value={method} onChange={(event) => setMethod(event.target.value)}>
              <option value="MPESA">M-Pesa</option>
              <option value="PAYPAL">PayPal</option>
            </select>
            <select
              value={formData.currency}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, currency: event.target.value }))
              }
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <input
            placeholder="Full name"
            value={formData.donorName}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, donorName: event.target.value }))
            }
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.donorEmail}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, donorEmail: event.target.value }))
            }
          />
          <input
            placeholder="Phone number (e.g. 07XXXXXXXX)"
            value={formData.donorPhone}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, donorPhone: event.target.value }))
            }
          />
          <input
            placeholder="Program ID (optional)"
            value={formData.programId}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, programId: event.target.value }))
            }
          />

          <button className="btn btn-primary" type="submit" disabled={processing}>
            {processing ? "Processing..." : "Initiate Donation"}
          </button>
        </form>

        <aside className="donate-sidebar">
          {method === "MPESA" && (
            <MpesaPaymentCard amount={amount} />
          )}
          {method === "PAYPAL" && (
            <div className="glass-card donate-status">
              <h3>PayPal Payment</h3>
              <p>Click "Initiate Donation" above to open PayPal checkout.</p>
              <p className="text-muted">Secure payment processing via PayPal.</p>
            </div>
          )}

          <div className="glass-card donate-status">
            <h3>Live Donation Status</h3>
            {!pendingDonation && <p>Your donation status will appear here after initiation.</p>}
            {pendingDonation && (
              <>
                <p>
                  <strong>Donation ID:</strong> {pendingDonation.donationId || pendingDonation.id}
                </p>
                <p>
                  <strong>Method:</strong> {pendingDonation.method}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-pill ${String(pendingDonation.status).toLowerCase()}`}>
                    {pendingDonation.status}
                  </span>
                </p>
                {method === "PAYPAL" && pendingDonation.status === "PENDING" && (
                  <button className="btn btn-outline" type="button" onClick={onConfirmPaypal}>
                    Confirm PayPal Payment
                  </button>
                )}
              </>
            )}
          </div>

          {!detailsLoading && method === "MPESA" && (
            <div className="glass-card donate-status">
              <h3>M-Pesa Environment</h3>
              <p>
                <strong>Mode:</strong> {mpesaDetails?.environment || "unknown"}
              </p>
              {mpesaDetails?.environment === "sandbox" && (
                <p>
                  Sandbox mode may not deliver real handset prompts. Switch to production
                  credentials for live STK popups.
                </p>
              )}
              {nonSandboxWarnings.length > 0 && (
                <ul className="map-list">
                  {nonSandboxWarnings.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>
      </section>
    </PageTransition>
  );
}

export default DonatePage;
