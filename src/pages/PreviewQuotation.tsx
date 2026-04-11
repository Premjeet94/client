import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { ArrowLeft, CheckCircle2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import Quotation, { QuotationProps } from "@/components/Quotation";
import { QuotationItem } from "@/components/quotation/types";
import { API_URL } from "@/config";
import {
  getPublicQuotation,
  getQuotationById,
} from "@/api/quotation";

interface BackendQuotationItem {
  locationId?: string | { _id?: string };
  cityName?: string;
  officeAddress?: string;
  planPrice?: number;
  discount?: {
    type?: "percentage" | "flat";
    value?: number;
  };
  finalPrice?: number;
  quantity?: number;
}

interface BackendQuotation {
  _id: string;
  quotationNo: string;
  date: string;
  clientName: string;
  clientCompany: string;
  clientMobile: string;
  clientEmail: string;
  validityDays?: number;
  consultantName?: string;
  consultantAddress?: string;
  consultantPhone?: string;
  consultantEmail?: string;
  totalAmount?: number;
  status?: string;
  plan?: string;
  items?: BackendQuotationItem[];
}

const formatDate = (dateValue?: string) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function PreviewQuotation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const quotationRef = useRef<HTMLDivElement>(null);
  
  // Detection for Puppeteer/Server-side rendering
  const queryParams = new URLSearchParams(location.search);
  const isPrintMode = queryParams.get("print") === "true";

  const [data, setData] = useState<BackendQuotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isConsultant = !!localStorage.getItem("token");

  const handlePrint = useReactToPrint({
    contentRef: quotationRef,
    documentTitle: `Quotation_${data?.quotationNo || id}`,
  });

  const handleServerDownload = useCallback(() => {
    if (!id) return;
    window.location.href = `${API_URL}/api/quotations/${id}/pdf`;
  }, [id]);

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!id) {
        setError("Quotation ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = isConsultant
          ? await getQuotationById(id)
          : await getPublicQuotation(id);

        setData(response.data);
      } catch (fetchError: any) {
        const message = fetchError?.response?.data?.message || "Failed to load quotation";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchQuotation();
  }, [id, isConsultant]);

  const mappedItems: QuotationItem[] = useMemo(
    () =>
      (data?.items || []).map((item: BackendQuotationItem) => ({
        locationId:
          (typeof item.locationId === "object" ? item.locationId?._id : item.locationId) || "",
        cityName: item.cityName || "",
        officeAddress: item.officeAddress || "",
        planPrice: Number(item.planPrice) || 0,
        discount: {
          type: item.discount?.type === "flat" ? "flat" : "percentage",
          value: Number(item.discount?.value) || 0,
        },
        finalPrice: Number(item.finalPrice) || 0,
        quantity: Number(item.quantity) || 1,
        planType: (data?.plan as any) || "mailing",
      })),
    [data?.items]
  );

  const quotationProps: QuotationProps | null = useMemo(() => {
    if (!data) return null;

    return {
      quotationNo: data.quotationNo,                                                          
      date: formatDate(data.date),
      clientName: data.clientName,
      clientCompany: data.clientCompany,
      clientMobile: data.clientMobile,
      clientEmail: data.clientEmail,
      plan: (data.plan as any) || "mailing",
      items: mappedItems,
      totalAmount: data.totalAmount,
      validityDays: data.validityDays,
      consultantName: data.consultantName,
      consultantAddress: data.consultantAddress,
      consultantPhone: data.consultantPhone,
      consultantEmail: data.consultantEmail,
    };
  }, [data, mappedItems]);

  const onCopyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    } catch {
      toast.error("Unable to copy link");
    }
  }, []);



  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-primary animate-spin" />
          <span className="text-sm font-medium">Loading quotation...</span>
        </div>
      </div>
    );
  }

  if (error || !quotationProps) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <p className="text-lg font-semibold text-slate-900 mb-2">Unable to load quotation</p>
          <p className="text-sm text-muted-foreground">{error || "Quotation data is unavailable"}</p>
          <Button className="mt-6" onClick={() => navigate(isConsultant ? "/dashboard" : "/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isPrintMode ? "print-mode bg-white" : "bg-background"}`}>
      {isConsultant && !isPrintMode && (
        <header className="bg-card border-b border-border p-4 shadow-sm sticky top-0 z-10 print:hidden">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <span className="text-sm font-semibold text-slate-700">{quotationProps.quotationNo}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <Button variant="secondary" onClick={onCopyShareLink}>
                <Copy className="mr-2 h-4 w-4" /> Copy Share Link
              </Button>
              <Button onClick={handleServerDownload}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100/50">
        <div 
          className="flex justify-center" 
          id={data ? "quotation-ready" : undefined}
        >
          <Quotation
            ref={quotationRef}
            {...quotationProps}
          />
        </div>
      </main>
    </div>
  );
}
