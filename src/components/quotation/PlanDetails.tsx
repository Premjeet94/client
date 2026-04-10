import { PlanConfig, PricingData, fmt, QuotationItem, planConfig, PlanType } from "@/components/quotation/types";

interface Props {
  plan: PlanConfig;
  pricing: PricingData;
  items?: QuotationItem[];
}

export default function PlanDetails({ plan, pricing, items = [] }: Props) {
  const hasMultiple = items.length > 0;
  const monthlyPrice = pricing.monthlyPrice ?? pricing.subtotal;
  const yearlyPrice = pricing.yearlyPrice ?? pricing.totalPayable;

  return (
    <section className="border border-border rounded overflow-hidden break-inside-avoid print:break-inside-avoid">
      <div className="bg-primary/10 px-4 py-2 border-b border-border">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
          {hasMultiple ? "Quotation Details" : "Plan Details"}
        </h2>
      </div>
      <div className="p-4 text-sm">
        {!hasMultiple ? (
          <>
            <div className="mb-3">
              <span className="text-muted-foreground">Plan Name: </span>
              <span className="font-semibold">{plan.title} ({plan.shortName})</span>
            </div>

            <div className="mb-1 text-muted-foreground font-medium text-xs uppercase tracking-wider">
              Services Included:
            </div>
            <ul className="list-disc list-inside space-y-1 ml-2 text-sm mb-4">
              {plan.services.map((service, i) => (
                <li key={i}>{service}</li>
              ))}
            </ul>
          </>
        ) : (
          <div className="mb-4">
            {items.map((item, idx) => {
              const itemPlan = planConfig[item.planType as PlanType];
              if (!itemPlan) return null;
              return (
                <div key={idx} className={`bg-slate-50 border border-slate-200 rounded-lg p-3 break-inside-avoid print:break-inside-avoid print:h-auto print:min-h-0 ${
                  idx !== items.length - 1 ? "mb-4 print:mb-2" : ""
                }`}>
                  <div className="flex items-start gap-4 mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-primary text-xs uppercase">{item.cityName}</h4>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{item.officeAddress}</p>
                    </div>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                      {itemPlan.shortName}
                    </span>
                  </div>
                  <div className="flex items-center text-xs mt-1">
                    <span className="text-muted-foreground flex-1">Base Price {item.quantity > 1 ? `(x${item.quantity})` : ""}:</span>
                    <span className="font-semibold shrink-0">{fmt(item.finalPrice)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pricing Cards — side by side */}
        <div className="flex gap-4 break-inside-avoid print:break-inside-avoid">
          <div className="flex-1 bg-accent/30 border border-accent rounded p-3">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              {hasMultiple ? "Item Subtotal" : "Monthly Price"}
            </span>
            <div className="mt-1">
              <span className="text-lg font-bold text-primary">
                {fmt(hasMultiple ? pricing.subtotal : monthlyPrice)}
              </span>
              <span className="text-sm text-muted-foreground"> {hasMultiple ? "" : "/ month"}</span>
            </div>
          </div>
          <div className="flex-1 bg-accent/30 border border-accent rounded p-3">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              {hasMultiple ? "Total (Incl. Tax)" : "Yearly Price"}
            </span>
            <div className="mt-1">
              <span className="text-lg font-bold text-primary">
                {fmt(hasMultiple ? pricing.totalPayable : yearlyPrice)}
              </span>
              <span className="text-sm text-muted-foreground"> {hasMultiple ? "" : "/ year"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
