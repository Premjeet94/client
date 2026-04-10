import { PlanConfig, fmt } from "@/components/quotation/types";

interface Props {
  charges: PlanConfig["charges"];
}

export default function ChargesTable({ charges }: Props) {
  return (
    <section className="border border-border rounded overflow-hidden">
      <div className="bg-primary/10 px-4 py-2 border-b border-border">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Additional / Government Charges</h2>
      </div>
      <div className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {charges.map((charge, i) => (
              <tr key={i}>
                <td className="py-2 text-foreground font-medium">{charge.description}</td>
                <td
                  className={`py-2 text-right ${
                    charge.amount ? "font-bold text-primary" : "text-slate-500 font-medium italic"
                  }`}
                >
                  {charge.amount ? fmt(charge.amount) : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
