import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/config";
import { getLocations } from "@/api/pricing";
import { createQuotation } from "@/api/quotation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { planConfig, PlanType, PLAN_LABELS, getPlanPrice } from "@/components/quotation/types";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

type DiscountType = "percentage" | "flat";

interface LocationOption {
  _id: string;
  cityName: string;
  officeAddress: string;
  pricing?: {
    mailingPrice: number;
    brPrice: number;
    gstPrice: number;
  };
}

interface QuoteItemForm {
  locationId: string;
  discount: {
    type: DiscountType;
    value: number;
  };
  quantity: number;
  isOption: boolean;
  planPrice: number | null;
}

interface QuotationFormData {
  clientName: string;
  clientCompany: string;
  clientMobile: string;
  clientEmail: string;
  plan: PlanType;
  validityDays: string;
  notes: string;
  consultantName: string;
  consultantPhone: string;
  consultantEmail: string;
  consultantAddress: string;
}

const createEmptyItem = (): QuoteItemForm => ({
  locationId: "",
  discount: { type: "percentage", value: 0 },
  quantity: 1,
  isOption: false,
  planPrice: null,
});

export default function CreateQuotation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<QuotationFormData>({
    clientName: "",
    clientCompany: "",
    clientMobile: "+91",
    clientEmail: "",
    plan: "mailing",
    validityDays: "7",
    notes: "",
    consultantName: "Flashspace Consultant",
    consultantPhone: "+91",
    consultantEmail: "info@flashspace.in",
    consultantAddress: "123, Business Hub, MG Road\nMumbai, Maharashtra - 400001",
  });

  const [customCharges, setCustomCharges] = useState<Record<string, string>>({});
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<QuoteItemForm[]>([createEmptyItem()]);

  useEffect(() => {
    const fetchConsultantDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData((prev) => ({
          ...prev,
          consultantName: res.data.name || prev.consultantName,
          consultantPhone: res.data.phone || prev.consultantPhone,
          consultantEmail: res.data.email || prev.consultantEmail,
          consultantAddress: res.data.officeAddress || prev.consultantAddress,
        }));
      } catch (error) {
        console.error("Failed to fetch consultant details:", error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await getLocations();
        const fetchedLocations = Array.isArray((response as any)?.data?.locations)
          ? (response as any).data.locations
          : Array.isArray((response as any)?.locations)
            ? (response as any).locations
            : Array.isArray(response)
              ? response
              : [];
        setLocations(fetchedLocations);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
        toast.error("Failed to load locations");
      }
    };

    void fetchConsultantDetails();
    void fetchLocations();
  }, []);

  useEffect(() => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        const matchingLocation = locations.find((l) => l._id === item.locationId);
        return { ...item, planPrice: matchingLocation ? getPlanPrice(matchingLocation, formData.plan) : null };
      })
    );
  }, [formData.plan, locations]);

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateItem = (index: number, field: string, value: string | number | boolean) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === "locationId") {
          const selectedLoc = locations.find((l) => l._id === value);
          return { 
            ...item, 
            locationId: value as string, 
            planPrice: selectedLoc ? getPlanPrice(selectedLoc, formData.plan) : null 
          };
        }

        if (field === "discountType") {
          return { ...item, discount: { ...item.discount, type: value as DiscountType } };
        }

        if (field === "discountValue") {
          return { ...item, discount: { ...item.discount, value: Number(value) || 0 } };
        }

        if (field === "quantity") {
          return { ...item, quantity: Math.max(1, Number(value) || 1) };
        }

        if (field === "isOption") {
          return { ...item, isOption: Boolean(value) };
        }

        return { ...item, [field]: value };
      })
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "clientMobile" || name === "consultantPhone") {
      const digits = value.replace(/\D/g, "");
      const localDigits = digits.startsWith("91") ? digits.slice(2) : digits;
      setFormData((prev) => ({ ...prev, [name]: `+91${localDigits.slice(0, 10)}` }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlanChange = (plan: string) => {
    setFormData((prev) => ({ ...prev, plan: plan as PlanType }));
    setCustomCharges({});
  };

  const handleCustomChargeChange = (desc: string, val: string) => {
    setCustomCharges((prev) => ({ ...prev, [desc]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.some((item) => !item.locationId)) {
      toast.error("Please select a location for every item");
      return;
    }

    const payload = {
      clientName: formData.clientName,
      clientCompany: formData.clientCompany,
      clientEmail: formData.clientEmail,
      clientMobile: formData.clientMobile,
      plan: formData.plan,
      validityDays: Number(formData.validityDays) || 7,
      notes: formData.notes || "",
      items: items.map((item) => ({
        locationId: item.locationId,
        discount: {
          type: item.discount.type,
          value: Number(item.discount.value),
        },
        quantity: Number(item.quantity) || 1,
        isOption: Boolean(item.isOption),
      })),
    };

    try {
      setLoading(true);
      const response = await createQuotation(payload);
      toast.success("Quotation created successfully");
      navigate(`/preview/${response.data._id}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to create quotation";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500">
        <Button
          variant="ghost"
          className="mb-6 hover:bg-transparent hover:text-primary transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <Card className="shadow-2xl shadow-slate-200/50 border-slate-200/60 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8 pt-8 px-8">
            <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Quotation</CardTitle>
            <p className="text-slate-500 mt-2 text-sm">
              Fill in the details to generate a fully dynamic and customized proposal.
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">1. Plan &amp; Client Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="plan" className="text-slate-700 font-medium">Select Plan</Label>
                    <Select value={formData.plan} onValueChange={handlePlanChange}>
                      <SelectTrigger className="bg-slate-50/50 focus:ring-primary/30 rounded-xl h-11 border-slate-200">
                        <SelectValue placeholder="Choose a plan" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                        {Object.entries(PLAN_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key} className="cursor-pointer focus:bg-accent/10 focus:text-primary">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="validityDays" className="text-slate-700 font-medium">Validity Duration (Days)</Label>
                    <Input
                      type="number"
                      id="validityDays"
                      name="validityDays"
                      value={formData.validityDays}
                      onChange={handleChange}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      placeholder="7"
                      className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="clientName" className="text-slate-700 font-medium">Client Name</Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      required
                      value={formData.clientName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="clientCompany" className="text-slate-700 font-medium">Company</Label>
                    <Input
                      id="clientCompany"
                      name="clientCompany"
                      required
                      value={formData.clientCompany}
                      onChange={handleChange}
                      placeholder="Acme Inc."
                      className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="clientMobile" className="text-slate-700 font-medium">Mobile</Label>
                    <Input
                      id="clientMobile"
                      name="clientMobile"
                      required
                      value={formData.clientMobile}
                      onChange={handleChange}
                      placeholder="+919876543210"
                      className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="clientEmail" className="text-slate-700 font-medium">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      name="clientEmail"
                      required
                      value={formData.clientEmail}
                      onChange={handleChange}
                      placeholder="john@acme.com"
                      className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-bold text-slate-800">2. Quotation Items</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-xl text-xs gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Item
                  </Button>
                </div>

                {items.map((item, index) => {
                  const computedPrice = item.planPrice;
                  return (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                      <div className="space-y-2.5 md:col-span-4">
                        <Label className="text-slate-700 font-medium">Location</Label>
                        <SearchableSelect
                          options={locations}
                          value={item.locationId}
                          onValueChange={(value: string) => updateItem(index, "locationId", value)}
                          disabled={!formData.plan}
                          placeholder={formData.plan ? "Search city or address..." : "Select a plan first"}
                        />
                      </div>

                      {/* Price badge — derived, never stored */}
                      <div className="space-y-2.5 md:col-span-2">
                        <Label className="text-slate-700 font-medium">Price</Label>
                        <div className={`h-11 rounded-xl border flex items-center px-3 text-sm font-mono ${
                          computedPrice !== null
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold"
                            : "bg-slate-100 border-slate-200 text-slate-400"
                        }`}>
                          {computedPrice !== null ? `₹${computedPrice.toLocaleString("en-IN")}` : "—"}
                        </div>
                      </div>

                      <div className="space-y-2.5 md:col-span-2">
                        <Label className="text-slate-700 font-medium">Discount Type</Label>
                        <Select value={item.discount.type} onValueChange={(value: string) => updateItem(index, "discountType", value)}>
                          <SelectTrigger className="bg-white focus:ring-primary/30 rounded-xl h-11 border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                            <SelectItem value="percentage" className="cursor-pointer">Percentage</SelectItem>
                            <SelectItem value="flat" className="cursor-pointer">Flat (Rs.)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2.5 md:col-span-2">
                        <Label className="text-slate-700 font-medium">
                          {item.discount.type === "percentage" ? "Discount %" : "Discount Rs."}
                        </Label>
                        {item.discount.type === "percentage" ? (
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={item.discount.value}
                            onChange={(e) => updateItem(index, "discountValue", e.target.value)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            placeholder="0-100"
                            className="bg-white focus-visible:ring-primary/30 rounded-xl h-11"
                          />
                        ) : (
                          <Input
                            type="number"
                            min={0}
                            value={item.discount.value}
                            onChange={(e) => updateItem(index, "discountValue", e.target.value)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            placeholder="0"
                            className="bg-white focus-visible:ring-primary/30 rounded-xl h-11"
                          />
                        )}
                      </div>

                      <div className="space-y-2.5 md:col-span-1">
                        <Label className="text-slate-700 font-medium">Qty</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          placeholder="1"
                          className="bg-white focus-visible:ring-primary/30 rounded-xl h-11"
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length <= 1}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-11 w-11"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="md:col-span-12 flex items-center gap-2 pt-1">
                        <input
                          id={`is-option-${index}`}
                          type="checkbox"
                          checked={item.isOption}
                          onChange={(e) => updateItem(index, "isOption", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={`is-option-${index}`} className="text-sm text-slate-700 font-medium cursor-pointer">
                          Mark as optional location (client will choose)
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">3. Additional Notes</h3>
                <div className="space-y-2.5">
                  <Label htmlFor="notes" className="text-slate-700 font-medium">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Optional notes for this quotation"
                    className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl min-h-[80px]"
                  />
                </div>
              </div>


              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">4. Additional Services Pricing (Leave empty to mark as N/A)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {planConfig[formData.plan].charges.map((charge, index) => (
                    <div key={index} className="space-y-2.5">
                      <Label className="text-slate-700 font-medium">{charge.description}</Label>
                      <Input
                        type="number"
                        placeholder="Price (Rs.)"
                        value={customCharges[charge.description] || ""}
                        onChange={(e) => handleCustomChargeChange(charge.description, e.target.value)}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">5. Consultant Details (Auto-filled)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="consultantName" className="text-slate-700 font-medium">Name</Label>
                    <Input
                      id="consultantName"
                      name="consultantName"
                      required
                      value={formData.consultantName}
                      onChange={handleChange}
                      className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="consultantPhone" className="text-slate-700 font-medium">Phone</Label>
                    <Input
                      id="consultantPhone"
                      name="consultantPhone"
                      required
                      value={formData.consultantPhone}
                      onChange={handleChange}
                      className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2.5 md:col-span-2">
                    <Label htmlFor="consultantEmail" className="text-slate-700 font-medium">Email</Label>
                    <Input
                      id="consultantEmail"
                      name="consultantEmail"
                      type="email"
                      required
                      value={formData.consultantEmail}
                      onChange={handleChange}
                      className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2.5 md:col-span-2">
                    <Label htmlFor="consultantAddress" className="text-slate-700 font-medium">Office Address</Label>
                    <Textarea
                      id="consultantAddress"
                      name="consultantAddress"
                      required
                      value={formData.consultantAddress}
                      onChange={handleChange}
                      className="bg-slate-50/50 focus-visible:ring-primary/30 transition-shadow rounded-xl min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full sm:w-auto rounded-xl px-8 shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    "Generate Preview"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
