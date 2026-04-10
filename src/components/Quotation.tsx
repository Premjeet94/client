import {
  forwardRef,
  useMemo,
} from "react";
import logo from "@/assets/logo.png";
import adda247 from "@/assets/clients/adda247.jpeg";
import agrizy from "@/assets/clients/agrizy.png";
import flipkart from "@/assets/clients/flipkart.png";
import plum from "@/assets/clients/plum.webp";
import studyiq from "@/assets/clients/studyiq.png";
import trulymadly from "@/assets/clients/trulymadly.png";
import growthschool from "@/assets/clients/growthschool.png";
import luvfilms from "@/assets/clients/luvfilms.png";

import QuotationHeader from "./quotation/QuotationHeader";
import PlanDetails from "./quotation/PlanDetails";
import ChargesTable from "./quotation/ChargesTable";
import TotalSection from "./quotation/TotalSection";
import ItemBreakdown from "./quotation/ItemBreakdown";
import NotesTerms from "./quotation/NotesTerms";
import PaymentSection from "./quotation/PaymentSection";
import LogoStrip from "./quotation/LogoStrip";
import { PlanType, PlanConfig, QuotationData, PricingData, ClientLogo, QuotationItem, LocationItem, planConfig } from "./quotation/types";

export type { PlanType };

export interface QuotationProps {
  quotationNo: string;
  date: string;
  clientName: string;
  clientCompany: string;
  clientMobile: string;
  clientEmail: string;
  plan?: PlanType;
  items?: QuotationItem[];
  totalAmount?: number;
  validityDays?: number | string;
  consultantName?: string;
  consultantAddress?: string;
  consultantPhone?: string;
  consultantEmail?: string;

  customCharges?: Record<string, number | undefined>;
}

const clientLogos: ClientLogo[] = [
  { name: "Luv Films", logo: luvfilms },
  { name: "Growth School", logo: growthschool },
  { name: "Study IQ", logo: studyiq },
  { name: "Agrizy", logo: agrizy },
  { name: "Flipkart", logo: flipkart },
  { name: "Adda247", logo: adda247 },
  { name: "Truly Madly", logo: trulymadly },
  { name: "Plum", logo: plum },
];

