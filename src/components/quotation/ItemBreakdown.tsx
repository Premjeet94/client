import { QuotationItem, fmt, PLAN_LABELS, PlanType } from "./types";

interface Props {
  items: QuotationItem[];
  plan?: PlanType;
}

export default function ItemBreakdown({ items, plan }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <section className="border border-border rounded overflow-hidden break-inside-avoid print:break-inside-avoid">
      <div className="bg-primary/10 px-4 py-2 border-b border-border">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider m-0">
          Selected Locations &amp; Pricing
        </h2>
      </div>
      <div className="p-4">
        {items.map((item, idx) => {
          const quantity = item.quantity || 1;
          const planLabel = PLAN_LABELS[plan as PlanType] || "Plan";
          
          // Use planPrice from backend snapshot
          const sourcePrice = item.planPrice || 0;
          
          const planLineTotal = sourcePrice * quantity;
          const finalLineTotal = (item.finalPrice || 0) * quantity;
          
          const discountLabel =
            item.discount.type === "percentage"
              ? `${item.discount.value}%`
              : fmt(Math.max(0, planLineTotal - finalLineTotal));

          return (
            <div
              key={idx}
              className={`border border-border rounded-xl px-4 py-3 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-4 break-inside-avoid print:break-inside-avoid print:h-auto print:min-h-0 ${
                idx !== items.length - 1 ? "mb-4 print:mb-2" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm leading-tight m-0 truncate">
                  {item.cityName}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-1 m-0">
                  {item.officeAddress}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                    {fmt(planLineTotal)} <span className="text-[9px] font-normal italic">({planLabel})</span>
                  </div>
                  <div className="text-[11px] font-medium text-red-500 whitespace-nowrap">
                    − {discountLabel} <span className="text-[9px] font-normal italic">(Discount)</span>
                  </div>
                  <div className="h-px w-full bg-slate-200 my-0.5" />
                  <div className="text-sm font-bold text-primary whitespace-nowrap">
                    = {fmt(finalLineTotal)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
