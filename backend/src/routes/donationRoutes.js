const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const mpesaService = require("../services/mpesaService");
const paypalService = require("../services/paypalService");
const payheroService = require("../services/payheroService");
const realtime = require("../services/realtimeService");

const router = express.Router();

function serializeDonation(row) {
  let metadata = {};
  if (row.metadata != null) {
    if (typeof row.metadata === "string") {
      try {
        metadata = JSON.parse(row.metadata);
      } catch {
        metadata = {};
      }
    } else {
      metadata = row.metadata;
    }
  }

  return {
    ...row,
    metadata,
  };
}

function buildCsv(rows) {
  const header = [
    "id",
    "donorName",
    "donorEmail",
    "donorPhone",
    "amount",
    "currency",
    "method",
    "status",
    "providerReference",
    "transactionId",
    "createdAt",
  ];

  const lines = [header.join(",")];
  for (const row of rows) {
    const values = header.map((key) =>
      `"${String(row[key] ?? "")
        .replace(/"/g, '""')
        .trim()}"`,
    );
    lines.push(values.join(","));
  }
  return lines.join("\n");
}

async function emitDonationById(donationId) {
  const rows = await query("SELECT * FROM donations WHERE id = ? LIMIT 1", [donationId]);
  if (!rows[0]) {
    return;
  }
  const donation = serializeDonation(rows[0]);
  realtime.emitDonationUpdate(donationId, donation);
}

async function createPendingDonation({
  donorName,
  donorEmail,
  donorPhone,
  amount,
  currency,
  method,
  programId,
}) {
  const result = await query(
    `
    INSERT INTO donations (
      donorName, donorEmail, donorPhone, amount, currency, method, status, programId, metadata
    )
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
    `,
    [
      donorName,
      donorEmail,
      donorPhone,
      amount,
      currency,
      method,
      programId || null,
      JSON.stringify({}),
    ],
  );
  return result.insertId;
}

