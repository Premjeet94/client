export type PlanType = "mailing" | "gst" | "business-registration";

export interface QuotationData {
  id: string;
  quotationNo: string;
  date: string;
  clientName: string;
  clientCompany: string;
  clientMobile: string;
  clientEmail: string;
  city: string;
  plan: PlanType;
  validityDays: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  customCharges?: Record<string, number | undefined>;
  consultantName: string;
  consultantPhone: string;
  consultantEmail: string;
  consultantAddress: string;
}

export interface WhatsAppResponse {
  success: true;
  messageIds: {
    text: string;
    pdf: string;
  };
  quotationId: string;
}

export interface SendQuotationPayload {
  clientName: string;
  clientMobile: string;
  clientEmail: string;
  companyName: string;
  pdfUrl: string;
  quotationNumber: string;
  totalAmount: number;
  validityDays: number;
  planType: string;
  services: string[];
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}
