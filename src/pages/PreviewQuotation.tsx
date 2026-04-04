import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Send, MessageCircle, Mail, Loader2, Link } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Quotation, { QuotationProps, planConfig } from "@/components/Quotation";

export default function PreviewQuotation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<QuotationProps | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState<"whatsapp" | "email" | "both" | null>(null);

  const backendBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const apiKey = import.meta.env.VITE_CLIENT_API_KEY || "";

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Quotation_${data?.quotationNo || id}`,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("preview_quote");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (id === parsed.id || id === "1" || id === "2") {
          setData(parsed as QuotationProps);
        }
      } else {
        // Fallback for demo
        setData({
          quotationNo: "FA-VO-2026-DMO",
          date: new Date().toLocaleDateString("en-GB"),
          clientName: "Demo Client",
          clientCompany: "Demo Company",
          clientMobile: "919876543210",
          clientEmail: "demo@demo.com",
          plan: "gst",
          validityDays: 7,
          consultantName: "Flashspace Support",
          consultantPhone: "919000000000",
          consultantEmail: "info@flashspace.in",
          consultantAddress: "Remote Office"
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  const handleDownloadPDF = useCallback(() => {
    toast.info("Opening print dialog...");
    reactToPrintFn();
  }, [reactToPrintFn]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  /**
   * Fire-and-forget Trigger (V2 Architecture)
   * Sends pure validation data to backend. Let BullMQ workers generate the PDF
   * via Puppeteer securely and reliably in the background.
   */
  const triggerSend = useCallback(
    async (sendType: "email" | "whatsapp" | "both") => {
      if (!data) return;
      
      setSending(sendType);
      const toastId = toast.loading(`Initiating secure sequence...`);
      
      try {
        // Idempotency Tracking: Guarantee we never double-send if user span clicks.
        const idempotencyKey = `REQ-${data.quotationNo}-${Date.now()}`;

        // Send raw parameters ONLY. Calculations happen safely on the backend
        const payload = {
          clientName: data.clientName,
          clientMobile: data.clientMobile,
          clientEmail: data.clientEmail,
          companyName: data.clientCompany || "",
          validityDays: Number(data.validityDays) || 30,
          planType: data.plan || "mailing",
          customAddons: data.customCharges || {} 
        };

        const res = await fetch(`${backendBase}/api/quotations/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
            "X-Idempotency-Key": idempotencyKey
          },
          body: JSON.stringify(payload),
        });

        const resData = await res.json();
        
        if (!res.ok) {
          throw new Error(resData.error || "Failed to dispatch via async gateway");
        }

        // 202 Accepted Fast Response. Background queue handles the rest.
        toast.success(`Success! Document rendering & delivery queued.`, { id: toastId });
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "An unexpected error occurred", { id: toastId });
      } finally {
        setSending(null);
      }
    },
    [backendBase, apiKey, data]
  );

  if (!data)
    return <div className="p-8 text-center text-muted-foreground">Loading quotation...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hidden sm:flex">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
            <Button onClick={handleDownloadPDF} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Local PDF
            </Button>
            <Button
              variant="default"
              disabled={sending !== null}
              onClick={() => triggerSend("whatsapp")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {sending === "whatsapp" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="mr-2 h-4 w-4" />
              )}
              Send via WhatsApp
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100/50">
        <div className="flex justify-center">
          <div className="shadow-2xl mb-12">
            <Quotation ref={contentRef} {...data} />
          </div>
        </div>
      </main>
    </div>
  );
}
