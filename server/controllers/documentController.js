import OpenAI from "openai";
import crypto from "crypto";
import fs from "fs";
import QRCode from "qrcode";
import Template from "../models/Template.js";
import Document from "../models/Document.js";
import { logActivity } from "../utils/logActivity.js";
import { sendEmail, sendSignatureConfirmationEmail } from "../utils/emailService.js";

let openai = null;
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    });
  }
  return openai;
};

const buildUserPrompt = (fields, formData, language) => {
  const details = Object.entries(formData)
    .filter(([, val]) => val && val.trim())
    .map(([key, val]) => {
      const field = fields.find((f) => f.name === key);
      return `${field ? field.label : key}: ${val}`;
    })
    .join("\n");

  const languageInstruction =
    language === "bengali"
      ? "Write the ENTIRE document in Bengali (বাংলা). All text must be in Bengali script."
      : language === "mixed"
        ? "Write Bengali section headers with English body text."
        : "Write the document primarily in English with Bengali terms where legally appropriate.";

  return `Generate a complete, ready-to-use legal document with the following details:\n\n${details}\n\n${languageInstruction}\n\nIMPORTANT: Generate ONLY the document text. Do NOT include any explanations, notes, or markdown formatting. The document should be ready to print on stamp paper. Use proper spacing, numbered clauses, and formal legal language. Include spaces for signatures at the end.`;
};

