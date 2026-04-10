import { ReactNode } from "react";
import { QuotationData, PlanConfig } from "@/components/quotation/types";

interface Props {
  data: QuotationData;
  plan: PlanConfig;
}

export default function QuotationHeader({ data, plan }: Props) {
  return (
    <header className="flex justify-between items-start border-b-2 border-primary pb-5 mb-0">
      <div className="flex-1">
        <img src={data.logoSrc} alt="Flashspace" className="h-14 mb-3 object-contain" />
        <p className="text-sm font-semibold text-primary">{data.consultantName}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1 whitespace-pre-line">
          {data.consultantAddress}<br />
          Phone: {data.consultantPhone}<br />
          Email: {data.consultantEmail}
        </p>
      </div>

      <div className="flex flex-col gap-3 text-xs shrink-0">
        <div className="border border-border rounded p-3 min-w-[220px] bg-secondary">
          <h3 className="font-bold text-primary text-[11px] uppercase tracking-wider mb-2 border-b border-border pb-1">
            Quotation Details
          </h3>
          <div className="space-y-1">
            <Row label="Quotation No" value={data.quotationNo} />
            <Row label="Date" value={data.date} />
            <Row
              label="Validity"
              value={
                <span className="font-semibold text-destructive">
                  {data.validityDays || 7} Days Only
                </span>
              }
            />
          </div>
        </div>

        <div className="border border-border rounded p-3 min-w-[220px] bg-secondary">
          <h3 className="font-bold text-primary text-[11px] uppercase tracking-wider mb-2 border-b border-border pb-1">
            Client Details
          </h3>
          <div className="space-y-0.5">
            <Row label="Name" value={data.clientName} />
            <Row label="Company" value={data.clientCompany} />
            <Row label="Mobile" value={data.clientMobile} />
            <Row label="Email" value={data.clientEmail} />
          </div>
        </div>
      </div>
    </header>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}
