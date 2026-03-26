export type PlanType = "mailing" | "gst" | "business-registration";

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
  plan: PlanType;
  logoSrc: string;
}

export interface PlanConfig {
  title: string;
  shortName: string;
  services: string[];
  charges: { description: string; amount?: number }[];
}

export interface PricingData {
  monthlyPrice: number;
  yearlyPrice: number;
  additionalCharges: number;
  gstRate: number;
  subtotal: number;
  gstAmount: number;
  totalPayable: number;
}

export interface ClientLogo {
  name: string;
  logo: string;
  bgClass?: string;
}

export const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
