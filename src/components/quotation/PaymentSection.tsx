import { toast } from "sonner";

export default function PaymentSection({ consultantEmail }: { consultantEmail: string }) {
  const copyBankDetails = () => {
    const details = `Bank: HDFC Bank Account\nName: Stirring Minds Services Pvt. Ltd\nAccount No: 50200025626726\nIFSC Code: HDFC0004399\nBranch: Gagan Vihar, New Delhi`;
    navigator.clipboard.writeText(details).then(() => {
      toast.success("Bank details copied to clipboard!");
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary text-primary-foreground text-center py-3 px-4 rounded shadow-sm">
        <h2 className="text-base font-bold tracking-wide uppercase">Payment Details</h2>
      </div>

      <section className="border border-border rounded overflow-hidden">
        <div className="bg-primary/10 px-4 py-2 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Bank / UPI Details</h3>
          <button 
            onClick={copyBankDetails}
            className="text-[10px] bg-primary/20 hover:bg-primary/30 text-primary px-2 py-0.5 rounded transition-colors font-bold uppercase"
          >
            Copy Bank Details
          </button>
        </div>
        <div className="p-4 text-sm space-y-2">
          <Detail label="UPI ID" value="stirringmindsbank@upi" />
          <Detail label="Account Name" value="Stirring Minds Services Pvt. Ltd" />
          <Detail label="Account No" value="50200025626726" />
          <Detail label="IFSC Code" value="HDFC0004399" />
          <Detail label="Branch" value="Gagan Vihar, New Delhi" />
        </div>
      </section>

      <div className="flex gap-3">
        <PayButton label="Pay via UPI" href="upi://pay?pa=stirringmindsbank@upi&pn=Stirring Minds Services Pvt. Ltd" />
        <PayButton label="Pay via Link" href="http://razorpay.me/@stirringminds" />
      </div>

      <div className="bg-accent/30 border border-accent rounded p-3 text-center">
        <p className="font-bold text-sm text-foreground">
          IMPORTANT: Send payment screenshot after payment
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          For any queries, contact: {consultantEmail}
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start text-sm">
      <span className="text-muted-foreground w-1/3 shrink-0">{label}:</span>
      <span className="font-semibold text-right flex-1">{value}</span>
    </div>
  );
}

function PayButton({ label, href, onClick }: { label: string; href?: string; onClick?: () => void }) {
  const className = "block text-center w-full bg-primary text-primary-foreground py-2.5 px-4 rounded font-semibold text-sm hover:opacity-90 transition print:border print:border-primary print:bg-transparent print:text-primary cursor-pointer";
  
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <button onClick={onClick} type="button" className={className}>
      {label}
    </button>
  );
}
