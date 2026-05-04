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

export const sendEmail = async ({ to, subject, html, text, attachments }) => {
  if (!to) return;

  if (!transporter) {
    transporter = createTransporter();
  }

  const from =
    process.env.EMAIL_FROM || '"Legal Shathi" <no-reply@legalshathi.com>';

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
    attachments,
  });
};

export const sendSignatureConfirmationEmail = async ({
  to,
  userName,
  documentTitle,
  documentId,
  signerName,
  timestamp,
  ipAddress,
  sha256Hash,
  qrFilePath,
  qrFileName
}) => {
  if (!to) return;

  const subject = `Document Signed: "${documentTitle}" - Confirmation`;
  const text = `Dear ${userName},

Your document "${documentTitle}" has been successfully signed by ${signerName} on ${new Date(timestamp).toLocaleString()}.

Signature Details:
- Signer: ${signerName}
- Time: ${new Date(timestamp).toLocaleString()}
- IP Address: ${ipAddress}
- SHA-256 Hash: ${sha256Hash}

A QR code has been generated for verification purposes. Please keep this email for your records.

Best regards,
Legal Shathi Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px;">
        <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">Document Signed Successfully! ✅</h2>
        <p style="margin: 0 0 15px 0; font-size: 16px;">Dear ${userName},</p>
        <p style="margin: 0 0 15px 0; font-size: 16px;">Your document <strong>"${documentTitle}"</strong> has been electronically signed.</p>
      </div>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📝 Signature Details</h3>
        <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #555;">
          <li style="margin-bottom: 8px;"><strong>Document:</strong> ${documentTitle}</li>
          <li style="margin-bottom: 8px;"><strong>Signed by:</strong> ${signerName}</li>
          <li style="margin-bottom: 8px;"><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</li>
          <li style="margin-bottom: 8px;"><strong>IP Address:</strong> ${ipAddress}</li>
        </ul>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">🔐 Digital Signature Verification</h3>
        <p style="margin: 0 0 15px 0; color: #555; line-height: 1.5;">The SHA-256 hash for this signature is:</p>
        <div style="background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; word-break: break-all; margin-bottom: 15px;">
          ${sha256Hash}
        </div>
        <p style="margin: 0 0 15px 0; color: #555; line-height: 1.5;">Scan QR code below to verify signature:</p>
        <div style="text-align: center; margin: 20px 0;">
          <img
            src="cid:qr-signature"
            alt="Signature QR Code"
            style="width:200px;height:200px;"
          />
        </div>
        <p style="margin: 15px 0 0 0; color: #555; line-height: 1.5; text-align: center;">
          <strong>Or click here to verify:</strong><br>
          <a href="http://localhost:1630/api/signature/verify/${documentId}" style="color: #007bff; text-decoration: underline;">
            http://localhost:1630/api/signature/verify/${documentId}
          </a>
        </p>
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>📋 Important:</strong> If QR code does not load, verify signature directly: <a href="http://localhost:1630/api/signature/verify/${documentId}" style="color: #007bff; text-decoration: underline;">http://localhost:1630/api/signature/verify/${documentId}</a>
          </p>
        </div>
      </div>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>📋 Legal Notice:</strong> This electronic signature is legally binding and has been recorded with a timestamp and cryptographic hash. Please keep this email for your records.
        </p>
      </div>
      
      <div style="background: #f1f3f4; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
          Best regards,<br>
          <strong>Legal Shathi Team</strong><br>
          <span style="color: #888; font-size: 12px;">Secure Electronic Signature System</span>
        </p>
      </div>
    </div>
  `;

  // Create attachments array with QR code as CID attachment
  const attachments = [];
  
  if (qrFilePath && qrFileName) {
    attachments.push({
      filename: qrFileName,
      path: qrFilePath,
      cid: 'qr-signature' // Same CID as referenced in HTML
    });
  }

  await sendEmail({ to, subject, text, html, attachments });
};

