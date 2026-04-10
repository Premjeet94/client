import { PricingData, fmt, QuotationItem } from "@/components/quotation/types";

interface Props {
  pricing: PricingData;
  items?: QuotationItem[];
}

export default function TotalSection({ pricing, items = [] }: Props) {
  const hasMultiple = items.length > 0;

  return (
    <section className="border border-border rounded overflow-hidden">
      <div className="bg-primary/10 px-4 py-2 border-b border-border">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider m-0">
          Pricing Summary
        </h2>
      </div>
      <div className="p-4 text-xs space-y-2">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Subtotal (Exclusive of GST):</span>
          <span className="font-semibold text-slate-900">{fmt(pricing.subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>GST (18%):</span>
          <span className="font-semibold text-slate-900">{fmt(pricing.gstAmount)}</span>
        </div>
        <div className="flex justify-between items-center border-t-2 border-primary pt-4 mt-2">
          <span className="font-bold text-primary text-[13px] uppercase tracking-tight">
            Total Amount Payable
          </span>
          <span className="font-bold text-primary text-2xl">
            {fmt(pricing.totalPayable)}
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-dashed border-border">
          <p className="text-[10px] text-muted-foreground italic m-0 leading-relaxed">
            * This quotation is valid for {hasMultiple ? "all listed locations" : "the selected location"}. 
            Prices are inclusive of standard documentation and processing fees unless specified otherwise.
          </p>
        </div>
      </div>
    </section>
  );
}