router.post(
  "/initiate",
  asyncHandler(async (req, res) => {
    const {
      method,
      amount,
      donorName = "Anonymous Donor",
      donorEmail = "",
      donorPhone = "",
      currency = "KES",
      programId,
    } = req.body;

    const normalizedMethod = String(method || "").toUpperCase();
    const donationAmount = Number(amount || 0);
    if (!normalizedMethod || donationAmount <= 0) {
      return res.status(400).json({ message: "Method and valid amount are required." });
    }

    if (!["MPESA", "PAYPAL", "PAYHERO"].includes(normalizedMethod)) {
      return res.status(400).json({ message: "Unsupported donation method." });
    }

    if ((normalizedMethod === "MPESA" || normalizedMethod === "PAYHERO") && !donorPhone) {
      return res.status(400).json({ message: "Phone number is required for mobile money STK push." });
    }

    let normalizedPhone = String(donorPhone || "").trim();
    if (normalizedMethod === "MPESA") {
      try {
        normalizedPhone = mpesaService.normalizePhone(normalizedPhone);
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    if (normalizedMethod === "PAYHERO") {
      try {
        normalizedPhone = payheroService.normalizePhone(normalizedPhone);
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    const donationId = await createPendingDonation({
      donorName: String(donorName).trim(),
      donorEmail: String(donorEmail).trim(),
      donorPhone: normalizedPhone,
      amount: donationAmount,
      currency: String(currency || "KES").toUpperCase(),
      method: normalizedMethod,
      programId,
    });

    if (normalizedMethod === "MPESA") {
      const fallbackReference = `SILVER-${donationId}`;

      try {
        const mpesa = await mpesaService.initiateStkPush({
          amount: donationAmount,
          phone: normalizedPhone,
          accountReference: fallbackReference,
          transactionDesc: "Silver Shield Donation",
        });

        const providerReference =
          mpesa.CheckoutRequestID || mpesa.checkoutRequestId || fallbackReference;

        await query(
          `
          UPDATE donations
          SET providerReference = ?, metadata = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
          [providerReference, JSON.stringify(mpesa), donationId],
        );

        await emitDonationById(donationId);

        return res.status(201).json({
          donationId,
          method: normalizedMethod,
          status: "PENDING",
          providerReference,
          providerMessage:
            mpesa.CustomerMessage || mpesa.ResponseDescription || "STK push sent.",
          environment: mpesa.environment,
          normalizedPhone: mpesa.normalizedPhone || normalizedPhone,
          providerPayload: mpesa,
        });
      } catch (error) {
        await query(
          `
          UPDATE donations
          SET status = 'FAILED', metadata = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
          [JSON.stringify({ error: error.message }), donationId],
        );
        await emitDonationById(donationId);
        throw error;
      }
    }

    if (normalizedMethod === "PAYPAL") {
      const paypalOrder = await paypalService.createOrder({
        amount: donationAmount,
        currency: String(currency || "USD").toUpperCase(),
        description: "Silver Shield Organisation Donation",
      });

      const approvalUrl = paypalOrder.links?.find((link) => link.rel === "approve")
        ?.href;

      await query(
        `
        UPDATE donations
        SET providerReference = ?, metadata = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [paypalOrder.id || null, JSON.stringify(paypalOrder), donationId],
      );

      await emitDonationById(donationId);

      return res.status(201).json({
        donationId,
        method: normalizedMethod,
        status: "PENDING",
        providerReference: paypalOrder.id || null,
        approvalUrl: approvalUrl || null,
        providerPayload: paypalOrder,
      });
    }

    if (normalizedMethod === "PAYHERO") {
      const fallbackReference = `SILVER-${donationId}`;

      try {
        const payhero = await payheroService.initiateStkPush({
          amount: donationAmount,
          phone: normalizedPhone,
          accountReference: fallbackReference,
          transactionDesc: "Silver Shield Donation",
        });

        const providerReference = payhero.id || payhero.transactionId || fallbackReference;

        await query(
          `
          UPDATE donations
          SET providerReference = ?, metadata = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
          [providerReference, JSON.stringify(payhero), donationId],
        );

        await emitDonationById(donationId);

        return res.status(201).json({
          donationId,
          method: normalizedMethod,
          status: "PENDING",
          providerReference,
          providerMessage:
            payhero.customerMessage || payhero.ResponseDescription || "STK push sent.",
          environment: payhero.environment,
          normalizedPhone: payhero.normalizedPhone || normalizedPhone,
          providerPayload: payhero,
        });
      } catch (error) {
        await query(
          `
          UPDATE donations
          SET status = 'FAILED', metadata = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
          [JSON.stringify({ error: error.message }), donationId],
        );
        await emitDonationById(donationId);
        throw error;
      }
    }

    return res.status(400).json({ message: "Unsupported donation method." });
  }),
);

router.post(
  "/paypal/confirm",
  asyncHandler(async (req, res) => {
    const { donationId, orderId } = req.body;
    if (!donationId || !orderId) {
      return res
        .status(400)
        .json({ message: "donationId and orderId are required." });
    }

    const capture = await paypalService.captureOrder(orderId);
    const isSuccess = capture.status === "COMPLETED";

    await query(
      `
      UPDATE donations
      SET status = ?, transactionId = ?, metadata = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        isSuccess ? "SUCCESS" : "FAILED",
        capture.id || orderId,
        JSON.stringify(capture),
        donationId,
      ],
    );

    await emitDonationById(donationId);

    const rows = await query("SELECT * FROM donations WHERE id = ? LIMIT 1", [donationId]);
    return res.json(serializeDonation(rows[0]));
  }),
);

router.post(
  "/mpesa/callback",
  asyncHandler(async (req, res) => {
    const callback = req.body?.Body?.stkCallback || req.body?.stkCallback || {};
    const checkoutRequestId = callback.CheckoutRequestID;

    if (!checkoutRequestId) {
      return res.status(400).json({ message: "Invalid callback payload." });
    }

    const status = Number(callback.ResultCode) === 0 ? "SUCCESS" : "FAILED";
    const metadata = callback.CallbackMetadata?.Item || [];
    const mpesaReceipt =
      metadata.find((item) => item.Name === "MpesaReceiptNumber")?.Value || null;

    await query(
      `
      UPDATE donations
      SET status = ?, transactionId = ?, metadata = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE providerReference = ?
      `,
      [status, mpesaReceipt, JSON.stringify(callback), checkoutRequestId],
    );

    const rows = await query(
      "SELECT id FROM donations WHERE providerReference = ? LIMIT 1",
      [checkoutRequestId],
    );
    if (rows[0]?.id) {
      await emitDonationById(rows[0].id);
    }

    return res.json({ message: "Callback processed." });
  }),
);

router.post(
  "/payhero/callback",
  asyncHandler(async (req, res) => {
    const callback = req.body || {};
    const transactionId = callback.transaction_id || callback.id;
    const normalizedStatus = String(callback.status || "").toLowerCase();
    const status = normalizedStatus === "completed" || normalizedStatus === "successful" || normalizedStatus === "succeeded" ? "SUCCESS" : "FAILED";

    if (!transactionId) {
      return res.status(400).json({ message: "Invalid PayHero callback payload." });
    }

    await query(
      `
      UPDATE donations
      SET status = ?, transactionId = ?, metadata = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE providerReference = ? OR transactionId = ?
      `,
      [status, transactionId, JSON.stringify(callback), transactionId, transactionId],
    );

    const rows = await query(
      "SELECT id FROM donations WHERE providerReference = ? OR transactionId = ? LIMIT 1",
      [transactionId, transactionId],
    );
    if (rows[0]?.id) {
      await emitDonationById(rows[0].id);
    }

    return res.json({ message: "Callback processed." });
  }),
);

router.post(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const rows = await query("SELECT * FROM donations WHERE id = ? LIMIT 1", [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Donation not found." });
    }
    return res.json({ data: serializeDonation(rows[0]) });
  }),
);

router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const filters = [];
    const params = [];

    if (req.query.status) {
      filters.push("status = ?");
      params.push(req.query.status);
    }

    if (req.query.method) {
      filters.push("method = ?");
      params.push(String(req.query.method).toUpperCase());
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const rows = await query(
      `SELECT * FROM donations ${where} ORDER BY createdAt DESC`,
      params,
    );

    if (req.query.export === "csv") {
      const csv = buildCsv(rows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="silver-shield-donations-${Date.now()}.csv"`,
      );
      return res.send(csv);
    }

    return res.json({ data: rows.map(serializeDonation) });
  }),
);

router.get(
  "/mpesa/details",
  asyncHandler(async (req, res) => {
    const details = mpesaService.getPaymentDetails();
    return res.json(details);
  }),
);

module.exports = router;
