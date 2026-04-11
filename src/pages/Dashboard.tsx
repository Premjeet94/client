import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/config";
import { getQuotations } from "@/api/quotation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { Copy, Eye, LogOut, Plus, User, Users, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import { PLAN_LABELS } from "@/components/quotation/types";

interface DashboardUser {
  name: string;
  role: string;
  email: string;
}

interface DashboardQuotation {
  _id: string;
  quotationNo: string;
  clientName: string;
  clientCompany: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  plan?: string;
  date?: string;
}

const statusClasses: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700",
  finalized: "bg-blue-100 text-blue-700",
  sent: "bg-purple-100 text-purple-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const planClasses: Record<string, string> = {
  mailing: "bg-blue-50 text-blue-600 border-blue-100",
  "business-registration": "bg-indigo-50 text-indigo-600 border-indigo-100",
  gst: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<DashboardUser | null>(null);
  const [quotations, setQuotations] = useState<DashboardQuotation[]>([]);
  const [quotationsLoading, setQuotationsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
    };

    void fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setQuotationsLoading(true);
        const res = await getQuotations(currentPage);
        setQuotations(res.data.quotations || []);
        setTotalPages(res.data.pages || 1);
      } catch {
        toast.error("Failed to load quotations");
      } finally {
        setQuotationsLoading(false);
      }
    };

    void fetchQuotations();
  }, [currentPage]);

  const filtered = useMemo(
    () =>
      quotations.filter((q) => {
        const matchSearch =
          q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.clientCompany.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === "all" || q.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [quotations, searchTerm, statusFilter]
  );

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
    } catch {
      // no-op
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const onCopyLink = async (quotationId: string) => {
    const shareUrl = `${window.location.origin}/preview/${quotationId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (dateValue?: string) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 text-foreground flex flex-col">
      <header className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-border/50 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Flashspace Logo" className="h-10 object-contain" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="font-semibold text-slate-800">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
                {user.role === "admin" && (
                  <>
                    <Button asChild variant="ghost" size="icon" className="text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors" title="User Management">
                      <Link to="/admin/users">
                        <Users className="h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors" title="Location Configuration">
                      <Link to="/admin/locations">
                        <MapPin className="h-5 w-5" />
                      </Link>
                    </Button>
                    <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
                  </>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors" title="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <span className="text-muted-foreground animate-pulse">Loading...</span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <section className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-border shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Virtual Office</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Generate professional quotations and track them from draft to finalization.
                    </p>
                  </div>
                </div>
              </div>
              <Button asChild size="lg" className="rounded-2xl h-12 px-6">
                <Link to="/create-quotation">Create New Quotation</Link>
              </Button>
            </div>
          </section>

          <section className="bg-white/85 backdrop-blur-md rounded-3xl border border-border shadow-xl p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900">Quotation List</h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Input
                  placeholder="Search by quotation, client, or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="min-w-[260px]"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">all</SelectItem>
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="finalized">finalized</SelectItem>
                    <SelectItem value="sent">sent</SelectItem>
                    <SelectItem value="accepted">accepted</SelectItem>
                    <SelectItem value="rejected">rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {quotationsLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading quotations...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quotation No</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                          No quotations found for the selected filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((q) => (
                        <TableRow key={q._id}>
                          <TableCell className="font-semibold text-slate-800">{q.quotationNo}</TableCell>
                          <TableCell>{q.clientName}</TableCell>
                          <TableCell>{q.clientCompany}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${planClasses[q.plan || "mailing"] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
                              {PLAN_LABELS[q.plan as keyof typeof PLAN_LABELS] || q.plan || "Mailing Plan"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusClasses[q.status] || "bg-slate-100 text-slate-700"}`}>
                              {q.status}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">{formatAmount(q.totalAmount)}</TableCell>
                          <TableCell className="text-slate-500">{formatDate(q.date || q.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => navigate(`/preview/${q._id}`)}>
                                <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                              </Button>
                              <Button variant="secondary" size="sm" onClick={() => onCopyLink(q._id)}>
                                <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
