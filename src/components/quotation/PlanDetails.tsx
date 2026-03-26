import { PlanConfig, PricingData, fmt } from "@/components/quotation/types";

interface Props {
  plan: PlanConfig;
  pricing: PricingData;
}

export default function PlanDetails({ plan, pricing }: Props) {
  return (
    <section className="border border-border rounded overflow-hidden">
      <div className="bg-primary/10 px-4 py-2 border-b border-border">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Plan Details</h2>
      </div>
      <div className="p-4 text-sm">
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

        {/* Pricing Cards — side by side */}
        <div className="flex gap-4">
          <div className="flex-1 bg-accent/30 border border-accent rounded p-3">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Monthly Price</span>
            <div className="mt-1">
              <span className="text-lg font-bold text-primary">{fmt(pricing.monthlyPrice)}</span>
              <span className="text-sm text-muted-foreground"> / month</span>
            </div>
          </div>
          <div className="flex-1 bg-accent/30 border border-accent rounded p-3">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Yearly Price</span>
            <div className="mt-1">
              <span className="text-lg font-bold text-primary">{fmt(pricing.yearlyPrice)}</span>
              <span className="text-sm text-muted-foreground"> / year</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
