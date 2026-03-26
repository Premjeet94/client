import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";
import { planConfig, PlanType } from "@/components/Quotation";

export default function CreateQuotation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: "",
    clientCompany: "",
    clientMobile: "+91 ",
    clientEmail: "",
    city: "",
    plan: "mailing",
    
    // Dynamic Pricing & Validity
    validityDays: "7",
    monthlyPrice: "",
    yearlyPrice: "",

    // Consultant Info
    consultantName: "Flashspace Consultant",
    consultantPhone: "+91 ",
    consultantEmail: "info@flashspace.in",
    consultantAddress: "123, Business Hub, MG Road\nMumbai, Maharashtra – 400001",
  });

  const [customCharges, setCustomCharges] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "yearlyPrice") {
      if (value === "") {
        setFormData({ ...formData, yearlyPrice: "", monthlyPrice: "" });
      } else {
        const yearly = Number(value);
        const monthly = isNaN(yearly) ? "" : Math.round(yearly / 12).toString();
        setFormData({ ...formData, yearlyPrice: value, monthlyPrice: monthly });
      }
    } else if (name === "clientMobile" || name === "consultantPhone") {
      // Enforce +91 prefix
      if (!value.startsWith("+91")) {
        setFormData({ ...formData, [name]: "+91 " + value.replace(/^\+?91?\s*/, "") });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePlanChange = (val: string) => {
    setFormData({ ...formData, plan: val });
    setCustomCharges({});
  };

  const handleCustomChargeChange = (desc: string, val: string) => {
    setCustomCharges((prev) => ({ ...prev, [desc]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert empty string numeric inputs to undefined so the Quotation template uses its default
    const selectedPlanConfig = planConfig[formData.plan as PlanType];
    const parsedCustomCharges: Record<string, number | undefined> = {};
    
    selectedPlanConfig.charges.forEach((c) => {
      const val = customCharges[c.description];
      parsedCustomCharges[c.description] = val ? Number(val) : undefined;
    });

    const payload = {
      ...formData,
      id: Date.now().toString(),
      quotationNo: `FA-VO-2026-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      monthlyPrice: formData.monthlyPrice ? Number(formData.monthlyPrice) : undefined,
      yearlyPrice: formData.yearlyPrice ? Number(formData.yearlyPrice) : undefined,
      validityDays: formData.validityDays ? Number(formData.validityDays) : 7,
      customCharges: parsedCustomCharges,
    };

    localStorage.setItem("preview_quote", JSON.stringify(payload));
    toast.success("Quotation generated successfully");
    navigate(`/preview/${payload.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500">
        <Button variant="ghost" className="mb-6 hover:bg-transparent hover:text-primary transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <Card className="shadow-2xl shadow-slate-200/50 border-slate-200/60 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8 pt-8 px-8">
            <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Quotation</CardTitle>
            <p className="text-slate-500 mt-2 text-sm">Fill in the details to generate a fully dynamic and customised proposal.</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Section 1: Client Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">1. Client Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="clientName" className="text-slate-700 font-medium">Client Name</Label>
                    <Input id="clientName" name="clientName" required value={formData.clientName} onChange={handleChange} placeholder="John Doe" className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="clientCompany" className="text-slate-700 font-medium">Company</Label>
                    <Input id="clientCompany" name="clientCompany" required value={formData.clientCompany} onChange={handleChange} placeholder="Acme Inc." className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="clientMobile" className="text-slate-700 font-medium">Mobile</Label>
                    <Input id="clientMobile" name="clientMobile" required value={formData.clientMobile} onChange={handleChange} placeholder="+91 9876543210" className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="clientEmail" className="text-slate-700 font-medium">Email</Label>
                    <Input id="clientEmail" type="email" name="clientEmail" required value={formData.clientEmail} onChange={handleChange} placeholder="john@acme.com" className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="city" className="text-slate-700 font-medium">City</Label>
                    <Input id="city" name="city" required value={formData.city} onChange={handleChange} placeholder="Mumbai" className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11" />
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Configurations */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">2. Plan & Base Pricing (Leave empty for default)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="plan" className="text-slate-700 font-medium">Select Plan</Label>
                    <Select value={formData.plan} onValueChange={handlePlanChange}>
                      <SelectTrigger className="bg-slate-50/50 focus:ring-primary/30 rounded-xl h-11 border-slate-200">
                        <SelectValue placeholder="Choose a plan" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                        <SelectItem value="mailing" className="cursor-pointer focus:bg-accent/10 focus:text-primary">Mailing Plan</SelectItem>
                        <SelectItem value="gst" className="cursor-pointer focus:bg-accent/10 focus:text-primary">GST Registration</SelectItem>
                        <SelectItem value="business-registration" className="cursor-pointer focus:bg-accent/10 focus:text-primary">Business Registration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="validityDays" className="text-slate-700 font-medium">Validity Duration (Days)</Label>
                    <Input type="number" id="validityDays" name="validityDays" value={formData.validityDays} onChange={handleChange} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="7" className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11" />
                  </div>
                  <div className="space-y-2.5 opacity-80">
                    <Label htmlFor="monthlyPrice" className="text-slate-700 font-medium">Calculated Monthly Price (₹)</Label>
                    <Input type="number" id="monthlyPrice" name="monthlyPrice" value={formData.monthlyPrice} readOnly onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="1999" className="bg-slate-100/50 cursor-not-allowed focus-visible:ring-0 transition-shadow rounded-xl h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="yearlyPrice" className="text-slate-700 font-medium">Yearly Price (₹)</Label>
                    <Input type="number" id="yearlyPrice" name="yearlyPrice" value={formData.yearlyPrice} onChange={handleChange} onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="23988" className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11" />
                  </div>
                </div>
              </div>

              {/* Section 3: Additional Services Override */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
                  3. Additional Services Pricing (Leave empty to mark as N/A)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {planConfig[formData.plan as PlanType].charges.map((charge, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <Label className="text-slate-700 font-medium">{charge.description}</Label>
                      <Input
                        type="number"
                        placeholder="Price (₹)"
                        value={customCharges[charge.description] || ""}
                        onChange={(e) => handleCustomChargeChange(charge.description, e.target.value)}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Consultant Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">4. Consultant Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="consultantName" className="text-slate-700 font-medium">Name</Label>
                    <Input id="consultantName" name="consultantName" required value={formData.consultantName} onChange={handleChange} className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="consultantPhone" className="text-slate-700 font-medium">Phone</Label>
                    <Input id="consultantPhone" name="consultantPhone" required value={formData.consultantPhone} onChange={handleChange} className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11" />
                  </div>
                  <div className="space-y-2.5 md:col-span-2">
                    <Label htmlFor="consultantEmail" className="text-slate-700 font-medium">Email</Label>
                    <Input id="consultantEmail" name="consultantEmail" type="email" required value={formData.consultantEmail} onChange={handleChange} className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11" />
                  </div>
                  <div className="space-y-2.5 md:col-span-2">
                    <Label htmlFor="consultantAddress" className="text-slate-700 font-medium">Office Address</Label>
                    <Textarea id="consultantAddress" name="consultantAddress" required value={formData.consultantAddress} onChange={handleChange} className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl min-h-[80px]" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button type="submit" size="lg" className="w-full sm:w-auto rounded-xl px-8 shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  Generate Preview
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
