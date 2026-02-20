const nodemailer = require("nodemailer");
const env = require("../config/env");

function createTransporter() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

const transporter = createTransporter();

async function sendReplyEmail({
  recipientEmail,
  recipientName,
  originalSubject,
  replyText,
}) {
  if (!transporter) {
    return {
      sent: false,
      message: "SMTP not configured. Email delivery skipped.",
    };
  }

  await transporter.sendMail({
    from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
    to: recipientEmail,
    subject: `Re: ${originalSubject}`,
    text: `Hi ${recipientName},\n\n${replyText}\n\nSilver Shield Organisation`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #1A1A1A;">
        <p>Hi ${recipientName},</p>
        <p>${replyText.replace(/\n/g, "<br/>")}</p>
        <p>Silver Shield Organisation</p>
      </div>
    `,
  });

  return {
    sent: true,
    message: "Email sent successfully.",
  };
}

module.exports = {
  sendReplyEmail,
};
