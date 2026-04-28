import nodemailer from "nodemailer";

let transporter = null;

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(
      "[Email] EMAIL_HOST / EMAIL_USER / EMAIL_PASS not set. Emails will be logged instead of sent."
    );
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) return;

  if (!transporter) {
    transporter = createTransporter();
  }

  const from =
    process.env.EMAIL_FROM || '"Legal Shathi" <no-reply@legalshathi.com>';

  // Fallback: log emails in dev if no SMTP config
  if (!transporter) {
    console.log("\n[Email:DRY_RUN]", { to, subject, text, htmlSnippet: html?.slice(0, 120) });
    return;
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

