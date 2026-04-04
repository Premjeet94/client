import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Quotation from "../components/Quotation";
import { Loader2 } from "lucide-react";

/**
 * Headless-optimized Print View.
 * Puppeteer visits this URL to render the PDF server-side.
 * It strictly fetches the canonical data from the backend to ensure zero tampering.
 */
export default function PublicQuotation() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Authenticate the request slightly (so not just anyone can enumerate quotes)
    // The backend worker passes ?apikey=...
    const apiKey = searchParams.get("apikey") || import.meta.env.VITE_CLIENT_API_KEY;

    // 2. Fetch the canonical data from the database
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/quotations/${id}`, {
      headers: { "X-API-Key": apiKey }
    })
      .then(res => res.json())
      .then(resData => {
        if (!resData.success) {
          setError(resData.error || "Quotation not found");
        } else {
          setData(resData.data);
        }
      })
      .catch(err => setError(err.message));
  }, [id, searchParams]);

  if (error) {
    return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  // 3. Render the exact Quotation component with absolute Data Trust
  return (
    <div className="bg-white min-h-screen">
      <Quotation
        quotationNo={data.quotationNumber}
        date={new Date(data.clientData.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        clientName={data.clientData.name}
        clientCompany={data.clientData.companyName || ""}
        clientMobile={data.clientData.phone}
        clientEmail={data.clientData.email}
        plan={data.planType}
        validityDays={Math.ceil((new Date(data.validityDate).getTime() - Date.now()) / (1000 * 3600 * 24))}
        monthlyPrice={data.totalAmount / 12} // V2 abstraction: rely on backend computed numbers
        yearlyPrice={data.totalAmount} // V2 abstraction: rely on backend computed numbers
        additionalCharges={0} // Computed directly from DB total
        consultantName="Flashspace Consultant"
        consultantAddress="123, Business Hub, MG Road\nMumbai, Maharashtra – 400001"
        consultantPhone="+91 22 1234 5678"
        consultantEmail="info@flashspace.in"
      />
    </div>
  );
}
