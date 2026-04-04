import {
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
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
import NotesTerms from "./quotation/NotesTerms";
import PaymentSection from "./quotation/PaymentSection";
import LogoStrip from "./quotation/LogoStrip";
import { Page, PageContent, PageFooter, PageHeader } from "./quotation/PageLayout";
import { PlanType, PlanConfig, QuotationData, PricingData, ClientLogo } from "./quotation/types";
import { BRANDING } from "../constants/branding";

export type { PlanType };

interface PaginationBlock {
  id: string;
  node: ReactNode;
}

interface PaginationChapter {
  id: string;
  header?: ReactNode;
  footer?: ReactNode;
  blocks: PaginationBlock[];
  contentClassName?: string;
}

interface PaginatedChapter extends Omit<PaginationChapter, "blocks"> {
  pages: PaginationBlock[][];
}

const FALLBACK_GAP_PX = 16;

function buildFallbackPagination(chapters: PaginationChapter[]): PaginatedChapter[] {
  return chapters.map((chapter) => ({
    id: chapter.id,
    header: chapter.header,
    footer: chapter.footer,
    contentClassName: chapter.contentClassName,
    pages: [chapter.blocks],
  }));
}

function buildPaginationSignature(chapters: PaginatedChapter[]): string {
  return chapters
    .map((chapter) =>
      `${chapter.id}:${chapter.pages
        .map((page) => page.map((block) => block.id).join(","))
        .join("|")}`
    )
    .join(";");
}

function paginateChapterBlocks(
  blocks: PaginationBlock[],
  blockHeights: Record<string, number>,
  maxHeight: number,
  gapPx: number
): PaginationBlock[][] {
  if (maxHeight <= 0 || blocks.length === 0) {
    return [blocks];
  }

  const pages: PaginationBlock[][] = [];
  let currentPage: PaginationBlock[] = [];
  let usedHeight = 0;

  blocks.forEach((block) => {
    const nextHeight = Math.max(0, Math.ceil(blockHeights[block.id] ?? 0));
    const gapCost = currentPage.length > 0 ? gapPx : 0;
    const canFit = currentPage.length === 0 || usedHeight + gapCost + nextHeight <= maxHeight;

    if (!canFit) {
      pages.push(currentPage);
      currentPage = [block];
      usedHeight = nextHeight;
      return;
    }

    if (currentPage.length > 0) {
      usedHeight += gapPx;
    }

    currentPage.push(block);
    usedHeight += nextHeight;
  });

  if (currentPage.length > 0 || pages.length === 0) {
    pages.push(currentPage);
  }

  return pages;
}

export interface QuotationProps {
  quotationNo: string;
  date: string;
  clientName: string;
  clientCompany: string;
  clientMobile: string;
  clientEmail: string;
  plan?: PlanType;
  validityDays?: number | string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  additionalCharges?: number;
  consultantName?: string;
  consultantAddress?: string;
  consultantPhone?: string;
  consultantEmail?: string;
  customCharges?: Record<string, number | undefined>;
}

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
      { description: "Current account opening assistance", amount: 2000 },
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
      { description: "Current account opening assistance", amount: 2000 },
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
      { description: "Current account opening assistance", amount: 2000 },
    ],
  },
};

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
      quotationNo = `${BRANDING.QUOTATION_PREFIX}-2026-001`,
      date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      clientName = "Client Name",
      clientCompany = "Company Name",
      clientMobile = "+91 ",
      clientEmail = "client@email.com",
      plan = "mailing",
      validityDays = 7,
      consultantName = "Consultant Name",
      consultantAddress = BRANDING.BASE_OFFICE_ADDRESS,
      consultantPhone = BRANDING.SUPPORT_PHONE,
      consultantEmail = BRANDING.INFO_EMAIL,
      customCharges,
      monthlyPrice: propMonthlyPrice,
      yearlyPrice: propYearlyPrice,
      additionalCharges: propAdditionalCharges,
    },
    ref
  ) => {
    const currentPlan = planConfig[plan];

    const finalCharges = useMemo(
      () =>
        currentPlan.charges.map((c) => ({
          description: c.description,
          amount: customCharges ? customCharges[c.description] : c.amount,
        })),
      [currentPlan, customCharges]
    );

    const monthlyPrice = propMonthlyPrice ?? 1999;
    const yearlyPrice = propYearlyPrice ?? (monthlyPrice * 12);
    const gstRate = 0.18;
    const calculatedAdditional = finalCharges.reduce((acc, c) => acc + (c.amount || 0), 0);
    const additionalCharges = propAdditionalCharges ?? calculatedAdditional;
    const subtotal = yearlyPrice + additionalCharges;
    const gstAmount = Math.round(subtotal * gstRate);
    const totalPayable = subtotal + gstAmount;

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
        plan,
        logoSrc: logo,
      }),
      [
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
        plan,
      ]
    );

    const pricing: PricingData = useMemo(
      () => ({
        monthlyPrice,
        yearlyPrice,
        additionalCharges,
        gstRate,
        subtotal,
        gstAmount,
        totalPayable,
      }),
      [
        monthlyPrice,
        yearlyPrice,
        additionalCharges,
        gstRate,
        subtotal,
        gstAmount,
        totalPayable,
      ]
    );

    const chapters = useMemo<PaginationChapter[]>(
      () => [
        {
          id: "plan",
          contentClassName: "gap-4",
          header: (
            <>
              <QuotationHeader data={quotationData} plan={currentPlan} />
              <div className="border-t-2 border-primary" />
              <div className="bg-primary text-primary-foreground text-center py-3 px-4 rounded shadow-sm max-w-3xl mx-auto">
                <h1 className="text-base font-bold tracking-wide uppercase m-0">
                  Quotation for Virtual Office - {currentPlan.title}
                </h1>
              </div>
            </>
          ),
          blocks: [
            {
              id: "plan-details",
              node: <PlanDetails plan={currentPlan} pricing={pricing} />,
            },
            {
              id: "plan-contact",
              node: (
                <div className="border border-dashed border-border rounded px-3 py-2 text-[11px] text-muted-foreground bg-secondary/40">
                  Need a tweak to the {currentPlan.shortName}? We can adjust documentation and pricing per city—reach out to your consultant for a tailored option.
                </div>
              ),
            },
            {
              id: "plan-checklist",
              node: (
                <section className="border border-border rounded overflow-hidden">
                  <div className="bg-primary/10 px-3 py-2 border-b border-border">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider m-0">Quick Checklist</h3>
                  </div>
                  <div className="p-3 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground text-[11px] m-0">Documents you provide</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>ID & Address proofs</li>
                        <li>PAN & GST (if any)</li>
                        <li>Company constitution docs</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground text-[11px] m-0">We deliver</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>NOC & Utility bill</li>
                        <li>Rent/Service agreement</li>
                        <li>Stamping & notarization</li>
                      </ul>
                    </div>
                  </div>
                </section>
              ),
            },
          ],
        },
        {
          id: "charges",
          contentClassName: "gap-4",
          header: (
            <div className="bg-primary text-primary-foreground text-center py-3 px-4 rounded shadow-sm">
              <h2 className="text-base font-bold tracking-wide uppercase">
                Additional / Government Charges
              </h2>
            </div>
          ),
          blocks: [
            {
              id: "charges-table",
              node: <ChargesTable charges={finalCharges} />,
            },
            {
              id: "total-section",
              node: <TotalSection pricing={pricing} />,
            },
            {
              id: "notes-terms",
              node: <NotesTerms />,
            },
          ],
        },
        {
          id: "payment",
          contentClassName: "gap-2",
          blocks: [
            {
              id: "payment-section",
              node: <PaymentSection consultantEmail={consultantEmail} />,
            },
            {
              id: "trust-section",
              node: (
                <div className="grid grid-cols-2 gap-6">
                  <section className="border border-border rounded overflow-hidden flex flex-col">
                    <div className="bg-primary/10 px-4 py-2 border-b border-border">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                        Why Choose Us
                      </h3>
                    </div>
                    <ul className="p-4 space-y-2 text-sm">
                      {BRANDING.TRUST_STATS.map((stat, i) => (
                        <li key={i}>{stat}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="border border-border rounded overflow-hidden flex flex-col">
                    <div className="bg-primary/10 px-4 py-2 border-b border-border flex justify-between items-center">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                        Pan-India Presence
                      </h3>
                      <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                        {BRANDING.TOTAL_CITIES} Cities
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-center">
                      <p className="text-[11px] text-muted-foreground mb-4 font-medium italic">
                        We offer high-speed compliance and address support in {BRANDING.TOTAL_CITIES} locations.
                      </p>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[13px] font-semibold text-slate-800">
                        {BRANDING.OFFICE_LOCATIONS.map((loc, i) => (
                          <div key={i} className="flex items-center gap-2">{loc}</div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              ),
            },
            {
              id: "ready-banner",
              node: (
                <section className="bg-accent/10 border border-accent/20 rounded p-6 text-center shadow-inner">
                  <h3 className="text-base font-bold text-primary mb-2 uppercase tracking-wide">
                    {BRANDING.READY_BANNER.TITLE}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    {BRANDING.READY_BANNER.DESCRIPTION}
                  </p>
                </section>
              ),
            },
            {
              id: "logo-strip",
              node: (
                <div className="border-t border-border">
                  <LogoStrip logos={clientLogos} />
                  <p className="text-[10px] text-center text-muted-foreground mt-2 uppercase tracking-[0.3em]">
                    Trusted by 500+ Businesses Across India
                  </p>
                </div>
              ),
            },
          ],
        },
      ],
      [quotationData, currentPlan, pricing, finalCharges, consultantEmail]
    );

    const fallbackPagination = useMemo(() => buildFallbackPagination(chapters), [chapters]);
    const measureRef = useRef<HTMLDivElement>(null);
    const signatureRef = useRef<string>(buildPaginationSignature(fallbackPagination));
    const [paginatedChapters, setPaginatedChapters] =
      useState<PaginatedChapter[]>(fallbackPagination);

    const recalculatePagination = useCallback(() => {
      const measureRoot = measureRef.current;
      if (!measureRoot) {
        return;
      }

      const nextPagination = chapters.map<PaginatedChapter>((chapter) => {
        const chapterNode = measureRoot.querySelector<HTMLElement>(
          `[data-measure-chapter="${chapter.id}"]`
        );
        const contentNode = chapterNode?.querySelector<HTMLElement>("[data-measure-content]");
        const availableHeight = contentNode?.clientHeight ?? 0;
        const computedGap = contentNode
          ? Number.parseFloat(window.getComputedStyle(contentNode).rowGap || "0")
          : FALLBACK_GAP_PX;
        const gapPx = Number.isFinite(computedGap) ? computedGap : FALLBACK_GAP_PX;

        const blockHeights = chapter.blocks.reduce<Record<string, number>>((acc, block) => {
          const blockNode = chapterNode?.querySelector<HTMLElement>(
            `[data-measure-block-id="${block.id}"]`
          );
          acc[block.id] = blockNode?.offsetHeight ?? 0;
          return acc;
        }, {});

        return {
          id: chapter.id,
          header: chapter.header,
          footer: chapter.footer,
          contentClassName: chapter.contentClassName,
          pages: paginateChapterBlocks(chapter.blocks, blockHeights, availableHeight, gapPx),
        };
      });

      const nextSignature = buildPaginationSignature(nextPagination);
      if (nextSignature !== signatureRef.current) {
        signatureRef.current = nextSignature;
        setPaginatedChapters(nextPagination);
      }
    }, [chapters]);

    useLayoutEffect(() => {
      signatureRef.current = "";
      const frameId = window.requestAnimationFrame(() => {
        recalculatePagination();
      });
      return () => window.cancelAnimationFrame(frameId);
    }, [recalculatePagination]);

    useEffect(() => {
      const onResize = () => {
        recalculatePagination();
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, [recalculatePagination]);

    useEffect(() => {
      const fontSet = (document as Document & {
        fonts?: {
          ready: Promise<unknown>;
        };
      }).fonts;

      if (!fontSet?.ready) {
        return;
      }

      let active = true;
      void fontSet.ready.then(() => {
        if (active) {
          recalculatePagination();
        }
      });

      return () => {
        active = false;
      };
    }, [recalculatePagination]);

    useEffect(() => {
      const measureRoot = measureRef.current;
      if (!measureRoot) {
        return;
      }

      const images = Array.from(measureRoot.querySelectorAll("img")).filter(
        (img) => !img.complete
      );
      if (images.length === 0) {
        return;
      }

      const onImageLoad = () => {
        recalculatePagination();
      };

      images.forEach((image) => {
        image.addEventListener("load", onImageLoad);
        image.addEventListener("error", onImageLoad);
      });

      return () => {
        images.forEach((image) => {
          image.removeEventListener("load", onImageLoad);
          image.removeEventListener("error", onImageLoad);
        });
      };
    }, [chapters, recalculatePagination]);

    const pages = useMemo(
      () =>
        paginatedChapters.flatMap((chapter) =>
          chapter.pages.map((blocks, pageIndex) => ({
            chapterId: chapter.id,
            pageKey: `${chapter.id}-${pageIndex + 1}`,
            header: chapter.header,
            footer: chapter.footer,
            blocks,
            contentClassName: chapter.contentClassName,
          }))
        ),
      [paginatedChapters]
    );

    return (
      <div ref={ref} className="quotation-root bg-slate-50 print:bg-white">
        <div className="quotation-pages">
          {pages.map((page) => (
            <Page key={page.pageKey}>
              <div className="page-frame">
                <PageHeader>{page.header}</PageHeader>
                <PageContent className={page.contentClassName}>
                  {page.blocks.map((block) => (
                    <div key={block.id} className="page-block">
                      {block.node}
                    </div>
                  ))}
                </PageContent>
                <PageFooter>{page.footer}</PageFooter>
              </div>
            </Page>
          ))}
        </div>

        <div ref={measureRef} className="quotation-measure-layer" aria-hidden="true">
          {chapters.map((chapter) => (
            <Page key={`measure-${chapter.id}`} className="page--measure" data-measure-chapter={chapter.id}>
              <div className="page-frame">
                <PageHeader data-measure-header>{chapter.header}</PageHeader>
                <PageContent className={chapter.contentClassName} data-measure-content>
                  {chapter.blocks.map((block) => (
                    <div key={block.id} className="page-block" data-measure-block-id={block.id}>
                      {block.node}
                    </div>
                  ))}
                </PageContent>
                <PageFooter data-measure-footer>{chapter.footer}</PageFooter>
              </div>
            </Page>
          ))}
        </div>

        <style>{`
          @page {
            size: A4;
            margin: 0;
          }

          .quotation-root {
            width: 100%;
          }

          .quotation-pages {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            padding: 8px 0 20px;
          }

          .page {
            width: 210mm;
            height: 297mm;
            box-sizing: border-box;
            overflow: hidden;
            background: white;
            display: flex;
            flex-direction: column;
          }

          .page-frame {
            flex: 1 1 auto;
            min-height: 0;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            padding: 12mm 15mm;
            display: flex;
            flex-direction: column;
          }

          .page-header,
          .page-footer {
            flex: 0 0 auto;
            min-height: 0;
          }

          .page-content {
            flex: 1 1 auto;
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .page-block {
            min-width: 0;
          }

          .page-content table {
            width: 100%;
            table-layout: fixed;
          }

          .page-content td,
          .page-content th,
          .page-content p,
          .page-content li,
          .page-content span {
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .page-content img,
          .page-header img,
          .page-footer img {
            max-width: 100%;
            height: auto;
            object-fit: contain;
          }

          .quotation-measure-layer {
            position: fixed;
            left: -10000px;
            top: 0;
            visibility: hidden;
            pointer-events: none;
            z-index: -1;
          }

          .page--measure {
            margin: 0 !important;
            box-shadow: none !important;
          }

          @media screen {
            .page {
              margin: 0 auto;
              box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
            }
          }

          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .quotation-pages {
              gap: 0 !important;
              padding: 0 !important;
            }

            .quotation-measure-layer {
              display: none !important;
            }

            .page {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              display: flex !important;
              flex-direction: column !important;
              page-break-after: always !important;
              break-after: page !important;
            }

            .quotation-pages > .page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          }
        `}</style>
      </div>
    );
  }
);

Quotation.displayName = "Quotation";

export default Quotation;
