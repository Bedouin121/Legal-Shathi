import mongoose from "mongoose";
import dotenv from "dotenv";
import Template from "../models/Template.js";

dotenv.config();

const templates = [
  {
    title: "Property Sale Agreement",
    description: "A comprehensive agreement template for buying and selling residential or commercial property in Bangladesh.",
    category: "Property",
    languages: ["EN", "BN"],
    isFree: false,
    isPopular: true,
  },
  {
    title: "Rental Agreement",
    description: "Standard rental agreement for landlords and tenants covering terms, conditions, and obligations.",
    category: "Property",
    languages: ["EN", "BN"],
    isFree: true,
    isPopular: true,
  },
  {
    title: "Business Partnership Deed",
    description: "Legal template for establishing partnership terms including profit sharing, roles, and responsibilities.",
    category: "Business",
    languages: ["EN"],
    isFree: false,
    isPopular: true,
  },
  {
    title: "Non-Disclosure Agreement",
    description: "Protect confidential business information with this professionally drafted NDA template.",
    category: "Business",
    languages: ["EN", "BN"],
    isFree: true,
    isPopular: false,
  },
  {
    title: "Last Will & Testament",
    description: "Create a legally binding will to ensure your assets are distributed according to your wishes.",
    category: "Personal",
    languages: ["EN", "BN"],
    isFree: false,
    isPopular: true,
  },
  {
    title: "Power of Attorney",
    description: "Authorize someone to act on your behalf in legal, financial, or personal matters.",
    category: "Personal",
    languages: ["EN"],
    isFree: false,
    isPopular: false,
  },
  {
    title: "Marriage Registration Form",
    description: "Official marriage registration document template as per Bangladesh family law requirements.",
    category: "Family",
    languages: ["EN", "BN"],
    isFree: true,
    isPopular: true,
  },
  {
    title: "Divorce Agreement",
    description: "Mutual divorce agreement template covering custody, alimony, and asset division terms.",
    category: "Family",
    languages: ["BN"],
    isFree: false,
    isPopular: false,
  },
  {
    title: "Employment Contract",
    description: "Standard employment agreement covering salary, benefits, responsibilities, and termination clauses.",
    category: "Employment",
    languages: ["EN", "BN"],
    isFree: true,
    isPopular: true,
  },
  {
    title: "Termination Letter",
    description: "Professional termination letter template compliant with Bangladesh labor laws and regulations.",
    category: "Employment",
    languages: ["EN"],
    isFree: true,
    isPopular: false,
  },
  {
    title: "Land Registration Document",
    description: "Complete land registration and transfer document template for property ownership changes.",
    category: "Property",
    languages: ["EN", "BN"],
    isFree: false,
    isPopular: true,
  },
  {
    title: "Company Registration Form",
    description: "Template for registering a new company with all required legal documentation and details.",
    category: "Business",
    languages: ["EN", "BN"],
    isFree: false,
    isPopular: false,
  },
];

const seedTemplates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await Template.deleteMany({});
    console.log("🗑️  Cleared existing templates");

    const created = await Template.insertMany(templates);
    console.log(`✅ Seeded ${created.length} templates`);

    await mongoose.disconnect();
    console.log("✅ Done! Disconnected.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seedTemplates();
