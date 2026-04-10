export type PlanType = "mailing" | "gst" | "business-registration";

export interface QuotationItem {
  locationId: string;
  cityName: string;
  officeAddress: string;
  planType?: PlanType;
  quantity: number;
  planPrice: number;
  discount: {
    type: "percentage" | "flat";
    value: number;
  };
  finalPrice: number;
}

export type LocationItem = QuotationItem;

export interface QuotationData {
  quotationNo: string;
  date: string;
  clientName: string;
  clientCompany: string;
  clientMobile: string;
  clientEmail: string;
  validityDays: number | string;
  consultantName: string;
  consultantAddress: string;
  consultantPhone: string;
  consultantEmail: string;
  plan?: PlanType;
  items?: QuotationItem[];
  totalAmount?: number;
  logoSrc: string;
}

export interface PlanConfig {
  title: string;
  shortName: string;
  services: string[];
  charges: { description: string; amount?: number }[];
}

export interface PricingData {
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  totalPayable: number;
  additionalCharges?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
}

export interface ClientLogo {
  name: string;
  logo: string;
  bgClass?: string;
}

export const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const PLAN_LABELS: Record<PlanType, string> = {
  mailing: "Mailing Plan",
  "business-registration": "Business Registration Plan",
  gst: "GST Registration Plan",
};

/** Centralized pricing logic — shared across all components */
export const getPlanPrice = (loc: any, plan: PlanType): number => {
  if (!loc || !plan || !loc.pricing) return 0;
  
  if (plan === "mailing") return loc.pricing.mailingPrice || 0;
  if (plan === "business-registration") return loc.pricing.brPrice || 0;
  if (plan === "gst") return loc.pricing.gstPrice || 0;
  
  return 0;
};

export const planConfig: Record<PlanType, PlanConfig> = {
  mailing: {
    title: "Mailing Plan",
    shortName: "Mailing Plan",
    services: [
      "Business mailing address",
      "Mail receiving & forwarding",
      "Courier handling support",
      "Address for business correspondence",
      "Rent Agreement / Service Agreement",
      "Documentation support",
    ],
    charges: [
      { description: "Agreement charges" },
      { description: "Stamp paper charges" },
      { description: "Notary charges" },
      { description: "Courier handling charges" },
      { description: "Mail forwarding charges" },
      { description: "Documentation charges" },
      { description: "Current account opening assistance" },
    ],
  },
  gst: {
    title: "GST Registration Plan",
    shortName: "GST Plan",
    services: [
      "Address for GST registration",
      "NOC provided",
      "Utility bill provided",
      "GST registration support",
      "Department query handling",
      "Rent Agreement / Service Agreement",
      "Mail handling support",
    ],
    charges: [
      { description: "Agreement charges" },
      { description: "Stamp paper charges" },
      { description: "Notary charges" },
      { description: "NOC preparation" },
      { description: "Utility bill preparation" },
      { description: "GST registration support" },
      { description: "Department query handling" },
      { description: "Documentation charges" },
      { description: "Current account opening assistance" },
    ],
  },
  "business-registration": {
    title: "Business Registration Plan",
    shortName: "BR Plan",
    services: [
      "Address for Company Registration",
      "Address for GST / MCA / Bank use",
      "NOC provided",
      "Utility bill provided",
      "Rent Agreement / Service Agreement",
      "Mail handling support",
    ],
    charges: [
      { description: "DSC charges" },
      { description: "DIN charges" },
      { description: "Name approval fees" },
      { description: "Government filing fees" },
      { description: "PAN / TAN charges" },
      { description: "GST / PT registration" },
      { description: "Stamp paper charges" },
      { description: "Notary charges" },
      { description: "Current account opening assistance" },
    ],
  },
};