const Quotation = forwardRef<HTMLDivElement, QuotationProps>(
  (
    {
      quotationNo = "FA-VO-2025-001",
      date = "26 March 2026",
      clientName = "Mr. Rajesh Kumar",
      clientCompany = "Kumar Enterprises Pvt. Ltd.",
      clientMobile = "+91 98765 43210",
      clientEmail = "rajesh@kumarenterprises.in",
      plan = "business-registration",
      validityDays = 7,
      consultantName = "Flashspace Consultant",
      consultantAddress = "123, Business Hub, MG Road\nMumbai, Maharashtra – 400001",
      consultantPhone = "+91 22 1234 5678",
      consultantEmail = "info@flashspace.in",

      customCharges,
      items = [],
      totalAmount: propTotalAmount,
    },
    ref
  ) => {
    const displayPlan = plan || items[0]?.planType || "business-registration";
    const currentPlan = planConfig[displayPlan as PlanType];

    const finalCharges = useMemo(
      () =>
        currentPlan.charges.map((c) => ({
          description: c.description,
          amount: customCharges ? customCharges[c.description] : c.amount,
        })),
      [currentPlan, customCharges]
    );

    const itemsForPricing = items;
    const hasLocationItems = itemsForPricing.length > 0;
    const gstRate = 18 / 100;
    const calculatedAdditional = finalCharges.reduce((acc, c) => acc + (c.amount || 0), 0);
    const additionalCharges = calculatedAdditional;

    const itemSubtotal = itemsForPricing.reduce(
      (sum, item) => sum + item.finalPrice * (item.quantity || 1),
      0
    );
    const subtotalBase = (hasLocationItems ? itemSubtotal : Math.max(0, propTotalAmount || 0)) + additionalCharges;
    const calculatedGstAmount = Math.round(subtotalBase * gstRate);
    const totalPayable = subtotalBase + calculatedGstAmount;
    const subtotal = subtotalBase;
    const gstAmount = calculatedGstAmount;

    const quotationData: QuotationData = useMemo(
      () => ({
        quotationNo,
        date,
        clientName,
        clientCompany,
        clientMobile,
        clientEmail,
        validityDays,
        consultantName,
        consultantAddress,
        consultantPhone,
        consultantEmail,
        plan: displayPlan as PlanType,
        items,
        totalAmount: propTotalAmount,
        logoSrc: logo,
      }),
      [
        quotationNo, date, clientName, clientCompany, clientMobile, clientEmail,
        validityDays, consultantName, consultantAddress, consultantPhone, consultantEmail,
        plan, items, propTotalAmount
      ]
    );

    const pricing: PricingData = useMemo(
      () => ({
        additionalCharges,
        gstRate,
        subtotal,
        gstAmount,
        totalPayable,
        monthlyPrice: subtotal,
        yearlyPrice: totalPayable,
      }),
      [additionalCharges, gstRate, subtotal, gstAmount, totalPayable]
    );

    return (
      <div ref={ref} className="bg-slate-50 print:bg-white w-full print:m-0 print:p-0">
        <div className="max-w-[210mm] mx-auto bg-white min-h-[297mm] shadow-xl print:shadow-none print:w-full print:max-w-none box-border p-8 sm:p-12 print:p-[12mm_15mm]">
          
          {/* 1. Header Control: Render main header ONLY ONCE at the top */}
          <header className="mb-6">
            <QuotationHeader data={quotationData} plan={currentPlan} />
            <div className="border-t-2 border-primary my-4" />
            <div className="bg-primary text-primary-foreground text-center py-3 px-4 rounded shadow-sm max-w-3xl mx-auto">
              <h1 className="text-base font-bold tracking-wide uppercase m-0">
                Quotation for Virtual Office - {currentPlan.title}
              </h1>
            </div>
          </header>

          {/* 2. Section Grouping & 5. Layout Flow */}
          <main className="flex flex-col gap-6 text-slate-800">
            
            {/* Locations & Pricing Group */}
            <div className="flex flex-col gap-4">
              {hasLocationItems ? (
                <ItemBreakdown items={itemsForPricing} plan={plan} />
              ) : (
                <PlanDetails plan={currentPlan} pricing={pricing} items={itemsForPricing} />
              )}


            </div>

            <div className="break-inside-avoid print:break-inside-avoid">
              <ChargesTable charges={finalCharges} />
            </div>

            <div className="break-inside-avoid print:break-inside-avoid">
              <TotalSection pricing={pricing} items={itemsForPricing} />
            </div>

            <div className="break-inside-avoid print:break-inside-avoid">
              <NotesTerms />
            </div>

            <section className="border border-border rounded p-4 text-sm break-inside-avoid print:break-inside-avoid">
              <p className="m-0 text-muted-foreground">For Flashspace</p>
              <div className="h-12" />
              <p className="m-0 font-semibold text-foreground">{consultantName}</p>
              <p className="m-0 text-muted-foreground">{consultantPhone}</p>
              <p className="m-0 text-muted-foreground">{consultantEmail}</p>
            </section>

            {/* 3. Page Break Optimization: Only before large sections where contextual split is natural */}
            <div className="flex flex-col gap-6 print:break-before-page">
              <div className="border border-dashed border-border rounded px-4 py-3 text-xs text-muted-foreground bg-secondary/40 break-inside-avoid print:break-inside-avoid">
                Need a tweak to the {currentPlan.shortName}? We can adjust documentation and pricing per city—reach out to your consultant for a tailored option.
              </div>

              <section className="border border-border rounded overflow-hidden break-inside-avoid print:break-inside-avoid">
                <div className="bg-primary/10 px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider m-0">Quick Checklist</h3>
                </div>
                <div className="p-4 text-sm text-muted-foreground grid grid-cols-2 gap-4 m-0">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground text-xs m-0">Documents you provide</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>ID & Address proofs</li>
                      <li>PAN & GST (if any)</li>
                      <li>Company constitution docs</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground text-xs m-0">We deliver</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>NOC & Utility bill</li>
                      <li>Rent/Service agreement</li>
                      <li>Stamping & notarization</li>
                    </ul>
                  </div>
                </div>
              </section>

              <div className="break-inside-avoid print:break-inside-avoid">
                <PaymentSection consultantEmail={consultantEmail} />
              </div>

              <div className="grid grid-cols-2 gap-6 break-inside-avoid print:break-inside-avoid">
                <section className="border border-border rounded overflow-hidden flex flex-col">
                  <div className="bg-primary/10 px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider m-0">
                      Why Choose Us
                    </h3>
                  </div>
                  <ul className="p-4 space-y-2 text-sm m-0">
                    <li>✔ Served 5000+ clients across India</li>
                    <li>✔ 95% client satisfaction rate</li>
                    <li>✔ Trusted by top brands and MNCs</li>
                    <li>✔ Expert legal documentation team</li>
                    <li>✔ 24/7 dedicated support desk</li>
                  </ul>
                </section>

                <section className="border border-border rounded overflow-hidden flex flex-col">
                  <div className="bg-primary/10 px-4 py-3 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider m-0">
                      Pan-India Presence
                    </h3>
                    <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold uppercase m-0">
                      70+ Cities
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground mb-4 font-medium italic m-0">
                      We offer high-speed compliance and address support in 70+ locations.
                    </p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm font-semibold text-slate-800">
                      <div className="flex items-center gap-2">📍 Mumbai</div>
                      <div className="flex items-center gap-2">📍 Delhi NCR</div>
                      <div className="flex items-center gap-2">📍 Bangalore</div>
                      <div className="flex items-center gap-2">📍 Hyderabad</div>
                      <div className="flex items-center gap-2">📍 Pune</div>
                      <div className="flex items-center gap-2">📍 Chennai</div>
                    </div>
                  </div>
                </section>
              </div>

              <section className="bg-accent/10 border border-accent/20 rounded p-6 text-center shadow-inner break-inside-avoid print:break-inside-avoid">
                <h3 className="text-base font-bold text-primary mb-2 uppercase tracking-wide m-0">
                  Ready to scale your business?
                </h3>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed mt-2 m-0">
                  Unlock professional addresses and physical space credentials within hours. Join
                  5,000+ businesses who rely on Flashspace for their corporate identity.
                </p>
              </section>

              <div className="border-t border-border mt-4 pt-6 break-inside-avoid print:break-inside-avoid">
                <LogoStrip logos={clientLogos} />
                <p className="text-xs text-center text-muted-foreground mt-4 uppercase tracking-[0.3em] font-medium m-0">
                  Trusted by 5000+ Businesses Across India
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
);

Quotation.displayName = "Quotation";

export default Quotation;
