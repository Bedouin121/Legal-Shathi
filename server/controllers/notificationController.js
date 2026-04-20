import { sendEmail } from "../utils/emailService.js";

// @desc    Send a signature request email for a document
// @route   POST /api/notifications/signature-request
export const sendSignatureRequest = async (req, res, next) => {
  try {
    const { toEmail, documentTitle, signUrl, message } = req.body;

    if (!toEmail || !documentTitle || !signUrl) {
      return res
        .status(400)
        .json({ message: "toEmail, documentTitle and signUrl are required" });
    }

    const bodyText =
      message ||
      `You have been asked to review and sign the document "${documentTitle}".\n\nOpen this link to view and sign:\n${signUrl}`;

    const bodyHtml =
      `<p>You have been asked to review and sign the document <strong>${documentTitle}</strong>.</p>` +
      `<p><a href="${signUrl}" target="_blank" rel="noopener noreferrer">Click here to view and sign the document</a></p>` +
      (message ? `<p>${message}</p>` : "");

    await sendEmail({
      to: toEmail,
      subject: `Signature request for "${documentTitle}"`,
      text: bodyText,
      html: bodyHtml,
    });

    res.json({ message: "Signature request email sent" });
  } catch (error) {
    next(error);
  }
};

