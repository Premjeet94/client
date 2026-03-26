export default function NotesTerms() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
      <section className="border border-border rounded overflow-hidden">
        <div className="bg-primary/10 px-3 py-1.5 border-b border-border">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider">Notes</h2>
        </div>
        <ul className="p-3 space-y-1.5 list-disc list-inside text-muted-foreground">
          <li>Price may vary depending on city</li>
          <li>Final quotation shared after confirmation</li>
          <li>Documents required before agreement</li>
          <li>Payment required in advance</li>
        </ul>
      </section>

      <section className="border border-border rounded overflow-hidden">
        <div className="bg-primary/10 px-3 py-1.5 border-b border-border">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider">Terms &amp; Conditions</h2>
        </div>
        <ul className="p-3 space-y-1.5 list-disc list-inside text-muted-foreground">
          <li>Address valid only for registration purpose</li>
          <li>Agreement validity 11 months</li>
          <li>No refund after agreement generated</li>
          <li>Renewal required after expiry</li>
        </ul>
      </section>
    </div>
  );
}