export const sendSecondPartySigningEmail = async ({
  email,
  documentTitle,
  secondPartyLabel,
  firstPartyLabel,
  signingLink
}) => {
  if (!email) return;

  const subject = `✍️ Signature Required — ${documentTitle} | Legal Shathi`;
  
  const text = `Dear ${secondPartyLabel},

${firstPartyLabel} has signed the document titled '${documentTitle}' and requires your signature to complete the agreement.

Please click the link below to sign the document:
${signingLink}

This signing link is unique to you and can only be used once.

Best regards,
Legal Shathi Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;">
        <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">✍️ Signature Required</h2>
        <p style="margin: 0 0 15px 0; font-size: 16px;">Dear ${secondPartyLabel},</p>
        <p style="margin: 0 0 15px 0; font-size: 16px;">${firstPartyLabel} has signed the document <strong>"${documentTitle}"</strong> and requires your signature to complete the agreement.</p>
      </div>
      
      <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📄 Document Details</h3>
        <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #555;">
          <li style="margin-bottom: 8px;"><strong>Document Title:</strong> ${documentTitle}</li>
          <li style="margin-bottom: 8px;"><strong>First Party:</strong> ${firstPartyLabel}</li>
          <li style="margin-bottom: 8px;"><strong>Your Role:</strong> ${secondPartyLabel}</li>
        </ul>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">✍️ Action Required</h3>
        <p style="margin: 0 0 15px 0; color: #555; line-height: 1.5;">Please review and sign the document using the secure link below:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${signingLink}" 
             target="_blank" 
             rel="noopener noreferrer"
             style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Sign Document Now
          </a>
        </div>
        
        <p style="margin: 20px 0 0 0; color: #888; font-size: 14px; text-align: center;">
          <strong>⏰ Important:</strong> This signing link is unique to you and can only be used once.
        </p>
      </div>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>📋 Legal Notice:</strong> This electronic signature is legally binding under the Information Technology Act, 2006 of Bangladesh. Please review the document carefully before signing.
        </p>
      </div>
      
      <div style="background: #f1f3f4; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
          Best regards,<br>
          <strong>Legal Shathi Team</strong><br>
          <span style="color: #888; font-size: 12px;">Secure Electronic Signature System</span>
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
};

export const sendBothPartiesSignedEmail = async ({
  email,
  userName,
  documentTitle,
  firstPartyName,
  firstPartyLabel,
  secondPartyName,
  secondPartyLabel,
  timestamp,
  sha256Hash,
  qrBase64
}) => {
  if (!email) return;

  const subject = `✅ Document Fully Signed by Both Parties — Legal Shathi`;
  
  const text = `Dear ${userName},

The document '${documentTitle}' has been successfully signed by both parties.

Party Details:
- First Party (${firstPartyLabel}): ${firstPartyName}
- Second Party (${secondPartyLabel}): ${secondPartyName}

Signed on: ${new Date(timestamp).toLocaleString()}

SHA-256 Hash: ${sha256Hash}

This QR code verifies both parties have signed and the document has not been tampered with.

Best regards,
Legal Shathi Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px;">
        <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">✅ Document Fully Signed!</h2>
        <p style="margin: 0 0 15px 0; font-size: 16px;">Dear ${userName},</p>
        <p style="margin: 0 0 15px 0; font-size: 16px;">The document <strong>"${documentTitle}"</strong> has been successfully signed by both parties.</p>
      </div>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">👥 Party Signatures</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #e8f5e8;">
              <th style="padding: 10px; text-align: left; border: 1px solid #d4d4d8;">Party</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #d4d4d8;">Name</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #d4d4d8;">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border: 1px solid #d4d4d8;">First Party</td>
              <td style="padding: 10px; border: 1px solid #d4d4d8;">${firstPartyName}</td>
              <td style="padding: 10px; border: 1px solid #d4d4d8;">${firstPartyLabel}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #d4d4d8;">Second Party</td>
              <td style="padding: 10px; border: 1px solid #d4d4d8;">${secondPartyName}</td>
              <td style="padding: 10px; border: 1px solid #d4d4d8;">${secondPartyLabel}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="background: #e8f5e8; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
          <p style="margin: 0; color: #333; font-size: 14px;">
            <strong>Signed on:</strong> ${new Date(timestamp).toLocaleString()}
          </p>
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">🔐 Digital Signature Verification</h3>
        <p style="margin: 0 0 15px 0; color: #555; line-height: 1.5;">The SHA-256 hash for this document is:</p>
        <div style="background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; word-break: break-all; margin-bottom: 15px;">
          ${sha256Hash}
        </div>
        <p style="margin: 0 0 15px 0; color: #555; line-height: 1.5;">QR code for verification:</p>
        <div style="text-align: center; margin: 20px 0;">
          <img
            src="${qrBase64}"
            alt="Document Verification QR Code"
            style="width:200px;height:200px;"
          />
        </div>
        <p style="margin: 15px 0 0 0; color: #555; line-height: 1.5; text-align: center;">
          <strong>📋 Note:</strong> This QR code verifies both parties have signed and the document has not been tampered with.
        </p>
      </div>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>📋 Legal Notice:</strong> This document is now legally binding with both electronic signatures recorded under the Information Technology Act, 2006 of Bangladesh. Please keep this email and the QR code for your records.
        </p>
      </div>
      
      <div style="background: #f1f3f4; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
          Best regards,<br>
          <strong>Legal Shathi Team</strong><br>
          <span style="color: #888; font-size: 12px;">Secure Multi-Party Electronic Signature System</span>
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
};
