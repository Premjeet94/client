import { ClientLogo } from "@/components/quotation/types";

interface Props {
  logos: ClientLogo[];
}

export default function LogoStrip({ logos }: Props) {
  return (
    <section className="border border-border rounded overflow-hidden">
      <div className="bg-primary/10 px-4 py-2 border-b border-border">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
          Companies We Have Worked With
        </h3>
      </div>
      <div className="p-4 grid grid-cols-4 gap-4 items-center justify-items-center">
        {logos.map((client, i) => (
          <div
            key={i}
            className="h-12 w-full flex items-center justify-center bg-secondary rounded px-2"
          >
            <img
              src={client.logo}
              alt={client.name}
              className="max-h-10 max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
