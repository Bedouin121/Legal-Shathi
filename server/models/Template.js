import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Template title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Template description is required"],
    },
    category: {
      type: String,
      required: true,
      enum: ["Business", "Personal", "Property", "Family", "Employment"],
    },
    languages: {
      type: [String],
      default: ["EN"],
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Text index for search
templateSchema.index({ title: "text", description: "text" });

const Template = mongoose.model("Template", templateSchema);
export default Template;
