import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Send, Copy, Share2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Quotation, { QuotationProps } from "@/components/Quotation";

export default function PreviewQuotation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<QuotationProps | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
        setData({
          quotationNo: "FA-VO-2026-DMO",
          date: new Date().toLocaleDateString("en-GB"),
          clientName: "Demo Client",
          clientCompany: "Demo Company",
          clientMobile: "+91 0000000000",
          clientEmail: "demo@demo.com",
          plan: "gst",
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

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${data?.clientName}, here is your Virtual Office Quotation from Flashspace: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (!data)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading quotation details...
      </div>
    );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Toolbar */}
      <header className="bg-card border-b border-border p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="hidden sm:flex self-start"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <Button
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-none"
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button
              variant="secondary"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Link
            </Button>
            <Button
              variant="outline"
              onClick={handleWhatsApp}
              className="flex-1 sm:flex-none border-green-600 text-green-600 hover:bg-green-50"
            >
              <Share2 className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info("Email sent (Demo)")}
              className="flex-1 sm:flex-none"
            >
              <Send className="mr-2 h-4 w-4" /> Email
            </Button>
          </div>
        </div>
      </header>

      {/* Live React Preview */}
      <main className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100/50">
        <div className="flex justify-center">
          <Quotation ref={contentRef} {...data} />
        </div>
      </main>
    </div>
  );
}
