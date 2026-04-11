import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getLocations, createLocation, updateLocation, deleteLocation } from "@/api/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, MapPin, Plus, Trash2, Edit2, X } from "lucide-react";

interface LocationPricing {
  _id: string;
  cityName: string;
  officeAddress: string;
  pricing: {
    mailingPrice: number;
    brPrice: number;
    gstPrice: number;
  };
  contactPersonName?: string;
  phone?: string;
  priority: string;
  isActive: boolean;
  updatedBy?: {
    name: string;
    email: string;
  };
  updatedAt: string;
}

export default function LocationAdmin() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [isEditing, setIsEditing] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cityName: "",
    officeAddress: "",
    mailingPrice: "",
    brPrice: "",
    gstPrice: "",
    contactPersonName: "",
    phone: "",
    priority: "P3"
  });

  const fetchLocationsData = async () => {
    try {
      setFetching(true);
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      toast.error("Failed to fetch locations. Ensure you have admin privileges.");
      navigate("/dashboard");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      toast.error("Unauthorized access");
      navigate("/dashboard");
      return;
    }
    fetchLocationsData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (loc: LocationPricing) => {
    setIsEditing(loc._id);
    setFormData({
      cityName: loc.cityName || "",
      officeAddress: loc.officeAddress || "",
      mailingPrice: (loc.pricing?.mailingPrice || 0).toString(),
      brPrice: (loc.pricing?.brPrice || 0).toString(),
      gstPrice: (loc.pricing?.gstPrice || 0).toString(),
      contactPersonName: loc.contactPersonName || "",
      phone: loc.phone || "",
      priority: loc.priority || "P3"
    });
    // Smooth scroll to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setFormData({ cityName: "", officeAddress: "", mailingPrice: "", brPrice: "", gstPrice: "", contactPersonName: "", phone: "", priority: "P3" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cityName.trim() || !formData.officeAddress.trim() || !formData.mailingPrice || !formData.brPrice || !formData.gstPrice) {
      toast.error("All fields are strictly required.");
      return;
    }

    const payload = {
      cityName: formData.cityName,
      officeAddress: formData.officeAddress,
      pricing: {
        mailingPrice: Number(formData.mailingPrice),
        brPrice: Number(formData.brPrice),
        gstPrice: Number(formData.gstPrice)
      },
      contactPersonName: formData.contactPersonName,
      phone: formData.phone,
      priority: formData.priority
    };

    if (payload.pricing.mailingPrice <= 0 || payload.pricing.brPrice <= 0 || payload.pricing.gstPrice <= 0) {
      toast.error("All pricing values must be greater than 0.");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await updateLocation(isEditing, payload);
        toast.success(`Location ${formData.cityName} updated successfully!`);
      } else {
        response = await createLocation(payload);
        toast.success(`Location ${formData.cityName} created successfully!`);
      }

      // Check for business warnings from meta
      if (response?.data?.meta?.warning) {
        toast.warning(response.data.meta.warning);
      }

      handleCancelEdit();
      fetchLocationsData(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}?`)) return;
    
    try {
      await deleteLocation(id);
      toast.success(`${name} deleted permanently.`);
      fetchLocationsData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete location.");
    }
  };

  if (fetching && locations.length === 0) return <div className="p-8 text-center text-muted-foreground">Loading Locations...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hover:bg-transparent hover:text-primary transition-colors" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <MapPin className="mr-3 h-8 w-8 text-primary" /> Location Configuration
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Create/Edit Form panel */}
          <Card className="lg:col-span-1 shadow-2xl shadow-slate-200/50 border-slate-200/60 rounded-3xl h-fit sticky top-6">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl font-bold">
                  {isEditing ? <Edit2 className="mr-2 h-5 w-5 text-primary" /> : <Plus className="mr-2 h-5 w-5 text-primary" />}
                  {isEditing ? "Edit Location" : "Add Location"}
                </CardTitle>
                {isEditing && (
                  <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="h-8 w-8 text-slate-500 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardDescription>{isEditing ? "Update tier geometries." : "Map out new pricing tiers."}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>City Name</Label>
                  <Input name="cityName" value={formData.cityName} onChange={handleChange} disabled={!!isEditing} required placeholder="Ahmedabad" />
                </div>
                <div className="space-y-2">
                  <Label>Office Address</Label>
                  <Textarea name="officeAddress" value={formData.officeAddress} onChange={handleChange} required placeholder="Full physical representation..." className="min-h-[80px]" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Priority Tier
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Required</span>
                  </Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(val: string) => setFormData(prev => ({ ...prev, priority: val }))}
                  >
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-primary/20">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P1" className="font-semibold text-amber-600">P1 - Recommended (Top Selling)</SelectItem>
                      <SelectItem value="P2" className="text-blue-600">P2 - Standard (Regular)</SelectItem>
                      <SelectItem value="P3" className="text-slate-500">P3 - Low Impact</SelectItem>
                      <SelectItem value="DISABLED" className="text-red-500 font-bold">DISABLED - Hide from Sales</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground pt-1 px-1 italic">
                    Affects sorting and visibility in the quotation flow.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input name="contactPersonName" value={formData.contactPersonName} onChange={handleChange} placeholder="Aditya" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 96623..." />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <Label className="text-primary font-bold text-sm tracking-tight uppercase">Tier Pricing (₹)</Label>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Mailing Plan</Label>
                    <Input name="mailingPrice" type="number" min="1" value={formData.mailingPrice} onChange={handleChange} required placeholder="Postage & Address Tier" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Business Registration</Label>
                    <Input name="brPrice" type="number" min="1" value={formData.brPrice} onChange={handleChange} required placeholder="BR Compliance Tier" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">GST Registration</Label>
                    <Input name="gstPrice" type="number" min="1" value={formData.gstPrice} onChange={handleChange} required placeholder="GST Configuration Tier" />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={loading}>
                  {loading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Configuration" : "Deploy Location")}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Location Records Table */}
          <Card className="lg:col-span-3 shadow-2xl shadow-slate-200/50 border-slate-200/60 rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6 px-6">
              <CardTitle className="text-xl font-bold">Configured Active Zones</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>City</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Mailing (₹)</TableHead>
                      <TableHead>BR (₹)</TableHead>
                      <TableHead>GST (₹)</TableHead>
                      <TableHead className="w-[180px]">Address Context</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((loc) => (
                      <TableRow key={loc._id} className="hover:bg-slate-50/80 cursor-pointer group">
                        <TableCell className="font-semibold text-slate-800 capitalize">
                          {loc.cityName}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight uppercase border",
                            loc.priority === 'P1' && "bg-amber-50 text-amber-600 border-amber-100",
                            loc.priority === 'P2' && "bg-blue-50 text-blue-600 border-blue-100",
                            loc.priority === 'P3' && "bg-slate-50 text-slate-500 border-slate-100",
                            loc.priority === 'DISABLED' && "bg-red-50 text-red-500 border-red-100"
                          )}>
                            {loc.priority}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-700">{loc.contactPersonName || "—"}</span>
                            <span className="text-[10px] text-slate-500">{loc.phone || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 font-mono">{loc.pricing?.mailingPrice || 0}</TableCell>
                        <TableCell className="text-slate-600 font-mono">{loc.pricing?.brPrice || 0}</TableCell>
                        <TableCell className="text-slate-600 font-mono">{loc.pricing?.gstPrice || 0}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <p className="text-xs text-slate-500 line-clamp-1" title={loc.officeAddress}>{loc.officeAddress}</p>
                            {loc.updatedBy && (
                              <span className="text-[9px] text-slate-400 mt-1 italic">
                                Last mod: {loc.updatedBy.name}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(loc)} className="text-slate-400 group-hover:text-primary transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(loc._id, loc.cityName)} className="text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {locations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          No locations active. Map out a new zone!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
