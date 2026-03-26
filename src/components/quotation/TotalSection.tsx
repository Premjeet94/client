import { PricingData, fmt } from "@/components/quotation/types";

interface Props {
  pricing: PricingData;
}

export default function TotalSection({ pricing }: Props) {
  return (
    <section className="border border-border rounded overflow-hidden">
      <div className="bg-primary/10 px-4 py-2 border-b border-border">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
          Total Calculation
        </h2>
      </div>
      <div className="p-4 text-sm space-y-1.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Yearly Price:</span>
          <span className="font-semibold">{fmt(pricing.yearlyPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Additional Charges:</span>
          <span className="font-semibold">{fmt(pricing.additionalCharges)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">GST {pricing.gstRate * 100}%:</span>
          <span className="font-semibold">{fmt(pricing.gstAmount)}</span>
        </div>
        <div className="flex justify-between border-t-2 border-primary pt-3 mt-3">
          <span className="font-bold text-primary text-base uppercase tracking-tight">
            Total Amount Payable
          </span>
          <span className="font-bold text-primary text-xl">
            {fmt(pricing.totalPayable)}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          * Auto renewal after 11 months unless cancelled earlier.
        </p>
      </div>
    </section>
  );
}