// Template-specific prompts (static fallback reference)
const TEMPLATE_PROMPTS = {
  "Property Sale Agreement": {
    fields: [
      { name: "sellerName", label: "Seller's Full Name (বিক্রেতার নাম)", required: true },
      { name: "sellerFather", label: "Seller's Father's Name", required: true },
      { name: "sellerAddress", label: "Seller's Address", required: true },
      { name: "sellerNID", label: "Seller's NID Number", required: true },
      { name: "buyerName", label: "Buyer's Full Name (ক্রেতার নাম)", required: true },
      { name: "buyerFather", label: "Buyer's Father's Name", required: true },
      { name: "buyerAddress", label: "Buyer's Address", required: true },
      { name: "buyerNID", label: "Buyer's NID Number", required: true },
      { name: "propertyAddress", label: "Property Address / Location", required: true },
      { name: "propertyType", label: "Property Type (Land/Flat/Building)", required: true },
      { name: "propertyArea", label: "Property Area (sq ft / katha / decimal)", required: true },
      { name: "deedNumber", label: "Previous Deed/Mouza Number", required: false },
      { name: "saleAmount", label: "Sale Amount (BDT)", required: true },
      { name: "date", label: "Agreement Date", type: "date", required: true },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Property Sale Agreement (সম্পত্তি বিক্রয় চুক্তিপত্র) in proper legal format. Write the document in a mix of Bengali headers with English body text. Include all standard legal clauses for property sale in Bangladesh including: parties involved, property description, consideration amount, payment terms, title warranty, possession transfer, encumbrance clause, indemnity, dispute resolution, and witness section. Format as a proper legal document with numbered clauses.`,
  },
  "Rental Agreement": {
    fields: [
      { name: "landlordName", label: "Landlord's Full Name (বাড়িওয়ালার নাম)", required: true },
      { name: "landlordAddress", label: "Landlord's Address", required: true },
      { name: "tenantName", label: "Tenant's Full Name (ভাড়িওয়া)", required: true },
      { name: "tenantAddress", label: "Tenant's Address", required: true },
      { name: "propertyAddress", label: "Property Address", required: true },
      { name: "monthlyRent", label: "Monthly Rent (BDT)", required: true },
      { name: "securityDeposit", label: "Security Deposit (BDT)", required: true },
      { name: "duration", label: "Lease Duration (months/years)", required: true },
      { name: "startDate", label: "Lease Start Date", type: "date", required: true },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Rental Agreement (ভাড়া চুক্তিপত্র) in proper legal format. Include standard clauses: parties, property description, rent amount, payment schedule, security deposit, maintenance responsibilities, termination conditions, notice period, restrictions, utility charges, and witness section. Use Bengali headers with English body.`,
  },
  "Business Partnership Deed": {
    fields: [
      { name: "partner1Name", label: "Partner 1 Full Name", required: true },
      { name: "partner1Address", label: "Partner 1 Address", required: true },
      { name: "partner1NID", label: "Partner 1 NID", required: true },
      { name: "partner2Name", label: "Partner 2 Full Name", required: true },
      { name: "partner2Address", label: "Partner 2 Address", required: true },
      { name: "partner2NID", label: "Partner 2 NID", required: true },
      { name: "businessName", label: "Business/Firm Name", required: true },
      { name: "businessType", label: "Nature of Business", required: true },
      { name: "businessAddress", label: "Business Address", required: true },
      { name: "totalCapital", label: "Total Capital (BDT)", required: true },
      { name: "profitRatio", label: "Profit Sharing Ratio (e.g., 50:50)", required: true },
      { name: "date", label: "Partnership Date", type: "date", required: true },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Business Partnership Deed (অংশীদারি কারবার দলিল). Include: parties, business details, capital contribution, profit/loss sharing, management duties, banking arrangements, accounts, dissolution terms, dispute resolution, and witness section.`,
  },
  "Non-Disclosure Agreement": {
    fields: [
      { name: "party1Name", label: "Disclosing Party Name", required: true },
      { name: "party1Address", label: "Disclosing Party Address", required: true },
      { name: "party2Name", label: "Receiving Party Name", required: true },
      { name: "party2Address", label: "Receiving Party Address", required: true },
      { name: "purpose", label: "Purpose of Disclosure", required: true },
      { name: "duration", label: "NDA Duration (years)", required: true },
      { name: "date", label: "Agreement Date", type: "date", required: true },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Non-Disclosure Agreement (গোপনীয়তা চুক্তি). Include: definition of confidential information, obligations, exclusions, term, remedies, return of materials, governing law (Bangladesh), and signature section.`,
  },
  "Last Will & Testament": {
    fields: [
      { name: "testatorName", label: "Testator's Full Name (ওসিয়তকারীর নাম)", required: true },
      { name: "testatorFather", label: "Father's Name", required: true },
      { name: "testatorAddress", label: "Address", required: true },
      { name: "testatorNID", label: "NID Number", required: true },
      { name: "beneficiaries", label: "Beneficiaries & Their Shares (list names and portions)", required: true },
      { name: "assets", label: "Assets to be Distributed (describe properties, accounts, etc.)", required: true },
      { name: "executorName", label: "Executor's Name", required: true },
      { name: "executorAddress", label: "Executor's Address", required: true },
      { name: "date", label: "Date of Will", type: "date", required: true },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Last Will & Testament (শেষ ইচ্ছা ও উইল) compliant with Bangladesh Succession Act. Include: declaration, revocation of previous wills, asset distribution, executor appointment, guardian appointment if applicable, residuary clause, and attestation section with witnesses.`,
  },
  "Power of Attorney": {
    fields: [
      { name: "principalName", label: "Principal's Full Name (মক্কেলের নাম)", required: true },
      { name: "principalAddress", label: "Principal's Address", required: true },
      { name: "principalNID", label: "Principal's NID", required: true },
      { name: "agentName", label: "Attorney/Agent's Name (মুক্তার/প্রতিনিধির নাম)", required: true },
      { name: "agentAddress", label: "Agent's Address", required: true },
      { name: "agentNID", label: "Agent's NID", required: true },
      { name: "scope", label: "Scope/Powers Granted (describe what the agent can do)", required: true },
      { name: "duration", label: "Duration of Power", required: true },
      { name: "date", label: "Date", type: "date", required: true },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Power of Attorney (পাওয়ার অব অ্যাটর্নি / মুখতারনামা). Include: parties, recitals, specific powers granted, limitations, duration, revocation conditions, indemnity, and attestation section.`,
  },
  "Marriage Registration Form": {
    fields: [
      { name: "groomName", label: "Groom's Full Name (বরের নাম)", required: true },
      { name: "groomFather", label: "Groom's Father's Name", required: true },
      { name: "groomAddress", label: "Groom's Address", required: true },
      { name: "groomNID", label: "Groom's NID", required: true },
      { name: "brideName", label: "Bride's Full Name (কনের নাম)", required: true },
      { name: "brideFather", label: "Bride's Father's Name", required: true },
      { name: "brideAddress", label: "Bride's Address", required: true },
      { name: "brideNID", label: "Bride's NID", required: true },
      { name: "dowerAmount", label: "Dower/Mohr Amount (দেনমোহর)", required: true },
      { name: "marriageDate", label: "Marriage Date", type: "date", required: true },
      { name: "witness1", label: "Witness 1 Name", required: true },
      { name: "witness2", label: "Witness 2 Name", required: true },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Marriage Registration document (বিবাহ নিবন্ধন ফর্ম / কাবিননামা) as per Muslim Marriages and Divorces (Registration) Act. Include: parties, consent declarations, dower details, conditions, witness statements, and registration details.`,
  },
  "Divorce Agreement": {
    fields: [
      { name: "husbandName", label: "Husband's Full Name", required: true },
      { name: "husbandAddress", label: "Husband's Address", required: true },
      { name: "wifeName", label: "Wife's Full Name", required: true },
      { name: "wifeAddress", label: "Wife's Address", required: true },
      { name: "marriageDate", label: "Date of Marriage", type: "date", required: true },
      { name: "children", label: "Children's Names & Ages (if any)", required: false },
      { name: "custody", label: "Custody Arrangement", required: false },
      { name: "alimony", label: "Alimony/Maintenance Amount (BDT)", required: false },
      { name: "assetDivision", label: "Asset Division Details", required: false },
      { name: "date", label: "Agreement Date", type: "date", required: true },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Mutual Divorce Agreement (তালাকনামা / বিবাহবিচ্ছেদ চুক্তি). Include: parties, marriage details, grounds, mutual consent, custody arrangements, maintenance, asset division, dower settlement, and signature section.`,
  },
  "Employment Contract": {
    fields: [
      { name: "employerName", label: "Employer/Company Name", required: true },
      { name: "employerAddress", label: "Employer Address", required: true },
      { name: "employeeName", label: "Employee's Full Name", required: true },
      { name: "employeeAddress", label: "Employee's Address", required: true },
      { name: "employeeNID", label: "Employee's NID", required: true },
      { name: "position", label: "Job Title/Position", required: true },
      { name: "department", label: "Department", required: false },
      { name: "salary", label: "Monthly Salary (BDT)", required: true },
      { name: "startDate", label: "Start Date", type: "date", required: true },
      { name: "duration", label: "Contract Duration", required: true },
      { name: "probation", label: "Probation Period", required: false },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Employment Contract (চাকরির চুক্তিপত্র) compliant with Bangladesh Labour Act 2006. Include: parties, position, duties, compensation, benefits, working hours, leave policy, probation, termination, confidentiality, non-compete, and signature section.`,
  },
  "Termination Letter": {
    fields: [
      { name: "employerName", label: "Employer/Company Name", required: true },
      { name: "employerAddress", label: "Employer Address", required: true },
      { name: "employeeName", label: "Employee's Full Name", required: true },
      { name: "position", label: "Employee's Position", required: true },
      { name: "joiningDate", label: "Date of Joining", type: "date", required: true },
      { name: "reason", label: "Reason for Termination", required: true },
      { name: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { name: "noticePeriod", label: "Notice Period Given", required: true },
      { name: "settlementDetails", label: "Settlement/Dues Details", required: false },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Termination Letter (চাকরি অবসান পত্র) compliant with Bangladesh Labour Act 2006. Include: company letterhead format, employee details, cause of termination, effective date, settlement of dues, return of company property, and final pay details.`,
  },
  "Land Registration Document": {
    fields: [
      { name: "sellerName", label: "Seller's Name (হস্তান্তরকারী)", required: true },
      { name: "sellerFather", label: "Seller's Father's Name", required: true },
      { name: "sellerAddress", label: "Seller's Address", required: true },
      { name: "sellerNID", label: "Seller's NID", required: true },
      { name: "buyerName", label: "Buyer's Name (গ্রহীতা)", required: true },
      { name: "buyerFather", label: "Buyer's Father's Name", required: true },
      { name: "buyerAddress", label: "Buyer's Address", required: true },
      { name: "buyerNID", label: "Buyer's NID", required: true },
      { name: "mouzaName", label: "Mouza / Village Name (মৌজা)", required: true },
      { name: "jlNumber", label: "J.L. Number", required: true },
      { name: "dagNumber", label: "Dag/Plot Number (দাগ নম্বর)", required: true },
      { name: "khatianNumber", label: "Khatian Number (খতিয়ান নম্বর)", required: true },
      { name: "landArea", label: "Land Area (শতাংশ/কাঠা/একর)", required: true },
      { name: "thana", label: "Thana/Upazila", required: true },
      { name: "district", label: "District (জেলা)", required: true },
      { name: "saleAmount", label: "Sale/Transfer Amount (BDT)", required: true },
      { name: "date", label: "Registration Date", type: "date", required: true },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Land Registration/Transfer Document (জমি রেজিস্ট্রেশন দলিল / সাফ কবলা দলিল). This is the most important legal document in Bangladesh property law. Include: parties with full identification, property schedule (mouza, dag, khatian, area, boundaries - north/south/east/west), chain of ownership, consideration, payment acknowledgment, possession transfer, title warranty, encumbrance-free declaration, indemnity, and attestation section with witnesses. Use proper legal formatting with Bengali section headers.`,
  },
  "Company Registration Form": {
    fields: [
      { name: "companyName", label: "Proposed Company Name", required: true },
      { name: "companyType", label: "Company Type (Private Ltd / Public Ltd)", required: true },
      { name: "businessNature", label: "Nature of Business", required: true },
      { name: "registeredAddress", label: "Registered Office Address", required: true },
      { name: "director1Name", label: "Director 1 Full Name", required: true },
      { name: "director1NID", label: "Director 1 NID", required: true },
      { name: "director2Name", label: "Director 2 Full Name", required: false },
      { name: "director2NID", label: "Director 2 NID", required: false },
      { name: "authorizedCapital", label: "Authorized Capital (BDT)", required: true },
      { name: "paidUpCapital", label: "Paid-up Capital (BDT)", required: true },
      { name: "numberOfShares", label: "Number of Shares", required: true },
      { name: "date", label: "Date", type: "date", required: true },
    ],
    systemPrompt: `You are a Bangladeshi legal document drafting expert. Generate a formal Company Registration / Memorandum of Association (কোম্পানি নিবন্ধন ফর্ম / সংঘস্মারক) as per Companies Act 1994 of Bangladesh. Include: company name clause, registered office, objects of the company, liability clause, capital clause, subscriber details, and declaration.`,
  },
};

// @desc    Get form fields for a template
// @route   GET /api/documents/fields/:templateTitle
export const getTemplateFields = async (req, res, next) => {
  try {
    const title = decodeURIComponent(req.params.templateTitle);
    const template = await Template.findOne({ title });

    if (!template || !template.fields.length) {
      return res.status(404).json({ message: "Template configuration not found" });
    }

    res.json({ fields: template.fields, title });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate legal document from template + form data
// @route   POST /api/documents/generate
export const generateDocument = async (req, res, next) => {
  try {
    const { templateTitle, formData, language = "english" } = req.body;

    if (!templateTitle || !formData) {
      return res.status(400).json({ message: "Template title and form data are required" });
    }

    const template = await Template.findOne({ title: templateTitle });
    if (!template || !template.systemPrompt) {
      return res.status(404).json({ message: "Template configuration not found" });
    }

    const userPrompt = buildUserPrompt(template.fields, formData, language);

    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: template.systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 3000,
      temperature: 0.3,
    });

    const document = completion.choices[0].message.content;

    if (req.user) {
      logActivity(req.user._id, "document_generated", { templateTitle, language });
    }

    const generatedAt = new Date().toISOString();

    let savedDocument = null;
    if (req.user?._id) {
      try {
        savedDocument = await Document.create({
          title: templateTitle,
          content: document,
          templateTitle,
          formData,
          language,
          user: req.user._id,
          status: 'pending_signature'
        });
      } catch (e) {
        console.error("[DocGen] Failed to persist Document:", e?.message);
      }
    }

    const userEmail = req.user?.email || req.body.notifyEmail;
    console.log("[DocGen] Final email to send:", userEmail);

    if (userEmail) {
      try {
        const signUrl = savedDocument
          ? `${process.env.CLIENT_URL || 'http://localhost:8080'}/sign/${savedDocument._id}/${savedDocument.signToken}`
          : `${process.env.CLIENT_URL || 'http://localhost:8080'}/template/sign?title=${encodeURIComponent(templateTitle)}&id=${Date.now()}`;
        console.log("[DocGen] Sending email to:", userEmail);
        console.log("[DocGen] Document title:", templateTitle);
        console.log("[DocGen] Signing URL:", signUrl);
        
        // Send combined email with document generation notification AND signature request
        await sendEmail({
          to: userEmail,
          subject: `Document Generated: "${templateTitle}" - Signature Requested`,
          text: `Your document "${templateTitle}" has been generated at ${generatedAt}.\n\nA signature request has been initiated. Please review and sign the document when ready.\n\nSigning Link: ${signUrl}\n\nThis link will expire in 7 days.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;">
                <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">Document Generated Successfully! 🎉</h2>
                <p style="margin: 0 0 15px 0; font-size: 16px;">Your document <strong>"${templateTitle}"</strong> is ready for review and signature.</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📄 Document Details</h3>
                <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #555;">
                  <li style="margin-bottom: 8px;"><strong>Document Title:</strong> ${templateTitle}</li>
                  <li style="margin-bottom: 8px;"><strong>Generated:</strong> ${new Date(generatedAt).toLocaleString()}</li>
                  <li style="margin-bottom: 8px;"><strong>Status:</strong> Ready for Signature</li>
                </ul>
              </div>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">✍️ Signature Required</h3>
                <p style="margin: 0 0 15px 0; color: #555; line-height: 1.5;">Please review your document and provide your digital signature using the secure link below:</p>
                
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${signUrl}" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Sign Document Now
                  </a>
                </div>
                
                <p style="margin: 20px 0 0 0; color: #888; font-size: 14px; text-align: center;">
                  <strong>⏰ Important:</strong> This signature link will expire in 7 days for security reasons.
                </p>
              </div>
              
              <div style="background: #f1f3f4; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
                  Best regards,<br>
                  <strong>Legal Shathi Team</strong><br>
                  <span style="color: #888; font-size: 12px;">Automated Document Generation System</span>
                </p>
              </div>
            </div>
          `,
        });
        
        console.log("✅ [Combined Email] Document generation + signature request email sent successfully to:", userEmail);
      } catch (err) {
        console.warn("❌ [Docs] Failed to send combined email", err?.message);
        console.warn("❌ [Docs] Error details:", err);
      }
    } else {
      console.log("❌ [DocGen] No user email found - skipping email notification");
    }

    res.json({
      document: savedDocument,
      templateTitle,
      generatedAt,
      signUrl: savedDocument
        ? `${process.env.CLIENT_URL || 'http://localhost:8080'}/sign/${savedDocument._id}/${savedDocument.signToken}`
        : undefined,
    });
  } catch (error) {
    if (error?.status === 429) {
      return res.status(429).json({ message: "AI is busy. Please try again in a moment." });
    }
    next(error);
  }
};

// @desc    Generate legal document with STREAMING
// @route   POST /api/documents/generate/stream
export const generateDocumentStream = async (req, res) => {
  try {
    const { templateTitle, formData, language = "english" } = req.body;

    if (!templateTitle || !formData) {
      return res.status(400).json({ message: "Template title and form data are required" });
    }

    const template = await Template.findOne({ title: templateTitle });
    if (!template || !template.systemPrompt) {
      return res.status(404).json({ message: "Template configuration not found" });
    }

    const userPrompt = buildUserPrompt(template.fields, formData, language);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const client = getOpenAI();
    const stream = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: template.systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 3000,
      temperature: 0.3,
      stream: true,
    });

    let fullDocument = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullDocument += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    if (req.user) {
      logActivity(req.user._id, "document_generated", { templateTitle, language });
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // Fire-and-forget email after stream completes
    const generatedAt = new Date().toISOString();
    const notifyEmail = req.body.notifyEmail || req.user?.email;
    console.log("[DocGen Stream] Request user:", req.user);
    console.log("[DocGen Stream] User email from request:", notifyEmail);

    let savedDocument = null;
    if (req.user?._id) {
      try {
        savedDocument = await Document.create({
          title: templateTitle,
          content: fullDocument,
          templateTitle,
          formData,
          language,
          user: req.user._id,
          status: 'pending_signature'
        });
      } catch (e) {
        console.error("[DocGen Stream] Failed to persist Document:", e?.message);
      }
    }

    const userEmail = notifyEmail;
    console.log("[DocGen Stream] Final email to send:", userEmail);

    if (userEmail) {
      (async () => {
        try {
          const signUrl = savedDocument
            ? `${process.env.CLIENT_URL || 'http://localhost:8080'}/sign/${savedDocument._id}/${savedDocument.signToken}`
            : `${process.env.CLIENT_URL || 'http://localhost:8080'}/template/sign?title=${encodeURIComponent(templateTitle)}&id=${Date.now()}`;
          console.log("[DocGen Stream] Sending email to:", userEmail);
          console.log("[DocGen Stream] Document title:", templateTitle);
          console.log("[DocGen Stream] Signing URL:", signUrl);
          
          // Send combined email with document generation notification AND signature request
          await sendEmail({
            to: userEmail,
            subject: `Document Generated: "${templateTitle}" - Signature Requested`,
            text: `Your document "${templateTitle}" has been generated at ${generatedAt}.\n\nA signature request has been initiated. Please review and sign the document when ready.\n\nSigning Link: ${signUrl}\n\nThis link will expire in 7 days.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;">
                  <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">Document Generated Successfully! 🎉</h2>
                  <p style="margin: 0 0 15px 0; font-size: 16px;">Your document <strong>"${templateTitle}"</strong> is ready for review and signature.</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📄 Document Details</h3>
                  <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #555;">
                    <li style="margin-bottom: 8px;"><strong>Document Title:</strong> ${templateTitle}</li>
                    <li style="margin-bottom: 8px;"><strong>Generated:</strong> ${new Date(generatedAt).toLocaleString()}</li>
                    <li style="margin-bottom: 8px;"><strong>Status:</strong> Ready for Signature</li>
                  </ul>
                </div>
                
                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">✍️ Signature Required</h3>
                  <p style="margin: 0 0 15px 0; color: #555; line-height: 1.5;">Please review your document and provide your digital signature using the secure link below:</p>
                  
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${signUrl}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                      Sign Document Now
                    </a>
                  </div>
                  
                  <p style="margin: 20px 0 0 0; color: #888; font-size: 14px; text-align: center;">
                    <strong>⏰ Important:</strong> This signature link will expire in 7 days for security reasons.
                  </p>
                </div>
                
                <div style="background: #f1f3f4; padding: 20px; border-radius: 8px; margin-top: 20px;">
                  <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
                    Best regards,<br>
                    <strong>Legal Shathi Team</strong><br>
                    <span style="color: #888; font-size: 12px;">Automated Document Generation System</span>
                  </p>
                </div>
              </div>
            `,
          });

          console.log("✅ [Combined Email] Document generation + signature request email sent (stream) to:", userEmail);
        } catch (err) {
          console.warn("❌ [Docs] Failed to send combined email (stream)", err?.message);
          console.warn("❌ [Docs] Error details:", err);
        }
      })();
    } else {
      console.log("❌ [DocGen Stream] No user email found - skipping email notification");
    }
  } catch (error) {
    console.error("Doc stream error:", error);
    if (!res.headersSent) {
      if (error?.status === 429) {
        return res.status(429).json({ message: "AI is busy. Please try again." });
      }
      return res.status(500).json({ message: "Document generation failed" });
    }
    res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
    res.end();
  }
};

// @desc    Extract NID details from an uploaded image
// @route   POST /api/documents/extract-nid
export const extractNID = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const dataURI = `data:${mimeType};base64,${base64Image}`;

    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a precise OCR AI for Bangladeshi National ID cards. Pay extreme attention to accurately reading Bengali characters without guessing. Extract these fields: nameBengali (exact Bengali name), nameEnglish (exact English name), fatherName (Bengali or English as written), motherName, dob, nidNumber, address (exactly as written). Return ONLY a pure JSON object mapping these exact keys: 'nameBengali', 'nameEnglish', 'fatherName', 'motherName', 'dob', 'nidNumber', 'address'. If a field is missing or unreadable, set it to an empty string. Do NOT use markdown code blocks or backticks. Return raw JSON only.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract details from this NID card accurately." },
            { type: "image_url", image_url: { url: dataURI } },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    const rawResponse = completion.choices[0].message.content.trim();
    const jsonString = rawResponse.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const extractedData = JSON.parse(jsonString);

    if (req.user) {
      logActivity(req.user._id, "nid_extracted", {});
    }

    res.json(extractedData);
  } catch (error) {
    console.error("NID Extraction error:", error);
    if (error instanceof SyntaxError) {
      return res.status(500).json({ message: "Failed to parse AI response. Please try a clearer image." });
    }
    next(error);
  }
};

// @desc    Sign a document
// @route   POST /api/documents/:documentId/sign
export const signDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { signerName } = req.body;

    if (!signerName || signerName.trim().length === 0) {
      return res.status(400).json({ message: "Signer name is required" });
    }

    const document = await Document.findById(documentId).populate('user');
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.signTokenUsed) {
      return res.status(400).json({ message: "This signing link has already been used" });
    }

    const user = document.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const timestamp = new Date().toISOString();

    const getClientIP = (req) => {
      const forwarded = req.headers['x-forwarded-for'];
      const realIP = req.headers['x-real-ip'];
      const clientIP = req.headers['x-client-ip'];
      if (forwarded) {
        const ips = forwarded.split(',').map(ip => ip.trim());
        return ips[0];
      }
      if (realIP) return realIP;
      if (clientIP) return clientIP;
      return req.socket.remoteAddress;
    };

    const ipAddress = getClientIP(req);
    const normalizedIP = ipAddress === '::1' ? '127.0.0.1' : ipAddress;

    const hashString = `${documentId}${signerName}${timestamp}${normalizedIP}`;
    const sha256Hash = crypto.createHash('sha256').update(hashString).digest('hex');

    let qrFilePath = null;
    let qrFileName = null;
    try {
      const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/signature/verify/${document._id}`;
      const ts = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      qrFileName = `qr-${document._id}-${ts}-${randomId}.png`;
      qrFilePath = `/tmp/${qrFileName}`;

      await QRCode.toFile(qrFilePath, verificationUrl, {
        type: 'png',
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
    } catch (err) {
      console.error("QR Code generation failed:", err?.message);
      qrFilePath = null;
      qrFileName = null;
    }

    const signature = {
      signerName: signerName.trim(),
      timestamp: new Date(timestamp),
      ipAddress: normalizedIP,
      sha256Hash,
      qrCodeDataUrl: qrFilePath,
    };

    document.signatures.push(signature);
    document.status = 'signed';
    document.signTokenUsed = true;
    document.signedAt = new Date(timestamp);
    await document.save();

    try {
      const userName = user?.name || "User";
      const userEmail = user?.email || "noreply@example.com";

      await sendSignatureConfirmationEmail({
        to: userEmail,
        userName,
        documentTitle: document.title,
        documentId: document._id.toString(),
        signerName,
        timestamp,
        ipAddress: normalizedIP,
        sha256Hash,
        qrFilePath,
        qrFileName,
      });

      if (qrFilePath && fs.existsSync(qrFilePath)) {
        try { fs.unlinkSync(qrFilePath); } catch {}
      }
    } catch (err) {
      console.warn("Failed to send signature confirmation email:", err?.message);
      if (qrFilePath && fs.existsSync(qrFilePath)) {
        try { fs.unlinkSync(qrFilePath); } catch {}
      }
    }

    try {
      const webhookUrl = process.env.WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Legal-Shathi-Webhook-Client/1.0' },
          body: JSON.stringify({
            event: 'signature_completed',
            data: {
              documentTitle: document.title,
              documentId: document._id.toString(),
              signerName,
              timestamp,
              ipAddress,
              sha256Hash,
              qrCodeDataUrl: qrFilePath,
              userEmail: user.email,
              userName: user.name,
            },
            timestamp: new Date().toISOString(),
          }),
        });
      }
    } catch (err) {
      console.warn("Failed to send webhook notification:", err?.message);
    }

    res.status(200).json({
      message: "Document signed successfully",
      document: {
        id: document._id,
        title: document.title,
        status: document.status,
        signedAt: document.signedAt,
        signature,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document signing page details
// @route   GET /api/documents/:documentId/sign/:token
export const getSigningPage = async (req, res, next) => {
  try {
    const { documentId, token } = req.params;

    // Find document and validate token
    const document = await Document.findById(documentId).populate('user');
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.signToken !== token) {
      return res.status(400).json({ message: "Invalid signing link" });
    }

    if (document.signTokenUsed) {
      return res.status(400).json({ message: "This signing link has already been used" });
    }

    res.json({
      document: {
        id: document._id,
        title: document.title,
        templateTitle: document.templateTitle,
        content: document.content,
        generatedAt: document.generatedAt
      },
      user: {
        name: document.user.name,
        email: document.user.email
      }
    });
  } catch (error) {
    next(error);
  }
};
