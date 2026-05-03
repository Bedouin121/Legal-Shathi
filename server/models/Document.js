import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Document content is required"],
    },
    templateTitle: {
      type: String,
      required: [true, "Template title is required"],
    },
    formData: {
      type: Object,
      required: [true, "Form data is required"],
    },
    language: {
      type: String,
      enum: ["english", "bengali"],
      default: "english",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    status: {
      type: String,
      enum: ["draft", "generated", "pending_signature", "signed", "fully_signed"],
      default: "generated",
    },
    // Multi-party signature fields
    requiresSecondParty: { type: Boolean, default: false },
    firstPartyLabel: { type: String, default: 'First Party' },
    secondPartyLabel: { type: String, default: 'Second Party' },
    secondPartyEmail: { type: String, default: null },
    secondPartySignToken: { type: String, default: null },
    secondPartySignTokenUsed: { type: Boolean, default: false },
    secondPartySigned: { type: Boolean, default: false },
    secondPartySignerName: { type: String, default: null },
    secondPartyTimestamp: { type: Date, default: null },
    secondPartyIpAddress: { type: String, default: null },
    bothPartiesSigned: { type: Boolean, default: false },
    signToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    signTokenUsed: {
      type: Boolean,
      default: false,
    },
    signatures: [
      {
        signerName: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        ipAddress: {
          type: String,
        },
        sha256Hash: {
          type: String,
          required: true,
        },
        qrCodeDataUrl: {
          type: String,
        },
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    signedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate sign token before saving if document is generated and doesn't have one
documentSchema.pre("save", function (next) {
  if (
    (this.isModified("status") && 
     (this.status === "generated" || this.status === "pending_signature") && 
     !this.signToken) ||
    (!this.signToken && this.isNew)
  ) {
    // Generate a unique token for signing
    this.signToken = this._id.toString() + Date.now().toString(36);
  }
  next();
});

const Document = mongoose.model("Document", documentSchema);
export default Document;
